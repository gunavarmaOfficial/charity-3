// "use server";

// import { NextResponse } from "next/server";
// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY!);

// export async function POST(req: Request) {
//   try {
//     console.log(resend, "api keyyyyy ==============================>");
//     const { name, email, subject, message } = await req.json();

//     // Email to your domain
//     const adminEmail = {
//       from: "noreply@srivisawacharitabletrust.com", // Verified sender address
//       to: "contact@srivisawacharitabletrust.com", // Your email address
//       subject: `New Contact Form Submission: ${subject}`,
//       html: `
//         <h2>Contact Form </h2>
//         <p><strong>Name:</strong> ${name}</p>
//         <p><strong>Email:</strong> ${email}</p>
//         <p><strong>Subject:</strong> ${subject}</p>
//         <p><strong>Message:</strong></p>
//         <p>${message}</p>
//       `,
//     };

//     const customerEmail = {
//       from: "noreply@srivisawacharitabletrust.com", // Verified sender address
//       to: email, // Customer's email
//       subject: `Thank You for Reaching Out!`,
//       html: `
//         <h2>Thank You, ${name}!</h2>
//         <p>We have received your message with the following details:</p>
//         <ul>
//           <li><strong>Subject:</strong> ${subject}</li>
//           <li><strong>Message:</strong> ${message}</li>
//         </ul>
//         <p>Our team will get back to you as soon as possible.</p>
//         <p>Best Regards,</p>
//         <p>Sri Viswa Charitable Trust</p>
//       `,
//     };

//     // Send both emails
//     await Promise.all([
//       resend.emails.send(adminEmail),
//       resend.emails.send(customerEmail),
//     ]);

//     return NextResponse.json({
//       success: true,
//       message: "Emails sent successfully!",
//     });
//   } catch (error) {
//     console.error("Error sending email:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to send emails." },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = NextResponse.json(
      { message: "Thank you for your message!" },
      { status: 200 }
    );

    // Add CORS headers
    response.headers.set("Access-Control-Allow-Origin", "*"); // Allow all origins or specify your domain
    response.headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");

    return response;
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
