import { NextResponse } from "next/server";

import { connectDB } from "@/lib/dbConnect";
import Category from "@/models/Category";

import { slugify } from "@/lib/slugify";

// ========================================
// GET CATEGORIES
// ========================================

export async function GET() {
    try {
        await connectDB();

        const categories = await Category.find()
            .sort({
                sortOrder: 1,
                createdAt: -1,
            })
            .lean();

        return NextResponse.json(
            {
                success: true,
                categories,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            "GET CATEGORIES ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch categories",
            },
            {
                status: 500,
            }
        );
    }
}

// ========================================
// CREATE CATEGORY
// ========================================

export async function POST(req) {
    try {
        await connectDB();

        const body = await req.json();

        const name = body?.name?.trim();

        if (!name) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Category name is required",
                },
                {
                    status: 400,
                }
            );
        }

        const slug =
            body?.slug?.trim()
                ? slugify(body.slug)
                : slugify(name);

        if (!slug) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Valid English slug is required for this category",
                },
                {
                    status: 400,
                }
            );
        }

        // ----------------------------------------
        // CHECK NAME
        // ----------------------------------------

        const existingName =
            await Category.findOne({
                name: {
                    $regex: `^${name}$`,
                    $options: "i",
                },
            });

        if (existingName) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Category already exists",
                },
                {
                    status: 409,
                }
            );
        }

        // ----------------------------------------
        // CHECK SLUG
        // ----------------------------------------

        const existingSlug =
            await Category.findOne({
                slug,
            });

        if (existingSlug) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Category slug already exists",
                },
                {
                    status: 409,
                }
            );
        }

        // ----------------------------------------
        // SUB CATEGORIES
        // ----------------------------------------

        const subCategories = Array.isArray(
            body?.subCategories
        )
            ? body.subCategories
                  .map((sub) => {
                      if (typeof sub === "string") {
                          const subName = sub.trim();

                          if (!subName) {
                              return null;
                          }

                          const subSlug =
                              slugify(subName);

                          if (!subSlug) {
                              return null;
                          }

                          return {
                              name: subName,
                              slug: subSlug,
                          };
                      }

                      const subName =
                          sub?.name?.trim();

                      if (!subName) {
                          return null;
                      }

                      const subSlug =
                          sub?.slug?.trim()
                              ? slugify(sub.slug)
                              : slugify(subName);

                      if (!subSlug) {
                          return null;
                      }

                      return {
                          name: subName,
                          slug: subSlug,
                      };
                  })
                  .filter(Boolean)
            : [];

        // ----------------------------------------
        // CREATE
        // ----------------------------------------

        const category =
            await Category.create({
                name,
                slug,
                subCategories,
                isActive:
                    body?.isActive !== false,
                sortOrder:
                    Number(body?.sortOrder) || 0,
            });

        return NextResponse.json(
            {
                success: true,
                message:
                    "Category created successfully",
                category,
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(
            "CREATE CATEGORY ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.code === 11000
                        ? "Category name or slug already exists"
                        : "Failed to create category",
            },
            {
                status: 500,
            }
        );
    }
}