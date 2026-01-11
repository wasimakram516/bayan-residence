// src/app/api/config/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import KioskConfig from "@/models/KioskConfig";

export async function GET() {
  try {
    await dbConnect();

    let config = await KioskConfig.findOne();
    if (!config) {
      config = new KioskConfig();
      await config.save();
    }

    return NextResponse.json({ success: true, config });
  } catch (err) {
    console.error("Config GET error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();

    let config = await KioskConfig.findOne();
    if (!config) config = new KioskConfig();

    // Update only provided fields
    if (body.location !== undefined) config.location = body.location;
    if (body.signupLink !== undefined) config.signupLink = body.signupLink;

    await config.save();

    return NextResponse.json({ success: true, config });
  } catch (err) {
    console.error("Config PUT error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
