import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import Product from "@/models/Product";




import { connectDB } from "@/lib/dbConnect";

export async function POST(req) {
  try {
    // 1️⃣ Connect to DB
    await connectDB();

    // 2️⃣ Get form data
    const formData = await req.formData();

    const name = formData.get("name");
    const category = formData.get("category");
    const subCategory = formData.get("subCategory");
    const brand = formData.get("brand");
    const stock = formData.get("stock");
    const regularPrice = formData.get("regularPrice");
    const sellPrice = formData.get("sellPrice");
    const warranty = formData.get("warranty");

    const file = formData.get("image");

    if (!file) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    // 3️⃣ Convert image file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 4️⃣ Upload image to Cloudinary
    const uploadRes = await new Promise((resolve) => {
      cloudinary.uploader
        .upload_stream({ folder: "products" }, (err, result) => {
          if (err) resolve({ error: err.message });
          resolve(result);
        })
        .end(buffer);
    });

    if (uploadRes.error) {
      return NextResponse.json({ error: uploadRes.error }, { status: 500 });
    }

    // 5️⃣ Save product in DB
    const product = await Product.create({
      name,
      category,
      subCategory,
      brand,
      stock,
      regularPrice,
      sellPrice,
      warranty,
      image: uploadRes.secure_url,
    });

    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}