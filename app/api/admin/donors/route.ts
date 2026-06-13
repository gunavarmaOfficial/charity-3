import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET all donors with aggregated donation info
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json([]);
    }

    // Fetch all donors
    const allDonors = await db
      .select()
      .from(schema.donors)
      .orderBy(desc(schema.donors.createdAt));

    // Fetch successful donations to compute aggregates
    const donations = await db
      .select()
      .from(schema.donations)
      .where(eq(schema.donations.status, "success"));

    // Map aggregates to donors
    const donorStats = allDonors.map(donor => {
      const donorDonations = donations.filter(d => d.donorId === donor.id);
      const totalDonated = donorDonations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
      return {
        ...donor,
        totalDonated,
        donationCount: donorDonations.length,
      };
    });

    return NextResponse.json(donorStats);
  } catch (error: any) {
    console.error("Error fetching donors:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
