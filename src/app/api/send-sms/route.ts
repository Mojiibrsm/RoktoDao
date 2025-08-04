
import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SmsLog } from '@/lib/types';

async function logSms(logData: Omit<SmsLog, 'id' | 'createdAt'>): Promise<void> {
    try {
        await addDoc(collection(db, 'sms_logs'), {
            ...logData,
            createdAt: serverTimestamp(),
        });
        console.log(`SMS log saved for ${logData.number}`);
    } catch (error) {
        console.error("Failed to log SMS to Firestore:", error);
    }
}

async function sendSmsWithBulkSmsBd(number: string, message: string): Promise<boolean> {
  const apiKey = process.env.BULKSMSBD_API_KEY || "LkcuBmpXSgO77LgytC9w";
  const senderId = process.env.BULKSMSBD_SENDER_ID || "8809617614208";

  if (!apiKey || !senderId) {
    console.error('BulkSMSBD API Key or Sender ID is not configured.');
    return false;
  }
  
  const url = `https://bulksmsbd.net/api/smsapi?api_key=${apiKey}&type=text&number=${number}&senderid=${senderId}&message=${encodeURIComponent(message)}`;
  
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) }); // 10s timeout
    const result = await response.json();
    
    if (result.response_code === 202) {
      console.log('SMS sent successfully via BulkSMSBD.');
      return true;
    } else {
      console.error('BulkSMSBD API Error:', result.response_msg, 'Code:', result.response_code);
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

  const success = await sendSmsWithBulkSmsBd(number, message);
  
  if (success) {
    await logSms({ number, message, status: 'success', apiUsed: 'BulkSMSBD' }); 
    return NextResponse.json({ success: true, message: 'SMS sent successfully.' });
  } else {
    console.error(`SMS API failed for number: ${number}`);
    await logSms({ number, message, status: 'failure', apiUsed: 'BulkSMSBD' });
    await sendFailureReport(number, message);
    return NextResponse.json({ success: false, error: 'SMS API failed to send the message.' }, { status: 500 });
  }
}
