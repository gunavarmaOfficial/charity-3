import { createClient } from "@supabase/supabase-js";
import { db } from "./db";
import * as schema from "./db/schema";
import { eq, asc, desc } from "drizzle-orm";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase Client with service key (backend writes) or anon key (for Storage/Auth)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)
  : null;

// GET Web data (settings, banners, gallery, causes, payment)
export async function getDbData() {
  if (!db) {
    throw new Error("Database not connected");
  }

  try {
    // 1. Fetch settings
    const settingsData = await db.select().from(schema.settings).where(eq(schema.settings.id, 1)).limit(1);

    // 2. Fetch banners
    const bannersData = await db.select().from(schema.banners).orderBy(asc(schema.banners.id));

    // 3. Fetch gallery
    const galleryData = await db.select().from(schema.gallery).orderBy(asc(schema.gallery.id));

    // 4. Fetch causes
    const causesData = await db.select().from(schema.causes).orderBy(asc(schema.causes.id));

    // 5. Fetch payment
    const paymentData = await db.select().from(schema.payment).where(eq(schema.payment.id, 1)).limit(1);

    return {
      settings: settingsData[0]
        ? {
            siteTitle: settingsData[0].siteTitle,
            whatsappNumber: settingsData[0].whatsappNumber,
            phone: settingsData[0].phone,
            email: settingsData[0].email,
            address: settingsData[0].address,
            tawkPropertyId: settingsData[0].tawkPropertyId || "",
            tawkWidgetId: settingsData[0].tawkWidgetId || "",
          }
        : {
            siteTitle: "Sri Viswa Charitable Trust",
            whatsappNumber: "+919944534098",
            phone: "+91 99445 34098",
            email: "noreply@srivisawacharitabletrust.com",
            address: "No. 128, Mani Nagar 2nd Street, Sivanandhapuram, Saravanampatti, Coimbatore - 641035",
            tawkPropertyId: "",
            tawkWidgetId: "",
          },
      banners: bannersData ? bannersData.map((b) => b.imageUrl) : [],
      gallery: galleryData
        ? galleryData.map((g) => ({
            src: g.src,
            title: g.title,
            category: g.category,
            description: g.description,
          }))
        : [],
      causes: causesData
        ? causesData.map((c) => ({
            title: c.title,
            description: c.description,
            image: c.image,
            goal: Number(c.goal),
            raised: Number(c.raised),
            impact: c.impact,
            location: c.location,
            category: c.category,
          }))
        : [],
      payment: paymentData[0]
        ? {
            razorpayApiKey: paymentData[0].razorpayApiKey || "",
            bankName: paymentData[0].bankName || "",
            accountNumber: paymentData[0].accountNumber || "",
            ifscCode: paymentData[0].ifscCode || "",
            accountName: paymentData[0].accountName || "",
            branchName: paymentData[0].branchName || "",
            upiId: paymentData[0].upiId || "",
            qrCodeUrl: paymentData[0].qrCodeUrl || "",
          }
        : {
            razorpayApiKey: "",
            bankName: "State Bank of India",
            accountNumber: "12345678901",
            ifscCode: "SBIN0001234",
            accountName: "Sri Viswa Charitable Trust",
            branchName: "Saravanampatti Branch",
            upiId: "sriviswa@okaxis",
            qrCodeUrl: "",
          },
    };
  } catch (error) {
    console.error("Drizzle database read failed:", error);
    throw error;
  }
}

// POST updates website settings (settings, banners, gallery, causes, payment)
export async function saveDbData(payload: any) {
  if (!db) {
    throw new Error("Database not connected");
  }

  try {
    // 1. Update settings
    const settings = payload.settings;
    await db.insert(schema.settings).values({
      id: 1,
      siteTitle: settings.siteTitle,
      whatsappNumber: settings.whatsappNumber,
      phone: settings.phone,
      email: settings.email,
      address: settings.address,
      tawkPropertyId: settings.tawkPropertyId || "",
      tawkWidgetId: settings.tawkWidgetId || "",
    }).onConflictDoUpdate({
      target: schema.settings.id,
      set: {
        siteTitle: settings.siteTitle,
        whatsappNumber: settings.whatsappNumber,
        phone: settings.phone,
        email: settings.email,
        address: settings.address,
        tawkPropertyId: settings.tawkPropertyId || "",
        tawkWidgetId: settings.tawkWidgetId || "",
      }
    });

    // 2. Update banners
    await db.delete(schema.banners);
    if (payload.banners && payload.banners.length > 0) {
      const bannerRows = payload.banners.map((url: string) => ({ imageUrl: url }));
      await db.insert(schema.banners).values(bannerRows);
    }

    // 3. Update gallery
    await db.delete(schema.gallery);
    if (payload.gallery && payload.gallery.length > 0) {
      const galleryRows = payload.gallery.map((g: any) => ({
        src: g.src,
        title: g.title,
        category: g.category,
        description: g.description,
      }));
      await db.insert(schema.gallery).values(galleryRows);
    }

    // 4. Update causes (Safe Upsert & Sync)
    if (payload.causes) {
      const existingCauses = await db.select().from(schema.causes);
      const incomingTitles = new Set(payload.causes.map((c: any) => c.title.trim()));

      // A. Delete causes that are no longer in the payload
      for (const exCause of existingCauses) {
        if (!incomingTitles.has(exCause.title.trim())) {
          try {
            await db.delete(schema.causes).where(eq(schema.causes.id, exCause.id));
          } catch (delErr) {
            console.warn(`Could not delete cause "${exCause.title}" due to references, updating status to draft:`, delErr);
            await db.update(schema.causes)
              .set({ status: "draft" })
              .where(eq(schema.causes.id, exCause.id));
          }
        }
      }

      // B. Upsert incoming causes
      for (const c of payload.causes) {
        const titleTrimmed = c.title.trim();
        const slug = c.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const matchingCause = existingCauses.find(ex => ex.title.trim().toLowerCase() === titleTrimmed.toLowerCase());

        if (matchingCause) {
          await db.update(schema.causes)
            .set({
              description: c.description,
              goal: c.goal.toString(),
              raised: c.raised.toString(),
              image: c.image,
              impact: c.impact || "",
              location: c.location || "",
              category: c.category || "",
            })
            .where(eq(schema.causes.id, matchingCause.id));
        } else {
          await db.insert(schema.causes).values({
            title: titleTrimmed,
            slug: slug,
            description: c.description,
            goal: c.goal.toString(),
            raised: c.raised.toString(),
            image: c.image,
            impact: c.impact || "",
            location: c.location || "",
            category: c.category || "",
            status: "published",
          });
        }
      }
    }


    // 5. Update payment
    const payment = payload.payment;
    await db.insert(schema.payment).values({
      id: 1,
      razorpayApiKey: payment.razorpayApiKey || "",
      bankName: payment.bankName || "",
      accountNumber: payment.accountNumber || "",
      ifscCode: payment.ifscCode || "",
      accountName: payment.accountName || "",
      branchName: payment.branchName || "",
      upiId: payment.upiId || "",
      qrCodeUrl: payment.qrCodeUrl || "",
    }).onConflictDoUpdate({
      target: schema.payment.id,
      set: {
        razorpayApiKey: payment.razorpayApiKey || "",
        bankName: payment.bankName || "",
        accountNumber: payment.accountNumber || "",
        ifscCode: payment.ifscCode || "",
        accountName: payment.accountName || "",
        branchName: payment.branchName || "",
        upiId: payment.upiId || "",
        qrCodeUrl: payment.qrCodeUrl || "",
      }
    });
  } catch (error) {
    console.error("Drizzle save failed:", error);
    throw error;
  }
}

// Queries CRUD
export async function getQueries() {
  if (!db) {
    throw new Error("Database not connected");
  }
  try {
    const data = await db.select().from(schema.queries).orderBy(desc(schema.queries.createdAt));
    return data.map((q) => ({
      id: q.id.toString(),
      name: q.name,
      email: q.email,
      subject: q.subject,
      message: q.message,
      createdAt: q.createdAt ? q.createdAt.toISOString() : new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Drizzle queries read failed:", error);
    throw error;
  }
}

export async function addQuery(query: any) {
  if (!db) {
    throw new Error("Database not connected");
  }
  try {
    await db.insert(schema.queries).values({
      name: query.name,
      email: query.email,
      subject: query.subject,
      message: query.message,
      createdAt: query.createdAt ? new Date(query.createdAt) : new Date(),
    });
  } catch (error) {
    console.error("Drizzle query insertion failed:", error);
    throw error;
  }
}

export async function deleteQuery(id: string) {
  if (!db) {
    throw new Error("Database not connected");
  }
  try {
    const numericId = parseInt(id, 10);
    if (!isNaN(numericId)) {
      await db.delete(schema.queries).where(eq(schema.queries.id, numericId));
    }
  } catch (error) {
    console.error("Drizzle query deletion failed:", error);
    throw error;
  }
}

// Volunteers CRUD
export async function getVolunteers() {
  if (!db) {
    throw new Error("Database not connected");
  }
  try {
    const data = await db.select().from(schema.volunteers).orderBy(desc(schema.volunteers.createdAt));
    return data.map((v) => ({
      id: v.id.toString(),
      name: v.name,
      email: v.email,
      phone: v.phone,
      interests: v.interests,
      availability: v.availability,
      experience: v.experience,
      message: v.message,
      createdAt: v.createdAt ? v.createdAt.toISOString() : new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Drizzle volunteers read failed:", error);
    throw error;
  }
}

export async function addVolunteer(volunteer: any) {
  if (!db) {
    throw new Error("Database not connected");
  }
  try {
    await db.insert(schema.volunteers).values({
      name: volunteer.name,
      email: volunteer.email,
      phone: volunteer.phone,
      interests: volunteer.interests,
      availability: volunteer.availability,
      experience: volunteer.experience,
      message: volunteer.message,
      createdAt: volunteer.createdAt ? new Date(volunteer.createdAt) : new Date(),
    });
  } catch (error) {
    console.error("Drizzle volunteer insertion failed:", error);
    throw error;
  }
}

export async function deleteVolunteer(id: string) {
  if (!db) {
    throw new Error("Database not connected");
  }
  try {
    const numericId = parseInt(id, 10);
    if (!isNaN(numericId)) {
      await db.delete(schema.volunteers).where(eq(schema.volunteers.id, numericId));
    }
  } catch (error) {
    console.error("Drizzle volunteer deletion failed:", error);
    throw error;
  }
}
