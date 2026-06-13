import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  getDbData,
  saveDbData,
  getQueries,
  getVolunteers,
  deleteQuery,
  deleteVolunteer,
} from "@/lib/supabase";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc, asc } from "drizzle-orm";

// GET website data (and logs if authenticated)
export async function GET(req: Request) {
  try {
    const data = await getDbData();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // If authenticated, attach queries and volunteers logs
    if (user) {
      let queries: any[] = [];
      let volunteers: any[] = [];
      let donations: any[] = [];
      let causes: any[] = [];
      let events: any[] = [];
      let blogs: any[] = [];
      let testimonials: any[] = [];
      let team: any[] = [];
      let documents: any[] = [];
      let auditLogs: any[] = [];

      if (db) {
        try {
          queries = await db.select().from(schema.queries).orderBy(desc(schema.queries.createdAt));
          volunteers = await db.select().from(schema.volunteers).orderBy(desc(schema.volunteers.createdAt));
          
          donations = await db
            .select({
              id: schema.donations.id,
              amount: schema.donations.amount,
              paymentMethod: schema.donations.paymentMethod,
              status: schema.donations.status,
              notes: schema.donations.notes,
              createdAt: schema.donations.createdAt,
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

          causes = await db.select().from(schema.causes).orderBy(desc(schema.causes.createdAt));
          
          const eventsList = await db.select().from(schema.events).orderBy(desc(schema.events.eventDate));
          const registrations = await db.select().from(schema.eventRegistrations);
          events = eventsList.map(event => {
            const eventGuests = registrations.filter(r => r.eventId === event.id);
            return {
              ...event,
              registrationsCount: eventGuests.length,
              attendedCount: eventGuests.filter(g => g.attended).length,
            };
          });

          blogs = await db
            .select({
              id: schema.blogs.id,
              title: schema.blogs.title,
              slug: schema.blogs.slug,
              tags: schema.blogs.tags,
              coverImage: schema.blogs.coverImage,
              status: schema.blogs.status,
              createdAt: schema.blogs.createdAt,
              category: {
                name: schema.blogCategories.name,
              },
            })
            .from(schema.blogs)
            .leftJoin(schema.blogCategories, eq(schema.blogs.categoryId, schema.blogCategories.id))
            .orderBy(desc(schema.blogs.createdAt));

          testimonials = await db.select().from(schema.testimonials).orderBy(desc(schema.testimonials.createdAt));
          team = await db.select().from(schema.teamMembers).orderBy(asc(schema.teamMembers.displayOrder));
          documents = await db.select().from(schema.documents).orderBy(desc(schema.documents.createdAt));
          
          auditLogs = await db
            .select({
              id: schema.auditLogs.id,
              action: schema.auditLogs.action,
              module: schema.auditLogs.module,
              ipAddress: schema.auditLogs.ipAddress,
              createdAt: schema.auditLogs.createdAt,
              user: {
                name: schema.users.name,
                email: schema.users.email,
              },
            })
            .from(schema.auditLogs)
            .leftJoin(schema.users, eq(schema.auditLogs.userId, schema.users.id))
            .orderBy(desc(schema.auditLogs.createdAt));
        } catch (dbError) {
          console.error("Drizzle authenticated data read failed, falling back to schema defaults:", dbError);
        }
      }

      return NextResponse.json({
        ...data,
        queries,
        volunteers,
        donations,
        causes: causes.length > 0 ? causes : data.causes,
        events,
        blogs,
        testimonials,
        team,
        documents,
        auditLogs,
        isAdmin: true,
      });
    }

    // Public response (omit query/volunteer logs)
    return NextResponse.json({
      ...data,
      isAdmin: false,
    });
  } catch (error) {
    console.error("Error reading database:", error);
    return NextResponse.json(
      { error: "Failed to read database configuration" },
      { status: 500 }
    );
  }
}

// POST updates website settings (requires auth)
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();

    // Verify format (basic validation of fields)
    if (!payload.settings || !payload.banners || !payload.gallery || !payload.causes || !payload.payment) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    // Save configurations
    await saveDbData(payload);

    // Sync query deletions
    if (payload.queries) {
      const currentQueries = await getQueries();
      const incomingIds = new Set(payload.queries.map((q: any) => q.id));
      for (const q of currentQueries) {
        if (!incomingIds.has(q.id)) {
          await deleteQuery(q.id);
        }
      }
    }

    // Sync volunteer deletions
    if (payload.volunteers) {
      const currentVols = await getVolunteers();
      const incomingIds = new Set(payload.volunteers.map((v: any) => v.id));
      for (const v of currentVols) {
        if (!incomingIds.has(v.id)) {
          await deleteVolunteer(v.id);
        }
      }
    }

    return NextResponse.json({ success: true, message: "Settings saved successfully" });
  } catch (error) {
    console.error("Error writing database:", error);
    return NextResponse.json(
      { error: "Failed to save database configuration" },
      { status: 500 }
    );
  }
}
