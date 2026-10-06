"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Plus,
    Save,
    X,
    Link2,
    Tags,
} from "lucide-react";

import { slugify } from "@/lib/slugify";

// ========================================
// CATEGORY FORM
// ========================================

export default function CategoryForm({
    onSubmit,
    editingCategory,
    onCancel,
    loading = false,
}) {
    const [name, setName] =
        useState("");

    const [slug, setSlug] =
        useState("");

    const [subCategories, setSubCategories] =
        useState("");

    const [slugManuallyEdited, setSlugManuallyEdited] =
        useState(false);

    // ========================================
    // EDIT DATA
    // ========================================

    useEffect(() => {
        if (editingCategory) {
            setName(
                editingCategory.name || ""
            );

            setSlug(
                editingCategory.slug || ""
            );

            const subNames =
                Array.isArray(
                    editingCategory.subCategories
                )
                    ? editingCategory.subCategories
                          .map((sub) =>
                              typeof sub ===
                              "string"
                                  ? sub
                                  : sub?.name
                          )
                          .filter(Boolean)
                          .join(", ")
                    : "";

            setSubCategories(
                subNames
            );

            setSlugManuallyEdited(
                true
            );
        } else {
            setName("");
            setSlug("");
            setSubCategories("");
            setSlugManuallyEdited(false);
        }
    }, [editingCategory]);

    // ========================================
    // AUTO SLUG
    // ========================================

    const generatedSlug = useMemo(() => {
        return slugify(name);
    }, [name]);

    useEffect(() => {
        if (
            !editingCategory &&
            !slugManuallyEdited
        ) {
            setSlug(
                generatedSlug
            );
        }
    }, [
        generatedSlug,
        editingCategory,
        slugManuallyEdited,
    ]);

    // ========================================
    // NAME CHANGE
    // ========================================

    const handleNameChange = (
        e
    ) => {
        const value =
            e.target.value;

        setName(value);

        if (
            !slugManuallyEdited
        ) {
            setSlug(
                slugify(value)
            );
        }
    };

    // ========================================
    // SLUG CHANGE
    // ========================================

    const handleSlugChange = (
        e
    ) => {
        const value =
            e.target.value
                .toLowerCase()
                .replace(
                    /[^a-z0-9-]/g,
                    ""
                )
                .replace(
                    /-+/g,
                    "-"
                );

        setSlug(value);
        setSlugManuallyEdited(
            true
        );
    };

    // ========================================
    // SUBMIT
    // ========================================

    const handleSubmit = async (
        e
    ) => {
        e.preventDefault();

        const cleanName =
            name.trim();

        const cleanSlug =
            slugify(slug);

        if (!cleanName) {
            return;
        }

        if (!cleanSlug) {
            return;
        }

        // ------------------------------------
        // Convert comma separated names
        // into objects
        // ------------------------------------

        const subCategoryArray =
            subCategories
                .split(",")
                .map((item) =>
                    item.trim()
                )
                .filter(Boolean)
                .map((item) => ({
                    name: item,
                    slug: slugify(item),
                }))
                .filter(
                    (item) =>
                        item.slug
                );

        // ------------------------------------
        // Remove duplicate slug
        // ------------------------------------

        const uniqueSubCategories =
            Array.from(
                new Map(
                    subCategoryArray.map(
                        (item) => [
                            item.slug,
                            item,
                        ]
                    )
                ).values()
            );

        await onSubmit({
            name: cleanName,

            slug: cleanSlug,

            subCategories:
                uniqueSubCategories,
        });

        // ------------------------------------
        // Reset only for ADD
        // ------------------------------------

        if (!editingCategory) {
            setName("");
            setSlug("");
            setSubCategories("");
            setSlugManuallyEdited(
                false
            );
        }
    };

    // ========================================
    // UI
    // ========================================

    return (
        <form
            onSubmit={handleSubmit}
            className="
                rounded-2xl
                border border-white/10
                bg-[#131318]
                p-5
                shadow-xl
            "
        >
            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <div className="mb-6 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                            <Tags
                                size={19}
                            />
                        </div>

                        <h2 className="text-lg font-semibold text-white">
                            {editingCategory
                                ? "Edit Category"
                                : "Add Category"}
                        </h2>
                    </div>

                    <p className="mt-2 text-sm text-gray-400">
                        Manage your store
                        category and
                        sub-categories.
                    </p>
                </div>

                {editingCategory && (
                    <button
                        type="button"
                        onClick={
                            onCancel
                        }
                        className="
                            rounded-lg
                            p-2
                            text-gray-400
                            transition
                            hover:bg-white/10
                            hover:text-white
                        "
                        aria-label="Cancel editing"
                    >
                        <X
                            size={20}
                        />
                    </button>
                )}
            </div>

            <div className="space-y-5">

                {/* ================================= */}
                {/* CATEGORY NAME */}
                {/* ================================= */}

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                        Category Name
                    </label>

                    <input
                        type="text"
                        value={name}
                        onChange={
                            handleNameChange
                        }
                        placeholder="Example: মধু"
                        className="
                            w-full
                            rounded-xl
                            border border-white/10
                            bg-[#0d0d11]
                            px-4 py-3
                            text-white
                            outline-none
                            placeholder:text-gray-600
                            focus:border-green-500
                            focus:ring-2
                            focus:ring-green-500/10
                        "
                        required
                    />
                </div>

                {/* ================================= */}
                {/* SLUG */}
                {/* ================================= */}

                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Link2
                            size={15}
                        />

                        Category Slug
                    </label>

                    <input
                        type="text"
                        value={slug}
                        onChange={
                            handleSlugChange
                        }
                        placeholder="honey"
                        className="
                            w-full
                            rounded-xl
                            border border-white/10
                            bg-[#0d0d11]
                            px-4 py-3
                            font-mono
                            text-sm
                            text-green-400
                            outline-none
                            placeholder:text-gray-700
                            focus:border-green-500
                            focus:ring-2
                            focus:ring-green-500/10
                        "
                        required
                    />

                    <p className="mt-2 text-xs text-gray-500">
                        URL:
                        {" "}
                        /category/
                        {slug ||
                            "category-slug"}
                    </p>
                </div>

                {/* ================================= */}
                {/* SUB CATEGORIES */}
                {/* ================================= */}

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                        Sub Categories
                    </label>

                    <input
                        type="text"
                        value={
                            subCategories
                        }
                        onChange={(e) =>
                            setSubCategories(
                                e.target
                                    .value
                            )
                        }
                        placeholder="লিচু, কালোজিরা, সুন্দরবন"
                        className="
                            w-full
                            rounded-xl
                            border border-white/10
                            bg-[#0d0d11]
                            px-4 py-3
                            text-white
                            outline-none
                            placeholder:text-gray-600
                            focus:border-green-500
                            focus:ring-2
                            focus:ring-green-500/10
                        "
                    />

                    <p className="mt-2 text-xs text-gray-500">
                        Separate multiple
                        sub-categories
                        with commas.
                    </p>
                </div>

                {/* ================================= */}
                {/* PREVIEW */}
                {/* ================================= */}

                {(name || slug) && (
                    <div className="
                        rounded-xl
                        border border-white/10
                        bg-[#0d0d11]
                        p-4
                    ">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                            Preview
                        </p>

                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="font-medium text-white">
                                    {name ||
                                        "Category Name"}
                                </p>

                                <p className="mt-1 font-mono text-xs text-gray-500">
                                    /category/
                                    {slug ||
                                        "..."}
                                </p>
                            </div>

                            <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                                Active
                            </span>
                        </div>
                    </div>
                )}

                {/* ================================= */}
                {/* BUTTON */}
                {/* ================================= */}

                <button
                    type="submit"
                    disabled={
                        loading ||
                        !name.trim() ||
                        !slug
                    }
                    className="
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-green-600
                        px-4
                        py-3
                        font-medium
                        text-white
                        transition
                        hover:bg-green-700
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    {editingCategory ? (
                        <>
                            <Save
                                size={18}
                            />

                            {loading
                                ? "Updating..."
                                : "Update Category"}
                        </>
                    ) : (
                        <>
                            <Plus
                                size={18}
                            />

                            {loading
                                ? "Adding..."
                                : "Add Category"}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}