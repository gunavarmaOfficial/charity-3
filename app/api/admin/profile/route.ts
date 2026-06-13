import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({
        user: {
          id: user.id,
          name: "Local Administrator",
          email: user.email,
          role: "super_admin",
          permissions: ["*"],
        }
      });
    }

    // Fetch user profile from DB
    const profileResult = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
      .limit(1);

    if (!profileResult[0]) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    // Fetch role details
    const roleResult = await db
      .select()
      .from(schema.roles)
      .where(eq(schema.roles.id, profileResult[0].roleId))
      .limit(1);

    return NextResponse.json({
      user: {
        id: user.id,
        name: profileResult[0].name,
        email: profileResult[0].email,
        role: roleResult[0]?.name || "editor",
        permissions: roleResult[0]?.permissions || [],
      }
    });
  } catch (error: any) {
    console.error("Error fetching admin profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
