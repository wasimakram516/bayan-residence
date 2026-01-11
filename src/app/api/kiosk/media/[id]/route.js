import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import KioskConfig from "@/models/KioskConfig";
import { deleteFromS3 } from "@/lib/s3";

export async function DELETE(req, context) {
  try {
    await dbConnect();

    /* =========================
       UNWRAP PARAMS (NEXT 15)
    ========================= */
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Media ID missing" },
        { status: 400 }
      );
    }

    const config = await KioskConfig.findOne();
    if (!config) {
      return NextResponse.json(
        { error: "Config not found" },
        { status: 404 }
      );
    }

    const media = config.media.id(id);
    if (!media) {
      return NextResponse.json(
        { error: "Media not found" },
        { status: 404 }
      );
    }

    /* =========================
       DELETE FROM S3 SAFELY
    ========================= */
    if (media.s3Key) {
      await deleteFromS3(media.s3Key);
    }

    media.deleteOne();
    await config.save();

    return NextResponse.json({ ok: true, config });
  } catch (err) {
    console.error("DELETE /api/kiosk/media/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
