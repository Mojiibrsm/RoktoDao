
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { number, message } = await request.json();

  if (!number || !message) {
    return NextResponse.json({ success: false, error: 'Missing number or message.' }, { status: 400 });
  }

  const apiKey = process.env.BULKSMSBD_API_KEY;
  const senderId = process.env.BULKSMSBD_SENDER_ID;

  if (!apiKey || !senderId) {
    console.error('SMS API Key or Sender ID is not configured in environment variables.');
    return NextResponse.json({ success: false, error: 'SMS service is not configured.' }, { status: 500 });
  }

  const url = `http://bulksmsbd.net/api/smsapi?api_key=${apiKey}&type=text&number=${number}&senderid=${senderId}&message=${encodeURIComponent(message)}`;

  try {
    const smsResponse = await fetch(url);
    const smsResult = await smsResponse.json();

    if (smsResult.response_code === 202) {
      return NextResponse.json({ success: true, message: 'SMS sent successfully.' });
    } else {
      console.error('SMS API Error:', smsResult);
      // Even if SMS fails, don't block the user flow. Just log the error.
      return NextResponse.json({ success: false, error: smsResult.error_message || 'Failed to send SMS.' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    return NextResponse.json({ success: false, error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
