"use client";

import { useEffect, useState } from "react";
import { Plus, Save, X } from "lucide-react";

export default function CategoryForm({
  onSubmit,
  editingCategory,
  onCancel,
  loading = false,
}) {
  const [name, setName] = useState("");
  const [subCategories, setSubCategories] = useState("");

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name || "");

      setSubCategories(
        editingCategory.subCategories?.join(", ") || ""
      );
    } else {
      setName("");
      setSubCategories("");
    }
  }, [editingCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    const subCategoryArray = subCategories
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    await onSubmit({
      name: name.trim(),
      subCategories: subCategoryArray,
    });

    if (!editingCategory) {
      setName("");
      setSubCategories("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-[#131318] p-5"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {editingCategory ? "Edit Category" : "Add Category"}
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Create your store category
          </p>
        </div>

        {editingCategory && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm text-gray-300">
            Category Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Example: Honey"
            className="w-full rounded-xl border border-white/10 bg-[#0d0d11] px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-green-500"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">
            Sub Categories
          </label>

          <input
            type="text"
            value={subCategories}
            onChange={(e) => setSubCategories(e.target.value)}
            placeholder="Litchi Honey, Kalojira Honey, Sundarban Honey"
            className="w-full rounded-xl border border-white/10 bg-[#0d0d11] px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-green-500"
          />

          <p className="mt-2 text-xs text-gray-500">
            Separate multiple sub-categories with comma.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {editingCategory ? (
            <>
              <Save size={18} />
              {loading ? "Updating..." : "Update Category"}
            </>
          ) : (
            <>
              <Plus size={18} />
              {loading ? "Adding..." : "Add Category"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}