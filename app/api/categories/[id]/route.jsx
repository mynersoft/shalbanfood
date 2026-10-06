import { NextResponse } from "next/server";

import { connectDB } from "@/lib/dbConnect";
import Category from "@/models/Category";

import { slugify } from "@/lib/slugify";

// ========================================
// UPDATE CATEGORY
// ========================================

export async function PUT(req, context) {
    try {
        await connectDB();

        const { id } = await context.params;

        const body = await req.json();

        const existing =
            await Category.findById(id);

        if (!existing) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Category not found",
                },
                {
                    status: 404,
                }
            );
        }

        const name =
            body?.name?.trim() ||
            existing.name;

        const slug =
            body?.slug?.trim()
                ? slugify(body.slug)
                : existing.slug;

        if (!slug) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Valid English slug is required",
                },
                {
                    status: 400,
                }
            );
        }

        // ----------------------------------------
        // CHECK DUPLICATE NAME
        // ----------------------------------------

        const duplicateName =
            await Category.findOne({
                name: {
                    $regex: `^${name}$`,
                    $options: "i",
                },

                _id: {
                    $ne: id,
                },
            });

        if (duplicateName) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Another category already uses this name",
                },
                {
                    status: 409,
                }
            );
        }

        // ----------------------------------------
        // CHECK DUPLICATE SLUG
        // ----------------------------------------

        const duplicateSlug =
            await Category.findOne({
                slug,

                _id: {
                    $ne: id,
                },
            });

        if (duplicateSlug) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Another category already uses this slug",
                },
                {
                    status: 409,
                }
            );
        }

        // ----------------------------------------
        // SUB CATEGORIES
        // ----------------------------------------

        const subCategories =
            Array.isArray(body?.subCategories)
                ? body.subCategories
                      .map((sub) => {
                          if (
                              typeof sub ===
                              "string"
                          ) {
                              const subName =
                                  sub.trim();

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
                                  ? slugify(
                                        sub.slug
                                    )
                                  : slugify(
                                        subName
                                    );

                          if (!subSlug) {
                              return null;
                          }

                          return {
                              name: subName,
                              slug: subSlug,
                          };
                      })
                      .filter(Boolean)
                : existing.subCategories;

        // ----------------------------------------
        // UPDATE
        // ----------------------------------------

        existing.name = name;
        existing.slug = slug;
        existing.subCategories =
            subCategories;

        if (
            typeof body?.isActive ===
            "boolean"
        ) {
            existing.isActive =
                body.isActive;
        }

        if (
            body?.sortOrder !== undefined
        ) {
            existing.sortOrder =
                Number(body.sortOrder) || 0;
        }

        await existing.save();

        return NextResponse.json(
            {
                success: true,
                message:
                    "Category updated successfully",
                category: existing,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            "UPDATE CATEGORY ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.code === 11000
                        ? "Category name or slug already exists"
                        : "Failed to update category",
            },
            {
                status: 500,
            }
        );
    }
}

// ========================================
// DELETE CATEGORY
// ========================================

export async function DELETE(
    req,
    context
) {
    try {
        await connectDB();

        const { id } = await context.params;

        const category =
            await Category.findById(id);

        if (!category) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Category not found",
                },
                {
                    status: 404,
                }
            );
        }

        await Category.findByIdAndDelete(id);

        return NextResponse.json(
            {
                success: true,
                message:
                    "Category deleted successfully",
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            "DELETE CATEGORY ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to delete category",
            },
            {
                status: 500,
            }
        );
    }
}