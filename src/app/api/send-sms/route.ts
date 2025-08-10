
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { SmsLog } from '@/lib/types';

async function logSms(logData: Omit<SmsLog, 'id' | 'createdAt'>): Promise<void> {
    try {
        const { error } = await supabase.from('sms_logs').insert({
            ...logData,
        });
        if (error) throw error;
        console.log(`SMS log saved for ${logData.number}`);
    } catch (error) {
        console.error("Failed to log SMS to Supabase:", error);
    }
}

async function sendSmsWithBulkSmsBd(number: string, message: string): Promise<boolean> {
  const apiKey = process.env.BULKSMSBD_API_KEY;
  const senderId = process.env.BULKSMSBD_SENDER_ID;

  if (!apiKey || !senderId) {
    console.warn('BulkSMSBD API Key or Sender ID is not configured. Skipping this provider.');
    return false;
  }
  
  const url = `https://bulksmsbd.net/api/smsapi?api_key=${apiKey}&type=text&number=${number}&senderid=${senderId}&message=${encodeURIComponent(message)}`;
  
  try {
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.response_code === 202) {
      console.log('SMS sent successfully via BulkSMSBD.');
      await logSms({ number, message, status: 'success', apiUsed: 'BulkSMSBD' });
      return true;
    } else {
      console.error('BulkSMSBD API Error:', result.response_msg, 'Code:', result.response_code);
      await logSms({ number, message, status: 'failure', apiUsed: 'BulkSMSBD' });
      return false;
    }
  } catch (error) {
    console.error('Error calling BulkSMSBD API:', error);
    await logSms({ number, message, status: 'failure', apiUsed: 'BulkSMSBD' });
    return false;
  }
}

async function sendSmsWithBdBulkSms(number: string, message: string): Promise<boolean> {
  const apiKey = process.env.BDBULKSMS_API_KEY;
  const senderId = process.env.BDBULKSMS_SENDER_ID;

  if (!apiKey || !senderId) {
    console.warn('BDBulkSMS API Key or Sender ID is not configured. Skipping this provider.');
    return false;
  }

  const url = `https://api.bd-bulk-sms.com/sms/send?api_key=${apiKey}&sender_id=${senderId}&number=${number}&message=${encodeURIComponent(message)}`;

  try {
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.status === 'success') {
      console.log('SMS sent successfully via BDBulkSMS.');
      await logSms({ number, message, status: 'success', apiUsed: 'BDBulkSMS' });
      return true;
    } else {
      console.error('BDBulkSMS API Error:', result.message);
      await logSms({ number, message, status: 'failure', apiUsed: 'BDBulkSMS' });
      return false;
    }
  } catch (error) {
    console.error('Error calling BDBulkSMS API:', error);
    await logSms({ number, message, status: 'failure', apiUsed: 'BDBulkSMS' });
    return false;
  }
}

async function sendFailureReport(number: string, message: string) {
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

  // Try the first provider
  let success = await sendSmsWithBulkSmsBd(number, message);
  
  // If the first provider fails, try the second one
  if (!success) {
    console.log("Primary SMS provider failed. Trying fallback provider...");
    success = await sendSmsWithBdBulkSms(number, message);
  }

  if (success) {
    return NextResponse.json({ success: true, message: 'SMS sent successfully.' });
  } else {
    const errorMessage = 'All SMS providers failed to send the message. Please check server logs and ensure at least one SMS provider is configured correctly in the environment variables.';
    console.error(`SMS sending failed for number: ${number}. Reason: ${errorMessage}`);
    // Notify admin about the complete failure.
    await sendFailureReport(number, message);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
