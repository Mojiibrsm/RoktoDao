
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

    // Check if notification for this type is enabled
    if (type === 'new_donor' && !settings.notifyNewDonor) {
        return NextResponse.json({ success: true, message: 'Notification for new donor is disabled.' });
    }
    if (type === 'new_request' && !settings.notifyNewRequest) {
        return NextResponse.json({ success: true, message: 'Notification for new request is disabled.' });
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

    let subject = '';
    let htmlContent = '';

    if (type === 'new_donor') {
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
    } else {
        return NextResponse.json({ success: false, error: 'Invalid notification type.' }, { status: 400 });
    }

    // Send mail with defined transport object
    await transporter.sendMail({
      from: `"RoktoDao Notifications" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: subject,
      html: htmlContent,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to send email.' }, { status: 500 });
  }
}
