
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '@/lib/supabase';
import type { FeedbackType } from '@/lib/types';


export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();

    // Fetch settings from Supabase
    const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'global')
        .maybeSingle(); // Use maybeSingle to avoid error if no settings row exists
    
    if (settingsError) {
        console.error('Error fetching settings from Supabase:', settingsError);
        // We can proceed with a default admin email if configured, but for now, we'll stop.
        throw new Error(`Database error fetching settings: ${settingsError.message}`);
    }

    // Even if settings row doesn't exist, we can proceed if env vars are set for email.
    // However, the recipient (adminEmail) and notification toggles depend on the settings table.
    if (!settings) {
        console.warn('No settings found in Supabase. Email notifications cannot be sent.');
        // Silently fail as this is a configuration issue, not a runtime error.
        return NextResponse.json({ success: true, message: 'Email sending skipped: settings not configured.' });
    }

    const adminEmail = settings.adminEmail;

    if (!adminEmail) {
        console.warn('Admin email is not set in settings. Email notifications cannot be sent.');
        return NextResponse.json({ success: true, message: 'Email sending skipped: admin email not configured.' });
    }

    let subject = '';
    let htmlContent = '';
    let recipientEmail = adminEmail; // Default recipient is admin

    if (type === 'new_donor') {
      if (settings.notifyNewDonor === false) { // Explicitly check for false
          return NextResponse.json({ success: true, message: 'Notification for new donor is disabled.' });
      }
      
      subject = '🎉 New Donor Registered on RoktoDao!';
      htmlContent = `
        <h1>New Donor Alert!</h1>
        <p>A new donor has registered on your platform.</p>
        <ul>
          <li><strong>Name:</strong> ${data.fullName}</li>
          <li><strong>Blood Group:</strong> ${data.bloodGroup}</li>
          <li><strong>Phone:</strong> ${data.phoneNumber}</li>
          <li><strong>Location:</strong> ${data.upazila}, ${data.district}, ${data.division}</li>
        </ul>
        <p>Please review their profile in the admin panel.</p>
      `;
    } else if (type === 'new_request') {
       if (settings.notifyNewRequest === false) { // Explicitly check for false
          return NextResponse.json({ success: true, message: 'Notification for new request is disabled.' });
       }

      subject = '🩸 New Blood Request on RoktoDao!';
      htmlContent = `
        <h1>New Blood Request!</h1>
        <p>A new request for blood has been submitted.</p>
        <ul>
          <li><strong>Patient Name:</strong> ${data.patientName}</li>
          <li><strong>Blood Group:</strong> ${data.bloodGroup}</li>
          <li><strong>Bags Needed:</strong> ${data.numberOfBags}</li>
          <li><strong>Hospital:</strong> ${data.hospitalLocation}</li>
          <li><strong>Contact:</strong> ${data.contactPhone}</li>
        </ul>
        <p>Please review the request in the admin panel.</p>
      `;
    } else if (type === 'contact_form') {
      // Save feedback to Supabase
      const feedbackData: Omit<FeedbackType, 'id' | 'date' | 'createdAt'> = {
        user: { name: data.name, email: data.email },
        type: data.type || 'Other',
        message: data.message,
        status: 'New',
      };
      
      const { error: feedbackError } = await supabase.from('feedback').insert(feedbackData);
      if (feedbackError) {
        console.error('Failed to save feedback to Supabase:', feedbackError);
        // We can still try to send the email even if DB save fails
      }

      subject = `📨 New Contact Message from ${data.name}`;
      htmlContent = `
        <h1>New message from your website's contact form!</h1>
        <p>You have received a new message from <strong>${data.name}</strong> (${data.email}).</p>
        <p><strong>Type:</strong> ${data.type || 'N/A'}</p>
        <hr>
        <h2>Message:</h2>
        <p style="white-space: pre-wrap;">${data.message}</p>
        <hr>
        <p>You can reply to this user directly at: <a href="mailto:${data.email}">${data.email}</a></p>
        <p>This has also been logged in your admin feedback panel.</p>
      `;
    } else if (type === 'sms_failure') {
      subject = '🚨 SMS Sending Failed on RoktoDao!';
      htmlContent = `
        <h1>SMS API Failure Report</h1>
        <p>The system failed to send an SMS after trying all available APIs.</p>
        <ul>
          <li><strong>Recipient Number:</strong> ${data.number}</li>
          <li><strong>Message:</strong></li>
        </ul>
        <blockquote style="padding: 10px; border-left: 4px solid #ccc; margin: 10px 0;">${data.message}</blockquote>
        <p>Please check the SMS API provider statuses and server logs for more details.</p>
      `;
    } else {
        return NextResponse.json({ success: false, error: 'Invalid notification type.' }, { status: 400 });
    }
    
    // Create a transporter object using the SMTP transport
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: String(process.env.SMTP_PASS),
      },
    });

    // Send mail with defined transport object
    await transporter.sendMail({
      from: `"RoktoDao Notifications" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: subject,
      html: htmlContent,
    });

    return NextResponse.json({ success: true, message: `Email of type '${type}' sent successfully.` });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to send email.' }, { status: 500 });
  }
}
