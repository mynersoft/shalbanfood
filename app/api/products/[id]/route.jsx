import { connectDB } from "@/lib/dbConnect";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

import cloudinary from "@/lib/cloudinary";



export async function PUT(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const id = formData.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const file = formData.get("image");
    let imageUrl;

    if (file && typeof file === "object") {
      const buffer = Buffer.from(await file.arrayBuffer());

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

      imageUrl = uploadRes.secure_url;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: formData.get("name"),
        category: formData.get("category"),
        subCategory: formData.get("subCategory"),
        brand: formData.get("brand"),
        stock: formData.get("stock"),
        regularPrice: formData.get("regularPrice"),
        sellPrice: formData.get("sellPrice"),
        warranty: formData.get("warranty"),
        ...(imageUrl && { image: imageUrl }),
      },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product: updatedProduct }); // ✔️ JSON format fixed
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}