import mongoose, { Schema, Document } from 'mongoose';

export interface ITempEmail extends Document {
  address: string;
  domain: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  emailCount: number;
  lastAccessedAt: Date;
}

const TempEmailSchema = new Schema<ITempEmail>({
  address: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  domain: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 0, // TTL index - documents will be automatically deleted when expiresAt is reached
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  emailCount: {
    type: Number,
    default: 0,
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.TempEmail || mongoose.model<ITempEmail>('TempEmail', TempEmailSchema); 