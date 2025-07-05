import mongoose, { Schema, Document } from 'mongoose';

export interface IAttachment {
  filename: string;
  contentType: string;
  size: number;
  s3Key: string;
}

export interface IEmail extends Document {
  tempEmailId: string;
  tempEmailAddress: string;
  messageId: string;
  from: string;
  to: string[];
  subject: string;
  textContent: string;
  htmlContent: string;
  attachments: IAttachment[];
  receivedAt: Date;
  s3Key: string;
  isRead: boolean;
  expiresAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>({
  filename: { type: String, required: true },
  contentType: { type: String, required: true },
  size: { type: Number, required: true },
  s3Key: { type: String, required: true },
});

const EmailSchema = new Schema<IEmail>({
  tempEmailId: {
    type: String,
    required: true,
    index: true,
  },
  tempEmailAddress: {
    type: String,
    required: true,
    index: true,
  },
  messageId: {
    type: String,
    required: true,
    unique: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: [{
    type: String,
    required: true,
  }],
  subject: {
    type: String,
    default: '',
  },
  textContent: {
    type: String,
    default: '',
  },
  htmlContent: {
    type: String,
    default: '',
  },
  attachments: [AttachmentSchema],
  receivedAt: {
    type: Date,
    default: Date.now,
  },
  s3Key: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 0, // TTL index - documents will be automatically deleted when expiresAt is reached
  },
});

export default mongoose.models.Email || mongoose.model<IEmail>('Email', EmailSchema); 