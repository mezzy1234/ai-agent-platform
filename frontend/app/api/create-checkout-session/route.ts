import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy route for creating a Stripe checkout session. This route runs on the
 * server and calls your backend API defined in the Express app. Using this
 * proxy avoids exposing your backend URL directly to the client and works
 * seamlessly with Vercel’s serverless functions.
 */
export async function POST(req: NextRequest) {
  const { planId } = await req.json();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: 'Backend URL not configured' }, { status: 500 });
  }
  try {
    const response = await fetch(`${backendUrl}/api/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
