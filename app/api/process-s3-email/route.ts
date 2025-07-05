import { NextRequest, NextResponse } from 'next/server';
import { S3EmailProcessor } from '@/lib/services/s3EmailProcessor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract S3 key from the request
    // This could come from an AWS Lambda function or webhook
    const { s3Key } = body;

    if (!s3Key) {
      return NextResponse.json(
        { error: 'S3 key is required' },
        { status: 400 }
      );
    }

    const processor = new S3EmailProcessor();
    const success = await processor.processEmailFromS3(s3Key);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Email processed successfully',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to process email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing S3 email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 