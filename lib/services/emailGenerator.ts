import { v4 as uuidv4 } from 'uuid';
import { addMinutes, addHours, addDays } from 'date-fns';
import dbConnect from '../mongodb';
import TempEmail from '../models/TempEmail';

export type ExpiryDuration = '10min' | '30min' | '1hour' | '24hours';

export interface EmailGenerationOptions {
  duration: ExpiryDuration;
  customPrefix?: string;
}

export class EmailGenerator {
  private domain: string;

  constructor() {
    this.domain = process.env.DOMAIN_NAME || 'localhost';
  }

  private generateRandomString(length: number = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private calculateExpiryDate(duration: ExpiryDuration): Date {
    const now = new Date();
    
    switch (duration) {
      case '10min':
        return addMinutes(now, 10);
      case '30min':
        return addMinutes(now, 30);
      case '1hour':
        return addHours(now, 1);
      case '24hours':
        return addDays(now, 1);
      default:
        return addMinutes(now, 10);
    }
  }

  async generateEmail(options: EmailGenerationOptions): Promise<string> {
    await dbConnect();

    const prefix = options.customPrefix || this.generateRandomString();
    const emailAddress = `${prefix}@${this.domain}`;
    const expiresAt = this.calculateExpiryDate(options.duration);

    // Check if email already exists
    const existingEmail = await TempEmail.findOne({ address: emailAddress });
    if (existingEmail) {
      // If it exists and is still active, extend the expiry
      if (existingEmail.isActive && existingEmail.expiresAt > new Date()) {
        existingEmail.expiresAt = expiresAt;
        existingEmail.lastAccessedAt = new Date();
        await existingEmail.save();
        return emailAddress;
      }
    }

    // Create new temporary email
    const tempEmail = new TempEmail({
      address: emailAddress,
      domain: this.domain,
      expiresAt,
    });

    await tempEmail.save();
    return emailAddress;
  }

  async isEmailValid(emailAddress: string): Promise<boolean> {
    await dbConnect();
    
    const tempEmail = await TempEmail.findOne({ 
      address: emailAddress,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    return !!tempEmail;
  }

  async getEmailInfo(emailAddress: string) {
    await dbConnect();
    
    const tempEmail = await TempEmail.findOne({ address: emailAddress });
    if (!tempEmail) return null;

    return {
      address: tempEmail.address,
      createdAt: tempEmail.createdAt,
      expiresAt: tempEmail.expiresAt,
      isActive: tempEmail.isActive,
      emailCount: tempEmail.emailCount,
      timeRemaining: Math.max(0, tempEmail.expiresAt.getTime() - Date.now()),
    };
  }

  async deactivateEmail(emailAddress: string): Promise<boolean> {
    await dbConnect();
    
    const result = await TempEmail.updateOne(
      { address: emailAddress },
      { isActive: false }
    );

    return result.modifiedCount > 0;
  }

  async cleanupExpiredEmails(): Promise<number> {
    await dbConnect();
    
    const result = await TempEmail.deleteMany({
      expiresAt: { $lt: new Date() }
    });

    return result.deletedCount || 0;
  }
} 