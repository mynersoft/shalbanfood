'use client';

import { useMemo, useState } from 'react';

import Image from 'next/image';

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
} from 'lucide-react';

import toast from 'react-hot-toast';

import ProductFormModal from '@/app/dashboard/components/product/ProductFormModal';
import CategoryForm from '@/app/dashboard/components/CategoryForm';
import Modal from '@/components/Modal';

import {
  useProducts,
  useDeleteProduct,
} from '@/hooks/useProducts';

import {
  useAddCategory,
} from '@/hooks/useCategory';


export default function ProductsPage() {

  /* ========================================
     PAGINATION
  ======================================== */

  const [page, setPage] = useState(1);

  const limit = 10;


  /* ========================================
     MODALS
  ======================================== */

  const [showProductModal, setShowProductModal] =
    useState(false);

  const [showCategoryModal, setShowCategoryModal] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);


  /* ========================================
     SEARCH
  ======================================== */

  const [search, setSearch] =
    useState('');


  /* ========================================
     PRODUCTS
  ======================================== */

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useProducts({
    page,
    limit,
  });


  const products =
    data?.products || [];

  const totalProducts =
    data?.totalProducts || 0;

  const totalPages =
    data?.totalPages ||
    Math.max(
      1,
      Math.ceil(
        totalProducts / limit
      )
    );


  /* ========================================
     DELETE
  ======================================== */

  const deleteProductMutation =
    useDeleteProduct();


  /* ========================================
     CATEGORY
  ======================================== */

  const addCategoryMutation =
    useAddCategory();


  /* ========================================
     FILTER
  ======================================== */

  const filteredProducts =
    useMemo(() => {
      const keyword =
        search.trim().toLowerCase();

      if (!keyword) {
        return products;
      }

      return products.filter(
        (product) =>
          product.name
            ?.toLowerCase()
            .includes(keyword) ||
          product.slug
            ?.toLowerCase()
            .includes(keyword) ||
          product.category
            ?.toLowerCase()
            .includes(keyword)
      );
    }, [products, search]);


  /* ========================================
     OPEN ADD
  ======================================== */

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };


  /* ========================================
     OPEN EDIT
  ======================================== */

  const handleEditProduct = (
    product
  ) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };


  /* ========================================
     CLOSE PRODUCT
  ======================================== */

  const handleCloseProductModal =
    () => {
      setShowProductModal(false);
      setEditingProduct(null);
    };


  /* ========================================
     DELETE
  ======================================== */

  const handleDelete = async (
    product
  ) => {
    if (!product?._id) return;

    const confirmed =
      window.confirm(
        `Delete "${product.name}"?`
      );

    if (!confirmed) return;

    try {
      await deleteProductMutation.mutateAsync(
        product._id
      );

      /*
       * If deleting the last item
       * of a page, go back one page.
       */

      if (
        products.length === 1 &&
        page > 1
      ) {
        setPage(
          (previous) =>
            previous - 1
        );
      }
    } catch (error) {
      console.error(error);
    }
  };


  /* ========================================
     CATEGORY CREATE
  ======================================== */

  const handleCategorySubmit =
    async (payload) => {
      try {
        await addCategoryMutation.mutateAsync(
          payload
        );

        setShowCategoryModal(false);

        toast.success(
          'Category added successfully'
        );
      } catch (error) {
        console.error(error);

        toast.error(
          error?.message ||
            'Category creation failed'
        );
      }
    };


  /* ========================================
     VARIANT HELPERS
  ======================================== */

  const getTotalStock = (
    product
  ) => {
    if (
      !Array.isArray(
        product?.variants
      )
    ) {
      return 0;
    }

    return product.variants.reduce(
      (total, variant) =>
        total +
        Number(
          variant.stock || 0
        ),
      0
    );
  };


  const getPriceText = (
    product
  ) => {
    if (
      !Array.isArray(
        product?.variants
      ) ||
      !product.variants.length
    ) {
      return '৳0';
    }

    const prices =
      product.variants
        .map((variant) =>
          Number(
            variant.sellPrice || 0
          )
        )
        .filter(
          (price) =>
            !Number.isNaN(price)
        );

    if (!prices.length) {
      return '৳0';
    }

    const min =
      Math.min(...prices);

    const max =
      Math.max(...prices);

    if (min === max) {
      return `৳${min}`;
    }

    return `৳${min} - ৳${max}`;
  };


  const getVariantText = (
    product
  ) => {
    if (
      !Array.isArray(
        product?.variants
      )
    ) {
      return '-';
    }

    return product.variants
      .map((variant) => {
        let size =
          Number(
            variant.value || 0
          );

        let unit = '';

        switch (
          variant.unit
        ) {
          case 'gram':
            unit = 'g';
            break;

          case 'kg':
            unit = 'kg';
            break;

          case 'milliliter':
            unit = 'ml';
            break;

          case 'litre':
            unit = 'L';
            break;

          case 'piece':
            unit = 'pcs';
            break;

          default:
            unit = '';
        }

        return `${size}${unit}`;
      })
      .join(', ');
  };


  /* ========================================
     LOADING
  ======================================== */

  if (
    isLoading &&
    !data
  ) {
    return (
      <main className="p-4 sm:p-6">

        <div
          className="
            flex min-h-[400px]
            items-center justify-center
          "
        >
          <RefreshCw
            size={28}
            className="animate-spin"
          />
        </div>

      </main>
    );
  }


  /* ========================================
     UI
  ======================================== */

  return (
    <main
      className="
        min-h-screen
        bg-[#0d0d11]
        p-3 text-white
        sm:p-5
      "
    >

      {/* ====================================
          HEADER
      ==================================== */}

      <div
        className="
          mb-5 flex flex-col
          gap-4 lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >

        <div>
          <h1 className="text-xl font-bold sm:text-2xl">
            Products
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your Shalban Food products
          </p>
        </div>


        <div className="flex gap-2">

          <button
            type="button"
            onClick={() =>
              setShowCategoryModal(true)
            }
            className="
              flex items-center
              justify-center gap-2
              rounded-xl
              border border-white/10
              bg-white/5
              px-4 py-2.5
              text-sm font-semibold
              hover:bg-white/10
            "
          >
            <Plus size={17} />

            Category
          </button>


          <button
            type="button"
            onClick={handleAddProduct}
            className="
              flex items-center
              justify-center gap-2
              rounded-xl
              bg-white
              px-4 py-2.5
              text-sm font-bold
              text-black
              hover:bg-gray-200
            "
          >
            <Plus size={17} />

            Add Product
          </button>

        </div>

      </div>


      {/* ====================================
          SEARCH
      ==================================== */}

      <div
        className="
          mb-5 flex flex-col
          gap-3 sm:flex-row
        "
      >

        <div className="relative flex-1">

          <Search
            size={18}
            className="
              absolute left-3
              top-1/2 -translate-y-1/2
              text-gray-500
            "
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search products..."
            className="
              w-full rounded-xl
              border border-white/10
              bg-white/[0.04]
              py-2.5 pl-10 pr-10
              text-sm text-white
              outline-none
              focus:border-white/30
            "
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch('')
              }
              className="
                absolute right-3
                top-1/2
                -translate-y-1/2
                text-gray-500
                hover:text-white
              "
            >
              <X size={16} />
            </button>
          )}

        </div>


        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="
            flex items-center
            justify-center gap-2
            rounded-xl
            border border-white/10
            bg-white/[0.04]
            px-4 py-2.5
            text-sm
            hover:bg-white/10
            disabled:opacity-50
          "
        >
          <RefreshCw
            size={16}
            className={
              isFetching
                ? 'animate-spin'
                : ''
            }
          />

          Refresh
        </button>

      </div>


      {/* ====================================
          STATS
      ==================================== */}

      <div
        className="
          mb-5 grid
          grid-cols-2 gap-3
          lg:grid-cols-4
        "
      >

        <div className="card">
          <p className="card-label">
            Total Products
          </p>

          <p className="card-value">
            {totalProducts}
          </p>
        </div>


        <div className="card">
          <p className="card-label">
            Current Page
          </p>

          <p className="card-value">
            {products.length}
          </p>
        </div>


        <div className="card">
          <p className="card-label">
            Page
          </p>

          <p className="card-value">
            {page}/{totalPages}
          </p>
        </div>


        <div className="card">
          <p className="card-label">
            Showing
          </p>

          <p className="card-value">
            {filteredProducts.length}
          </p>
        </div>

      </div>


      {/* ====================================
          DESKTOP TABLE
      ==================================== */}

      <div
        className="
          hidden overflow-hidden
          rounded-2xl
          border border-white/10
          bg-[#131318]
          md:block
        "
      >

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr
                className="
                  border-b border-white/10
                  text-left text-xs
                  uppercase tracking-wide
                  text-gray-500
                "
              >
                <th className="px-4 py-4">
                  Product
                </th>

                <th className="px-4 py-4">
                  Category
                </th>

                <th className="px-4 py-4">
                  Variants
                </th>

                <th className="px-4 py-4">
                  Price
                </th>

                <th className="px-4 py-4">
                  Stock
                </th>

                <th className="px-4 py-4 text-right">
                  Action
                </th>
              </tr>
            </thead>


            <tbody>

              {filteredProducts.map(
                (product) => (
                  <tr
                    key={product._id}
                    className="
                      border-b border-white/5
                      last:border-0
                      hover:bg-white/[0.025]
                    "
                  >

                    {/* Product */}

                    <td className="px-4 py-4">

                      <div className="flex items-center gap-3">

                        <div
                          className="
                            relative
                            h-12 w-12
                            shrink-0
                            overflow-hidden
                            rounded-xl
                            bg-white/5
                          "
                        >
                          {product.image ? (
                            <Image
                              src={
                                product.image
                              }
                              alt={
                                product.name ||
                                'Product'
                              }
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div
                              className="
                                flex h-full
                                items-center
                                justify-center
                              "
                            >
                              <Package
                                size={20}
                                className="text-gray-600"
                              />
                            </div>
                          )}
                        </div>


                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold">
                            {product.name}
                          </p>

                          <p className="mt-1 truncate text-xs text-gray-500">
                            /{product.slug}
                          </p>

                        </div>

                      </div>

                    </td>


                    {/* Category */}

                    <td className="px-4 py-4">

                      <span
                        className="
                          rounded-full
                          bg-white/5
                          px-2.5 py-1
                          text-xs
                        "
                      >
                        {product.category ||
                          '-'}
                      </span>

                    </td>


                    {/* Variants */}

                    <td className="px-4 py-4 text-sm text-gray-300">
                      {getVariantText(
                        product
                      )}
                    </td>


                    {/* Price */}

                    <td className="px-4 py-4 text-sm font-semibold">
                      {getPriceText(
                        product
                      )}
                    </td>


                    {/* Stock */}

                    <td className="px-4 py-4">

                      <span
                        className={
                          getTotalStock(
                            product
                          ) > 0
                            ? 'text-sm text-green-400'
                            : 'text-sm text-red-400'
                        }
                      >
                        {getTotalStock(
                          product
                        )}
                      </span>

                    </td>


                    {/* Actions */}

                    <td className="px-4 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleEditProduct(
                              product
                            )
                          }
                          className="
                            rounded-lg
                            border
                            border-white/10
                            p-2
                            text-gray-400
                            hover:bg-white/10
                            hover:text-white
                          "
                        >
                          <Pencil
                            size={16}
                          />
                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              product
                            )
                          }
                          disabled={
                            deleteProductMutation.isPending
                          }
                          className="
                            rounded-lg
                            border
                            border-red-500/10
                            p-2
                            text-red-400
                            hover:bg-red-500/10
                            disabled:opacity-40
                          "
                        >
                          <Trash2
                            size={16}
                          />
                        </button>

                      </div>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>


          {!filteredProducts.length && (
            <div
              className="
                flex min-h-[250px]
                flex-col items-center
                justify-center
                text-center
              "
            >
              <Package
                size={38}
                className="mb-3 text-gray-700"
              />

              <p className="font-semibold">
                No products found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Try another search or add a product.
              </p>
            </div>
          )}

        </div>

      </div>


      {/* ====================================
          MOBILE CARDS
      ==================================== */}

      <div className="space-y-3 md:hidden">

        {filteredProducts.map(
          (product) => (
            <div
              key={product._id}
              className="
                rounded-2xl
                border border-white/10
                bg-[#131318]
                p-3
              "
            >

              <div className="flex gap-3">

                <div
                  className="
                    relative
                    h-16 w-16
                    shrink-0
                    overflow-hidden
                    rounded-xl
                    bg-white/5
                  "
                >
                  {product.image ? (
                    <Image
                      src={
                        product.image
                      }
                      alt={
                        product.name ||
                        'Product'
                      }
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package
                        size={22}
                        className="text-gray-600"
                      />
                    </div>
                  )}
                </div>


                <div className="min-w-0 flex-1">

                  <h3 className="truncate text-sm font-semibold">
                    {product.name}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    {product.category}
                  </p>

                  <p className="mt-2 text-sm font-bold">
                    {getPriceText(
                      product
                    )}
                  </p>

                </div>

              </div>


              <div
                className="
                  mt-3 grid
                  grid-cols-3 gap-2
                "
              >

                <div className="mobile-info">
                  <span>Variants</span>
                  <strong>
                    {product.variants?.length ||
                      0}
                  </strong>
                </div>


                <div className="mobile-info">
                  <span>Stock</span>
                  <strong>
                    {getTotalStock(
                      product
                    )}
                  </strong>
                </div>


                <div className="mobile-info">
                  <span>Status</span>
                  <strong>
                    {product.isActive
                      ? 'Active'
                      : 'Off'}
                  </strong>
                </div>

              </div>


              <div
                className="
                  mt-3 flex gap-2
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    handleEditProduct(
                      product
                    )
                  }
                  className="
                    flex flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border border-white/10
                    bg-white/5
                    py-2.5
                    text-sm
                    font-medium
                  "
                >
                  <Pencil size={15} />

                  Edit
                </button>


                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      product
                    )
                  }
                  className="
                    flex flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border border-red-500/10
                    bg-red-500/5
                    py-2.5
                    text-sm
                    font-medium
                    text-red-400
                  "
                >
                  <Trash2 size={15} />

                  Delete
                </button>

              </div>

            </div>
          )
        )}


        {!filteredProducts.length && (
          <div
            className="
              rounded-2xl
              border border-white/10
              bg-[#131318]
              p-10
              text-center
            "
          >
            <Package
              size={35}
              className="
                mx-auto mb-3
                text-gray-700
              "
            />

            <p className="font-semibold">
              No products found
            </p>
          </div>
        )}

      </div>


      {/* ====================================
          PAGINATION
      ==================================== */}

      <div
        className="
          mt-5 flex
          items-center
          justify-between
          rounded-2xl
          border border-white/10
          bg-[#131318]
          px-3 py-3
          sm:px-4
        "
      >

        <p className="text-xs text-gray-500 sm:text-sm">
          Page {page} of {totalPages}
        </p>


        <div className="flex gap-2">

          <button
            type="button"
            disabled={
              page <= 1 ||
              isFetching
            }
            onClick={() =>
              setPage(
                (previous) =>
                  Math.max(
                    1,
                    previous - 1
                  )
              )
            }
            className="
              rounded-lg
              border border-white/10
              p-2
              hover:bg-white/10
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
          >
            <ChevronLeft
              size={17}
            />
          </button>


          <button
            type="button"
            disabled={
              page >= totalPages ||
              isFetching
            }
            onClick={() =>
              setPage(
                (previous) =>
                  Math.min(
                    totalPages,
                    previous + 1
                  )
              )
            }
            className="
              rounded-lg
              border border-white/10
              p-2
              hover:bg-white/10
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
          >
            <ChevronRight
              size={17}
            />
          </button>

        </div>

      </div>


      {/* ====================================
          PRODUCT MODAL
      ==================================== */}

      <ProductFormModal
        isOpen={showProductModal}
        editingProduct={
          editingProduct
        }
        onClose={
          handleCloseProductModal
        }
      />


      {/* ====================================
          CATEGORY MODAL
      ==================================== */}

      <Modal
        open={showCategoryModal}
        onClose={() =>
          setShowCategoryModal(false)
        }
      >
        <CategoryForm
          onSubmit={
            handleCategorySubmit
          }
          onCancel={() =>
            setShowCategoryModal(
              false
            )
          }
        />
      </Modal>


      {/* ====================================
          STYLES
      ==================================== */}

      <style jsx>{`

        .card {
          border: 1px solid
            rgba(255, 255, 255, 0.08);
          background:
            rgba(255, 255, 255, 0.03);
          border-radius: 1rem;
          padding: 1rem;
        }

        .card-label {
          color: rgb(107, 114, 128);
          font-size: 0.75rem;
        }

        .card-value {
          margin-top: 0.35rem;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .mobile-info {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          border-radius: 0.75rem;
          background:
            rgba(255, 255, 255, 0.04);
          padding: 0.6rem;
        }

        .mobile-info span {
          color: rgb(107, 114, 128);
          font-size: 0.65rem;
        }

        .mobile-info strong {
          font-size: 0.75rem;
        }

      `}</style>

    </main>
  );
}