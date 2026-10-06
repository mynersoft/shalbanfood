"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

import {
    addProduct,
    updateProduct,
    fetchProducts,
} from "@/redux/store/slices/productSlice";

import { useCategories } from "@/hooks/useCategory";

import {
    X,
    Camera,
    FolderOpen,
    Loader2,
    PackagePlus,
    Save,
    Tag,
    Layers,
    DollarSign,
    ImagePlus,
} from "lucide-react";

import { slugify } from "@/lib/slugify";

// =====================================================
// IMAGE RESIZE
// =====================================================

function resizeImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        const objectUrl =
            URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);

            const canvas =
                document.createElement(
                    "canvas"
                );

            const MAX_WIDTH = 1000;

            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
                height =
                    height *
                    (MAX_WIDTH / width);

                width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx =
                canvas.getContext("2d");

            if (!ctx) {
                reject(
                    new Error(
                        "Canvas is not supported."
                    )
                );

                return;
            }

            // Better image rendering
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            ctx.drawImage(
                img,
                0,
                0,
                width,
                height
            );

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(
                            new Error(
                                "Image resize failed."
                            )
                        );

                        return;
                    }

                    resolve(blob);
                },
                "image/jpeg",
                0.82
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);

            reject(
                new Error(
                    "Image loading failed."
                )
            );
        };

        img.src = objectUrl;
    });
}

// =====================================================
// RENAME IMAGE
// =====================================================

function renameFile(
    blob,
    productName
) {
    const safeName =
        productName
            ?.trim()
            .replace(/\s+/g, "_")
            .replace(
                /[^a-zA-Z0-9_\-\u0980-\u09FF]/g,
                ""
            ) || "product";

    return new File(
        [blob],
        `${safeName}_shalbanfood.jpg`,
        {
            type: "image/jpeg",
        }
    );
}

// =====================================================
// DEFAULT FORM
// =====================================================

const defaultForm = {
    name: "",
    slug: "",

    category: "",
    subCategory: "",

    brand: "",

    size: {
        value: "",
        unit: "gram",
    },

    stock: "",

    regularPrice: "",
    sellPrice: "",

    warranty: "",

    image: "",
};

// =====================================================
// COMPONENT
// =====================================================

export default function ProductFormModal({
    editingProduct = null,
    onClose,
    currentPage = 1,
}) {
    const dispatch = useDispatch();

    // =====================================================
    // CATEGORY QUERY
    // =====================================================

    const {
        data: categoryData = [],
        isLoading: categoriesLoading,
        isFetching: categoriesFetching,
        isError: categoriesError,
    } = useCategories();

    const categories = Array.isArray(
        categoryData
    )
        ? categoryData
        : [];

    // =====================================================
    // FORM
    // =====================================================

    const [form, setForm] =
        useState(defaultForm);

    const [file, setFile] =
        useState(null);

    const [previewUrl, setPreviewUrl] =
        useState("");

    const [saving, setSaving] =
        useState(false);

    // =====================================================
    // SLUG MANUAL STATE
    // =====================================================

    const [slugEdited, setSlugEdited] =
        useState(false);

    // =====================================================
    // LOAD PRODUCT
    // =====================================================

    useEffect(() => {
        if (editingProduct) {
            setForm({
                ...defaultForm,

                name:
                    editingProduct.name ||
                    "",

                slug:
                    editingProduct.slug ||
                    "",

                category:
                    editingProduct.category ||
                    "",

                subCategory:
                    editingProduct.subCategory ||
                    "",

                brand:
                    editingProduct.brand ||
                    "",

                size: {
                    value:
                        editingProduct
                            .size
                            ?.value ??
                        "",

                    unit:
                        editingProduct
                            .size
                            ?.unit ||
                        "gram",
                },

                stock:
                    editingProduct.stock ??
                    "",

                regularPrice:
                    editingProduct.regularPrice ??
                    "",

                sellPrice:
                    editingProduct.sellPrice ??
                    "",

                warranty:
                    editingProduct.warranty ||
                    "",

                image:
                    editingProduct.image ||
                    "",
            });

            setFile(null);
            setPreviewUrl("");

            setSlugEdited(true);
        } else {
            setForm({
                ...defaultForm,

                size: {
                    value: "",
                    unit: "gram",
                },
            });

            setFile(null);
            setPreviewUrl("");

            setSlugEdited(false);
        }
    }, [editingProduct]);

    // =====================================================
    // IMAGE PREVIEW
    // =====================================================

    useEffect(() => {
        if (!file) {
            setPreviewUrl("");
            return;
        }

        const url =
            URL.createObjectURL(file);

        setPreviewUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [file]);

    // =====================================================
    // SELECTED CATEGORY
    // =====================================================

    const selectedCategory =
        useMemo(() => {
            if (!form.category) {
                return null;
            }

            return (
                categories.find(
                    (category) =>
                        category.slug ===
                        form.category
                ) || null
            );
        }, [
            categories,
            form.category,
        ]);

    // =====================================================
    // SUBCATEGORIES
    // =====================================================

    const subCategories =
        Array.isArray(
            selectedCategory?.subCategories
        )
            ? selectedCategory.subCategories
            : [];

    // =====================================================
    // UPDATE FIELD
    // =====================================================

    const updateField = (
        field,
        value
    ) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    // =====================================================
    // PRODUCT NAME
    // =====================================================

    const handleNameChange = (
        event
    ) => {
        const value =
            event.target.value;

        setForm((previous) => ({
            ...previous,

            name: value,

            slug: slugEdited
                ? previous.slug
                : slugify(value),
        }));
    };

    // =====================================================
    // PRODUCT SLUG
    // =====================================================

    const handleSlugChange = (
        event
    ) => {
        const value =
            event.target.value
                .toLowerCase()
                .replace(
                    /[^a-z0-9-]/g,
                    ""
                )
                .replace(
                    /-+/g,
                    "-"
                )
                .replace(
                    /^-+|-+$/g,
                    ""
                );

        setSlugEdited(true);

        updateField(
            "slug",
            value
        );
    };

    // =====================================================
    // CATEGORY CHANGE
    // =====================================================

    const handleCategoryChange = (
        event
    ) => {
        const categorySlug =
            event.target.value;

        setForm((previous) => ({
            ...previous,

            category:
                categorySlug,

            // Reset subcategory
            subCategory: "",
        }));
    };

    // =====================================================
    // SIZE UPDATE
    // =====================================================

    const updateSize = (
        field,
        value
    ) => {
        setForm((previous) => ({
            ...previous,

            size: {
                ...previous.size,

                [field]: value,
            },
        }));
    };

    // =====================================================
    // MOBILE INPUT SCROLL
    // =====================================================

    const focusScroll = (
        event
    ) => {
        setTimeout(() => {
            event.target.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }, 150);
    };

    // =====================================================
    // IMAGE SELECT
    // =====================================================

    const handleImageSelect =
        async (
            selectedFile
        ) => {
            if (!selectedFile) {
                return;
            }

            if (
                !selectedFile.type.startsWith(
                    "image/"
                )
            ) {
                toast.error(
                    "Please select a valid image."
                );

                return;
            }

            // Maximum original upload size
            if (
                selectedFile.size >
                10 * 1024 * 1024
            ) {
                toast.error(
                    "Image must be smaller than 10MB."
                );

                return;
            }

            try {
                toast.loading(
                    "Preparing image...",
                    {
                        id: "image-loading",
                    }
                );

                const resizedBlob =
                    await resizeImage(
                        selectedFile
                    );

                const finalFile =
                    renameFile(
                        resizedBlob,
                        form.name
                    );

                setFile(finalFile);

                toast.success(
                    "Image ready!",
                    {
                        id: "image-loading",
                    }
                );
            } catch (error) {
                console.error(
                    "IMAGE ERROR:",
                    error
                );

                toast.error(
                    "Image processing failed.",
                    {
                        id: "image-loading",
                    }
                );
            }
        };

    // =====================================================
    // REMOVE NEW IMAGE
    // =====================================================

    const handleRemoveNewImage =
        () => {
            setFile(null);
            setPreviewUrl("");
        };

    // =====================================================
    // VALIDATION
    // =====================================================

    const validateForm = () => {
        // -----------------------------------------------
        // NAME
        // -----------------------------------------------

        if (!form.name.trim()) {
            toast.error(
                "Product name is required."
            );

            return false;
        }

        // -----------------------------------------------
        // SLUG
        // -----------------------------------------------

        if (!form.slug.trim()) {
            toast.error(
                "Product slug is required."
            );

            return false;
        }

        // -----------------------------------------------
        // CATEGORY
        // -----------------------------------------------

        if (!form.category) {
            toast.error(
                "Please select a category."
            );

            return false;
        }

        // -----------------------------------------------
        // SUBCATEGORY
        // -----------------------------------------------

        /*
         * Subcategory is optional.
         *
         * Some categories may not have
         * subcategories.
         */

        // -----------------------------------------------
        // SIZE
        // -----------------------------------------------

        if (
            form.size?.value === "" ||
            Number(
                form.size?.value
            ) <= 0
        ) {
            toast.error(
                "Please enter a valid product size."
            );

            return false;
        }

        if (!form.size?.unit) {
            toast.error(
                "Please select product unit."
            );

            return false;
        }

        // -----------------------------------------------
        // STOCK
        // -----------------------------------------------

        if (
            form.stock === "" ||
            Number(form.stock) < 0
        ) {
            toast.error(
                "Please enter valid stock."
            );

            return false;
        }

        // -----------------------------------------------
        // REGULAR PRICE
        // -----------------------------------------------

        if (
            form.regularPrice === "" ||
            Number(
                form.regularPrice
            ) < 0
        ) {
            toast.error(
                "Please enter regular price."
            );

            return false;
        }

        // -----------------------------------------------
        // SELL PRICE
        // -----------------------------------------------

        if (
            form.sellPrice === "" ||
            Number(
                form.sellPrice
            ) < 0
        ) {
            toast.error(
                "Please enter sell price."
            );

            return false;
        }

        // -----------------------------------------------
        // PRICE RELATION
        // -----------------------------------------------

        if (
            Number(
                form.sellPrice
            ) >
            Number(
                form.regularPrice
            )
        ) {
            toast.error(
                "Sell price cannot be higher than regular price."
            );

            return false;
        }

        return true;
    };

    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSaving(true);

        try {
            const formData =
                new FormData();

            // =================================================
            // IMAGE
            // =================================================

            if (file) {
                formData.append(
                    "image",
                    file
                );
            }

            // =================================================
            // BASIC INFORMATION
            // =================================================

            formData.append(
                "name",
                form.name.trim()
            );

            formData.append(
                "slug",
                form.slug.trim()
            );

            /*
             * IMPORTANT:
             *
             * Category stores SLUG.
             *
             * Example:
             * honey
             * dates
             * ghee
             */

            formData.append(
                "category",
                form.category
            );

            /*
             * Subcategory also stores SLUG.
             *
             * Example:
             * lichu
             * kalojira
             * sundarban
             */

            formData.append(
                "subCategory",
                form.subCategory || ""
            );

            formData.append(
                "brand",
                form.brand.trim()
            );

            // =================================================
            // STOCK
            // =================================================

            formData.append(
                "stock",
                String(
                    Number(
                        form.stock || 0
                    )
                )
            );

            // =================================================
            // PRICE
            // =================================================

            formData.append(
                "regularPrice",
                String(
                    Number(
                        form.regularPrice
                    )
                )
            );

            formData.append(
                "sellPrice",
                String(
                    Number(
                        form.sellPrice
                    )
                )
            );

            // =================================================
            // WARRANTY
            // =================================================

            formData.append(
                "warranty",
                form.warranty.trim()
            );

            // =================================================
            // SIZE
            // =================================================

            formData.append(
                "size",
                JSON.stringify({
                    value: Number(
                        form.size.value
                    ),

                    unit:
                        form.size.unit,
                })
            );

            // =================================================
            // EXISTING IMAGE
            // =================================================

            if (
                editingProduct?.image
            ) {
                formData.append(
                    "existingImage",
                    editingProduct.image
                );
            }

            // =================================================
            // UPDATE ID
            // =================================================

            if (
                editingProduct?._id
            ) {
                formData.append(
                    "_id",
                    editingProduct._id
                );
            }

            // =================================================
            // API
            // =================================================

            const response =
                await fetch(
                    "/api/products",
                    {
                        method:
                            editingProduct
                                ? "PUT"
                                : "POST",

                        body: formData,
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        data?.error ||
                        "Product save failed."
                );
            }

            const product =
                data?.product;

            if (!product) {
                throw new Error(
                    "Product data was not returned."
                );
            }

            // =================================================
            // REDUX UPDATE
            // =================================================

            if (editingProduct) {
                await dispatch(
                    updateProduct(
                        product
                    )
                ).unwrap();

                toast.success(
                    "Product updated successfully!"
                );
            } else {
                await dispatch(
                    addProduct(
                        product
                    )
                ).unwrap();

                toast.success(
                    "Product added successfully!"
                );
            }

            // =================================================
            // REFRESH
            // =================================================

            await dispatch(
                fetchProducts({
                    page: currentPage,
                })
            );

            // =================================================
            // CLOSE
            // =================================================

            onClose?.();
        } catch (error) {
            console.error(
                "PRODUCT SAVE ERROR:",
                error
            );

            toast.error(
                error?.message ||
                    "Failed to save product."
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="
            fixed
            inset-0
            z-[60]
            flex
            items-center
            justify-center
            bg-black/75
            p-3
            backdrop-blur-sm
            sm:p-5
        ">

            <div className="
                flex
                max-h-[94vh]
                w-full
                max-w-2xl
                flex-col
                overflow-hidden
                rounded-2xl
                border
                border-gray-800
                bg-gray-950
                text-gray-100
                shadow-2xl
            ">

                {/* ==========================================
                    HEADER
                ========================================== */}

                <div className="
                    flex
                    shrink-0
                    items-center
                    justify-between
                    border-b
                    border-gray-800
                    bg-gray-950
                    px-5
                    py-4
                    sm:px-6
                ">

                    <div className="
                        flex
                        items-center
                        gap-3
                    ">

                        <div className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-green-500/10
                            text-green-400
                        ">
                            <PackagePlus
                                size={21}
                            />
                        </div>

                        <div>
                            <h2 className="
                                text-base
                                font-semibold
                                sm:text-lg
                            ">
                                {editingProduct
                                    ? "Edit Product"
                                    : "Add Product"}
                            </h2>

                            <p className="
                                text-xs
                                text-gray-500
                            ">
                                Manage product
                                information
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                        disabled={
                            saving
                        }
                        className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            text-gray-400
                            transition
                            hover:bg-gray-800
                            hover:text-white
                            disabled:opacity-50
                        "
                    >
                        <X
                            size={20}
                        />
                    </button>
                </div>

                {/* ==========================================
                    BODY
                ========================================== */}

                <div className="
                    overflow-y-auto
                    px-5
                    py-5
                    sm:px-6
                ">

                    <form
                        onSubmit={
                            handleSubmit
                        }
                        className="
                            space-y-6
                        "
                    >

                        {/* ==================================
                            PRODUCT NAME
                        ================================== */}

                        <div className="space-y-2">

                            <div className="
                                flex
                                items-center
                                gap-2
                            ">
                                <Tag
                                    size={16}
                                    className="text-green-400"
                                />

                                <label className="
                                    text-sm
                                    font-medium
                                    text-gray-300
                                ">
                                    Product Name
                                </label>
                            </div>

                            <input
                                required
                                value={
                                    form.name
                                }
                                onFocus={
                                    focusScroll
                                }
                                onChange={
                                    handleNameChange
                                }
                                placeholder="লিচু ফুলের মধু"
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-800
                                    bg-gray-900
                                    px-4
                                    py-3
                                    text-sm
                                    text-white
                                    outline-none
                                    transition
                                    placeholder:text-gray-600
                                    focus:border-green-500
                                    focus:ring-2
                                    focus:ring-green-500/10
                                "
                            />
                        </div>

                        {/* ==================================
                            SLUG
                        ================================== */}

                        <div className="space-y-2">

                            <label className="
                                text-sm
                                font-medium
                                text-gray-300
                            ">
                                Product Slug
                            </label>

                            <input
                                required
                                value={
                                    form.slug
                                }
                                onChange={
                                    handleSlugChange
                                }
                                placeholder="lichu-fuler-modhu"
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-800
                                    bg-gray-900
                                    px-4
                                    py-3
                                    font-mono
                                    text-sm
                                    text-green-400
                                    outline-none
                                    transition
                                    placeholder:text-gray-700
                                    focus:border-green-500
                                    focus:ring-2
                                    focus:ring-green-500/10
                                "
                            />

                            <p className="
                                text-xs
                                text-gray-600
                            ">
                                URL:
                                {" "}
                                /product/
                                {form.slug ||
                                    "product-slug"}
                            </p>
                        </div>

                        {/* ==================================
                            CATEGORY
                        ================================== */}

                        <div className="
                            grid
                            grid-cols-1
                            gap-4
                            sm:grid-cols-2
                        ">

                            {/* CATEGORY */}

                            <div className="space-y-2">

                                <label className="
                                    text-sm
                                    font-medium
                                    text-gray-300
                                ">
                                    Category
                                </label>

                                <select
                                    required
                                    value={
                                        form.category
                                    }
                                    disabled={
                                        categoriesLoading ||
                                        categoriesFetching
                                    }
                                    onChange={
                                        handleCategoryChange
                                    }
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-gray-800
                                        bg-gray-900
                                        px-4
                                        py-3
                                        text-sm
                                        text-white
                                        outline-none
                                        focus:border-green-500
                                        focus:ring-2
                                        focus:ring-green-500/10
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >

                                    <option value="">
                                        {categoriesLoading
                                            ? "Loading categories..."
                                            : "Select category"}
                                    </option>

                                    {categories.map(
                                        (
                                            category
                                        ) => (
                                            <option
                                                key={
                                                    category._id
                                                }
                                                value={
                                                    category.slug
                                                }
                                            >
                                                {
                                                    category.name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>

                                {categoriesError && (
                                    <p className="
                                        text-xs
                                        text-red-400
                                    ">
                                        Failed to
                                        load
                                        categories.
                                    </p>
                                )}

                                {!categoriesLoading &&
                                    categories.length ===
                                        0 && (
                                        <p className="
                                            text-xs
                                            text-yellow-400
                                        ">
                                            No categories
                                            found.
                                        </p>
                                    )}
                            </div>

                            {/* SUBCATEGORY */}

                            <div className="space-y-2">

                                <label className="
                                    text-sm
                                    font-medium
                                    text-gray-300
                                ">
                                    Subcategory
                                    <span className="
                                        ml-1
                                        text-xs
                                        text-gray-600
                                    ">
                                        (Optional)
                                    </span>
                                </label>

                                <select
                                    value={
                                        form.subCategory
                                    }
                                    disabled={
                                        !selectedCategory ||
                                        subCategories.length ===
                                            0
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        updateField(
                                            "subCategory",
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-gray-800
                                        bg-gray-900
                                        px-4
                                        py-3
                                        text-sm
                                        text-white
                                        outline-none
                                        focus:border-green-500
                                        focus:ring-2
                                        focus:ring-green-500/10
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >

                                    <option value="">
                                        {!selectedCategory
                                            ? "Select category first"
                                            : subCategories.length
                                            ? "Select subcategory"
                                            : "No subcategory"}
                                    </option>

                                    {subCategories.map(
                                        (
                                            subCategory
                                        ) => (
                                            <option
                                                key={
                                                    subCategory.slug
                                                }
                                                value={
                                                    subCategory.slug
                                                }
                                            >
                                                {
                                                    subCategory.name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* ==================================
                            BRAND + STOCK
                        ================================== */}

                        <div className="
                            grid
                            grid-cols-1
                            gap-4
                            sm:grid-cols-2
                        ">

                            <div className="space-y-2">

                                <label className="
                                    text-sm
                                    font-medium
                                    text-gray-300
                                ">
                                    Brand
                                </label>

                                <input
                                    value={
                                        form.brand
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        updateField(
                                            "brand",
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Shalban Food"
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-gray-800
                                        bg-gray-900
                                        px-4
                                        py-3
                                        text-sm
                                        text-white
                                        outline-none
                                        focus:border-green-500
                                    "
                                />
                            </div>

                            <div className="space-y-2">

                                <label className="
                                    text-sm
                                    font-medium
                                    text-gray-300
                                ">
                                    Stock
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={
                                        form.stock
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        updateField(
                                            "stock",
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="50"
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-gray-800
                                        bg-gray-900
                                        px-4
                                        py-3
                                        text-sm
                                        text-white
                                        outline-none
                                        focus:border-green-500
                                    "
                                />
                            </div>
                        </div>

                        {/* ==================================
                            SIZE
                        ================================== */}

                        <div className="space-y-2">

                            <div className="
                                flex
                                items-center
                                gap-2
                            ">
                                <Layers
                                    size={16}
                                    className="text-green-400"
                                />

                                <label className="
                                    text-sm
                                    font-medium
                                    text-gray-300
                                ">
                                    Product Size
                                </label>
                            </div>

                            <div className="
                                grid
                                grid-cols-2
                                gap-4
                            ">

                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    required
                                    value={
                                        form.size
                                            ?.value
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        updateSize(
                                            "value",
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="500"
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-gray-800
                                        bg-gray-900
                                        px-4
                                        py-3
                                        text-sm
                                        text-white
                                        outline-none
                                        focus:border-green-500
                                    "
                                />

                                <select
                                    required
                                    value={
                                        form.size
                                            ?.unit ||
                                        "gram"
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        updateSize(
                                            "unit",
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-gray-800
                                        bg-gray-900
                                        px-4
                                        py-3
                                        text-sm
                                        text-white
                                        outline-none
                                        focus:border-green-500
                                    "
                                >

                                    <option value="gram">
                                        Gram (g)
                                    </option>

                                    <option value="kg">
                                        Kilogram (kg)
                                    </option>

                                    <option value="milliliter">
                                        Milliliter (ml)
                                    </option>

                                    <option value="litre">
                                        Litre (L)
                                    </option>

                                    <option value="piece">
                                        Piece
                                    </option>
                                </select>
                            </div>
                        </div>

                        {/* ==================================
                            PRICES
                        ================================== */}

                        <div className="
                            grid
                            grid-cols-1
                            gap-4
                            sm:grid-cols-2
                        ">

                            {/* REGULAR */}

                            <div className="space-y-2">

                                <label className="
                                    text-sm
                                    font-medium
                                    text-gray-300
                                ">
                                    Regular Price
                                </label>

                                <div className="relative">

                                    <span className="
                                        absolute
                                        left-4
                                        top-1/2
                                        -translate-y-1/2
                                        text-gray-500
                                    ">
                                        ৳
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={
                                            form.regularPrice
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateField(
                                                "regularPrice",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="1200"
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-gray-800
                                            bg-gray-900
                                            py-3
                                            pl-9
                                            pr-4
                                            text-sm
                                            text-white
                                            outline-none
                                            focus:border-green-500
                                        "
                                    />
                                </div>
                            </div>

                            {/* SELL */}

                            <div className="space-y-2">

                                <label className="
                                    text-sm
                                    font-medium
                                    text-gray-300
                                ">
                                    Sell Price
                                </label>

                                <div className="relative">

                                    <span className="
                                        absolute
                                        left-4
                                        top-1/2
                                        -translate-y-1/2
                                        text-green-500
                                    ">
                                        ৳
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={
                                            form.sellPrice
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateField(
                                                "sellPrice",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="920"
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-gray-800
                                            bg-gray-900
                                            py-3
                                            pl-9
                                            pr-4
                                            text-sm
                                            text-white
                                            outline-none
                                            focus:border-green-500
                                        "
                                    />
                                </div>
                            </div>
                        </div>

                        {/* DISCOUNT */}

                        {Number(
                            form.regularPrice
                        ) >
                            Number(
                                form.sellPrice
                            ) &&
                            Number(
                                form.sellPrice
                            ) > 0 && (
                                <div className="
                                    rounded-xl
                                    border
                                    border-green-500/10
                                    bg-green-500/5
                                    px-4
                                    py-3
                                    text-sm
                                    text-green-400
                                ">
                                    Discount:{" "}
                                    <strong>
                                        {Math.round(
                                            ((Number(
                                                form.regularPrice
                                            ) -
                                                Number(
                                                    form.sellPrice
                                                )) /
                                                Number(
                                                    form.regularPrice
                                                )) *
                                                100
                                        )}
                                        %
                                    </strong>
                                </div>
                            )}

                        {/* ==================================
                            WARRANTY
                        ================================== */}

                        <div className="space-y-2">

                            <label className="
                                text-sm
                                font-medium
                                text-gray-300
                            ">
                                Warranty
                            </label>

                            <input
                                value={
                                    form.warranty
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "warranty",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="e.g. 7 Days"
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-800
                                    bg-gray-900
                                    px-4
                                    py-3
                                    text-sm
                                    text-white
                                    outline-none
                                    focus:border-green-500
                                "
                            />
                        </div>

                        {/* ==================================
                            IMAGE
                        ================================== */}

                        <div className="space-y-3">

                            <div className="
                                flex
                                items-center
                                gap-2
                            ">
                                <ImagePlus
                                    size={17}
                                    className="text-green-400"
                                />

                                <label className="
                                    text-sm
                                    font-medium
                                    text-gray-300
                                ">
                                    Product Image
                                </label>
                            </div>

                            <div className="
                                grid
                                grid-cols-2
                                gap-3
                            ">

                                {/* CAMERA */}

                                <label className="
                                    flex
                                    cursor-pointer
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-blue-500/20
                                    bg-blue-500/10
                                    px-4
                                    py-3
                                    text-sm
                                    font-medium
                                    text-blue-400
                                    transition
                                    hover:bg-blue-500/20
                                ">

                                    <Camera
                                        size={18}
                                    />

                                    Camera

                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        className="hidden"
                                        onChange={(
                                            event
                                        ) =>
                                            handleImageSelect(
                                                event
                                                    .target
                                                    .files?.[0]
                                            )
                                        }
                                    />
                                </label>

                                {/* GALLERY */}

                                <label className="
                                    flex
                                    cursor-pointer
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-purple-500/20
                                    bg-purple-500/10
                                    px-4
                                    py-3
                                    text-sm
                                    font-medium
                                    text-purple-400
                                    transition
                                    hover:bg-purple-500/20
                                ">

                                    <FolderOpen
                                        size={18}
                                    />

                                    Gallery

                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(
                                            event
                                        ) =>
                                            handleImageSelect(
                                                event
                                                    .target
                                                    .files?.[0]
                                            )
                                        }
                                    />
                                </label>
                            </div>

                            {/* PREVIEW */}

                            {(previewUrl ||
                                (
                                    form.image &&
                                    !file
                                )) && (
                                <div className="
                                    rounded-xl
                                    border
                                    border-gray-800
                                    bg-gray-900
                                    p-3
                                ">

                                    <div className="
                                        flex
                                        items-center
                                        gap-4
                                    ">

                                        <img
                                            src={
                                                previewUrl ||
                                                form.image
                                            }
                                            alt={
                                                form.name ||
                                                "Product preview"
                                            }
                                            className="
                                                h-24
                                                w-24
                                                rounded-xl
                                                border
                                                border-gray-700
                                                object-cover
                                            "
                                        />

                                        <div className="min-w-0">

                                            <p className="
                                                text-sm
                                                font-medium
                                                text-gray-200
                                            ">
                                                Image
                                                Preview
                                            </p>

                                            {file && (
                                                <p className="
                                                    mt-1
                                                    truncate
                                                    text-xs
                                                    text-gray-500
                                                ">
                                                    {
                                                        file.name
                                                    }
                                                </p>
                                            )}

                                            <p className="
                                                mt-2
                                                text-xs
                                                text-gray-600
                                            ">
                                                Image will
                                                be optimized
                                                before upload.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ==================================
                            SUMMARY
                        ================================== */}

                        <div className="
                            rounded-2xl
                            border
                            border-gray-800
                            bg-gray-900/60
                            p-4
                        ">

                            <div className="
                                mb-3
                                flex
                                items-center
                                gap-2
                            ">
                                <Layers
                                    size={16}
                                    className="text-green-400"
                                />

                                <span className="
                                    text-xs
                                    font-semibold
                                    uppercase
                                    tracking-wider
                                    text-gray-500
                                ">
                                    Product Summary
                                </span>
                            </div>

                            <div className="
                                grid
                                grid-cols-2
                                gap-4
                            ">

                                <div>
                                    <p className="
                                        text-xs
                                        text-gray-600
                                    ">
                                        Category
                                    </p>

                                    <p className="
                                        mt-1
                                        text-sm
                                        text-gray-200
                                    ">
                                        {selectedCategory
                                            ?.name ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="
                                        text-xs
                                        text-gray-600
                                    ">
                                        Subcategory
                                    </p>

                                    <p className="
                                        mt-1
                                        text-sm
                                        text-gray-200
                                    ">
                                        {subCategories.find(
                                            (
                                                sub
                                            ) =>
                                                sub.slug ===
                                                form.subCategory
                                        )
                                            ?.name ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="
                                        text-xs
                                        text-gray-600
                                    ">
                                        Size
                                    </p>

                                    <p className="
                                        mt-1
                                        text-sm
                                        text-gray-200
                                    ">
                                        {form.size
                                            ?.value ||
                                            "—"}{" "}
                                        {form.size
                                            ?.value
                                            ? form
                                                  .size
                                                  .unit
                                            : ""}
                                    </p>
                                </div>

                                <div>
                                    <p className="
                                        text-xs
                                        text-gray-600
                                    ">
                                        Selling Price
                                    </p>

                                    <p className="
                                        mt-1
                                        text-sm
                                        font-semibold
                                        text-green-400
                                    ">
                                        ৳
                                        {form.sellPrice ||
                                            "0"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ==================================
                            ACTIONS
                        ================================== */}

                        <div className="
                            sticky
                            bottom-0
                            flex
                            gap-3
                            border-t
                            border-gray-800
                            bg-gray-950
                            py-4
                        ">

                            <button
                                type="button"
                                onClick={
                                    onClose
                                }
                                disabled={
                                    saving
                                }
                                className="
                                    flex-1
                                    rounded-xl
                                    border
                                    border-gray-700
                                    bg-gray-900
                                    px-4
                                    py-3
                                    text-sm
                                    font-medium
                                    text-gray-300
                                    transition
                                    hover:bg-gray-800
                                    disabled:opacity-50
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    saving ||
                                    categoriesLoading ||
                                    categories.length ===
                                        0
                                }
                                className="
                                    flex
                                    flex-1
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-green-600
                                    px-4
                                    py-3
                                    text-sm
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-green-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >

                                {saving ? (
                                    <>
                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />

                                        Saving...
                                    </>
                                ) : editingProduct ? (
                                    <>
                                        <Save
                                            size={18}
                                        />

                                        Update Product
                                    </>
                                ) : (
                                    <>
                                        <Save
                                            size={18}
                                        />

                                        Add Product
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}