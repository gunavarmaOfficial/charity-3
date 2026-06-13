import { NextResponse } from "next/server";
import crypto from "crypto";

const getExpectedToken = () => {
  const password = process.env.ADMIN_PASSWORD || "admin123";
  return crypto.createHash("sha256").update(password).digest("hex");
};

export async function GET(req: Request) {
  try {
    const cookies = req.headers.get("cookie") || "";
    const sessionCookie = cookies
      .split(";")
      .find((c) => c.trim().startsWith("admin_session="))
      ?.split("=")[1];

    const expectedToken = getExpectedToken();

    if (sessionCookie && sessionCookie === expectedToken) {
      return NextResponse.json({ authenticated: true });
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ authenticated: false, error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (username === expectedUsername && password === expectedPassword) {
      const sessionToken = getExpectedToken();
      
      const response = NextResponse.json({ success: true, message: "Logged in successfully" });
      
      // Set the session cookie
      response.headers.set(
        "Set-Cookie",
        `admin_session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${
          process.env.NODE_ENV === "production" ? "; Secure" : ""
        }`
      );
      
      return response;
    }

    return NextResponse.json(
      { success: false, message: "Invalid username or password" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  
  // Clear the session cookie
  response.headers.set(
    "Set-Cookie",
    `admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`
  );
  
  return response;
}
