import "server-only";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import KioskConfig from "@/models/KioskConfig";
import { deleteFromS3 } from "@/lib/s3";

export async function DELETE(req, { params }) {
  await dbConnect();
  const { id } = params;

  const config = await KioskConfig.findOne();
  const media = config.media.id(id);

  await deleteFromS3(media.s3Key);
  media.deleteOne();
  await config.save();

  return NextResponse.json({ ok: true, config });
}
