import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(request) {
    try {
        const formData = await request.formData();

        const file = formData.get("file");

        if (!file) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Image file is required",
                },
                { status: 400 }
            );
        }

        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Only image files are allowed",
                },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise(
            (resolve, reject) => {
                const uploadStream =
                    cloudinary.uploader.upload_stream(
                        {
                            folder: "shalbanfood/offers",
                            resource_type: "image",
                        },
                        (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result);
                            }
                        }
                    );

                uploadStream.end(buffer);
            }
        );

        return NextResponse.json(
            {
                success: true,
                url: result.secure_url,
                publicId: result.public_id,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(
            "OFFER IMAGE UPLOAD ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Image upload failed",
            },
            { status: 500 }
        );
    }
}