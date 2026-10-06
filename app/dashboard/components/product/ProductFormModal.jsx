'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Save,
  Loader2,
  Package,
  Search,
} from 'lucide-react';

import toast from 'react-hot-toast';

import {
  useAddProduct,
  useUpdateProduct,
} from '@/hooks/useProducts';

import { useCategories } from '@/hooks/useCategory';


const MAX_VARIANTS = 4;

const UNIT_OPTIONS = [
  {
    value: 'gram',
    label: 'Gram',
  },
  {
    value: 'kg',
    label: 'Kilogram',
  },
  {
    value: 'milliliter',
    label: 'Milliliter',
  },
  {
    value: 'litre',
    label: 'Litre',
  },
  {
    value: 'piece',
    label: 'Piece',
  },
];


/* ========================================
   EMPTY VARIANT
======================================== */

function createEmptyVariant() {
  return {
    _id: undefined,
    value: '',
    unit: 'gram',
    regularPrice: '',
    sellPrice: '',
    stock: '',
    soldCount: 0,
    sku: '',
  };
}


/* ========================================
   FORMAT SIZE
======================================== */

function formatVariantSize(variant) {
  if (!variant) return '';

  const value = Number(variant.value || 0);

  if (!value) return '';

  switch (variant.unit) {
    case 'gram':
      return `${value}g`;

    case 'kg':
      return `${value}kg`;

    case 'milliliter':
      return `${value}ml`;

    case 'litre':
      return `${value}L`;

    case 'piece':
      return `${value} pcs`;

    default:
      return `${value}`;
  }
}


/* ========================================
   IMAGE RESIZE
======================================== */

function resizeImage(file, maxWidth = 1000) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      try {
        const ratio = Math.min(
          1,
          maxWidth / image.width
        );

        const width = Math.round(
          image.width * ratio
        );

        const height = Math.round(
          image.height * ratio
        );

        const canvas = document.createElement('canvas');

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        ctx.drawImage(
          image,
          0,
          0,
          width,
          height
        );

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);

            if (!blob) {
              reject(
                new Error('Image processing failed')
              );
              return;
            }

            resolve(blob);
          },
          'image/jpeg',
          0.82
        );
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(
        new Error('Invalid image file')
      );
    };

    image.src = objectUrl;
  });
}


/* ========================================
   MAIN COMPONENT
======================================== */

export default function ProductFormModal({
  isOpen,
  onClose,
  editingProduct = null,
}) {
  const isEditing = Boolean(editingProduct?._id);

  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useCategories();

  const addProductMutation = useAddProduct();
  const updateProductMutation = useUpdateProduct();

  const isSaving =
    addProductMutation.isPending ||
    updateProductMutation.isPending;


  /* ======================================
     FORM STATE
  ====================================== */

  const [form, setForm] = useState({
    name: '',
    slug: '',
    category: '',
    subCategory: '',
    brand: '',
    warranty: '',

    shortDescription: '',
    description: '',

    image: null,
    existingImage: '',

    sku: '',

    seoTitle: '',
    seoDescription: '',
    keywords: '',
    canonicalUrl: '',

    isActive: true,
    isFeatured: false,

    variants: [
      createEmptyVariant(),
    ],
  });


  /* ======================================
     RESET / EDIT FORM
  ====================================== */

  useEffect(() => {
    if (!isOpen) return;

    if (editingProduct) {
      const variants =
        Array.isArray(editingProduct.variants) &&
        editingProduct.variants.length
          ? editingProduct.variants.map((variant) => ({
              _id: variant._id,
              value: variant.value ?? '',
              unit: variant.unit || 'gram',
              regularPrice:
                variant.regularPrice ?? '',
              sellPrice:
                variant.sellPrice ?? '',
              stock: variant.stock ?? '',
              soldCount:
                variant.soldCount ?? 0,
              sku: variant.sku || '',
            }))
          : [createEmptyVariant()];

      setForm({
        name: editingProduct.name || '',
        slug: editingProduct.slug || '',
        category: editingProduct.category || '',
        subCategory:
          editingProduct.subCategory || '',
        brand: editingProduct.brand || '',
        warranty:
          editingProduct.warranty || '',

        shortDescription:
          editingProduct.shortDescription || '',

        description:
          editingProduct.description || '',

        image: null,

        existingImage:
          editingProduct.image || '',

        sku:
          editingProduct.sku || '',

        seoTitle:
          editingProduct.seoTitle || '',

        seoDescription:
          editingProduct.seoDescription || '',

        keywords:
          Array.isArray(editingProduct.keywords)
            ? editingProduct.keywords.join(', ')
            : '',

        canonicalUrl:
          editingProduct.canonicalUrl || '',

        isActive:
          editingProduct.isActive !== false,

        isFeatured:
          editingProduct.isFeatured === true,

        variants,
      });

      return;
    }

    setForm({
      name: '',
      slug: '',
      category: '',
      subCategory: '',
      brand: '',
      warranty: '',

      shortDescription: '',
      description: '',

      image: null,
      existingImage: '',

      sku: '',

      seoTitle: '',
      seoDescription: '',
      keywords: '',
      canonicalUrl: '',

      isActive: true,
      isFeatured: false,

      variants: [
        createEmptyVariant(),
      ],
    });
  }, [isOpen, editingProduct]);


  /* ======================================
     CATEGORY
  ====================================== */

  const selectedCategory = useMemo(() => {
    return categories.find(
      (category) =>
        category.slug === form.category ||
        category.name?.toLowerCase() ===
          form.category?.toLowerCase()
    );
  }, [categories, form.category]);


  const subCategories =
    selectedCategory?.subCategories || [];


  /* ======================================
     CLOSE
  ====================================== */

  const handleClose = () => {
    if (isSaving) return;

    onClose?.();
  };


  /* ======================================
     FIELD CHANGE
  ====================================== */

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };


  /* ======================================
     VARIANT CHANGE
  ====================================== */

  const updateVariant = (
    index,
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,

      variants: previous.variants.map(
        (variant, variantIndex) =>
          variantIndex === index
            ? {
                ...variant,
                [field]: value,
              }
            : variant
      ),
    }));
  };


  /* ======================================
     ADD VARIANT
  ====================================== */

  const addVariant = () => {
    if (
      form.variants.length >=
      MAX_VARIANTS
    ) {
      toast.error(
        `Maximum ${MAX_VARIANTS} variants allowed`
      );
      return;
    }

    setForm((previous) => ({
      ...previous,

      variants: [
        ...previous.variants,
        createEmptyVariant(),
      ],
    }));
  };


  /* ======================================
     REMOVE VARIANT
  ====================================== */

  const removeVariant = (index) => {
    if (form.variants.length <= 1) {
      toast.error(
        'At least one variant is required'
      );
      return;
    }

    setForm((previous) => ({
      ...previous,

      variants: previous.variants.filter(
        (_, variantIndex) =>
          variantIndex !== index
      ),
    }));
  };


  /* ======================================
     AUTO SLUG
  ====================================== */

  const handleNameChange = (value) => {
    updateField('name', value);

    if (!isEditing) {
      const generatedSlug = value
        .toLowerCase()
        .trim()
        .replace(
          /[^a-z0-9\u0980-\u09ff]+/g,
          '-'
        )
        .replace(/^-+|-+$/g, '');

      updateField(
        'slug',
        generatedSlug
      );
    }
  };


  /* ======================================
     IMAGE CHANGE
  ====================================== */

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(
        'Please select an image file'
      );
      return;
    }

    updateField('image', file);
  };


  /* ======================================
     VALIDATION
  ====================================== */

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error(
        'Product name is required'
      );
      return false;
    }

    if (!form.slug.trim()) {
      toast.error(
        'Product slug is required'
      );
      return false;
    }

    if (!form.category.trim()) {
      toast.error(
        'Category is required'
      );
      return false;
    }

    if (
      !Array.isArray(form.variants) ||
      form.variants.length < 1 ||
      form.variants.length > 4
    ) {
      toast.error(
        'Product must have 1–4 variants'
      );
      return false;
    }

    const duplicateKeys = new Set();

    for (
      let index = 0;
      index < form.variants.length;
      index++
    ) {
      const variant =
        form.variants[index];

      const value = Number(
        variant.value
      );

      const regularPrice = Number(
        variant.regularPrice
      );

      const sellPrice = Number(
        variant.sellPrice
      );

      const stock = Number(
        variant.stock
      );

      if (!value || value <= 0) {
        toast.error(
          `Variant ${index + 1}: size/value required`
        );
        return false;
      }

      if (
        Number.isNaN(regularPrice) ||
        regularPrice < 0
      ) {
        toast.error(
          `Variant ${index + 1}: invalid regular price`
        );
        return false;
      }

      if (
        Number.isNaN(sellPrice) ||
        sellPrice < 0
      ) {
        toast.error(
          `Variant ${index + 1}: invalid sell price`
        );
        return false;
      }

      if (sellPrice > regularPrice) {
        toast.error(
          `Variant ${index + 1}: sell price cannot be higher than regular price`
        );
        return false;
      }

      if (
        Number.isNaN(stock) ||
        stock < 0
      ) {
        toast.error(
          `Variant ${index + 1}: invalid stock`
        );
        return false;
      }

      const duplicateKey =
        `${value}-${variant.unit}`;

      if (
        duplicateKeys.has(
          duplicateKey
        )
      ) {
        toast.error(
          `Duplicate variant: ${formatVariantSize(
            variant
          )}`
        );
        return false;
      }

      duplicateKeys.add(
        duplicateKey
      );
    }

    return true;
  };


  /* ======================================
     SUBMIT
  ====================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSaving) return;

    if (!validateForm()) return;

    try {
      const formData =
        new FormData();

      /* Product fields */

      formData.append(
        'name',
        form.name.trim()
      );

      formData.append(
        'slug',
        form.slug.trim().toLowerCase()
      );

      formData.append(
        'category',
        form.category.trim().toLowerCase()
      );

      formData.append(
        'subCategory',
        form.subCategory
          .trim()
          .toLowerCase()
      );

      formData.append(
        'brand',
        form.brand.trim()
      );

      formData.append(
        'warranty',
        form.warranty.trim()
      );

      formData.append(
        'shortDescription',
        form.shortDescription.trim()
      );

      formData.append(
        'description',
        form.description.trim()
      );

      formData.append(
        'sku',
        form.sku.trim().toUpperCase()
      );

      formData.append(
        'seoTitle',
        form.seoTitle.trim()
      );

      formData.append(
        'seoDescription',
        form.seoDescription.trim()
      );

      formData.append(
        'keywords',
        JSON.stringify(
          form.keywords
            .split(',')
            .map((keyword) =>
              keyword.trim()
            )
            .filter(Boolean)
        )
      );

      formData.append(
        'canonicalUrl',
        form.canonicalUrl.trim()
      );

      formData.append(
        'isActive',
        String(form.isActive)
      );

      formData.append(
        'isFeatured',
        String(form.isFeatured)
      );


      /* Variants */

      const variants =
        form.variants.map(
          (variant) => ({
            ...(variant._id
              ? {
                  _id: variant._id,
                }
              : {}),

            value: Number(
              variant.value
            ),

            unit: variant.unit,

            regularPrice: Number(
              variant.regularPrice
            ),

            sellPrice: Number(
              variant.sellPrice
            ),

            stock: Number(
              variant.stock || 0
            ),

            soldCount: Number(
              variant.soldCount || 0
            ),

            sku:
              variant.sku
                ?.trim()
                .toUpperCase() || '',
          })
        );

      formData.append(
        'variants',
        JSON.stringify(variants)
      );


      /* Existing image */

      if (form.existingImage) {
        formData.append(
          'existingImage',
          form.existingImage
        );
      }


      /* New image */

      if (form.image) {
        const resizedImage =
          await resizeImage(
            form.image
          );

        const safeName =
          form.name
            .trim()
            .replace(
              /[^\w\u0980-\u09ff-]+/g,
              '_'
            );

        const imageFile =
          new File(
            [
              resizedImage,
            ],
            `${safeName}_shalbanfood.jpg`,
            {
              type: 'image/jpeg',
            }
          );

        formData.append(
          'image',
          imageFile
        );
      }


      /* Edit ID */

      if (isEditing) {
        formData.append(
          '_id',
          editingProduct._id
        );
      }


      /* Save */

      if (isEditing) {
        await updateProductMutation.mutateAsync(
          formData
        );
      } else {
        await addProductMutation.mutateAsync(
          formData
        );
      }

      onClose?.();
    } catch (error) {
      console.error(
        'Product save error:',
        error
      );

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Something went wrong'
      );
    }
  };


  /* ======================================
     IF CLOSED
  ====================================== */

  if (!isOpen) {
    return null;
  }


  /* ======================================
     RENDER
  ====================================== */

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-black/70 backdrop-blur-sm
        p-3 sm:p-5
      "
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          handleClose();
        }
      }}
    >
      <div
        className="
          flex max-h-[95vh] w-full
          max-w-5xl flex-col
          overflow-hidden rounded-2xl
          border border-white/10
          bg-[#131318]
          text-white shadow-2xl
        "
      >

        {/* ==================================
            HEADER
        ================================== */}

        <div
          className="
            flex shrink-0 items-center
            justify-between border-b
            border-white/10 px-4 py-4
            sm:px-6
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex h-10 w-10 items-center
                justify-center rounded-xl
                bg-white/10
              "
            >
              <Package
                size={20}
              />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                {isEditing
                  ? 'Edit Product'
                  : 'Add Product'}
              </h2>

              <p className="text-xs text-gray-400">
                {isEditing
                  ? 'Update product information'
                  : 'Create a new product'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="
              rounded-xl p-2
              text-gray-400
              transition
              hover:bg-white/10
              hover:text-white
            "
          >
            <X size={22} />
          </button>
        </div>


        {/* ==================================
            FORM
        ================================== */}

        <form
          onSubmit={handleSubmit}
          className="
            flex-1 overflow-y-auto
            p-4 sm:p-6
          "
        >

          <div className="space-y-6">

            {/* ==============================
                BASIC INFORMATION
            ============================== */}

            <section>
              <h3 className="mb-4 text-sm font-bold">
                Basic Information
              </h3>

              <div className="grid gap-4 md:grid-cols-2">

                {/* Name */}

                <div>
                  <label className="mb-1.5 block text-sm text-gray-300">
                    Product Name *
                  </label>

                  <input
                    value={form.name}
                    onChange={(event) =>
                      handleNameChange(
                        event.target.value
                      )
                    }
                    placeholder="e.g. লিচু ফুলের মধু"
                    className="input"
                    required
                  />
                </div>


                {/* Slug */}

                <div>
                  <label className="mb-1.5 block text-sm text-gray-300">
                    Slug *
                  </label>

                  <input
                    value={form.slug}
                    onChange={(event) =>
                      updateField(
                        'slug',
                        event.target.value
                      )
                    }
                    placeholder="lichu-fuler-modhu"
                    className="input"
                    required
                  />
                </div>


                {/* Category */}

                <div>
                  <label className="mb-1.5 block text-sm text-gray-300">
                    Category *
                  </label>

                  <select
                    value={form.category}
                    onChange={(event) => {
                      updateField(
                        'category',
                        event.target.value
                      );

                      updateField(
                        'subCategory',
                        ''
                      );
                    }}
                    className="input"
                    disabled={
                      categoriesLoading
                    }
                    required
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={
                            category._id ||
                            category.slug
                          }
                          value={
                            category.slug ||
                            category.name
                              ?.toLowerCase()
                          }
                        >
                          {category.name}
                        </option>
                      )
                    )}
                  </select>
                </div>


                {/* Subcategory */}

                <div>
                  <label className="mb-1.5 block text-sm text-gray-300">
                    Sub Category
                  </label>

                  {subCategories.length > 0 ? (
                    <select
                      value={
                        form.subCategory
                      }
                      onChange={(event) =>
                        updateField(
                          'subCategory',
                          event.target.value
                        )
                      }
                      className="input"
                    >
                      <option value="">
                        Select sub category
                      </option>

                      {subCategories.map(
                        (subCategory) => {
                          const name =
                            typeof subCategory ===
                            'string'
                              ? subCategory
                              : subCategory.name;

                          return (
                            <option
                              key={name}
                              value={name}
                            >
                              {name}
                            </option>
                          );
                        }
                      )}
                    </select>
                  ) : (
                    <input
                      value={
                        form.subCategory
                      }
                      onChange={(event) =>
                        updateField(
                          'subCategory',
                          event.target.value
                        )
                      }
                      placeholder="Optional"
                      className="input"
                    />
                  )}
                </div>


                {/* Brand */}

                <div>
                  <label className="mb-1.5 block text-sm text-gray-300">
                    Brand
                  </label>

                  <input
                    value={form.brand}
                    onChange={(event) =>
                      updateField(
                        'brand',
                        event.target.value
                      )
                    }
                    placeholder="Shalban Food"
                    className="input"
                  />
                </div>


                {/* Warranty */}

                <div>
                  <label className="mb-1.5 block text-sm text-gray-300">
                    Warranty
                  </label>

                  <input
                    value={form.warranty}
                    onChange={(event) =>
                      updateField(
                        'warranty',
                        event.target.value
                      )
                    }
                    placeholder="Optional"
                    className="input"
                  />
                </div>

              </div>
            </section>


            {/* ==============================
                DESCRIPTION
            ============================== */}

            <section>
              <h3 className="mb-4 text-sm font-bold">
                Description
              </h3>

              <div className="space-y-4">

                <div>
                  <label className="mb-1.5 block text-sm text-gray-300">
                    Short Description
                  </label>

                  <textarea
                    value={
                      form.shortDescription
                    }
                    onChange={(event) =>
                      updateField(
                        'shortDescription',
                        event.target.value
                      )
                    }
                    maxLength={500}
                    rows={3}
                    placeholder="Short product description..."
                    className="input resize-none"
                  />
                </div>


                <div>
                  <label className="mb-1.5 block text-sm text-gray-300">
                    Full Description
                  </label>

                  <textarea
                    value={
                      form.description
                    }
                    onChange={(event) =>
                      updateField(
                        'description',
                        event.target.value
                      )
                    }
                    rows={6}
                    placeholder="Full product description..."
                    className="input resize-y"
                  />
                </div>

              </div>
            </section>


            {/* ==============================
                VARIANTS
            ============================== */}

            <section>

              <div className="mb-4 flex items-center justify-between">

                <div>
                  <h3 className="text-sm font-bold">
                    Variants
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Add 1–4 size/price variants
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addVariant}
                  disabled={
                    form.variants.length >=
                    MAX_VARIANTS
                  }
                  className="
                    flex items-center gap-1.5
                    rounded-lg bg-white
                    px-3 py-2 text-xs
                    font-semibold text-black
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  <Plus size={15} />
                  Add Variant
                </button>

              </div>


              <div className="space-y-4">

                {form.variants.map(
                  (variant, index) => (
                    <div
                      key={
                        variant._id ||
                        `variant-${index}`
                      }
                      className="
                        rounded-xl border
                        border-white/10
                        bg-white/[0.03]
                        p-4
                      "
                    >

                      <div className="mb-4 flex items-center justify-between">

                        <span className="text-sm font-semibold">
                          Variant {index + 1}
                        </span>

                        {form.variants.length >
                          1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeVariant(
                                index
                              )
                            }
                            className="
                              rounded-lg p-2
                              text-red-400
                              hover:bg-red-500/10
                            "
                          >
                            <Trash2
                              size={17}
                            />
                          </button>
                        )}

                      </div>


                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                        {/* Value */}

                        <div>
                          <label className="label">
                            Value *
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={
                              variant.value
                            }
                            onChange={(event) =>
                              updateVariant(
                                index,
                                'value',
                                event.target.value
                              )
                            }
                            placeholder="500"
                            className="input"
                          />
                        </div>


                        {/* Unit */}

                        <div>
                          <label className="label">
                            Unit *
                          </label>

                          <select
                            value={
                              variant.unit
                            }
                            onChange={(event) =>
                              updateVariant(
                                index,
                                'unit',
                                event.target.value
                              )
                            }
                            className="input"
                          >
                            {UNIT_OPTIONS.map(
                              (unit) => (
                                <option
                                  key={
                                    unit.value
                                  }
                                  value={
                                    unit.value
                                  }
                                >
                                  {
                                    unit.label
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </div>


                        {/* Regular */}

                        <div>
                          <label className="label">
                            Regular Price *
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              variant.regularPrice
                            }
                            onChange={(event) =>
                              updateVariant(
                                index,
                                'regularPrice',
                                event.target.value
                              )
                            }
                            placeholder="1200"
                            className="input"
                          />
                        </div>


                        {/* Sell */}

                        <div>
                          <label className="label">
                            Sell Price *
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              variant.sellPrice
                            }
                            onChange={(event) =>
                              updateVariant(
                                index,
                                'sellPrice',
                                event.target.value
                              )
                            }
                            placeholder="920"
                            className="input"
                          />
                        </div>


                        {/* Stock */}

                        <div>
                          <label className="label">
                            Stock *
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={
                              variant.stock
                            }
                            onChange={(event) =>
                              updateVariant(
                                index,
                                'stock',
                                event.target.value
                              )
                            }
                            placeholder="50"
                            className="input"
                          />
                        </div>


                        {/* Sold */}

                        <div>
                          <label className="label">
                            Sold Count
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={
                              variant.soldCount
                            }
                            onChange={(event) =>
                              updateVariant(
                                index,
                                'soldCount',
                                event.target.value
                              )
                            }
                            className="input"
                          />
                        </div>


                        {/* Variant SKU */}

                        <div className="sm:col-span-2">
                          <label className="label">
                            Variant SKU
                          </label>

                          <input
                            value={
                              variant.sku
                            }
                            onChange={(event) =>
                              updateVariant(
                                index,
                                'sku',
                                event.target.value
                              )
                            }
                            placeholder="HONEY-500G"
                            className="input"
                          />
                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>
            </section>


            {/* ==============================
                PRODUCT SKU
            ============================== */}

            <section>
              <h3 className="mb-4 text-sm font-bold">
                Inventory
              </h3>

              <div>
                <label className="mb-1.5 block text-sm text-gray-300">
                  Product SKU
                </label>

                <input
                  value={form.sku}
                  onChange={(event) =>
                    updateField(
                      'sku',
                      event.target.value
                    )
                  }
                  placeholder="SHALBAN-HONEY"
                  className="input"
                />
              </div>
            </section>


            {/* ==============================
                IMAGE
            ============================== */}

            <section>

              <h3 className="mb-4 text-sm font-bold">
                Product Image
              </h3>

              <div
                className="
                  rounded-xl border
                  border-dashed border-white/15
                  bg-white/[0.02] p-5
                "
              >

                <label
                  className="
                    flex cursor-pointer
                    flex-col items-center
                    justify-center
                    rounded-xl border
                    border-white/10
                    bg-black/10
                    p-8
                    text-center
                    transition
                    hover:bg-white/5
                  "
                >
                  <ImageIcon
                    size={32}
                    className="mb-3 text-gray-500"
                  />

                  <span className="text-sm font-medium">
                    {form.image
                      ? form.image.name
                      : 'Choose product image'}
                  </span>

                  <span className="mt-1 text-xs text-gray-500">
                    JPG, PNG, WEBP
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handleImageChange
                    }
                    className="hidden"
                  />
                </label>

                {form.existingImage &&
                  !form.image && (
                    <div className="mt-3">
                      <p className="mb-2 text-xs text-gray-500">
                        Current image
                      </p>

                      <img
                        src={
                          form.existingImage
                        }
                        alt={form.name}
                        className="
                          h-24 w-24
                          rounded-lg
                          object-cover
                        "
                      />
                    </div>
                  )}

              </div>
            </section>


            {/* ==============================
                SEO
            ============================== */}

            <section>

              <div className="mb-4 flex items-center gap-2">
                <Search size={17} />

                <h3 className="text-sm font-bold">
                  SEO
                </h3>
              </div>

              <div className="space-y-4">

                <div>
                  <label className="label">
                    SEO Title
                  </label>

                  <input
                    value={
                      form.seoTitle
                    }
                    onChange={(event) =>
                      updateField(
                        'seoTitle',
                        event.target.value
                      )
                    }
                    maxLength={70}
                    placeholder="Product SEO title"
                    className="input"
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    {form.seoTitle.length}/70
                  </p>
                </div>


                <div>
                  <label className="label">
                    SEO Description
                  </label>

                  <textarea
                    value={
                      form.seoDescription
                    }
                    onChange={(event) =>
                      updateField(
                        'seoDescription',
                        event.target.value
                      )
                    }
                    maxLength={160}
                    rows={3}
                    placeholder="SEO description"
                    className="input resize-none"
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    {form.seoDescription.length}/160
                  </p>
                </div>


                <div>
                  <label className="label">
                    Keywords
                  </label>

                  <input
                    value={
                      form.keywords
                    }
                    onChange={(event) =>
                      updateField(
                        'keywords',
                        event.target.value
                      )
                    }
                    placeholder="honey, litchi honey, pure honey"
                    className="input"
                  />
                </div>


                <div>
                  <label className="label">
                    Canonical URL
                  </label>

                  <input
                    value={
                      form.canonicalUrl
                    }
                    onChange={(event) =>
                      updateField(
                        'canonicalUrl',
                        event.target.value
                      )
                    }
                    placeholder="https://shalbanfood.vercel.app/product/..."
                    className="input"
                  />
                </div>

              </div>
            </section>


            {/* ==============================
                STATUS
            ============================== */}

            <section>

              <h3 className="mb-4 text-sm font-bold">
                Status
              </h3>

              <div className="grid gap-3 sm:grid-cols-2">

                <label
                  className="
                    flex cursor-pointer
                    items-center gap-3
                    rounded-xl border
                    border-white/10
                    bg-white/[0.03]
                    p-4
                  "
                >
                  <input
                    type="checkbox"
                    checked={
                      form.isActive
                    }
                    onChange={(event) =>
                      updateField(
                        'isActive',
                        event.target.checked
                      )
                    }
                  />

                  <div>
                    <p className="text-sm font-medium">
                      Active Product
                    </p>

                    <p className="text-xs text-gray-500">
                      Product visible in shop
                    </p>
                  </div>
                </label>


                <label
                  className="
                    flex cursor-pointer
                    items-center gap-3
                    rounded-xl border
                    border-white/10
                    bg-white/[0.03]
                    p-4
                  "
                >
                  <input
                    type="checkbox"
                    checked={
                      form.isFeatured
                    }
                    onChange={(event) =>
                      updateField(
                        'isFeatured',
                        event.target.checked
                      )
                    }
                  />

                  <div>
                    <p className="text-sm font-medium">
                      Featured Product
                    </p>

                    <p className="text-xs text-gray-500">
                      Show as featured
                    </p>
                  </div>
                </label>

              </div>
            </section>


            {/* ==============================
                PREVIEW
            ============================== */}

            <section
              className="
                rounded-xl
                border border-white/10
                bg-white/[0.03]
                p-4
              "
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Variant Preview
              </p>

              <div className="flex flex-wrap gap-2">
                {form.variants.map(
                  (variant, index) => (
                    <span
                      key={index}
                      className="
                        rounded-full
                        bg-white/10
                        px-3 py-1.5
                        text-xs
                      "
                    >
                      {formatVariantSize(
                        variant
                      ) || `Variant ${index + 1}`}

                      {variant.sellPrice
                        ? ` — ৳${variant.sellPrice}`
                        : ''}
                    </span>
                  )
                )}
              </div>
            </section>

          </div>


          {/* ==================================
              FOOTER
          ================================== */}

          <div
            className="
              sticky bottom-0
              mt-6 flex
              justify-end gap-3
              border-t border-white/10
              bg-[#131318]
              pt-4
            "
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="
                rounded-xl
                border border-white/10
                px-5 py-2.5
                text-sm font-medium
                text-gray-300
                hover:bg-white/5
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="
                flex items-center
                gap-2 rounded-xl
                bg-white px-5 py-2.5
                text-sm font-bold
                text-black
                transition
                hover:bg-gray-200
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {isSaving ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />

                  {isEditing
                    ? 'Update Product'
                    : 'Save Product'}
                </>
              )}
            </button>
          </div>

        </form>
      </div>


      {/* ====================================
          LOCAL STYLES
      ==================================== */}

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          padding: 0.7rem 0.8rem;
          color: white;
          outline: none;
          font-size: 0.875rem;
        }

        .input:focus {
          border-color: rgba(255, 255, 255, 0.3);
        }

        .input::placeholder {
          color: rgb(107, 114, 128);
        }

        .input option {
          background: #18181d;
          color: white;
        }

        .label {
          display: block;
          margin-bottom: 0.375rem;
          font-size: 0.75rem;
          color: rgb(156, 163, 175);
        }
      `}</style>
    </div>
  );
}