"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addProduct, updateProduct, fetchProducts } from "@/redux/productSlice";
import { fetchCategories } from "@/redux/categorySlice";
import toast from "react-hot-toast";

// ===============================
// ⭐ IMAGE RESIZE (medium quality)
// ⭐ RENAME: productName_mahirstore.ext
// ===============================
function resizeImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");

      const MAX_WIDTH = 800; // medium resolution
      let width = img.width;
      let height = img.height;

      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => resolve(blob),
        file.type,
        0.7 // 70% quality
      );
    };
    img.src = URL.createObjectURL(file);
  });
}

function renameFile(blob, productName, fileType) {
  const ext = fileType.split("/")[1];
  const safeName = productName.replace(/\s+/g, "_");
  const finalName = `${safeName}_mahirstore.${ext}`;
  return new File([blob], finalName, { type: fileType });
}

// ===============================
// COMPONENT START
// ===============================
export default function ProductFormModal({
  editingProduct,
  onClose,
  currentPage = 1,
}) {
  const dispatch = useDispatch();
  const { list: categories } = useSelector((state) => state.categories);

  const [form, setForm] = useState({
    name: "",
    category: "",
    subCategory: "",
    brand: "",
    stock: "",
    regularPrice: "",
    sellPrice: "",
    warranty: "",
    image: "",
  });

  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load categories
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Load existing product when editing
  useEffect(() => {
    if (editingProduct) {
      setForm(editingProduct);
    } else {
      setForm({
        name: "",
        category: "",
        subCategory: "",
        brand: "",
        stock: "",
        regularPrice: "",
        sellPrice: "",
        warranty: "",
        image: "",
      });
      setFile(null);
    }
  }, [editingProduct]);

  // Auto scroll input into view on mobile
  const focusScroll = (e) => {
    e.target.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // ===========================
  // HANDLE SAVE PRODUCT
  // ===========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.sellPrice || !form.regularPrice) {
      toast.error("Required fields missing!");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      if (file) {
        formData.append("image", file);
      }

      Object.keys(form).forEach((key) => {
        if (key !== "image") formData.append(key, form[key]);
      });

      const res = await fetch("/api/products", {
        method: editingProduct ? "PUT" : "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Upload failed");
        setSaving(false);
        return;
      }

      const payload = data.product;

      if (editingProduct) {
        dispatch(updateProduct(payload)).unwrap();
        toast.success("Product updated successfully!");
      } else {
        dispatch(addProduct(payload)).unwrap();
        toast.success("Product added successfully!");
      }

      dispatch(fetchProducts({ page: currentPage }));
      onClose();
    } catch (error) {
      toast.error("Save failed: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedCategory =
    categories.find((cat) => cat.name === form.category) || {};

  // ===========================================
  // FILE HANDLER (Camera/Gallery)
  // ===========================================
  const handleImageSelect = async (file) => {
    if (!file) return;

    const resizedBlob = await resizeImage(file);

    const finalFile = renameFile(
      resizedBlob,
      form.name ? form.name : "product",
      file.type
    );

    setFile(finalFile);
    toast.success("Image ready!");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-3 sm:p-4">
      <div className="bg-gray-900 text-gray-100 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-900 pb-3">
          <h3 className="text-lg font-semibold">
            {editingProduct ? "Edit Product" : "Add Product"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-xl"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="grid gap-4">

          {/* PRODUCT NAME */}
          <div className="flex flex-col gap-1">
            <label className="text-gray-300">Product Name</label>
            <input
              required
              placeholder="Product Name"
              value={form.name}
              onFocus={focusScroll}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="p-3 rounded bg-gray-800 w-full text-base"
            />
          </div>

          {/* CATEGORY & SUBCATEGORY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-gray-300">Category</label>
              <select
                required
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                    subCategory: "",
                  })
                }
                className="p-3 rounded bg-gray-800"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-gray-300">Subcategory</label>
              <select
                required
                value={form.subCategory}
                onChange={(e) =>
                  setForm({ ...form, subCategory: e.target.value })
                }
                disabled={!selectedCategory.subCategories}
                className="p-3 rounded bg-gray-800"
              >
                <option value="">Select subcategory</option>
                {selectedCategory.subCategories?.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* BRAND + STOCK */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-gray-300">Brand</label>
              <input
                placeholder="Brand"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="p-3 rounded bg-gray-800"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-gray-300">Stock</label>
              <input
                type="number"
                placeholder="Stock"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: Number(e.target.value) })
                }
                className="p-3 rounded bg-gray-800"
              />
            </div>
          </div>

          {/* PRICE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-gray-300">Regular Price</label>
              <input
                type="number"
                placeholder="Regular Price"
                value={form.regularPrice}
                onChange={(e) =>
                  setForm({ ...form, regularPrice: Number(e.target.value) })
                }
                className="p-3 rounded bg-gray-800"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-gray-300">Sell Price</label>
              <input
                type="number"
                placeholder="Sell Price"
                value={form.sellPrice}
                onChange={(e) =>
                  setForm({ ...form, sellPrice: Number(e.target.value) })
                }
                className="p-3 rounded bg-gray-800"
              />
            </div>
          </div>

          {/* WARRANTY */}
          <div className="flex flex-col gap-1">
            <label className="text-gray-300">Warranty</label>
            <input
              placeholder="Warranty"
              value={form.warranty}
              onChange={(e) =>
                setForm({ ...form, warranty: e.target.value })
              }
              className="p-3 rounded bg-gray-800"
            />
          </div>

          {/* IMAGE UPLOAD */}
          <div className="flex flex-col gap-1">
            <label className="text-gray-300">Product Image</label>

            <div className="flex gap-3 mt-1 flex-wrap">

              {/* 📸 Take Photo */}
              <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded cursor-pointer text-sm">
                📸 Take Photo
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleImageSelect(e.target.files[0])}
                />
              </label>

              {/* 📁 Choose From Gallery */}
              <label className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded cursor-pointer text-sm">
                📁 Choose From Gallery
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageSelect(e.target.files[0])}
                />
              </label>
            </div>

            {/* PREVIEW */}
            <div className="flex gap-2 mt-2">
              {form.image && !file && (
                <img
                  src={form.image}
                  alt={form.name || ""}
                  className="w-16 h-16 object-cover rounded"
                />
              )}

              {file && (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded"
                />
              )}
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
            >
              {saving ? "Saving..." : editingProduct ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}