"use client";

import { useEffect, useState } from "react";
import {
    ImagePlus,
    Plus,
    Save,
    Trash2,
    X,
} from "lucide-react";

import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/--+/g, "-");
}

const emptyItem = {
    name: "",
    quantity: "",
};

const defaultForm = {
    name: "",
    slug: "",
    shortDescription: "",
    description: "",

    items: [
        {
            ...emptyItem,
        },
        {
            ...emptyItem,
        },
    ],

    regularPrice: "",
    offerPrice: "",

    featureImg: "",
    images: [],

    stock: 0,
    sold: 0,

    startDate: "",
    endDate: "",

    isActive: true,
    isFeatured: false,
    priority: 0,

    seoTitle: "",
    seoDescription: "",
    keywords: "",
};

function formatDateTimeLocal(value) {
    if (!value) return "";

    const date = new Date(value);

    const offset =
        date.getTimezoneOffset() * 60000;

    return new Date(
        date.getTime() - offset
    )
        .toISOString()
        .slice(0, 16);
}

export default function OfferForm({
    offer = null,
}) {
    const router = useRouter();

    const isEdit = Boolean(offer);

    const [form, setForm] = useState(
        defaultForm
    );

    const [loading, setLoading] =
        useState(false);

    const [uploading, setUploading] =
        useState(false);

    useEffect(() => {
        if (!offer) return;

        setForm({
            name: offer.name || "",
            slug: offer.slug || "",
            shortDescription:
                offer.shortDescription || "",
            description: offer.description || "",

            items:
                offer.items?.length >= 2
                    ? offer.items
                    : defaultForm.items,

            regularPrice:
                offer.regularPrice ?? "",

            offerPrice:
                offer.offerPrice ?? "",

            featureImg:
                offer.featureImg || "",

            images:
                offer.images || [],

            stock: offer.stock ?? 0,
            sold: offer.sold ?? 0,

            startDate:
                formatDateTimeLocal(
                    offer.startDate
                ),

            endDate:
                formatDateTimeLocal(
                    offer.endDate
                ),

            isActive:
                offer.isActive ?? true,

            isFeatured:
                offer.isFeatured ?? false,

            priority:
                offer.priority ?? 0,

            seoTitle:
                offer.seoTitle || "",

            seoDescription:
                offer.seoDescription || "",

            keywords:
                offer.keywords?.join(", ") || "",
        });
    }, [offer]);

    const updateField = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const updateItem = (
        index,
        field,
        value
    ) => {
        setForm((prev) => ({
            ...prev,
            items: prev.items.map(
                (item, itemIndex) =>
                    itemIndex === index
                        ? {
                              ...item,
                              [field]: value,
                          }
                        : item
            ),
        }));
    };

    const addItem = () => {
        setForm((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    ...emptyItem,
                },
            ],
        }));
    };

    const removeItem = (index) => {
        if (form.items.length <= 2) {
            toast.error(
                "A combo needs at least 2 items"
            );
            return;
        }

        setForm((prev) => ({
            ...prev,
            items: prev.items.filter(
                (_, itemIndex) =>
                    itemIndex !== index
            ),
        }));
    };

    const handleNameChange = (value) => {
        setForm((prev) => ({
            ...prev,
            name: value,

            slug:
                isEdit && prev.slug
                    ? prev.slug
                    : slugify(value),
        }));
    };

    const uploadImage = async (file) => {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error(
                "Please select an image"
            );
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();

            formData.append("file", file);

            const response = await fetch(
                "/api/upload/offer",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data =
                await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                        "Upload failed"
                );
            }

            setForm((prev) => ({
                ...prev,
                featureImg: data.url,
            }));

            toast.success(
                "Image uploaded successfully"
            );
        } catch (error) {
            toast.error(error.message);
        } finally {
            setUploading(false);
        }
    };

    const validate = () => {
        if (!form.name.trim()) {
            toast.error(
                "Offer name is required"
            );
            return false;
        }

        if (!form.slug.trim()) {
            toast.error("Slug is required");
            return false;
        }

        if (form.items.length < 2) {
            toast.error(
                "At least 2 items are required"
            );
            return false;
        }

        for (const item of form.items) {
            if (
                !item.name.trim() ||
                !item.quantity.trim()
            ) {
                toast.error(
                    "Complete all combo items"
                );
                return false;
            }
        }

        if (!form.regularPrice) {
            toast.error(
                "Regular price is required"
            );
            return false;
        }

        if (!form.offerPrice) {
            toast.error(
                "Offer price is required"
            );
            return false;
        }

        if (
            Number(form.offerPrice) >
            Number(form.regularPrice)
        ) {
            toast.error(
                "Offer price cannot be greater than regular price"
            );
            return false;
        }

        if (!form.featureImg) {
            toast.error(
                "Feature image is required"
            );
            return false;
        }

        if (!form.startDate || !form.endDate) {
            toast.error(
                "Start and end dates are required"
            );
            return false;
        }

        if (
            new Date(form.endDate) <=
            new Date(form.startDate)
        ) {
            toast.error(
                "End date must be after start date"
            );
            return false;
        }

        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            const payload = {
                ...form,

                regularPrice: Number(
                    form.regularPrice
                ),

                offerPrice: Number(
                    form.offerPrice
                ),

                stock: Number(form.stock),

                priority: Number(
                    form.priority
                ),

                items: form.items.map((item) => ({
                    name: item.name.trim(),
                    quantity:
                        item.quantity.trim(),
                })),

                keywords: form.keywords
                    .split(",")
                    .map((item) =>
                        item.trim()
                    )
                    .filter(Boolean),
            };

            delete payload.sold;

            const url = isEdit
                ? `/api/offers/${offer._id}`
                : "/api/offers";

            const method = isEdit
                ? "PUT"
                : "POST";

            const response = await fetch(url, {
                method,

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify(payload),
            });

            const data =
                await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                        "Something went wrong"
                );
            }

            toast.success(
                isEdit
                    ? "Offer updated successfully"
                    : "Offer created successfully"
            );

            router.push(
                "/dashboard/admin/offers"
            );

            router.refresh();
        } catch (error) {
            console.error(error);

            toast.error(
                error.message ||
                    "Failed to save offer"
            );
        } finally {
            setLoading(false);
        }
    };

    const discount =
        Number(form.regularPrice) > 0
            ? Math.round(
                  ((Number(
                      form.regularPrice
                  ) -
                      Number(
                          form.offerPrice || 0
                      )) /
                      Number(
                          form.regularPrice
                      )) *
                      100
              )
            : 0;

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            {/* Basic Information */}

            <section className="rounded-2xl border bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900">
                    Basic Information
                </h2>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold">
                            Offer Name *
                        </label>

                        <input
                            value={form.name}
                            onChange={(e) =>
                                handleNameChange(
                                    e.target.value
                                )
                            }
                            placeholder="1 KG কালোজিরা মধু + 500g গাওয়া ঘি"
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">
                            Slug *
                        </label>

                        <input
                            value={form.slug}
                            onChange={(e) =>
                                updateField(
                                    "slug",
                                    e.target.value
                                )
                            }
                            placeholder="kalojira-honey-ghee-combo"
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">
                            Priority
                        </label>

                        <input
                            type="number"
                            value={form.priority}
                            onChange={(e) =>
                                updateField(
                                    "priority",
                                    e.target.value
                                )
                            }
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold">
                            Short Description
                        </label>

                        <input
                            value={
                                form.shortDescription
                            }
                            onChange={(e) =>
                                updateField(
                                    "shortDescription",
                                    e.target.value
                                )
                            }
                            maxLength={300}
                            placeholder="বিশেষ অফারে মধু ও গাওয়া ঘির কম্বো"
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold">
                            Description
                        </label>

                        <textarea
                            value={
                                form.description
                            }
                            onChange={(e) =>
                                updateField(
                                    "description",
                                    e.target.value
                                )
                            }
                            rows={5}
                            placeholder="Offer details..."
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
                        />
                    </div>
                </div>
            </section>

            {/* Combo Items */}

            <section className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold">
                            Combo Items
                        </h2>

                        <p className="text-sm text-gray-500">
                            Products are stored as combo text. No product reference.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={addItem}
                        className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
                    >
                        <Plus size={17} />
                        Add Item
                    </button>
                </div>

                <div className="mt-5 space-y-3">
                    {form.items.map(
                        (item, index) => (
                            <div
                                key={index}
                                className="grid gap-3 rounded-xl border bg-gray-50 p-3 md:grid-cols-[1fr_180px_auto]"
                            >
                                <input
                                    value={
                                        item.name
                                    }
                                    onChange={(e) =>
                                        updateItem(
                                            index,
                                            "name",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Item name"
                                    className="rounded-lg border bg-white px-3 py-3 outline-none focus:border-green-600"
                                />

                                <input
                                    value={
                                        item.quantity
                                    }
                                    onChange={(e) =>
                                        updateItem(
                                            index,
                                            "quantity",
                                            e.target.value
                                        )
                                    }
                                    placeholder="1 KG"
                                    className="rounded-lg border bg-white px-3 py-3 outline-none focus:border-green-600"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        removeItem(
                                            index
                                        )
                                    }
                                    className="rounded-lg border border-red-200 px-3 text-red-600 hover:bg-red-50"
                                >
                                    <Trash2
                                        size={18}
                                    />
                                </button>
                            </div>
                        )
                    )}
                </div>
            </section>

            {/* Pricing */}

            <section className="rounded-2xl border bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold">
                    Pricing
                </h2>

                <div className="mt-5 grid gap-5 md:grid-cols-3">
                    <div>
                        <label className="mb-2 block text-sm font-semibold">
                            Regular Price *
                        </label>

                        <input
                            type="number"
                            min="0"
                            value={
                                form.regularPrice
                            }
                            onChange={(e) =>
                                updateField(
                                    "regularPrice",
                                    e.target.value
                                )
                            }
                            placeholder="1450"
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">
                            Offer Price *
                        </label>

                        <input
                            type="number"
                            min="0"
                            value={
                                form.offerPrice
                            }
                            onChange={(e) =>
                                updateField(
                                    "offerPrice",
                                    e.target.value
                                )
                            }
                            placeholder="1200"
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
                        />
                    </div>

                    <div className="flex items-end">
                        <div className="w-full rounded-xl bg-green-50 px-4 py-3">
                            <span className="text-sm text-green-700">
                                Discount
                            </span>

                            <p className="text-2xl font-bold text-green-700">
                                {discount > 0
                                    ? `${discount}%`
                                    : "0%"}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Image */}

            <section className="rounded-2xl border bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold">
                    Feature Image
                </h2>

                <div className="mt-5">
                    {form.featureImg ? (
                        <div className="relative max-w-md overflow-hidden rounded-2xl border">
                            <img
                                src={
                                    form.featureImg
                                }
                                alt="Offer"
                                className="aspect-square w-full object-cover"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    updateField(
                                        "featureImg",
                                        ""
                                    )
                                }
                                className="absolute right-3 top-3 rounded-full bg-white p-2 text-red-600 shadow"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ) : (
                        <label className="flex aspect-video max-w-md cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-green-500">
                            <ImagePlus
                                size={40}
                                className="text-gray-400"
                            />

                            <span className="mt-3 text-sm font-semibold">
                                {uploading
                                    ? "Uploading..."
                                    : "Choose Feature Image"}
                            </span>

                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={
                                    uploading
                                }
                                onChange={(e) =>
                                    uploadImage(
                                        e.target
                                            .files?.[0]
                                    )
                                }
                            />
                        </label>
                    )}
                </div>
            </section>

            {/* Stock + Schedule */}

            <section className="rounded-2xl border bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold">
                    Stock & Schedule
                </h2>

                <div className="mt-5 grid gap-5 md:grid-cols-3">
                    <div>
                        <label className="mb-2 block text-sm font-semibold">
                            Stock
                        </label>

                        <input
                            type="number"
                            min="0"
                            value={form.stock}
                            onChange={(e) =>
                                updateField(
                                    "stock",
                                    e.target.value
                                )
                            }
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">
                            Start Date
                        </label>

                        <input
                            type="datetime-local"
                            value={
                                form.startDate
                            }
                            onChange={(e) =>
                                updateField(
                                    "startDate",
                                    e.target.value
                                )
                            }
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">
                            End Date
                        </label>

                        <input
                            type="datetime-local"
                            value={form.endDate}
                            onChange={(e) =>
                                updateField(
                                    "endDate",
                                    e.target.value
                                )
                            }
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
                        />
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-6">
                    <label className="flex cursor-pointer items-center gap-3">
                        <input
                            type="checkbox"
                            checked={
                                form.isActive
                            }
                            onChange={(e) =>
                                updateField(
                                    "isActive",
                                    e.target.checked
                                )
                            }
                            className="h-5 w-5"
                        />

                        <span className="text-sm font-semibold">
                            Active Offer
                        </span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-3">
                        <input
                            type="checkbox"
                            checked={
                                form.isFeatured
                            }
                            onChange={(e) =>
                                updateField(
                                    "isFeatured",
                                    e.target.checked
                                )
                            }
                            className="h-5 w-5"
                        />

                        <span className="text-sm font-semibold">
                            Featured Offer
                        </span>
                    </label>
                </div>
            </section>

            {/* SEO */}

            <section className="rounded-2xl border bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold">
                    SEO
                </h2>

                <div className="mt-5 space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-semibold">
                            SEO Title
                        </label>

                        <input
                            value={
                                form.seoTitle
                            }
                            onChange={(e) =>
                                updateField(
                                    "seoTitle",
                                    e.target.value
                                )
                            }
                            maxLength={70}
                            placeholder="Kalojira Honey & Ghee Combo Offer | Shalban Food"
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">
                            SEO Description
                        </label>

                        <textarea
                            value={
                                form.seoDescription
                            }
                            onChange={(e) =>
                                updateField(
                                    "seoDescription",
                                    e.target.value
                                )
                            }
                            maxLength={170}
                            rows={3}
                            placeholder="Special combo offer from Shalban Food..."
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">
                            Keywords
                        </label>

                        <input
                            value={
                                form.keywords
                            }
                            onChange={(e) =>
                                updateField(
                                    "keywords",
                                    e.target.value
                                )
                            }
                            placeholder="combo offer, kalojira honey, ghee, shalban food"
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
                        />

                        <p className="mt-1 text-xs text-gray-400">
                            Separate keywords with commas.
                        </p>
                    </div>
                </div>
            </section>

            {/* Submit */}

            <div className="sticky bottom-4 z-10 flex justify-end">
                <button
                    type="submit"
                    disabled={
                        loading || uploading
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-7 py-3 font-bold text-white shadow-lg hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Save size={18} />

                    {loading
                        ? "Saving..."
                        : isEdit
                        ? "Update Offer"
                        : "Create Offer"}
                </button>
            </div>
        </form>
    );
}