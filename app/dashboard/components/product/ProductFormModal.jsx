"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	addProduct,
	updateProduct,
	setProducts,
} from '@/redux/store/slices/productSlice';
import toast from "react-hot-toast";

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

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error("Image resize failed"));
                        return;
                    }

                    resolve(blob);
                },
                file.type || "image/jpeg",
                0.7
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Image loading failed"));
        };

        img.src = objectUrl;
    });
}

// =====================================================
// RENAME IMAGE
// =====================================================
function renameFile(blob, productName, fileType) {
    const ext = fileType?.split("/")[1] || "jpg";

    const safeName =
        productName
            ?.trim()
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9_\-\u0980-\u09FF]/g, "") ||
        "product";

    const finalName = `${safeName}_shalbanfood.${ext}`;

    return new File([blob], finalName, {
        type: fileType || "image/jpeg",
    });
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

    const {categories}  = useSelector((state) => state.category);
   
    
    const [form, setForm] = useState(defaultForm);
    const [file, setFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");

    // =====================================================
    // LOAD EDITING PRODUCT
    // =====================================================
    useEffect(() => {
        if (editingProduct) {
            setForm({
                ...defaultForm,
                ...editingProduct,

                size: editingProduct.size || {
                    value: "",
                    unit: "gram",
                },
            });

            setFile(null);
            setPreviewUrl("");
        } else {
            setForm(defaultForm);
            setFile(null);
            setPreviewUrl("");
        }
    }, [editingProduct]);

    // =====================================================
    // CREATE IMAGE PREVIEW
    // =====================================================
    useEffect(() => {
        if (!file) {
            setPreviewUrl("");
            return;
        }

        const url = URL.createObjectURL(file);

        setPreviewUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [file]);

    // =====================================================
    // AUTO SCROLL INPUT ON MOBILE
    // =====================================================
    const focusScroll = (e) => {
        e.target.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    };

    // =====================================================
    // UPDATE NORMAL FIELD
    // =====================================================
    const updateField = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // =====================================================
    // UPDATE SIZE
    // =====================================================
    const updateSize = (field, value) => {
        setForm((prev) => ({
            ...prev,
            size: {
                ...prev.size,
                [field]: value,
            },
        }));
    };

    // =====================================================
    // SELECTED CATEGORY
    // =====================================================
    const selectedCategory =
     categories.length >= 0 &&  categories.find(
            (cat) => cat.name === form.category
        ) || {};

    // =====================================================
    // IMAGE SELECT
    // =====================================================
    const handleImageSelect = async (selectedFile) => {
        if (!selectedFile) return;

        if (!selectedFile.type.startsWith("image/")) {
            toast.error("Please select an image file!");
            return;
        }

        try {
            toast.loading("Preparing image...", {
                id: "image-loading",
            });

            const resizedBlob = await resizeImage(selectedFile);

            const finalFile = renameFile(
                resizedBlob,
                form.name || "product",
                selectedFile.type
            );

            setFile(finalFile);

            toast.success("Image ready!", {
                id: "image-loading",
            });
        } catch (error) {
            console.error(error);

            toast.error("Image processing failed!", {
                id: "image-loading",
            });
        }
    };

    // =====================================================
    // VALIDATION
    // =====================================================
    const validateForm = () => {
        if (!form.name.trim()) {
            toast.error("Product name is required!");
            return false;
        }

        if (!form.category) {
            toast.error("Please select a category!");
            return false;
        }

        if (!form.subCategory) {
            toast.error("Please select a subcategory!");
            return false;
        }

        if (
            form.size?.value === "" ||
            form.size?.value === null ||
            Number(form.size?.value) <= 0
        ) {
            toast.error("Please enter product size!");
            return false;
        }

        if (!form.size?.unit) {
            toast.error("Please select product unit!");
            return false;
        }

        if (
            form.regularPrice === "" ||
            Number(form.regularPrice) < 0
        ) {
            toast.error("Please enter regular price!");
            return false;
        }

        if (
            form.sellPrice === "" ||
            Number(form.sellPrice) < 0
        ) {
            toast.error("Please enter sell price!");
            return false;
        }

        return true;
    };

    // =====================================================
    // SUBMIT
    // =====================================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSaving(true);

        try {
            const formData = new FormData();

            // -------------------------------
            // IMAGE
            // -------------------------------
            if (file) {
                formData.append("image", file);
            }

            // -------------------------------
            // NORMAL FIELDS
            // -------------------------------
            formData.append("name", form.name.trim());
            formData.append("category", form.category);
            formData.append(
                "subCategory",
                form.subCategory || ""
            );
            formData.append("brand", form.brand || "");

            formData.append(
                "stock",
                Number(form.stock || 0)
            );

            formData.append(
                "regularPrice",
                Number(form.regularPrice)
            );

            formData.append(
                "sellPrice",
                Number(form.sellPrice)
            );

            formData.append(
                "warranty",
                form.warranty || ""
            );

            // -------------------------------
            // SIZE
            // -------------------------------
            formData.append(
                "size",
                JSON.stringify({
                    value: Number(form.size.value),
                    unit: form.size.unit,
                })
            );

            // -------------------------------
            // UPDATE / CREATE
            // -------------------------------
            if (editingProduct?._id) {
                formData.append(
                    "_id",
                    editingProduct._id
                );
            }

            const res = await fetch("/api/products", {
                method: editingProduct ? "PUT" : "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data?.error || "Product save failed"
                );
            }

            const payload = data.product;

            // -------------------------------
            // REDUX UPDATE
            // -------------------------------
            if (editingProduct) {
                await dispatch(
                    updateProduct(payload)
                ).unwrap();

                toast.success(
                    "Product updated successfully!"
                );
            } else {
                await dispatch(
                    addProduct(payload)
                ).unwrap();

                toast.success(
                    "Product added successfully!"
                );
            }

            // -------------------------------
            // REFRESH PRODUCT LIST
            // -------------------------------
            await dispatch(
                fetchProducts({
                    page: currentPage,
                })
            );

            onClose();
        } catch (error) {
            console.error("Product save error:", error);

            toast.error(
                error?.message || "Save failed!"
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // RENDER
    // =====================================================
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-3 sm:p-4">
            <div className="bg-gray-900 text-gray-100 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-xl">

                {/* ================================================= */}
                {/* HEADER */}
                {/* ================================================= */}
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-900 pb-3 z-10">

                    <h3 className="text-lg font-semibold">
                        {editingProduct
                            ? "Edit Product"
                            : "Add Product"}
                    </h3>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="text-gray-400 hover:text-white text-xl disabled:opacity-50"
                    >
                        ✕
                    </button>
                </div>

                {/* ================================================= */}
                {/* FORM */}
                {/* ================================================= */}
                <form
                    onSubmit={handleSubmit}
                    className="grid gap-4"
                >

                    {/* ================================================= */}
                    {/* PRODUCT NAME */}
                    {/* ================================================= */}
                    <div className="flex flex-col gap-1">

                        <label className="text-gray-300">
                            Product Name
                        </label>

                        <input
                            required
                            placeholder="Product Name"
                            value={form.name}
                            onFocus={focusScroll}
                            onChange={(e) =>
                                updateField(
                                    "name",
                                    e.target.value
                                )
                            }
                            className="p-3 rounded bg-gray-800 w-full text-base outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* ================================================= */}
                    {/* CATEGORY + SUBCATEGORY */}
                    {/* ================================================= */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        {/* CATEGORY */}
                        <div className="flex flex-col gap-1">

                            <label className="text-gray-300">
                                Category
                            </label>

                            <select
                                required
                                value={form.category}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        category:
                                            e.target.value,
                                        subCategory: "",
                                    }))
                                }
                                className="p-3 rounded bg-gray-800 outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">
                                    Select category
                                </option>

                                {categories.length >= 0 && categories.map((cat) => (
                                    <option
                                        key={
                                            cat._id ||
                                            cat.name
                                        }
                                        value={cat.name}
                                    >
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* SUBCATEGORY */}
                        <div className="flex flex-col gap-1">

                            <label className="text-gray-300">
                                Subcategory
                            </label>

                            <select
                                required
                                value={
                                    form.subCategory
                                }
                                onChange={(e) =>
                                    updateField(
                                        "subCategory",
                                        e.target.value
                                    )
                                }
                                disabled={
                                    !selectedCategory
                                        .subCategories
                                        ?.length
                                }
                                className="p-3 rounded bg-gray-800 outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                            >
                                <option value="">
                                    Select subcategory
                                </option>

                                {selectedCategory.subCategories?.map(
                                    (sub) => (
                                        <option
                                            key={sub}
                                            value={sub}
                                        >
                                            {sub}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>
                    </div>

                    {/* ================================================= */}
                    {/* BRAND + STOCK */}
                    {/* ================================================= */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        {/* BRAND */}
                        <div className="flex flex-col gap-1">

                            <label className="text-gray-300">
                                Brand
                            </label>

                            <input
                                placeholder="Brand"
                                value={form.brand}
                                onChange={(e) =>
                                    updateField(
                                        "brand",
                                        e.target.value
                                    )
                                }
                                className="p-3 rounded bg-gray-800 outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        {/* STOCK */}
                        <div className="flex flex-col gap-1">

                            <label className="text-gray-300">
                                Stock
                            </label>

                            <input
                                type="number"
                                min="0"
                                placeholder="Stock"
                                value={form.stock}
                                onChange={(e) =>
                                    updateField(
                                        "stock",
                                        e.target.value
                                            ? Number(
                                                  e.target
                                                      .value
                                              )
                                            : ""
                                    )
                                }
                                className="p-3 rounded bg-gray-800 outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    {/* ================================================= */}
                    {/* PRODUCT SIZE */}
                    {/* ================================================= */}
                    <div className="flex flex-col gap-1">

                        <label className="text-gray-300">
                            Product Size
                        </label>

                        <div className="grid grid-cols-2 gap-3">

                            {/* SIZE VALUE */}
                            <input
                                type="number"
                                min="0"
                                step="any"
                                required
                                placeholder="e.g. 250"
                                value={
                                    form.size?.value ??
                                    ""
                                }
                                onChange={(e) =>
                                    updateSize(
                                        "value",
                                        e.target.value
                                            ? Number(
                                                  e.target
                                                      .value
                                              )
                                            : ""
                                    )
                                }
                                className="p-3 rounded bg-gray-800 outline-none focus:ring-2 focus:ring-green-500"
                            />

                            {/* UNIT */}
                            <select
                                required
                                value={
                                    form.size?.unit ||
                                    "gram"
                                }
                                onChange={(e) =>
                                    updateSize(
                                        "unit",
                                        e.target.value
                                    )
                                }
                                className="p-3 rounded bg-gray-800 outline-none focus:ring-2 focus:ring-green-500"
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
                            </select>
                        </div>

                        {/* SIZE PREVIEW */}
                        {form.size?.value && (
                            <p className="text-sm text-gray-400 mt-1">
                                Size:{" "}
                                <span className="text-green-400 font-medium">
                                    {form.size.value}{" "}
                                    {form.size.unit ===
                                    "gram"
                                        ? "g"
                                        : form.size
                                              .unit ===
                                          "kg"
                                        ? "kg"
                                        : form.size
                                              .unit ===
                                          "milliliter"
                                        ? "ml"
                                        : "L"}
                                </span>
                            </p>
                        )}
                    </div>

                    {/* ================================================= */}
                    {/* PRICE */}
                    {/* ================================================= */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        {/* REGULAR PRICE */}
                        <div className="flex flex-col gap-1">

                            <label className="text-gray-300">
                                Regular Price
                            </label>

                            <input
                                type="number"
                                min="0"
                                required
                                placeholder="Regular Price"
                                value={
                                    form.regularPrice
                                }
                                onChange={(e) =>
                                    updateField(
                                        "regularPrice",
                                        e.target.value
                                            ? Number(
                                                  e.target
                                                      .value
                                              )
                                            : ""
                                    )
                                }
                                className="p-3 rounded bg-gray-800 outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        {/* SELL PRICE */}
                        <div className="flex flex-col gap-1">

                            <label className="text-gray-300">
                                Sell Price
                            </label>

                            <input
                                type="number"
                                min="0"
                                required
                                placeholder="Sell Price"
                                value={form.sellPrice}
                                onChange={(e) =>
                                    updateField(
                                        "sellPrice",
                                        e.target.value
                                            ? Number(
                                                  e.target
                                                      .value
                                              )
                                            : ""
                                    )
                                }
                                className="p-3 rounded bg-gray-800 outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    {/* ================================================= */}
                    {/* WARRANTY */}
                    {/* ================================================= */}
                    <div className="flex flex-col gap-1">

                        <label className="text-gray-300">
                            Warranty
                        </label>

                        <input
                            placeholder="Warranty"
                            value={form.warranty}
                            onChange={(e) =>
                                updateField(
                                    "warranty",
                                    e.target.value
                                )
                            }
                            className="p-3 rounded bg-gray-800 outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* ================================================= */}
                    {/* IMAGE UPLOAD */}
                    {/* ================================================= */}
                    <div className="flex flex-col gap-1">

                        <label className="text-gray-300">
                            Product Image
                        </label>

                        <div className="flex gap-3 mt-1 flex-wrap">

                            {/* CAMERA */}
                            <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded cursor-pointer text-sm transition">

                                📸 Take Photo

                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={(e) =>
                                        handleImageSelect(
                                            e.target
                                                .files?.[0]
                                        )
                                    }
                                />
                            </label>

                            {/* GALLERY */}
                            <label className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded cursor-pointer text-sm transition">

                                📁 Choose From Gallery

                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) =>
                                        handleImageSelect(
                                            e.target
                                                .files?.[0]
                                        )
                                    }
                                />
                            </label>
                        </div>

                        {/* ================================================= */}
                        {/* IMAGE PREVIEW */}
                        {/* ================================================= */}
                        {(previewUrl ||
                            (form.image && !file)) && (
                            <div className="mt-3">

                                <img
                                    src={
                                        previewUrl ||
                                        form.image
                                    }
                                    alt={
                                        form.name ||
                                        "Product preview"
                                    }
                                    className="w-24 h-24 object-cover rounded-lg border border-gray-700"
                                />

                                {file && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        {file.name}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ================================================= */}
                    {/* BUTTONS */}
                    {/* ================================================= */}
                    <div className="flex justify-end gap-3 mt-4 sticky bottom-0 bg-gray-900 pt-3">

                        {/* CANCEL */}
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        {/* SAVE */}
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving
                                ? "Saving..."
                                : editingProduct
                                ? "Update"
                                : "Add"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}