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
//         <h2>Contact Form Submission</h2>
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

export async function POST(request: Request) {
  const allowedOrigins = ["https://www.srivisawacharitabletrust.com"]; // Replace with your actual frontend URL

  const origin = request.headers.get("Origin"); // This could be null

  // If origin is null, fallback to an empty string or handle it as needed
  if (!origin) {
    return new Response("Origin header is missing", { status: 400 });
  }

  const response = NextResponse.json({
    message: "Form submitted successfully",
  });

  // Check if the Origin is allowed
  if (allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin); // Allow the specific origin
    response.headers.set("Access-Control-Allow-Methods", "POST"); // Allow only POST method
    response.headers.set("Access-Control-Allow-Headers", "Content-Type"); // Allow Content-Type header
    response.headers.set("Access-Control-Allow-Credentials", "true"); // Allow credentials if needed
  }

  // If it's a preflight request (OPTIONS), respond with 200
  if (request.method === "OPTIONS") {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    return new Response(null, { status: 200, headers: response.headers });
  }

  // Continue processing the POST request
  try {
    const body = await request.json();
    // Process form data here
    return response;
  } catch (error) {
    console.error("Error in contact form submission:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
