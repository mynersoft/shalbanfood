import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  try {
    const { imageUrl } = await req.json();

    const upload = await cloudinary.uploader.upload(imageUrl, {
      folder: "products",
    });
console.log(imageUrl);

    return Response.json({ url: upload.secure_url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}