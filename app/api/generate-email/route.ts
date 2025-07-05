import { NextRequest, NextResponse } from 'next/server';
import { EmailGenerator, ExpiryDuration } from '@/lib/services/emailGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { duration = '10min', customPrefix } = body;

    // Validate duration
    const validDurations: ExpiryDuration[] = ['10min', '30min', '1hour', '24hours'];
    if (!validDurations.includes(duration)) {
      return NextResponse.json(
        { error: 'Invalid duration. Must be one of: 10min, 30min, 1hour, 24hours' },
        { status: 400 }
      );
    }

    // Validate custom prefix if provided
    if (customPrefix && (customPrefix.length < 3 || customPrefix.length > 20)) {
      return NextResponse.json(
        { error: 'Custom prefix must be between 3 and 20 characters' },
        { status: 400 }
      );
    }

    const emailGenerator = new EmailGenerator();
    const emailAddress = await emailGenerator.generateEmail({
      duration,
      customPrefix,
    });

    return NextResponse.json({
      success: true,
      email: emailAddress,
      duration,
    });
  } catch (error) {
    console.error('Error generating email:', error);
    return NextResponse.json(
      { error: 'Failed to generate email address' },
      { status: 500 }
    );
  }
} 