import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET all donations with donor and cause details
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

    // Perform joins to get donor name and cause title
    const results = await db
      .select({
        id: schema.donations.id,
        amount: schema.donations.amount,
        paymentMethod: schema.donations.paymentMethod,
        status: schema.donations.status,
        notes: schema.donations.notes,
        createdAt: schema.donations.createdAt,
        razorpayPaymentId: schema.donations.razorpayPaymentId,
        donor: {
          id: schema.donors.id,
          name: schema.donors.name,
          email: schema.donors.email,
          phone: schema.donors.phone,
        },
        cause: {
          id: schema.causes.id,
          title: schema.causes.title,
        },
      })
      .from(schema.donations)
      .innerJoin(schema.donors, eq(schema.donations.donorId, schema.donors.id))
      .leftJoin(schema.causes, eq(schema.donations.causeId, schema.causes.id))
      .orderBy(desc(schema.donations.createdAt));

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Error fetching donations:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// POST: Add manual/offline donation
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    const body = await req.json();
    const { donorName, donorEmail, donorPhone, donorAddress, amount, causeId, paymentMethod, notes } = body;

    if (!donorName || !donorEmail || !amount || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find or create donor
    let donorId: number;
    const existingDonor = await db
      .select()
      .from(schema.donors)
      .where(eq(schema.donors.email, donorEmail))
      .limit(1);

    if (existingDonor.length > 0) {
      donorId = existingDonor[0].id;
    } else {
      const [newDonor] = await db
        .insert(schema.donors)
        .values({
          name: donorName,
          email: donorEmail,
          phone: donorPhone || null,
          address: donorAddress || null,
        })
        .returning({ id: schema.donors.id });
      donorId = newDonor.id;
    }

    // Insert donation record
    const [newDonation] = await db
      .insert(schema.donations)
      .values({
        donorId,
        amount: amount.toString(),
        causeId: causeId ? parseInt(causeId) : null,
        paymentMethod,
        status: "success", // Manual/offline donations are assumed successful
        notes: notes || null,
      })
      .returning();

    // Update Cause raised amount if causeId is specified
    if (causeId) {
      const cause = await db
        .select()
        .from(schema.causes)
        .where(eq(schema.causes.id, parseInt(causeId)))
        .limit(1);

      if (cause.length > 0) {
        const currentRaised = parseFloat(cause[0].raised || "0");
        const newRaised = (currentRaised + parseFloat(amount)).toString();

        await db
          .update(schema.causes)
          .set({ raised: newRaised })
          .where(eq(schema.causes.id, parseInt(causeId)));
      }
    }

    // Create Audit Log
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: `Added offline donation of ₹${amount} for donor ${donorName}`,
      module: "Donations",
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, donation: newDonation });
  } catch (error: any) {
    console.error("Error creating offline donation:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
