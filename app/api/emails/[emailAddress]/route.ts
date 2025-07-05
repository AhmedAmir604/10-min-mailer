import { NextRequest, NextResponse } from 'next/server';
import { S3EmailProcessor } from '@/lib/services/s3EmailProcessor';
import { EmailGenerator } from '@/lib/services/emailGenerator';

export async function GET(
  request: NextRequest,
  { params }: { params: { emailAddress: string } }
) {
  try {
    const emailAddress = decodeURIComponent(params.emailAddress);

    // Validate email address
    const emailGenerator = new EmailGenerator();
    const isValid = await emailGenerator.isEmailValid(emailAddress);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Email address not found or expired' },
        { status: 404 }
      );
    }

    // Get emails
    const processor = new S3EmailProcessor();
    const emails = await processor.getEmailsForAddress(emailAddress);

    // Get email info
    const emailInfo = await emailGenerator.getEmailInfo(emailAddress);

    return NextResponse.json({
      success: true,
      emailInfo,
      emails: emails.map(email => ({
        id: email._id,
        from: email.from,
        subject: email.subject,
        textContent: email.textContent,
        htmlContent: email.htmlContent,
        receivedAt: email.receivedAt,
        isRead: email.isRead,
        attachments: email.attachments,
      })),
    });
  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
} 