import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import sharp from "sharp";


export async function POST(req: Request) {
  try {
    // 1. Authorize user using Supabase server client
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 3. Setup file naming
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFilename = `${timestamp}_${sanitizedName}`;

    // Read buffer and compress it
    const arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);

    if (file.type.startsWith("image/")) {
      try {
        let sharpInstance = sharp(buffer)
          .rotate()
          .resize({
            width: 1600,
            height: 1600,
            fit: "inside",
            withoutEnlargement: true,
          });

        if (file.type === "image/png") {
          buffer = await sharpInstance.png({ quality: 80, palette: true }).toBuffer();
        } else if (file.type === "image/webp") {
          buffer = await sharpInstance.webp({ quality: 80 }).toBuffer();
        } else if (file.type === "image/gif") {
          // Keep animated GIFs or other GIFs unchanged
        } else {
          buffer = await sharpInstance.jpeg({ quality: 80, mozjpeg: true }).toBuffer();
        }
      } catch (sharpError) {
        console.error("Image compression failed, using original buffer:", sharpError);
      }
    }

    // 4. If Supabase is configured, upload to storage bucket using the authenticated client
    if (supabaseServer) {
      try {
        const { error: uploadError } = await supabaseServer.storage
          .from("charity-assets")
          .upload(uniqueFilename, buffer, {
            contentType: file.type,
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabaseServer.storage
          .from("charity-assets")
          .getPublicUrl(uniqueFilename);

        return NextResponse.json({ success: true, url: publicUrlData.publicUrl });
      } catch (storageError) {
        console.warn("Supabase storage upload failed, falling back to local storage", storageError);
      }
    }

    // 5. Fallback to Local Filesystem
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, uniqueFilename);
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${uniqueFilename}`;
    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Image upload failed. Ensure server permissions allow writing to public/uploads." },
      { status: 500 }
    );
  }
}
