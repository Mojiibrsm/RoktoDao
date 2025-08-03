
import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SmsLog } from '@/lib/types';

async function logSms(logData: Omit<SmsLog, 'id' | 'createdAt'>) {
    try {
        await addDoc(collection(db, 'sms_logs'), {
            ...logData,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Failed to log SMS to Firestore:", error);
    }
}

async function sendSmsApi1(number: string, message: string): Promise<boolean> {
  const url = `http://209.145.55.60:8000/send?number=${number}&sms=${encodeURIComponent(message)}`;
  try {
    const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
    });
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

async function sendFailureReport(number: string, message: string) {
    // This is an internal call, so we construct the full URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    try {
        await fetch(`${baseUrl}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'sms_failure',
                data: { number, message },
            }),
        });
    } catch (error) {
        console.error("Failed to send SMS failure email report:", error);
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
    await logSms({ number, message, status: 'success', apiUsed: 'API 1' });
    return NextResponse.json({ success: true, message: 'SMS sent successfully via API 1.' });
  }

  // If the first API fails, fall back to the second one
  console.warn('SMS API 1 failed, falling back to API 2 (BulkSMSBD).');
  const successApi2 = await sendSmsApi2(number, message);
  if (successApi2) {
    await logSms({ number, message, status: 'success', apiUsed: 'API 2' });
    return NextResponse.json({ success: true, message: 'SMS sent successfully via fallback API 2.' });
  }

  // If both APIs fail
  console.error(`Both SMS APIs failed for number: ${number}`);
  await logSms({ number, message, status: 'failure', apiUsed: 'Both Failed' });
  await sendFailureReport(number, message);
  return NextResponse.json({ success: false, error: 'Both SMS APIs failed to send the message.' }, { status: 500 });
}
