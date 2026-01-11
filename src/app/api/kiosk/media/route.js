import "server-only";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import KioskConfig from "@/models/KioskConfig";
import { s3, deleteFromS3 } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(req) {
  await dbConnect();
  const body = await req.json();

  /* ================= PRESIGN ================= */
  if (body.presign) {
    const { fileName, fileType } = body;

    const folder = fileType.startsWith("image")
      ? "images"
      : fileType.startsWith("video")
      ? "videos"
      : "pdfs";

    const key = `Bayan Residence/${folder}/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ContentType: fileType,
    });

    const uploadURL = await getSignedUrl(s3, command, { expiresIn: 60 });

    return NextResponse.json({
      uploadURL,
      key,
      fileUrl: `${process.env.CLOUDFRONT_URL}/${key}`,
    });
  }

  /* ================= SAVE ================= */
  const { type, fileName, s3Key, fileUrl } = body;

  let config = await KioskConfig.findOne();
  if (!config) config = await KioskConfig.create({});

  // enforce single video/pdf
  if (type === "video" || type === "pdf") {
    const existing = config.media.filter((m) => m.type === type);
    for (const m of existing) {
      await deleteFromS3(m.s3Key);
    }
    config.media = config.media.filter((m) => m.type !== type);
  }

  config.media.push({ type, fileName, s3Key, fileUrl });
  await config.save();

  return NextResponse.json({ ok: true, config });
}
