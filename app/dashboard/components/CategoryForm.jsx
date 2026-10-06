'use client';

import { useEffect, useState } from 'react';

import {
    Plus,
    Save,
    X,
    Link as LinkIcon,
} from 'lucide-react';

const CATEGORY_SLUG_MAP = {
    'মধু': 'honey',
    'গাওয়া ঘি': 'ghee',
    'ঘি': 'ghee',
    'খেজুর': 'dates',
    'বাদাম': 'nuts',
    'ড্রাই ফ্রুটস': 'dry-fruits',
    'শুকনা খাবার': 'dry-foods',
    'ন্যাচারাল ফুড': 'natural-foods',
};

const slugify = (value) => {
    const text = value.trim().toLowerCase();

    if (CATEGORY_SLUG_MAP[text]) {
        return CATEGORY_SLUG_MAP[text];
    }

    return text
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

export default function CategoryForm({
    onSubmit,
    editingCategory = null,
    onCancel,
    loading = false,
}) {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [subCategories, setSubCategories] =
        useState('');

    const [slugManuallyEdited, setSlugManuallyEdited] =
        useState(false);

    // ==========================================
    // LOAD EDIT DATA
    // ==========================================

    useEffect(() => {
        if (editingCategory) {
            setName(
                editingCategory.name || ''
            );

            setSlug(
                editingCategory.slug || ''
            );

            setSubCategories(
                Array.isArray(
                    editingCategory.subCategories
                )
                    ? editingCategory.subCategories.join(
                          ', '
                      )
                    : ''
            );

            setSlugManuallyEdited(true);
        } else {
            setName('');
            setSlug('');
            setSubCategories('');
            setSlugManuallyEdited(false);
        }
    }, [editingCategory]);

    // ==========================================
    // NAME CHANGE
    // ==========================================

    const handleNameChange = (e) => {
        const value = e.target.value;

        setName(value);

        if (!slugManuallyEdited) {
            setSlug(slugify(value));
        }
    };

    // ==========================================
    // SLUG CHANGE
    // ==========================================

    const handleSlugChange = (e) => {
        const value = e.target.value
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-');

        setSlug(value);
        setSlugManuallyEdited(true);
    };

    // ==========================================
    // SUBMIT
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        const cleanName = name.trim();
        const cleanSlug = slug.trim().toLowerCase();

        if (!cleanName) {
            return;
        }

        if (!cleanSlug) {
            return;
        }

        if (
            !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
                cleanSlug
            )
        ) {
            return;
        }

        const subCategoryArray =
            subCategories
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);

        await onSubmit({
            name: cleanName,
            slug: cleanSlug,
            subCategories: subCategoryArray,
        });
    };

    return (
        <div className="rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        {editingCategory
                            ? 'Edit Category'
                            : 'Add Category'}
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-500">
                        {editingCategory
                            ? 'Update category information'
                            : 'Create a new product category'}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                >
                    <X size={20} />
                </button>

            </div>

            {/* FORM */}

            <form
                onSubmit={handleSubmit}
                className="space-y-5 p-5"
            >

                {/* NAME */}

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Category Name
                    </label>

                    <input
                        type="text"
                        value={name}
                        onChange={
                            handleNameChange
                        }
                        placeholder="e.g. মধু"
                        autoFocus
                        disabled={loading}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100"
                    />
                </div>

                {/* SLUG */}

                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <LinkIcon size={15} />
                        URL Slug
                    </label>

                    <input
                        type="text"
                        value={slug}
                        onChange={
                            handleSlugChange
                        }
                        placeholder="e.g. honey"
                        disabled={loading}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100"
                    />

                    <p className="mt-1.5 text-xs text-gray-400">
                        Example: /category/
                        {slug || 'honey'}
                    </p>
                </div>

                {/* SUBCATEGORIES */}

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Subcategories
                    </label>

                    <input
                        type="text"
                        value={
                            subCategories
                        }
                        onChange={(e) =>
                            setSubCategories(
                                e.target.value
                            )
                        }
                        placeholder="e.g. লিচু ফুলের মধু, কালোজিরা ফুলের মধু"
                        disabled={loading}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100"
                    />

                    <p className="mt-1.5 text-xs text-gray-400">
                        Separate multiple subcategories with commas.
                    </p>
                </div>

                {/* ACTIONS */}

                <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex min-w-[130px] items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                        {loading ? (
                            <span className="animate-spin">
                                <Save size={16} />
                            </span>
                        ) : editingCategory ? (
                            <Save size={16} />
                        ) : (
                            <Plus size={17} />
                        )}

                        {editingCategory
                            ? 'Update Category'
                            : 'Add Category'}

                    </button>

                </div>

            </form>
        </div>
    );
}