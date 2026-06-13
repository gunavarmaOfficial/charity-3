import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!db) {
      return NextResponse.json({ hasAdmin: true }); // fallback mode
    }

    const existingUsers = await db.select().from(schema.users).limit(1);
    
    return NextResponse.json({
      hasAdmin: existingUsers.length > 0
    });
  } catch (error) {
    console.error("Error checking for existing admins:", error);
    return NextResponse.json({ hasAdmin: true }); // safe default
  }
}
