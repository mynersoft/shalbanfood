import { NextResponse } from "next/server";
import cloudinary from "cloudinary";
import TestProduct from "@/models/testProducts";

import { connectDB } from "@/lib/dbConnect";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { imageUrl, title } = body;

    if (!imageUrl)
      return NextResponse.json(
        { message: "imageUrl required" },
        { status: 400 }
      );

    // Download remote image
    const imgBuffer = await fetch(imageUrl).then((r) => r.arrayBuffer());

    // Upload to Cloudinary
    const uploadRes = await new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        { folder: "test-products" },
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );

      stream.end(Buffer.from(imgBuffer));
    });

    // Save in DB
    await dbConnect();
    const product = await TestProduct.create({
      name: title,
      images: [{ url: uploadRes.secure_url, public_id: uploadRes.public_id }],
      category: "test",
    });

    return NextResponse.json({
      message: "Saved",
      product,
    });
  } catch (e) {
    return NextResponse.json(
      { message: "Upload error", error: e.message },
      { status: 500 }
    );
  }
}