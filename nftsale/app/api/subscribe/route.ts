import { NextResponse } from 'next/server';

// In production, you'd store this in a database (Supabase, MongoDB, PostgreSQL, etc.)
// For now, we'll use in-memory storage for demonstration
const subscribers = new Set<string>();

export async function POST(request: Request) {
  try {
    const { email, walletAddress } = await request.json();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // In production, save to database
    // Example with Supabase:
    // const { data, error } = await supabase
    //   .from('subscribers')
    //   .insert([{ email, wallet_address: walletAddress, subscribed_at: new Date() }]);

    // For demo, use in-memory storage
    subscribers.add(email);

    // In production, send welcome email
    // await sendWelcomeEmail(email);

    // Log for development
    console.log('New subscriber:', { email, walletAddress, total: subscribers.size });

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to updates',
      // In production, return less info for security
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // In production, protect this endpoint with authentication
  return NextResponse.json({
    count: subscribers.size,
    message: 'Use POST to subscribe',
  });
}