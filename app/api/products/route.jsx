import { NextResponse } from 'next/server';

import { connectDB } from '@/lib/dbConnect';
import Product from '@/models/Product';

import cloudinary from '@/lib/cloudinary';


// ======================================================
// CONSTANTS
// ======================================================

const ALLOWED_UNITS = [
    'gram',
    'kg',
    'milliliter',
    'litre',
    'piece',
];

const MAX_VARIANTS = 4;


// ======================================================
// HELPERS
// ======================================================

function parseJSON(value, fallback = null) {
    if (!value) return fallback;

    if (typeof value !== 'string') {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}


function normalizeKeywords(value) {
    const parsed = parseJSON(value, []);

    if (Array.isArray(parsed)) {
        return parsed
            .map((item) =>
                String(item)
                    .trim()
                    .toLowerCase()
            )
            .filter(Boolean);
    }

    if (typeof value === 'string') {
        return value
            .split(',')
            .map((item) =>
                item
                    .trim()
                    .toLowerCase()
            )
            .filter(Boolean);
    }

    return [];
}


function normalizeSlug(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}


function validateVariants(variants) {
    if (!Array.isArray(variants)) {
        return {
            valid: false,
            message:
                'Variants must be an array.',
        };
    }

    if (
        variants.length < 1 ||
        variants.length > MAX_VARIANTS
    ) {
        return {
            valid: false,
            message:
                'Product must have 1 to 4 variants.',
        };
    }


    const duplicateKeys = new Set();


    for (
        let index = 0;
        index < variants.length;
        index++
    ) {
        const variant =
            variants[index];


        const value =
            Number(variant.value);

        const regularPrice =
            Number(
                variant.regularPrice
            );

        const sellPrice =
            Number(
                variant.sellPrice
            );

        const stock =
            Number(
                variant.stock ?? 0
            );

        const unit =
            String(
                variant.unit || ''
            )
                .trim()
                .toLowerCase();


        // ----------------------------------------------
        // SIZE
        // ----------------------------------------------

        if (
            !Number.isFinite(value) ||
            value <= 0
        ) {
            return {
                valid: false,
                message:
                    `Variant ${index + 1}: valid size is required.`,
            };
        }


        // ----------------------------------------------
        // UNIT
        // ----------------------------------------------

        if (
            !ALLOWED_UNITS.includes(
                unit
            )
        ) {
            return {
                valid: false,
                message:
                    `Variant ${index + 1}: invalid unit.`,
            };
        }


        // ----------------------------------------------
        // REGULAR PRICE
        // ----------------------------------------------

        if (
            !Number.isFinite(
                regularPrice
            ) ||
            regularPrice < 0
        ) {
            return {
                valid: false,
                message:
                    `Variant ${index + 1}: invalid regular price.`,
            };
        }


        // ----------------------------------------------
        // SELL PRICE
        // ----------------------------------------------

        if (
            !Number.isFinite(
                sellPrice
            ) ||
            sellPrice < 0
        ) {
            return {
                valid: false,
                message:
                    `Variant ${index + 1}: invalid sell price.`,
            };
        }


        if (
            sellPrice >
            regularPrice
        ) {
            return {
                valid: false,
                message:
                    `Variant ${index + 1}: sell price cannot be higher than regular price.`,
            };
        }


        // ----------------------------------------------
        // STOCK
        // ----------------------------------------------

        if (
            !Number.isFinite(stock) ||
            stock < 0
        ) {
            return {
                valid: false,
                message:
                    `Variant ${index + 1}: invalid stock.`,
            };
        }


        // ----------------------------------------------
        // DUPLICATE SIZE
        // ----------------------------------------------

        const key =
            `${value}-${unit}`;

        if (
            duplicateKeys.has(key)
        ) {
            return {
                valid: false,
                message:
                    `Duplicate variant found: ${value} ${unit}.`,
            };
        }

        duplicateKeys.add(key);
    }


    return {
        valid: true,
    };
}


// ======================================================
// CLOUDINARY FILE UPLOAD
// ======================================================

async function uploadFileToCloudinary(
    file
) {
    const bytes =
        await file.arrayBuffer();

    const buffer =
        Buffer.from(bytes);


    return new Promise(
        (resolve, reject) => {
            const stream =
                cloudinary.uploader.upload_stream(
                    {
                        folder:
                            'products',
                    },

                    (
                        error,
                        result
                    ) => {
                        if (error) {
                            reject(
                                error
                            );
                        } else {
                            resolve(
                                result
                            );
                        }
                    }
                );


            stream.end(buffer);
        }
    );
}


// ======================================================
// CLOUDINARY URL UPLOAD
// ======================================================

async function uploadUrlToCloudinary(
    imageUrl
) {
    return cloudinary.uploader.upload(
        imageUrl,
        {
            folder:
                'products',
        }
    );
}


// ======================================================
// ================== GET PRODUCTS ======================
// ======================================================

export async function GET(req) {
    try {
        await connectDB();


        const {
            searchParams,
        } = new URL(req.url);


        const page = Math.max(
            Number(
                searchParams.get(
                    'page'
                )
            ) || 1,
            1
        );


        const limit = Math.min(
            Math.max(
                Number(
                    searchParams.get(
                        'limit'
                    )
                ) || 10,
                1
            ),
            100
        );


        const skip =
            (page - 1) * limit;


        // ------------------------------------------------
        // PAGINATED PRODUCTS
        // ------------------------------------------------

        const products =
            await Product.find()
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limit)
                .lean();


        // ------------------------------------------------
        // TOTAL PRODUCT COUNT
        // ------------------------------------------------

        const totalProducts =
            await Product.countDocuments();


        // ------------------------------------------------
        // TOTAL INVENTORY VALUE
        //
        // regularPrice × stock
        // for every variant
        // ------------------------------------------------

        const inventoryProducts =
            await Product.find(
                {},
                {
                    variants: 1,
                }
            ).lean();


        const totalAmount =
            inventoryProducts.reduce(
                (
                    total,
                    product
                ) => {
                    if (
                        !Array.isArray(
                            product.variants
                        )
                    ) {
                        return total;
                    }


                    const productTotal =
                        product.variants.reduce(
                            (
                                sum,
                                variant
                            ) => {
                                const stock =
                                    Number(
                                        variant.stock
                                    ) || 0;

                                const price =
                                    Number(
                                        variant.regularPrice
                                    ) || 0;

                                return (
                                    sum +
                                    stock *
                                        price
                                );
                            },
                            0
                        );


                    return (
                        total +
                        productTotal
                    );
                },
                0
            );


        return NextResponse.json(
            {
                success: true,

                products,

                totalProducts,

                totalAmount,

                page,

                limit,

                totalPages:
                    Math.ceil(
                        totalProducts /
                            limit
                    ),
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            'GET PRODUCTS ERROR:',
            error
        );


        return NextResponse.json(
            {
                success: false,

                message:
                    error.message ||
                    'Server Error',
            },
            {
                status: 500,
            }
        );
    }
}


// ======================================================
// ================== POST PRODUCT =======================
// ======================================================

export async function POST(req) {
    try {
        await connectDB();


        const formData =
            await req.formData();


        // =================================================
        // BASIC DATA
        // =================================================

        const name =
            formData.get('name');

        const slug =
            normalizeSlug(
                formData.get(
                    'slug'
                )
            );

        const category =
            formData.get(
                'category'
            );

        const subCategory =
            formData.get(
                'subCategory'
            ) || '';

        const brand =
            formData.get(
                'brand'
            ) || '';

        const warranty =
            formData.get(
                'warranty'
            ) || '';


        // =================================================
        // CONTENT
        // =================================================

        const shortDescription =
            formData.get(
                'shortDescription'
            ) || '';

        const description =
            formData.get(
                'description'
            ) || '';


        // =================================================
        // SKU
        // =================================================

        const sku =
            String(
                formData.get(
                    'sku'
                ) || ''
            )
                .trim()
                .toUpperCase();


        // =================================================
        // SEO
        // =================================================

        const seoTitle =
            String(
                formData.get(
                    'seoTitle'
                ) || ''
            ).trim();


        const seoDescription =
            String(
                formData.get(
                    'seoDescription'
                ) || ''
            ).trim();


        const keywords =
            normalizeKeywords(
                formData.get(
                    'keywords'
                )
            );


        const canonicalUrl =
            String(
                formData.get(
                    'canonicalUrl'
                ) || ''
            ).trim();


        // =================================================
        // STATUS
        // =================================================

        const isActive =
            formData.get(
                'isActive'
            ) !== 'false';


        const isFeatured =
            formData.get(
                'isFeatured'
            ) === 'true';


        // =================================================
        // VALIDATE BASIC DATA
        // =================================================

        if (
            !name ||
            !String(name).trim()
        ) {
            return NextResponse.json(
                {
                    success: false,

                    message:
                        'Product name is required.',
                },
                {
                    status: 400,
                }
            );
        }


        if (
            !category ||
            !String(
                category
            ).trim()
        ) {
            return NextResponse.json(
                {
                    success: false,

                    message:
                        'Product category is required.',
                },
                {
                    status: 400,
                }
            );
        }


        if (!slug) {
            return NextResponse.json(
                {
                    success: false,

                    message:
                        'Product slug is required.',
                },
                {
                    status: 400,
                }
            );
        }


        // =================================================
        // CHECK DUPLICATE SLUG
        // =================================================

        const existingSlug =
            await Product.findOne({
                slug,
            }).lean();


        if (existingSlug) {
            return NextResponse.json(
                {
                    success: false,

                    message:
                        'A product with this slug already exists.',
                },
                {
                    status: 409,
                }
            );
        }


        // =================================================
        // VARIANTS
        // =================================================

        const variants =
            parseJSON(
                formData.get(
                    'variants'
                ),
                []
            );


        const variantValidation =
            validateVariants(
                variants
            );


        if (
            !variantValidation.valid
        ) {
            return NextResponse.json(
                {
                    success: false,

                    message:
                        variantValidation.message,
                },
                {
                    status: 400,
                }
            );
        }


        // =================================================
        // NORMALIZE VARIANTS
        // =================================================

        const normalizedVariants =
            variants.map(
                (variant) => ({
                    value:
                        Number(
                            variant.value
                        ),

                    unit:
                        String(
                            variant.unit
                        )
                            .trim()
                            .toLowerCase(),

                    regularPrice:
                        Number(
                            variant.regularPrice
                        ),

                    sellPrice:
                        Number(
                            variant.sellPrice
                        ),

                    stock:
                        Number(
                            variant.stock ||
                                0
                        ),

                    soldCount:
                        Number(
                            variant.soldCount ||
                                0
                        ),

                    sku:
                        String(
                            variant.sku ||
                                ''
                        )
                            .trim()
                            .toUpperCase(),
                })
            );


        // =================================================
        // IMAGE
        // =================================================

        let finalImage = '';


        // -------------------------------------------------
        // IMAGE URL
        // -------------------------------------------------

        const imageUrl =
            formData.get(
                'imageUrl'
            );


        if (
            imageUrl &&
            typeof imageUrl ===
                'string'
        ) {
            try {
                const uploadResponse =
                    await uploadUrlToCloudinary(
                        imageUrl
                    );


                finalImage =
                    uploadResponse.secure_url;
            } catch (error) {
                console.error(
                    'IMAGE URL UPLOAD ERROR:',
                    error
                );
            }
        }


        // -------------------------------------------------
        // LOCAL FILE
        // -------------------------------------------------

        const imageFile =
            formData.get(
                'image'
            );


        if (
            imageFile &&
            typeof imageFile !==
                'string' &&
            imageFile.size > 0
        ) {
            const uploadResponse =
                await uploadFileToCloudinary(
                    imageFile
                );


            finalImage =
                uploadResponse.secure_url;
        }


        // =================================================
        // CREATE PRODUCT
        // =================================================

        const newProduct =
            await Product.create({
                name:
                    String(name)
                        .trim(),

                slug,

                category:
                    String(category)
                        .trim()
                        .toLowerCase(),

                subCategory:
                    String(
                        subCategory
                    )
                        .trim()
                        .toLowerCase(),

                brand:
                    String(brand)
                        .trim(),

                warranty:
                    String(warranty)
                        .trim(),

                shortDescription:
                    String(
                        shortDescription
                    ).trim(),

                description:
                    String(
                        description
                    ).trim(),

                image:
                    finalImage,

                sku,

                seoTitle,

                seoDescription,

                keywords,

                canonicalUrl,

                variants:
                    normalizedVariants,

                isActive,

                isFeatured,
            });


        return NextResponse.json(
            {
                success: true,

                message:
                    'Product added successfully.',

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
            'POST PRODUCT ERROR:',
            error
        );


        // Mongo duplicate key
        if (
            error.code === 11000
        ) {
            const duplicateField =
                Object.keys(
                    error.keyPattern ||
                        {}
                )[0];


            return NextResponse.json(
                {
                    success: false,

                    message:
                        `${duplicateField || 'Field'} already exists.`,
                },
                {
                    status: 409,
                }
            );
        }


        return NextResponse.json(
            {
                success: false,

                message:
                    error.message ||
                    'Failed to add product.',
            },
            {
                status: 500,
            }
        );
    }
}


// ======================================================
// ================== PUT PRODUCT ========================
// ======================================================

export async function PUT(req) {
    try {
        await connectDB();


        const formData =
            await req.formData();


        // =================================================
        // PRODUCT ID
        // =================================================

        const _id =
            formData.get('_id');


        if (!_id) {
            return NextResponse.json(
                {
                    success: false,

                    message:
                        'Product ID is missing.',
                },
                {
                    status: 400,
                }
            );
        }


        // =================================================
        // FIND PRODUCT
        // =================================================

        const existingProduct =
            await Product.findById(
                _id
            );


        if (!existingProduct) {
            return NextResponse.json(
                {
                    success: false,

                    message:
                        'Product not found.',
                },
                {
                    status: 404,
                }
            );
        }


        // =================================================
        // BASIC DATA
        // =================================================

        const name =
            formData.get(
                'name'
            );


        const slug =
            normalizeSlug(
                formData.get(
                    'slug'
                )
            );


        const category =
            formData.get(
                'category'
            );


        const subCategory =
            formData.get(
                'subCategory'
            ) || '';


        const brand =
            formData.get(
                'brand'
            ) || '';


        const warranty =
            formData.get(
                'warranty'
            ) || '';


        // =================================================
        // CONTENT
        // =================================================

        const shortDescription =
            formData.get(
                'shortDescription'
            ) || '';


        const description =
            formData.get(
                'description'
            ) || '';


        // =================================================
        // SKU
        // =================================================

        const sku =
            String(
                formData.get(
                    'sku'
                ) ||
                    existingProduct.sku ||
                    ''
            )
                .trim()
                .toUpperCase();


        // =================================================
        // SEO
        // =================================================

        const seoTitle =
            String(
                formData.get(
                    'seoTitle'
                ) ||
                    ''
            ).trim();


        const seoDescription =
            String(
                formData.get(
                    'seoDescription'
                ) ||
                    ''
            ).trim();


        const keywords =
            normalizeKeywords(
                formData.get(
                    'keywords'
                )
            );


        const canonicalUrl =
            String(
                formData.get(
                    'canonicalUrl'
                ) || ''
            ).trim();


        // =================================================
        // STATUS
        // =================================================

        const isActive =
            formData.get(
                'isActive'
            ) !== 'false';


        const isFeatured =
            formData.get(
                'isFeatured'
            ) === 'true';


        // =================================================
        // BASIC VALIDATION
        // =================================================

        if (
            !name ||
            !String(name).trim()
        ) {
            return NextResponse.json(
                {
                    success: false,

                    message:
                        'Product name is required.',
                },
                {
                    status: 400,
                }
            );
        }


        if (
            !category ||
            !String(
                category
            ).trim()
        ) {
            return NextResponse.json(
                {
                    success: false,

                    message:
                        'Product category is required.',
                },
                {
                    status: 400,
                }
            );
        }


        if (!slug) {
            return NextResponse.json(
                {
                    success: false,

                    message:
                        'Product slug is required.',
                },
                {
                    status: 400,
                }
            );
        }


        // =================================================
        // DUPLICATE SLUG CHECK
        // =================================================

        const duplicateSlug =
            await Product.findOne({
                slug,

                _id: {
                    $ne: _id,
                },
            }).lean();


        if (duplicateSlug) {
            return NextResponse.json(
                {
                    success: false,

                    message:
                        'Another product already uses this slug.',
                },
                {
                    status: 409,
                }
            );
        }


        // =================================================
        // VARIANTS
        // =================================================

        const variantsData =
            formData.get(
                'variants'
            );


        let variants;


        if (
            variantsData !==
            null
        ) {
            variants =
                parseJSON(
                    variantsData,
                    null
                );
        } else {
            // If no variants were sent,
            // preserve existing variants.
            variants =
                existingProduct.variants;
        }


        const variantValidation =
            validateVariants(
                variants
            );


        if (
            !variantValidation.valid
        ) {
            return NextResponse.json(
                {
                    success: false,

                    message:
                        variantValidation.message,
                },
                {
                    status: 400,
                }
            );
        }


        // =================================================
        // PRESERVE VARIANT DATA
        // =================================================

        const normalizedVariants =
            variants.map(
                (variant) => {
                    const oldVariant =
                        existingProduct.variants?.find(
                            (item) =>
                                String(
                                    item._id
                                ) ===
                                String(
                                    variant._id
                                )
                        );


                    return {
                        _id:
                            variant._id ||
                            undefined,

                        value:
                            Number(
                                variant.value
                            ),

                        unit:
                            String(
                                variant.unit
                            )
                                .trim()
                                .toLowerCase(),

                        regularPrice:
                            Number(
                                variant.regularPrice
                            ),

                        sellPrice:
                            Number(
                                variant.sellPrice
                            ),

                        stock:
                            Number(
                                variant.stock ||
                                    0
                            ),

                        // --------------------------------
                        // IMPORTANT:
                        // Preserve old soldCount
                        // --------------------------------

                        soldCount:
                            variant.soldCount !==
                            undefined
                                ? Number(
                                      variant.soldCount
                                  )
                                : Number(
                                      oldVariant
                                          ?.soldCount ||
                                          0
                                  ),

                        sku:
                            String(
                                variant.sku ||
                                    ''
                            )
                                .trim()
                                .toUpperCase(),
                    };
                }
            );


        // =================================================
        // IMAGE
        // =================================================

        let finalImage =
            existingProduct.image ||
            '';


        // -------------------------------------------------
        // EXISTING IMAGE
        // -------------------------------------------------

        const existingImage =
            formData.get(
                'existingImage'
            );


        if (
            existingImage &&
            typeof existingImage ===
                'string'
        ) {
            finalImage =
                existingImage;
        }


        // -------------------------------------------------
        // IMAGE URL
        // -------------------------------------------------

        const imageUrl =
            formData.get(
                'imageUrl'
            );


        if (
            imageUrl &&
            typeof imageUrl ===
                'string'
        ) {
            try {
                const uploadResponse =
                    await uploadUrlToCloudinary(
                        imageUrl
                    );


                finalImage =
                    uploadResponse.secure_url;
            } catch (error) {
                console.error(
                    'IMAGE URL UPDATE ERROR:',
                    error
                );
            }
        }


        // -------------------------------------------------
        // NEW IMAGE FILE
        // -------------------------------------------------

        const imageFile =
            formData.get(
                'image'
            );


        if (
            imageFile &&
            typeof imageFile !==
                'string' &&
            imageFile.size > 0
        ) {
            const uploadResponse =
                await uploadFileToCloudinary(
                    imageFile
                );


            finalImage =
                uploadResponse.secure_url;
        }


        // =================================================
        // UPDATE
        // =================================================

        existingProduct.name =
            String(name).trim();


        existingProduct.slug =
            slug;


        existingProduct.category =
            String(category)
                .trim()
                .toLowerCase();


        existingProduct.subCategory =
            String(subCategory)
                .trim()
                .toLowerCase();


        existingProduct.brand =
            String(brand).trim();


        existingProduct.warranty =
            String(warranty).trim();


        existingProduct.shortDescription =
            String(
                shortDescription
            ).trim();


        existingProduct.description =
            String(
                description
            ).trim();


        existingProduct.sku =
            sku;


        existingProduct.seoTitle =
            seoTitle;


        existingProduct.seoDescription =
            seoDescription;


        existingProduct.keywords =
            keywords;


        existingProduct.canonicalUrl =
            canonicalUrl;


        existingProduct.image =
            finalImage;


        existingProduct.variants =
            normalizedVariants;


        existingProduct.isActive =
            isActive;


        existingProduct.isFeatured =
            isFeatured;


        // =================================================
        // SAVE
        // =================================================

        const updatedProduct =
            await existingProduct.save();


        return NextResponse.json(
            {
                success: true,

                message:
                    'Product updated successfully.',

                product:
                    JSON.parse(
                        JSON.stringify(
                            updatedProduct
                        )
                    ),
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            'PUT PRODUCT ERROR:',
            error
        );


        if (
            error.code === 11000
        ) {
            const duplicateField =
                Object.keys(
                    error.keyPattern ||
                        {}
                )[0];


            return NextResponse.json(
                {
                    success: false,

                    message:
                        `${duplicateField || 'Field'} already exists.`,
                },
                {
                    status: 409,
                }
            );
        }


        return NextResponse.json(
            {
                success: false,

                message:
                    error.message ||
                    'Failed to update product.',
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

export async function DELETE(req) {
    try {
        await connectDB();


        const {
            searchParams,
        } = new URL(req.url);


        const id =
            searchParams.get(
                'id'
            );


        if (!id) {
            return NextResponse.json(
                {
                    success: false,

                    message:
                        'Product ID is missing.',
                },
                {
                    status: 400,
                }
            );
        }


        const product =
            await Product.findById(
                id
            );


        if (!product) {
            return NextResponse.json(
                {
                    success: false,

                    message:
                        'Product not found.',
                },
                {
                    status: 404,
                }
            );
        }


        await Product.findByIdAndDelete(
            id
        );


        return NextResponse.json(
            {
                success: true,

                message:
                    'Product deleted successfully.',
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            'DELETE PRODUCT ERROR:',
            error
        );


        return NextResponse.json(
            {
                success: false,

                message:
                    error.message ||
                    'Failed to delete product.',
            },
            {
                status: 500,
            }
        );
    }
}