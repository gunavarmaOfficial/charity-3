"use server";

import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { name, email, amount, currency } = await req.json();

    // Email to Admin
    const adminEmailContent = {
      from: "noreply@srivisawacharitabletrust.com",
      to: "admin@srivisawacharitabletrust.com", // Admin email address
      subject: "New Donation Received!",
      html: `
        <h1>New Donation Details</h1>
        <p>A new donation has been received:</p>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Amount:</strong> ${currency} ${amount}</li>
        </ul>
        <p>Best Regards,</p>
        <p>Sri Viswa Charitable Trust</p>
      `,
    };

    // Email to Donor
    const donorEmailContent = {
      from: "noreply@srivisawacharitabletrust.com",
      to: email, // Donor's email address
      subject: "Thank You for Your Donation!",
      html: `
        <h1>Thank You, ${name}!</h1>
        <p>We sincerely appreciate your generous donation to Sri Viswa Charitable Trust.</p>
        <p><strong>Donation Details:</strong></p>
        <ul>
          <li><strong>Amount:</strong> ${currency} ${amount}</li>
          <li><strong>Donor Name:</strong> ${name}</li>
        </ul>
        <p>Your support helps us continue our mission.</p>
        <p>Best Regards,</p>
        <p>Sri Viswa Charitable Trust</p>
      `,
    };

    // Send both emails
    await Promise.all([
      resend.emails.send(adminEmailContent), // Notify admin
      resend.emails.send(donorEmailContent), // Thank donor
    ]);

    return NextResponse.json({
      success: true,
      message: "Emails sent successfully!",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send emails." },
      { status: 500 }
    );
  }
}
