import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Product from "@/models/Product";

import cloudinary from "@/lib/cloudinary";

// ======================================================
// ================== GET PRODUCTS ======================
// ======================================================
export async function GET(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);

        const page =
            Number(searchParams.get("page")) || 1;

        const limit =
            Number(searchParams.get("limit")) || 10;

        const skip = (page - 1) * limit;

        // ------------------------------------------------
        // Fetch paginated products
        // ------------------------------------------------
        const products = await Product.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        // ------------------------------------------------
        // Calculate total inventory amount
        // ALL products, not only current page
        // ------------------------------------------------
        const allProducts = await Product.find(
            {},
            {
                stock: 1,
                regularPrice: 1,
            }
        );

        const totalAmount = allProducts.reduce(
            (sum, product) => {
                const stock =
                    Number(product.stock) || 0;

                const price =
                    Number(product.regularPrice) || 0;

                return sum + stock * price;
            },
            0
        );

        return NextResponse.json(
            {
                success: true,
                products,
                totalAmount,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            "GET products error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Server Error",
                error: error.message,
            },
            {
                status: 500,
            }
        );
    }
}

// ======================================================
// ================== POST - ADD PRODUCT =================
// ======================================================
export async function POST(req) {
    try {
        await connectDB();

        const formData = await req.formData();

        // ------------------------------------------------
        // BASIC PRODUCT DATA
        // ------------------------------------------------
        const name = formData.get("name");
        const category =
            formData.get("category");

        const subCategory =
            formData.get("subCategory") || "";

        const brand =
            formData.get("brand") || "";

        const stock = Number(
            formData.get("stock") || 0
        );

        const regularPrice = Number(
            formData.get("regularPrice") || 0
        );

        const sellPrice = Number(
            formData.get("sellPrice") || 0
        );

        const warranty =
            formData.get("warranty") || "";

        // ------------------------------------------------
        // VALIDATION
        // ------------------------------------------------
        if (!name || !category) {
            return NextResponse.json(
                {
                    error:
                        "Product name and category are required",
                },
                {
                    status: 400,
                }
            );
        }

        // =================================================
        // PRODUCT SIZE
        // =================================================

        const sizeData = formData.get("size");

        let size = null;

        if (sizeData) {
            try {
                size =
                    typeof sizeData === "string"
                        ? JSON.parse(sizeData)
                        : sizeData;
            } catch (error) {
                console.error(
                    "SIZE PARSE ERROR:",
                    error
                );

                return NextResponse.json(
                    {
                        error:
                            "Invalid product size",
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        // ------------------------------------------------
        // Validate size
        // ------------------------------------------------
        if (
            !size ||
            size.value === undefined ||
            size.value === null ||
            Number(size.value) <= 0 ||
            !size.unit
        ) {
            return NextResponse.json(
                {
                    error:
                        "Valid product size is required",
                },
                {
                    status: 400,
                }
            );
        }

        // ------------------------------------------------
        // Allowed units
        // ------------------------------------------------
        const allowedUnits = [
            "gram",
            "kg",
            "milliliter",
            "litre",
        ];

        if (!allowedUnits.includes(size.unit)) {
            return NextResponse.json(
                {
                    error:
                        "Invalid product size unit",
                },
                {
                    status: 400,
                }
            );
        }

        // =================================================
        // IMAGE UPLOAD
        // =================================================

        let finalImage = "";

        // ------------------------------------------------
        // CASE 1
        // Google Image URL
        // ------------------------------------------------
        const googleImageUrl =
            formData.get("imageUrl");

        if (
            googleImageUrl &&
            typeof googleImageUrl === "string"
        ) {
            try {
                const uploadResponse =
                    await cloudinary.uploader.upload(
                        googleImageUrl,
                        {
                            folder: "products",
                        }
                    );

                finalImage =
                    uploadResponse.secure_url;
            } catch (error) {
                console.error(
                    "GOOGLE IMAGE UPLOAD ERROR:",
                    error
                );
            }
        }

        // ------------------------------------------------
        // CASE 2
        // Local uploaded image
        // ------------------------------------------------
        const file =
            formData.get("image");

        if (
            file &&
            typeof file !== "string" &&
            file.size > 0
        ) {
            const bytes =
                await file.arrayBuffer();

            const buffer =
                Buffer.from(bytes);

            const uploadResponse =
                await new Promise(
                    (resolve, reject) => {
                        cloudinary.uploader
                            .upload_stream(
                                {
                                    folder:
                                        "products",
                                },
                                (
                                    err,
                                    result
                                ) => {
                                    if (err) {
                                        reject(
                                            err
                                        );
                                    } else {
                                        resolve(
                                            result
                                        );
                                    }
                                }
                            )
                            .end(buffer);
                    }
                );

            finalImage =
                uploadResponse.secure_url;
        }

        // =================================================
        // CREATE PRODUCT
        // =================================================

        const newProduct =
            await Product.create({
                name: name.trim(),

                category: category.trim(),

                subCategory:
                    subCategory.toString().trim(),

                brand:
                    brand.toString().trim(),

                // ⭐ SIZE
                size: {
                    value: Number(
                        size.value
                    ),
                    unit: size.unit,
                },

                stock,

                regularPrice,

                sellPrice,

                warranty:
                    warranty
                        .toString()
                        .trim(),

                image: finalImage,

                soldCount: 0,
            });

        console.log(
            "PRODUCT CREATED:",
            newProduct
        );

        return NextResponse.json(
            {
                success: true,
                message:
                    "Product added successfully",
                product:
                    JSON.parse(
                        JSON.stringify(
                            newProduct
                        )
                    ),
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(
            "PRODUCT ADD ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    error.message ||
                    "Failed to add product",
            },
            {
                status: 500,
            }
        );
    }
}

// ======================================================
// ================== PUT - UPDATE PRODUCT ==============
// ======================================================
export async function PUT(request) {
    try {
        await connectDB();

        const formData =
            await request.formData();

        // ------------------------------------------------
        // PRODUCT ID
        // ------------------------------------------------
        const _id = formData.get("_id");

        if (!_id) {
            return NextResponse.json(
                {
                    error:
                        "Product ID missing",
                },
                {
                    status: 400,
                }
            );
        }

        // ------------------------------------------------
        // CHECK PRODUCT
        // ------------------------------------------------
        const existingProduct =
            await Product.findById(_id);

        if (!existingProduct) {
            return NextResponse.json(
                {
                    error:
                        "Product not found",
                },
                {
                    status: 404,
                }
            );
        }

        // =================================================
        // BASIC FIELDS
        // =================================================

        const name =
            formData.get("name");

        const category =
            formData.get("category");

        const subCategory =
            formData.get("subCategory") || "";

        const brand =
            formData.get("brand") || "";

        const stock = Number(
            formData.get("stock") || 0
        );

        const regularPrice = Number(
            formData.get(
                "regularPrice"
            ) || 0
        );

        const sellPrice = Number(
            formData.get("sellPrice") || 0
        );

        const warranty =
            formData.get("warranty") || "";

        // =================================================
        // PRODUCT SIZE
        // =================================================

        const sizeData =
            formData.get("size");

        let size = null;

        if (sizeData) {
            try {
                size =
                    typeof sizeData ===
                    "string"
                        ? JSON.parse(
                              sizeData
                          )
                        : sizeData;
            } catch (error) {
                console.error(
                    "SIZE PARSE ERROR:",
                    error
                );

                return NextResponse.json(
                    {
                        error:
                            "Invalid product size",
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        // ------------------------------------------------
        // For old products
        // If size doesn't exist, don't break update
        // ------------------------------------------------
        if (size) {
            const allowedUnits = [
                "gram",
                "kg",
                "milliliter",
                "litre",
            ];

            if (
                !size.value ||
                Number(size.value) <= 0 ||
                !size.unit
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Valid product size is required",
                    },
                    {
                        status: 400,
                    }
                );
            }

            if (
                !allowedUnits.includes(
                    size.unit
                )
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Invalid product size unit",
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        // =================================================
        // IMAGE
        // =================================================

        let finalImage =
            existingProduct.image || "";

        const imageFile =
            formData.get("image");

        // ------------------------------------------------
        // New image selected
        // ------------------------------------------------
        if (
            imageFile &&
            typeof imageFile !==
                "string" &&
            imageFile.size > 0
        ) {
            const arrayBuffer =
                await imageFile.arrayBuffer();

            const buffer =
                Buffer.from(
                    arrayBuffer
                );

            const uploadToCloudinary =
                () =>
                    new Promise(
                        (
                            resolve,
                            reject
                        ) => {
                            const stream =
                                cloudinary
                                    .uploader
                                    .upload_stream(
                                        {
                                            folder:
                                                "products",
                                        },
                                        (
                                            err,
                                            result
                                        ) => {
                                            if (
                                                err
                                            ) {
                                                reject(
                                                    err
                                                );
                                            } else {
                                                resolve(
                                                    result
                                                );
                                            }
                                        }
                                    );

                            stream.end(
                                buffer
                            );
                        }
                    );

            const result =
                await uploadToCloudinary();

            finalImage =
                result.secure_url;
        }

        // =================================================
        // UPDATE DATA
        // =================================================

        const updateFields = {
            name:
                name?.toString().trim(),

            category:
                category?.toString().trim(),

            subCategory:
                subCategory
                    .toString()
                    .trim(),

            brand:
                brand.toString().trim(),

            stock,

            regularPrice,

            sellPrice,

            warranty:
                warranty
                    .toString()
                    .trim(),

            image: finalImage,
        };

        // ------------------------------------------------
        // Add size only when received
        // ------------------------------------------------
        if (size) {
            updateFields.size = {
                value: Number(
                    size.value
                ),
                unit: size.unit,
            };
        }

        // =================================================
        // UPDATE DATABASE
        // =================================================

        const updated =
            await Product.findByIdAndUpdate(
                _id,
                updateFields,
                {
                    new: true,
                    runValidators: true,
                }
            );

        return NextResponse.json(
            {
                success: true,
                message:
                    "Product updated successfully",
                product: updated,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            "PUT PRODUCT ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    error.message ||
                    "Failed to update product",
            },
            {
                status: 500,
            }
        );
    }
}

// ======================================================
// ================== DELETE PRODUCT ====================
// ======================================================
export async function DELETE(request) {
    try {
        await connectDB();

        const { searchParams } =
            new URL(request.url);

        const id =
            searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                {
                    error:
                        "Product ID missing",
                },
                {
                    status: 400,
                }
            );
        }

        const deletedProduct =
            await Product.findByIdAndDelete(
                id
            );

        if (!deletedProduct) {
            return NextResponse.json(
                {
                    error:
                        "Product not found",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message:
                    "Product deleted successfully",
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            "DELETE PRODUCT ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    error.message ||
                    "Failed to delete product",
            },
            {
                status: 500,
            }
        );
    }
}