"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Trash2,
  Pencil,
  FolderTree,
  Plus,
  Loader2,
} from "lucide-react";

import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/redux/store/slices/categorySlice";

import CategoryForm from "@/components/CategoryForm";

export default function CategoriesPage() {
  const dispatch = useDispatch();

  const { list, loading, error } = useSelector(
    (state) => state.categories
  );

  const [editingCategory, setEditingCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleAdd = async (data) => {
    const result = await dispatch(addCategory(data));

    if (addCategory.fulfilled.match(result)) {
      setShowForm(false);
    }
  };

  const handleUpdate = async (data) => {
    if (!editingCategory?._id) return;

    const result = await dispatch(
      updateCategory({
        id: editingCategory._id,
        data,
      })
    );

    if (updateCategory.fulfilled.match(result)) {
      setEditingCategory(null);
      setShowForm(false);
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Delete "${name}" category?`
    );

    if (!confirmed) return;

    dispatch(deleteCategory(id));
  };

  const handleFormSubmit = async (data) => {
    if (editingCategory) {
      await handleUpdate(data);
    } else {
      await handleAdd(data);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleAddClick = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] p-4 text-white md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-600/10 p-3 text-green-500">
                <FolderTree size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  Categories
                </h1>

                <p className="text-sm text-gray-400">
                  Manage your store categories
                </p>
              </div>
            </div>
          </div>

          {!showForm && (
            <button
              onClick={handleAddClick}
              className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-medium text-white hover:bg-green-700"
            >
              <Plus size={18} />
              Add Category
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-6">
            <CategoryForm
              onSubmit={handleFormSubmit}
              editingCategory={editingCategory}
              onCancel={handleCancel}
              loading={loading}
            />
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-[#131318] p-5">
            <p className="text-sm text-gray-400">
              Total Categories
            </p>

            <p className="mt-2 text-3xl font-bold">
              {list.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#131318] p-5">
            <p className="text-sm text-gray-400">
              Total Sub Categories
            </p>

            <p className="mt-2 text-3xl font-bold">
              {list.reduce(
                (total, category) =>
                  total + (category.subCategories?.length || 0),
                0
              )}
            </p>
          </div>
        </div>

        {/* Category List */}
        <div className="rounded-2xl border border-white/10 bg-[#131318]">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="font-semibold">
              All Categories
            </h2>
          </div>

          {loading && list.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2
                size={24}
                className="mr-2 animate-spin"
              />
              Loading categories...
            </div>
          ) : list.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <FolderTree
                size={40}
                className="mx-auto mb-3 text-gray-600"
              />

              <h3 className="font-medium text-gray-300">
                No categories yet
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Add your first category.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {list.map((category) => (
                <div
                  key={category._id}
                  className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between"
                >
                  {/* Category info */}
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-green-600/10 p-3 text-green-500">
                      <FolderTree size={20} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-white">
                        {category.name}
                      </h3>

                      {category.subCategories?.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {category.subCategories.map(
                            (subCategory, index) => (
                              <span
                                key={`${subCategory}-${index}`}
                                className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400"
                              >
                                {subCategory}
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="mt-1 text-xs text-gray-600">
                          No sub-categories
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(
                          category._id,
                          category.name
                        )
                      }
                      disabled={loading}
                      className="flex items-center gap-2 rounded-lg border border-red-500/20 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}