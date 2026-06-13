import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, email, name, roleName } = body;

    if (!userId || !email || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    // Check if any admin profile already exists
    const existingUsers = await db.select().from(schema.users).limit(1);
    const isFirstUser = existingUsers.length === 0;

    let targetRoleName = "super_admin";

    if (!isFirstUser) {
      // If not the first user, the current user must be authenticated and must be a super_admin
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Fetch current user's profile and check if they are super_admin
      const currentUserProfile = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, user.id))
        .limit(1);

      if (!currentUserProfile[0]) {
        return NextResponse.json({ error: "No profile found for current user" }, { status: 403 });
      }

      const superAdminRole = await db
        .select()
        .from(schema.roles)
        .where(eq(schema.roles.name, "super_admin"))
        .limit(1);

      if (!superAdminRole[0] || currentUserProfile[0].roleId !== superAdminRole[0].id) {
        return NextResponse.json({ error: "Only Super Admin can register new users" }, { status: 403 });
      }

      targetRoleName = roleName || "editor"; // Default to editor role for safety
    }

    // Find the role ID
    const dbRole = await db
      .select()
      .from(schema.roles)
      .where(eq(schema.roles.name, targetRoleName))
      .limit(1);

    if (!dbRole[0]) {
      return NextResponse.json({ error: `Role '${targetRoleName}' not found` }, { status: 400 });
    }

    // Insert the user profile
    await db.insert(schema.users).values({
      id: userId,
      email: email,
      name: name,
      roleId: dbRole[0].id,
    });

    // Write audit log
    await db.insert(schema.auditLogs).values({
      userId: isFirstUser ? userId : undefined,
      action: `Registered User (${targetRoleName})`,
      module: "Auth",
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, message: "User profile created successfully" });
  } catch (error: any) {
    console.error("Error registering user profile:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
