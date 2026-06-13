import { NextResponse } from "next/server";
import { Resend } from "resend";
import { addQuery } from "@/lib/supabase";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    // 1. Log query to database / queries.json locally
    try {
      await addQuery({
        name,
        email,
        subject,
        message,
        createdAt: new Date().toISOString(),
      });
    } catch (logError) {
      console.error("Error logging query:", logError);
    }

    // 2. Attempt to send email notifications if API key is provided
    if (process.env.RESEND_API_KEY) {
      try {
        const adminEmail = {
          from: "noreply@srivisawacharitabletrust.com",
          to: "contact@srivisawacharitabletrust.com",
          subject: `New Contact Form Submission: ${subject}`,
          html: `
            <h2>Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          `,
        };

        const customerEmail = {
          from: "noreply@srivisawacharitabletrust.com",
          to: email,
          subject: `Thank You for Reaching Out!`,
          html: `
            <h2>Thank You, ${name}!</h2>
            <p>We have received your message with the following details:</p>
            <ul>
              <li><strong>Subject:</strong> ${subject}</li>
              <li><strong>Message:</strong> ${message}</li>
            </ul>
            <p>Our team will get back to you as soon as possible.</p>
            <p>Best Regards,</p>
            <p>Sri Viswa Charitable Trust</p>
          `,
        };

        await Promise.all([
          resend.emails.send(adminEmail),
          resend.emails.send(customerEmail),
        ]);
      } catch (emailError) {
        console.error("Error sending email notification via Resend:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Message processed successfully!",
    });
  } catch (error) {
    console.error("Error handling contact submission:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process message." },
      { status: 500 }
    );
  }
}
