
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { FeedbackType } from '@/lib/types';


export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();

    // Fetch settings from Firestore
    const settingsRef = doc(db, 'settings', 'global');
    const docSnap = await getDoc(settingsRef);

    if (!docSnap.exists()) {
        console.warn('Settings not found in Firestore. Email not sent.');
        return NextResponse.json({ success: false, error: 'Email settings not configured.' }, { status: 500 });
    }

    const settings = docSnap.data();
    const adminEmail = settings.adminEmail;

    if (!adminEmail) {
        return NextResponse.json({ success: false, error: 'Admin email not set in settings.' }, { status: 500 });
    }

    let subject = '';
    let htmlContent = '';
    let recipientEmail = adminEmail; // Default recipient is admin

    if (type === 'new_donor') {
      if (!settings.notifyNewDonor) return NextResponse.json({ success: true, message: 'Notification for new donor is disabled.' });
      
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
       if (!settings.notifyNewRequest) return NextResponse.json({ success: true, message: 'Notification for new request is disabled.' });

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
      // Save feedback to Firestore
      const feedbackData: Omit<FeedbackType, 'id' | 'date'> = {
        user: { name: data.name, email: data.email },
        type: data.type || 'Other',
        message: data.message,
        status: 'New',
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'feedback'), feedbackData);

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
    } else if (type === 'send_credentials') {
        recipientEmail = data.email;
        subject = `স্বাগতম! আপনার RoktoDao অ্যাকাউন্ট তৈরি হয়েছে`;
        htmlContent = `
          <h1>RoktoDao-তে আপনাকে স্বাগতম!</h1>
          <p>প্রিয় ${data.fullName},</p>
          <p>জীবন বাঁচানোর এই যাত্রায় আমাদের সাথে যোগ দেওয়ার জন্য আপনাকে ধন্যবাদ। আপনার ডোনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।</p>
          <p>আপনার অ্যাকাউন্টে লগইন করার জন্য নিচের তথ্যগুলো ব্যবহার করুন:</p>
          <ul>
            <li><strong>ইমেইল:</strong> ${data.email}</li>
            <li><strong>পাসওয়ার্ড:</strong> ${data.password}</li>
          </ul>
          <p>লগইন করার পর, আপনি আপনার প্রোফাইল পেজ থেকে পাসওয়ার্ড পরিবর্তন করে নিতে পারবেন।</p>
          <p>ধন্যবাদ,</p>
          <p><strong>RoktoDao টিম</strong></p>
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
        pass: process.env.SMTP_PASS,
      },
    });

    // Send mail with defined transport object
    await transporter.sendMail({
      from: `"RoktoDao Notifications" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: subject,
      html: htmlContent,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to send email.' }, { status: 500 });
  }
}
