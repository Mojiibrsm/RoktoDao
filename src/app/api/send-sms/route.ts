
import { NextRequest, NextResponse } from 'next/server';

async function sendSmsApi1(number: string, message: string): Promise<boolean> {
  // This is a custom, non-standard API endpoint. Success/failure is determined by reachability.
  const url = `http://209.145.55.60:8000/send?number=${number}&sms=${encodeURIComponent(message)}`;
  try {
    const response = await fetch(url, {
        method: 'GET',
        // Adding a timeout as this custom server might be slow or unresponsive
        signal: AbortSignal.timeout(5000) // 5 seconds timeout
    });
    // Assuming any 2xx response is a success for this custom API
    return response.ok;
  } catch (error) {
    console.error('SMS API 1 (Custom) failed:', error);
    return false;
  }
}

async function sendSmsApi2(number: string, message: string): Promise<boolean> {
  const apiKey = process.env.BULKSMSBD_API_KEY;
  const senderId = process.env.BULKSMSBD_SENDER_ID;

  if (!apiKey || !senderId) {
    console.error('BulkSMSBD API Key or Sender ID is not configured.');
    return false;
  }
  const url = `https://bulksmsbd.net/api/smsapi?api_key=${apiKey}&type=text&number=${number}&senderid=${senderId}&message=${encodeURIComponent(message)}`;
  try {
    const response = await fetch(url);
    const result = await response.json();
    if (result.response_code === 202) {
      console.log('SMS sent successfully via BulkSMSBD.');
      return true;
    } else {
      console.error('BulkSMSBD API Error:', result);
      return false;
    }
  } catch (error) {
    console.error('Error calling BulkSMSBD API:', error);
    return false;
  }
}


export async function POST(request: NextRequest) {
  const { number, message } = await request.json();

  if (!number || !message) {
    return NextResponse.json({ success: false, error: 'Missing number or message.' }, { status: 400 });
  }

  // Try the first API
  const successApi1 = await sendSmsApi1(number, message);

  if (successApi1) {
    return NextResponse.json({ success: true, message: 'SMS sent successfully via API 1.' });
  }

  // If the first API fails, fall back to the second one
  console.warn('SMS API 1 failed, falling back to API 2 (BulkSMSBD).');
  const successApi2 = await sendSmsApi2(number, message);

  if (successApi2) {
    return NextResponse.json({ success: true, message: 'SMS sent successfully via fallback API 2.' });
  }

  // If both APIs fail
  return NextResponse.json({ success: false, error: 'Both SMS APIs failed to send the message.' }, { status: 500 });
}
