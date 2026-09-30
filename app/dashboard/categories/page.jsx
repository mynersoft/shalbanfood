'use client';

import { useState } from 'react';

import {
    Plus,
    Search,
    Pencil,
    Trash2,
    FolderTree,
    ChevronDown,
    ChevronUp,
    X,
    Loader2,
    FolderPlus,
} from 'lucide-react';

import toast from 'react-hot-toast';

import {
    useCategories,
    useAddCategory,
    useUpdateCategory,
    useDeleteCategory,
    useAddSubCategory,
    useDeleteSubCategory,
} from '@/hooks/useCategory';

export default function CategoriesPage() {
    const [search, setSearch] = useState('');

    const [isCategoryModalOpen, setIsCategoryModalOpen] =
        useState(false);

    const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] =
        useState(false);

    const [editingCategory, setEditingCategory] =
        useState(null);

    const [selectedCategory, setSelectedCategory] =
        useState(null);

    const [categoryName, setCategoryName] =
        useState('');

    const [subCategoryName, setSubCategoryName] =
        useState('');

    const [expandedCategories, setExpandedCategories] =
        useState({});

    // ==========================================
    // QUERIES
    // ==========================================

    const {
        data: categories = [],
        isLoading,
    } = useCategories();

    // ==========================================
    // MUTATIONS
    // ==========================================

    const addCategoryMutation =
        useAddCategory();

    const updateCategoryMutation =
        useUpdateCategory();

    const deleteCategoryMutation =
        useDeleteCategory();

    const addSubCategoryMutation =
        useAddSubCategory();

    const deleteSubCategoryMutation =
        useDeleteSubCategory();

    // ==========================================
    // SEARCH
    // ==========================================

    const filteredCategories = categories.filter(
        (category) => {
            const searchText =
                search.toLowerCase();

            const categoryMatch =
                category.name
                    ?.toLowerCase()
                    .includes(searchText);

            const subCategoryMatch =
                category.subCategories?.some(
                    (subCategory) =>
                        subCategory
                            ?.toLowerCase()
                            .includes(searchText)
                );

            return (
                categoryMatch ||
                subCategoryMatch
            );
        }
    );

    // ==========================================
    // TOGGLE CATEGORY
    // ==========================================

    const toggleCategory = (id) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // ==========================================
    // OPEN ADD CATEGORY
    // ==========================================

    const openAddCategory = () => {
        setEditingCategory(null);
        setCategoryName('');
        setIsCategoryModalOpen(true);
    };

    // ==========================================
    // OPEN EDIT CATEGORY
    // ==========================================

    const openEditCategory = (category) => {
        setEditingCategory(category);
        setCategoryName(category.name);
        setIsCategoryModalOpen(true);
    };

    // ==========================================
    // CLOSE CATEGORY MODAL
    // ==========================================

    const closeCategoryModal = () => {
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
        setCategoryName('');
    };

    // ==========================================
    // SAVE CATEGORY
    // ==========================================

    const handleCategorySubmit = async (e) => {
        e.preventDefault();

        const name = categoryName.trim();

        if (!name) {
            toast.error(
                'Category name is required'
            );
            return;
        }

        try {
            if (editingCategory) {
                await updateCategoryMutation.mutateAsync(
                    {
                        id: editingCategory._id,
                        name,
                    }
                );

                toast.success(
                    'Category updated successfully'
                );
            } else {
                await addCategoryMutation.mutateAsync(
                    {
                        name,
                        subCategories: [],
                    }
                );

                toast.success(
                    'Category added successfully'
                );
            }

            closeCategoryModal();
        } catch (error) {
            // Hook already handles API errors.
        }
    };

    // ==========================================
    // DELETE CATEGORY
    // ==========================================

    const handleDeleteCategory = async (
        category
    ) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${category.name}"?`
        );

        if (!confirmed) return;

        try {
            await deleteCategoryMutation.mutateAsync(
                category._id
            );

            toast.success(
                'Category deleted successfully'
            );
        } catch (error) {
            // Hook handles error.
        }
    };

    // ==========================================
    // OPEN ADD SUBCATEGORY
    // ==========================================

    const openAddSubCategory = (category) => {
        setSelectedCategory(category);
        setSubCategoryName('');
        setIsSubCategoryModalOpen(true);
    };

    // ==========================================
    // CLOSE SUBCATEGORY MODAL
    // ==========================================

    const closeSubCategoryModal = () => {
        setIsSubCategoryModalOpen(false);
        setSelectedCategory(null);
        setSubCategoryName('');
    };

    // ==========================================
    // ADD SUBCATEGORY
    // ==========================================

    const handleSubCategorySubmit = async (e) => {
        e.preventDefault();

        const name =
            subCategoryName.trim();

        if (!name) {
            toast.error(
                'Subcategory name is required'
            );
            return;
        }

        if (!selectedCategory?._id) {
            toast.error(
                'Parent category not found'
            );
            return;
        }

        try {
            await addSubCategoryMutation.mutateAsync(
                {
                    parentId:
                        selectedCategory._id,

                    subCategoryData: {
                        name,
                    },
                }
            );

            toast.success(
                'Subcategory added successfully'
            );

            closeSubCategoryModal();
        } catch (error) {
            // Hook handles error.
        }
    };

    // ==========================================
    // DELETE SUBCATEGORY
    // ==========================================

    const handleDeleteSubCategory = async (
        category,
        subCategory
    ) => {
        const confirmed = window.confirm(
            `Delete "${subCategory}"?`
        );

        if (!confirmed) return;

        try {
            await deleteSubCategoryMutation.mutateAsync(
                {
                    slug: subCategory,
                }
            );

            toast.success(
                'Subcategory deleted successfully'
            );
        } catch (error) {
            // Hook handles error.
        }
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="flex min-h-[400px] items-center justify-center">
                    <Loader2
                        size={35}
                        className="animate-spin text-gray-600"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Categories
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage product categories and subcategories
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openAddCategory}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                    <Plus size={18} />
                    Add Category
                </button>

            </div>

            {/* ================================= */}
            {/* STATS */}
            {/* ================================= */}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                            <FolderTree
                                size={22}
                                className="text-gray-700"
                            />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Total Categories
                            </p>

                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {categories.length}
                            </p>
                        </div>

                    </div>

                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                            <FolderPlus
                                size={22}
                                className="text-gray-700"
                            />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Total Subcategories
                            </p>

                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {categories.reduce(
                                    (total, category) =>
                                        total +
                                        (category.subCategories?.length ||
                                            0),
                                    0
                                )}
                            </p>
                        </div>

                    </div>

                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                            <Search
                                size={22}
                                className="text-gray-700"
                            />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Showing
                            </p>

                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {filteredCategories.length}
                            </p>
                        </div>

                    </div>

                </div>

            </div>

            {/* ================================= */}
            {/* SEARCH */}
            {/* ================================= */}

            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

                <div className="relative">

                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        placeholder="Search categories or subcategories..."
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />

                </div>

            </div>

            {/* ================================= */}
            {/* CATEGORY LIST */}
            {/* ================================= */}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                {filteredCategories.length === 0 ? (

                    <div className="flex min-h-[300px] flex-col items-center justify-center px-4 text-center">

                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                            <FolderTree
                                size={25}
                                className="text-gray-500"
                            />
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900">
                            No categories found
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            Create your first category to get started.
                        </p>

                        <button
                            onClick={
                                openAddCategory
                            }
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            <Plus size={17} />
                            Add Category
                        </button>

                    </div>

                ) : (

                    <div className="divide-y divide-gray-100">

                        {filteredCategories.map(
                            (category, index) => {

                                const subCategories =
                                    category.subCategories ||
                                    [];

                                const isExpanded =
                                    expandedCategories[
                                        category._id
                                    ];

                                return (
                                    <div
                                        key={
                                            category._id
                                        }
                                        className="group"
                                    >

                                        {/* ========================= */}
                                        {/* CATEGORY ROW */}
                                        {/* ========================= */}

                                        <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">

                                            <div className="flex min-w-0 items-center gap-3">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleCategory(
                                                            category._id
                                                        )
                                                    }
                                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                >
                                                    {isExpanded ? (
                                                        <ChevronUp
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    ) : (
                                                        <ChevronDown
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    )}
                                                </button>

                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white">
                                                    <FolderTree
                                                        size={
                                                            18
                                                        }
                                                    />
                                                </div>

                                                <div className="min-w-0">

                                                    <div className="flex flex-wrap items-center gap-2">

                                                        <h3 className="font-semibold text-gray-900">
                                                            {
                                                                category.name
                                                            }
                                                        </h3>

                                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                                                            {
                                                                subCategories.length
                                                            }{' '}
                                                            subcategories
                                                        </span>

                                                    </div>

                                                    <p className="mt-0.5 text-xs text-gray-400">
                                                        #{index +
                                                            1}
                                                    </p>

                                                </div>

                                            </div>

                                            {/* ACTIONS */}

                                            <div className="flex items-center gap-2 md:justify-end">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openAddSubCategory(
                                                            category
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                                >
                                                    <Plus
                                                        size={
                                                            15
                                                        }
                                                    />
                                                    Subcategory
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditCategory(
                                                            category
                                                        )
                                                    }
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-black"
                                                    title="Edit category"
                                                >
                                                    <Pencil
                                                        size={
                                                            16
                                                        }
                                                    />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteCategory(
                                                            category
                                                        )
                                                    }
                                                    disabled={
                                                        deleteCategoryMutation.isPending
                                                    }
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50 disabled:opacity-50"
                                                    title="Delete category"
                                                >
                                                    {deleteCategoryMutation.isPending ? (
                                                        <Loader2
                                                            size={
                                                                16
                                                            }
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <Trash2
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    )}
                                                </button>

                                            </div>

                                        </div>

                                        {/* ========================= */}
                                        {/* SUBCATEGORIES */}
                                        {/* ========================= */}

                                        {isExpanded && (
                                            <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">

                                                {subCategories.length ===
                                                0 ? (

                                                    <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center">

                                                        <p className="text-sm text-gray-500">
                                                            No subcategories
                                                            yet.
                                                        </p>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openAddSubCategory(
                                                                    category
                                                                )
                                                            }
                                                            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-xs font-medium text-white hover:bg-gray-800"
                                                        >
                                                            <Plus
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                            Add
                                                            Subcategory
                                                        </button>

                                                    </div>

                                                ) : (

                                                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">

                                                        {subCategories.map(
                                                            (
                                                                subCategory,
                                                                subIndex
                                                            ) => (

                                                                <div
                                                                    key={`${category._id}-${subCategory}-${subIndex}`}
                                                                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-3"
                                                                >

                                                                    <div className="flex min-w-0 items-center gap-3">

                                                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs font-medium text-gray-500">
                                                                            {subIndex +
                                                                                1}
                                                                        </span>

                                                                        <span className="truncate text-sm text-gray-700">
                                                                            {
                                                                                subCategory
                                                                            }
                                                                        </span>

                                                                    </div>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleDeleteSubCategory(
                                                                                category,
                                                                                subCategory
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            deleteSubCategoryMutation.isPending
                                                                        }
                                                                        className="ml-2 shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                                                                        title="Delete subcategory"
                                                                    >
                                                                        <Trash2
                                                                            size={
                                                                                15
                                                                            }
                                                                        />
                                                                    </button>

                                                                </div>

                                                            )
                                                        )}

                                                    </div>

                                                )}

                                            </div>
                                        )}

                                    </div>
                                );
                            }
                        )}

                    </div>

                )}

            </div>

            {/* ========================================= */}
            {/* CATEGORY MODAL */}
            {/* ========================================= */}

            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

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
                                onClick={
                                    closeCategoryModal
                                }
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            onSubmit={
                                handleCategorySubmit
                            }
                            className="p-5"
                        >

                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Category Name
                            </label>

                            <input
                                type="text"
                                value={categoryName}
                                onChange={(e) =>
                                    setCategoryName(
                                        e.target.value
                                    )
                                }
                                placeholder="e.g. Honey"
                                autoFocus
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                            />

                            <div className="mt-5 flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={
                                        closeCategoryModal
                                    }
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        addCategoryMutation.isPending ||
                                        updateCategoryMutation.isPending
                                    }
                                    className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {(addCategoryMutation.isPending ||
                                        updateCategoryMutation.isPending) && (
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />
                                    )}

                                    {editingCategory
                                        ? 'Update'
                                        : 'Add Category'}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* ========================================= */}
            {/* SUBCATEGORY MODAL */}
            {/* ========================================= */}

            {isSubCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Add Subcategory
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    Parent:{' '}
                                    <span className="font-medium text-gray-700">
                                        {
                                            selectedCategory?.name
                                        }
                                    </span>
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeSubCategoryModal
                                }
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            onSubmit={
                                handleSubCategorySubmit
                            }
                            className="p-5"
                        >

                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Subcategory Name
                            </label>

                            <input
                                type="text"
                                value={
                                    subCategoryName
                                }
                                onChange={(e) =>
                                    setSubCategoryName(
                                        e.target.value
                                    )
                                }
                                placeholder="e.g. Sundarbans Honey"
                                autoFocus
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                            />

                            <div className="mt-5 flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={
                                        closeSubCategoryModal
                                    }
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        addSubCategoryMutation.isPending
                                    }
                                    className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {addSubCategoryMutation.isPending && (
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />
                                    )}

                                    Add Subcategory

                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}