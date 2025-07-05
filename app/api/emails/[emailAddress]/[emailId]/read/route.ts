import { NextRequest, NextResponse } from 'next/server';
import { S3EmailProcessor } from '@/lib/services/s3EmailProcessor';

export async function POST(
  request: NextRequest,
  { params }: { params: { emailAddress: string; emailId: string } }
) {
  try {
    const { emailId } = params;

    const processor = new S3EmailProcessor();
    const success = await processor.markEmailAsRead(emailId);

    if (!success) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email marked as read',
    });
  } catch (error) {
    console.error('Error marking email as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark email as read' },
      { status: 500 }
    );
  }
} 