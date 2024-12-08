import { NextResponse } from "next/server";

export function middleware(req: Request) {
  const response = NextResponse.next();

  // Add custom headers for development or serverless deployments
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  return response;
}
