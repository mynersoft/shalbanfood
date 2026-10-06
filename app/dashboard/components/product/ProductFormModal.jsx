"use client";

import { useEffect, useState } from "react";
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
    ImagePlus,
    Camera,
    FolderOpen,
    Loader2,
    PackagePlus,
    Save,
} from "lucide-react";

// =====================================================
// IMAGE RESIZE
// =====================================================

function resizeImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);

            const canvas = document.createElement("canvas");

            const MAX_WIDTH = 800;

            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
                height = height * (MAX_WIDTH / width);
                width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");

            if (!ctx) {
                reject(new Error("Canvas not supported"));
                return;
            }

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
                                "Image resize failed"
                            )
                        );
                        return;
                    }

                    resolve(blob);
                },
                "image/jpeg",
                0.75
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(
                new Error("Image loading failed")
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
    productName,
    fileType = "image/jpeg"
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
            type: fileType,
        }
    );
}

// =====================================================
// DEFAULT FORM
// =====================================================

const defaultForm = {
    name: "",

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
    editingProduct,
    onClose,
    currentPage = 1,
}) {
    const dispatch = useDispatch();

    // =====================================================
    // CATEGORIES
    // =====================================================

    const {
        data: categoryData = [],
        isLoading: categoriesLoading,
        isFetching: categoriesFetching,
        isError: categoriesError,
    } = useCategories();

    const categories = Array.isArray(categoryData)
        ? categoryData
        : [];

    // =====================================================
    // FORM STATE
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
    // LOAD EDIT PRODUCT
    // =====================================================

    useEffect(() => {
        if (editingProduct) {
            setForm({
                ...defaultForm,

                ...editingProduct,

                size: {
                    value:
                        editingProduct.size?.value ??
                        "",

                    unit:
                        editingProduct.size?.unit ??
                        "gram",
                },

                category:
                    editingProduct.category || "",

                subCategory:
                    editingProduct.subCategory || "",

                brand:
                    editingProduct.brand || "",

                stock:
                    editingProduct.stock ?? "",

                regularPrice:
                    editingProduct.regularPrice ?? "",

                sellPrice:
                    editingProduct.sellPrice ?? "",

                warranty:
                    editingProduct.warranty || "",

                image:
                    editingProduct.image || "",
            });

            setFile(null);
            setPreviewUrl("");
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
        categories.find(
            (category) =>
                category.name ===
                form.category
        ) || null;

    // =====================================================
    // FIELD UPDATE
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

    const focusScroll = (event) => {
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
        async (selectedFile) => {
            if (!selectedFile) return;

            if (
                !selectedFile.type.startsWith(
                    "image/"
                )
            ) {
                toast.error(
                    "Please select an image file."
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
                        form.name,
                        "image/jpeg"
                    );

                setFile(finalFile);

                toast.success(
                    "Image ready!",
                    {
                        id: "image-loading",
                    }
                );
            } catch (error) {
                console.error(error);

                toast.error(
                    "Image processing failed.",
                    {
                        id: "image-loading",
                    }
                );
            }
        };

    // =====================================================
    // VALIDATION
    // =====================================================

    const validateForm = () => {
        if (!form.name.trim()) {
            toast.error(
                "Product name is required."
            );

            return false;
        }

        if (!form.category) {
            toast.error(
                "Please select a category."
            );

            return false;
        }

        if (!form.subCategory) {
            toast.error(
                "Please select a subcategory."
            );

            return false;
        }

        if (
            form.size?.value === "" ||
            Number(form.size?.value) <= 0
        ) {
            toast.error(
                "Please enter product size."
            );

            return false;
        }

        if (!form.size?.unit) {
            toast.error(
                "Please select product unit."
            );

            return false;
        }

        if (
            form.regularPrice === "" ||
            Number(form.regularPrice) < 0
        ) {
            toast.error(
                "Please enter regular price."
            );

            return false;
        }

        if (
            form.sellPrice === "" ||
            Number(form.sellPrice) < 0
        ) {
            toast.error(
                "Please enter sell price."
            );

            return false;
        }

        if (
            Number(form.sellPrice) >
            Number(form.regularPrice)
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

        if (!validateForm()) return;

        setSaving(true);

        try {
            const formData =
                new FormData();

            // -----------------------------------------
            // IMAGE
            // -----------------------------------------

            if (file) {
                formData.append(
                    "image",
                    file
                );
            }

            // -----------------------------------------
            // NORMAL FIELDS
            // -----------------------------------------

            formData.append(
                "name",
                form.name.trim()
            );

            formData.append(
                "category",
                form.category
            );

            formData.append(
                "subCategory",
                form.subCategory || ""
            );

            formData.append(
                "brand",
                form.brand || ""
            );

            formData.append(
                "stock",
                String(
                    Number(form.stock || 0)
                )
            );

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

            formData.append(
                "warranty",
                form.warranty || ""
            );

            // -----------------------------------------
            // SIZE
            // -----------------------------------------

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

            // -----------------------------------------
            // UPDATE ID
            // -----------------------------------------

            if (
                editingProduct?._id
            ) {
                formData.append(
                    "_id",
                    editingProduct._id
                );
            }

            // -----------------------------------------
            // API REQUEST
            // -----------------------------------------

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

            // -----------------------------------------
            // REDUX
            // -----------------------------------------

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

            // -----------------------------------------
            // REFRESH PRODUCT LIST
            // -----------------------------------------

            await dispatch(
                fetchProducts({
                    page: currentPage,
                })
            );

            onClose();
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-5">

            <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 text-gray-100 shadow-2xl">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-800 bg-gray-950 px-5 py-4 sm:px-6">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                            <PackagePlus
                                size={21}
                            />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold sm:text-lg">
                                {editingProduct
                                    ? "Edit Product"
                                    : "Add Product"}
                            </h2>

                            <p className="text-xs text-gray-500">
                                Product information
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* =================================================
                    BODY
                ================================================= */}

                <div className="overflow-y-auto px-5 py-5 sm:px-6">

                    <form
                        onSubmit={
                            handleSubmit
                        }
                        className="space-y-5"
                    >

                        {/* =================================================
                            PRODUCT NAME
                        ================================================= */}

                        <div className="space-y-1.5">

                            <label className="text-sm font-medium text-gray-300">
                                Product Name
                            </label>

                            <input
                                required
                                value={
                                    form.name
                                }
                                onFocus={
                                    focusScroll
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "name",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="e.g. লিচু ফুলের মধু"
                                className="w-full rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-sm outline-none transition placeholder:text-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                            />
                        </div>

                        {/* =================================================
                            CATEGORY
                        ================================================= */}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                            {/* CATEGORY */}

                            <div className="space-y-1.5">

                                <label className="text-sm font-medium text-gray-300">
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
                                    onChange={(
                                        event
                                    ) => {
                                        setForm(
                                            (
                                                previous
                                            ) => ({
                                                ...previous,

                                                category:
                                                    event
                                                        .target
                                                        .value,

                                                subCategory:
                                                    "",
                                            })
                                        );
                                    }}
                                    className="w-full rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10 disabled:cursor-not-allowed disabled:opacity-60"
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
                                                    category.name
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
                                    <p className="text-xs text-red-400">
                                        Failed to load
                                        categories.
                                    </p>
                                )}

                                {!categoriesLoading &&
                                    categories.length ===
                                        0 && (
                                        <p className="text-xs text-yellow-400">
                                            No categories
                                            found.
                                        </p>
                                    )}
                            </div>

                            {/* SUBCATEGORY */}

                            <div className="space-y-1.5">

                                <label className="text-sm font-medium text-gray-300">
                                    Subcategory
                                </label>

                                <select
                                    required
                                    value={
                                        form.subCategory
                                    }
                                    disabled={
                                        !selectedCategory ||
                                        !selectedCategory
                                            .subCategories
                                            ?.length
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
                                    className="w-full rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    <option value="">
                                        {!selectedCategory
                                            ? "Select category first"
                                            : selectedCategory
                                                  .subCategories
                                                  ?.length
                                            ? "Select subcategory"
                                            : "No subcategory"}
                                    </option>

                                    {selectedCategory?.subCategories?.map(
                                        (
                                            subCategory
                                        ) => (
                                            <option
                                                key={
                                                    subCategory
                                                }
                                                value={
                                                    subCategory
                                                }
                                            >
                                                {
                                                    subCategory
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* =================================================
                            BRAND + STOCK
                        ================================================= */}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                            <div className="space-y-1.5">

                                <label className="text-sm font-medium text-gray-300">
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
                                    placeholder="Brand name"
                                    className="w-full rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                                />
                            </div>

                            <div className="space-y-1.5">

                                <label className="text-sm font-medium text-gray-300">
                                    Stock
                                </label>

                                <input
                                    type="number"
                                    min="0"
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
                                                ? Number(
                                                      event
                                                          .target
                                                          .value
                                                  )
                                                : ""
                                        )
                                    }
                                    placeholder="0"
                                    className="w-full rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                                />
                            </div>
                        </div>

                        {/* =================================================
                            SIZE
                        ================================================= */}

                        <div className="space-y-1.5">

                            <label className="text-sm font-medium text-gray-300">
                                Product Size
                            </label>

                            <div className="grid grid-cols-2 gap-4">

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
                                                ? Number(
                                                      event
                                                          .target
                                                          .value
                                                  )
                                                : ""
                                        )
                                    }
                                    placeholder="250"
                                    className="w-full rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
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
                                    className="w-full rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
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

                        {/* =================================================
                            PRICE
                        ================================================= */}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                            <div className="space-y-1.5">

                                <label className="text-sm font-medium text-gray-300">
                                    Regular Price
                                </label>

                                <div className="relative">

                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                        ৳
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
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
                                                    ? Number(
                                                          event
                                                              .target
                                                              .value
                                                      )
                                                    : ""
                                            )
                                        }
                                        placeholder="1200"
                                        className="w-full rounded-xl border border-gray-800 bg-gray-900 py-3 pl-9 pr-4 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">

                                <label className="text-sm font-medium text-gray-300">
                                    Sell Price
                                </label>

                                <div className="relative">

                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500">
                                        ৳
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
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
                                                    ? Number(
                                                          event
                                                              .target
                                                              .value
                                                      )
                                                    : ""
                                            )
                                        }
                                        placeholder="920"
                                        className="w-full rounded-xl border border-gray-800 bg-gray-900 py-3 pl-9 pr-4 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            WARRANTY
                        ================================================= */}

                        <div className="space-y-1.5">

                            <label className="text-sm font-medium text-gray-300">
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
                                className="w-full rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                            />
                        </div>

                        {/* =================================================
                            IMAGE
                        ================================================= */}

                        <div className="space-y-3">

                            <label className="text-sm font-medium text-gray-300">
                                Product Image
                            </label>

                            <div className="grid grid-cols-2 gap-3">

                                {/* CAMERA */}

                                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm font-medium text-blue-400 transition hover:bg-blue-500/20">

                                    <Camera
                                        size={18}
                                    />

                                    <span>
                                        Camera
                                    </span>

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

                                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 text-sm font-medium text-purple-400 transition hover:bg-purple-500/20">

                                    <FolderOpen
                                        size={18}
                                    />

                                    <span>
                                        Gallery
                                    </span>

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
                                (form.image &&
                                    !file)) && (
                                <div className="rounded-xl border border-gray-800 bg-gray-900 p-3">

                                    <div className="flex items-center gap-4">

                                        <img
                                            src={
                                                previewUrl ||
                                                form.image
                                            }
                                            alt={
                                                form.name ||
                                                "Product preview"
                                            }
                                            className="h-24 w-24 rounded-xl border border-gray-700 object-cover"
                                        />

                                        <div className="min-w-0">

                                            <p className="text-sm font-medium text-gray-200">
                                                Image
                                                Preview
                                            </p>

                                            {file && (
                                                <p className="mt-1 truncate text-xs text-gray-500">
                                                    {
                                                        file.name
                                                    }
                                                </p>
                                            )}

                                            <p className="mt-2 text-xs text-gray-600">
                                                Optimized
                                                before
                                                upload
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <div className="sticky bottom-0 flex gap-3 border-t border-gray-800 bg-gray-950 py-4">

                            <button
                                type="button"
                                onClick={
                                    onClose
                                }
                                disabled={
                                    saving
                                }
                                className="flex-1 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    saving ||
                                    categoriesLoading
                                }
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                {saving ? (
                                    <>
                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />

                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save
                                            size={18}
                                        />

                                        {editingProduct
                                            ? "Update Product"
                                            : "Add Product"}
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