import { Resend } from "resend";
import { NextResponse } from "next/server";
import { addVolunteer } from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, interests, availability, experience, message } = body;

    if (!name || !email || !phone || !interests) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Log to database / volunteers.json locally
    try {
      await addVolunteer({
        name,
        email,
        phone,
        interests,
        availability,
        experience: experience || "",
        message: message || "",
        createdAt: new Date().toISOString(),
      });
    } catch (logError) {
      console.error("Error logging volunteer application:", logError);
    }

    // 2. Send emails using Resend if API key is configured
    if (process.env.RESEND_API_KEY) {
      try {
        // Admin notification email
        await resend.emails.send({
          from: "noreply@srivisawacharitabletrust.com",
          to: "contact@srivisawacharitabletrust.com",
          subject: `Volunteer Application: ${name}`,
          html: `
            <h1>New Volunteer Application</h1>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Interests:</strong> ${interests.join(", ")}</p>
            <p><strong>Availability:</strong> ${availability}</p>
            <p><strong>Experience:</strong> ${experience || "Not provided"}</p>
            <p><strong>Message:</strong> ${message}</p>
          `,
        });

        // Thank-you email to the applicant
        await resend.emails.send({
          from: "noreply@srivisawacharitabletrust.com",
          to: email,
          subject: "Thank You for Applying as a Volunteer!",
          html: `
            <div style="background-color: #e0f7e0; padding: 20px; font-family: Arial, sans-serif; color: #333;">
              <h1 style="color: #4caf50;">Thank You, ${name}!</h1>
              <p>We sincerely appreciate your interest in volunteering with the Sri Viswa Charitable Trust. Your willingness to help means so much to us.</p>
              <p><strong>Your Application Details:</strong></p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background-color: #f4f4f4;">
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
                </tr>
                <tr style="background-color: #f4f4f4;">
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Interests</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${interests.join(
                    ", "
                  )}</td>
                </tr>
                <tr style="background-color: #f4f4f4;">
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Availability</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${availability}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Experience</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${
                    experience || "Not provided"
                  }</td>
                </tr>
                <tr style="background-color: #f4f4f4;">
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Message</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${message}</td>
                </tr>
              </table>
              <p>We will review your application and get back to you soon. If you have any questions, feel free to contact us at <a href="mailto:contact@srivisawacharitabletrust.com" style="color: #4caf50;">contact@srivisawacharitabletrust.com</a>.</p>
              <p>Thank you for your support!</p>
              <p style="font-weight: bold;">The Sri Viswa Charitable Trust Team</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Resend sending error:", emailError);
      }
    }

    return NextResponse.json({ message: "Volunteer application processed successfully!" });
  } catch (error: unknown) {
    console.error("Error processing volunteer application:", error);
    return NextResponse.json(
      { message: "Failed to process volunteer registration." },
      { status: 500 }
    );
  }
}
