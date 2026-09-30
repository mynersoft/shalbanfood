'use client';

import { useState } from 'react';

import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Tag,
    Loader2,
    X,
} from 'lucide-react';

import toast from 'react-hot-toast';

import {
    useBrands,
    useAddBrand,
    useUpdateBrand,
    useDeleteBrand,
} from '@/hooks/useBrands';

export default function BrandsPage() {
    const [search, setSearch] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [editingBrand, setEditingBrand] = useState(null);

    const [brandName, setBrandName] = useState('');

    const { data: brands = [], isLoading } = useBrands();

    const addBrandMutation = useAddBrand();
    const updateBrandMutation = useUpdateBrand();
    const deleteBrandMutation = useDeleteBrand();

    // =====================================
    // FILTER
    // =====================================
    const filteredBrands = brands.filter((brand) =>
        brand.name
            ?.toLowerCase()
            .includes(search.toLowerCase())
    );

    // =====================================
    // OPEN ADD MODAL
    // =====================================
    const openAddModal = () => {
        setEditingBrand(null);
        setBrandName('');
        setIsModalOpen(true);
    };

    // =====================================
    // OPEN EDIT MODAL
    // =====================================
    const openEditModal = (brand) => {
        setEditingBrand(brand);
        setBrandName(brand.name);
        setIsModalOpen(true);
    };

    // =====================================
    // CLOSE MODAL
    // =====================================
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBrand(null);
        setBrandName('');
    };

    // =====================================
    // SUBMIT
    // =====================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        const name = brandName.trim();

        if (!name) {
            toast.error('Please enter brand name');
            return;
        }

        if (editingBrand) {
            await updateBrandMutation.mutateAsync({
                id: editingBrand._id,
                name,
            });
        } else {
            await addBrandMutation.mutateAsync({
                name,
            });
        }

        closeModal();
    };

    // =====================================
    // DELETE
    // =====================================
    const handleDelete = async (brand) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${brand.name}"?`
        );

        if (!confirmed) return;

        await deleteBrandMutation.mutateAsync(
            brand._id
        );
    };

    const isSaving =
        addBrandMutation.isPending ||
        updateBrandMutation.isPending;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Brands
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage your product brands
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                    <Plus size={18} />
                    Add Brand
                </button>
            </div>

            {/* ================================= */}
            {/* STATS */}
            {/* ================================= */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                            <Tag
                                size={22}
                                className="text-gray-700"
                            />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Total Brands
                            </p>

                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {brands.length}
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
                                {filteredBrands.length}
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
                        placeholder="Search brands..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />

                </div>

            </div>

            {/* ================================= */}
            {/* TABLE */}
            {/* ================================= */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                {isLoading ? (
                    <div className="flex min-h-[300px] items-center justify-center">

                        <Loader2
                            size={32}
                            className="animate-spin text-gray-600"
                        />

                    </div>
                ) : filteredBrands.length === 0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center px-4 text-center">

                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                            <Tag
                                size={25}
                                className="text-gray-500"
                            />
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900">
                            No brands found
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            Add your first brand to get started.
                        </p>

                        <button
                            onClick={openAddModal}
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            <Plus size={17} />
                            Add Brand
                        </button>

                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[600px]">

                            <thead className="border-b border-gray-200 bg-gray-50">

                                <tr>
                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        #
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Brand Name
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Created
                                    </th>

                                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Actions
                                    </th>
                                </tr>

                            </thead>

                            <tbody className="divide-y divide-gray-100">

                                {filteredBrands.map(
                                    (brand, index) => (
                                        <tr
                                            key={brand._id}
                                            className="transition hover:bg-gray-50"
                                        >

                                            <td className="px-5 py-4 text-sm text-gray-500">
                                                {index + 1}
                                            </td>

                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                                                        <Tag
                                                            size={18}
                                                            className="text-gray-600"
                                                        />
                                                    </div>

                                                    <span className="font-medium text-gray-900">
                                                        {brand.name}
                                                    </span>

                                                </div>

                                            </td>

                                            <td className="px-5 py-4 text-sm text-gray-500">
                                                {brand.createdAt
                                                    ? new Date(
                                                          brand.createdAt
                                                      ).toLocaleDateString(
                                                          'en-BD'
                                                      )
                                                    : '-'}
                                            </td>

                                            <td className="px-5 py-4">

                                                <div className="flex justify-end gap-2">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditModal(
                                                                brand
                                                            )
                                                        }
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-100 hover:text-black"
                                                        title="Edit"
                                                    >
                                                        <Pencil
                                                            size={16}
                                                        />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                brand
                                                            )
                                                        }
                                                        disabled={
                                                            deleteBrandMutation.isPending
                                                        }
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                        title="Delete"
                                                    >
                                                        {deleteBrandMutation.isPending ? (
                                                            <Loader2
                                                                size={16}
                                                                className="animate-spin"
                                                            />
                                                        ) : (
                                                            <Trash2
                                                                size={16}
                                                            />
                                                        )}
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {/* ================================= */}
            {/* MODAL */}
            {/* ================================= */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {editingBrand
                                        ? 'Edit Brand'
                                        : 'Add Brand'}
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    {editingBrand
                                        ? 'Update brand information'
                                        : 'Create a new product brand'}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        {/* Form */}
                        <form
                            onSubmit={handleSubmit}
                            className="p-5"
                        >

                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Brand Name
                            </label>

                            <input
                                type="text"
                                value={brandName}
                                onChange={(e) =>
                                    setBrandName(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter brand name"
                                autoFocus
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                            />

                            <div className="mt-5 flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSaving && (
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />
                                    )}

                                    {editingBrand
                                        ? 'Update Brand'
                                        : 'Add Brand'}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}