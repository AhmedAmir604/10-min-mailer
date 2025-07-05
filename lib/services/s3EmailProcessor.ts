import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { simpleParser, ParsedMail, Attachment } from 'mailparser';
import dbConnect from '../mongodb';
import Email from '../models/Email';
import TempEmail from '../models/TempEmail';

export class S3EmailProcessor {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'eu-north-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucketName = process.env.S3_BUCKET_NAME!;
  }

  async processEmailFromS3(s3Key: string): Promise<boolean> {
    try {
      await dbConnect();

      // Get email from S3
      const emailContent = await this.getEmailFromS3(s3Key);
      if (!emailContent) {
        console.error('Failed to retrieve email from S3:', s3Key);
        return false;
      }

      // Parse email
      const parsedEmail = await this.parseEmail(emailContent);
      if (!parsedEmail) {
        console.error('Failed to parse email:', s3Key);
        return false;
      }

      // Extract recipient and validate
      const recipients = this.extractRecipients(parsedEmail);
      const validRecipients = await this.validateRecipients(recipients);

      if (validRecipients.length === 0) {
        console.log('No valid temporary email recipients found:', recipients);
        return false;
      }

      // Store email for each valid recipient
      for (const recipient of validRecipients) {
        await this.storeEmail(parsedEmail, recipient, s3Key);
        await this.incrementEmailCount(recipient);
      }

      return true;
    } catch (error) {
      console.error('Error processing email from S3:', error);
      return false;
    }
  }

  private async getEmailFromS3(s3Key: string): Promise<string | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      const response = await this.s3Client.send(command);
      if (!response.Body) return null;

      // Convert stream to string
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }
      
      const buffer = Buffer.concat(chunks);
      return buffer.toString('utf-8');
    } catch (error) {
      console.error('Error getting email from S3:', error);
      return null;
    }
  }

  private async parseEmail(emailContent: string): Promise<ParsedMail | null> {
    try {
      return await simpleParser(emailContent);
    } catch (error) {
      console.error('Error parsing email:', error);
      return null;
    }
  }

  private extractRecipients(parsedEmail: ParsedMail): string[] {
    const recipients: string[] = [];

    if (parsedEmail.to) {
      const toArray = Array.isArray(parsedEmail.to) ? parsedEmail.to : [parsedEmail.to];
      for (const to of toArray) {
        if (typeof to === 'string') {
          recipients.push(to);
        } else if (to.value) {
          for (const addr of to.value) {
            recipients.push(addr.address || '');
          }
        }
      }
    }

    return recipients.filter(email => email.length > 0);
  }

  private async validateRecipients(recipients: string[]): Promise<string[]> {
    const validRecipients: string[] = [];

    for (const recipient of recipients) {
      const tempEmail = await TempEmail.findOne({
        address: recipient,
        isActive: true,
        expiresAt: { $gt: new Date() }
      });

      if (tempEmail) {
        validRecipients.push(recipient);
      }
    }

    return validRecipients;
  }

  private async storeEmail(
    parsedEmail: ParsedMail,
    recipient: string,
    s3Key: string
  ): Promise<void> {
    const messageId = parsedEmail.messageId || `generated-${Date.now()}-${Math.random()}`;

    // Check if email already exists
    const existingEmail = await Email.findOne({ messageId, tempEmailAddress: recipient });
    if (existingEmail) {
      console.log('Email already exists:', messageId);
      return;
    }

    // Process attachments
    const attachments = await this.processAttachments(parsedEmail.attachments || []);

    // Get temp email for expiry date
    const tempEmail = await TempEmail.findOne({ address: recipient });
    const expiresAt = tempEmail?.expiresAt || new Date(Date.now() + 10 * 60 * 1000); // 10 min default

    const email = new Email({
      tempEmailId: tempEmail?._id.toString() || '',
      tempEmailAddress: recipient,
      messageId,
      from: this.extractSenderAddress(parsedEmail.from),
      to: [recipient],
      subject: parsedEmail.subject || '(No Subject)',
      textContent: parsedEmail.text || '',
      htmlContent: parsedEmail.html || '',
      attachments,
      s3Key,
      expiresAt,
    });

    await email.save();
  }

  private extractSenderAddress(from: any): string {
    if (!from) return '';
    
    if (typeof from === 'string') return from;
    
    if (from.value && Array.isArray(from.value) && from.value.length > 0) {
      return from.value[0].address || '';
    }
    
    return '';
  }

  private async processAttachments(attachments: Attachment[]): Promise<any[]> {
    return attachments.map(attachment => ({
      filename: attachment.filename || 'unnamed',
      contentType: attachment.contentType || 'application/octet-stream',
      size: attachment.size || 0,
      s3Key: '', // TODO: Implement attachment storage to S3
    }));
  }

  private async incrementEmailCount(emailAddress: string): Promise<void> {
    await TempEmail.updateOne(
      { address: emailAddress },
      { 
        $inc: { emailCount: 1 },
        $set: { lastAccessedAt: new Date() }
      }
    );
  }

  async getEmailsForAddress(emailAddress: string, limit: number = 50): Promise<any[]> {
    await dbConnect();

    const emails = await Email.find({
      tempEmailAddress: emailAddress,
      expiresAt: { $gt: new Date() }
    })
    .sort({ receivedAt: -1 })
    .limit(limit)
    .lean();

    return emails;
  }

  async markEmailAsRead(emailId: string): Promise<boolean> {
    await dbConnect();

    const result = await Email.updateOne(
      { _id: emailId },
      { isRead: true }
    );

    return result.modifiedCount > 0;
  }
} 