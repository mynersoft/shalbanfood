import Image from 'next/image';
import Link from 'next/link';

import {
  ChevronRight,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
} from 'lucide-react';

import {connectDB} from '@/lib/dbConnect';
import Product from '@/models/Product';


/* =========================================================
   HELPERS
   ========================================================= */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://shalbanfood.vercel.app';

const SITE_NAME =
  'Shalban Food';


const getUnitLabel = (unit) => {
  const labels = {
    gram: 'গ্রাম',
    kg: 'কেজি',
    milliliter: 'মিলিলিটার',
    litre: 'লিটার',
    piece: 'পিস',
  };

  return labels[unit] || unit;
};


const formatSize = (variant) => {
  return `${variant.value} ${getUnitLabel(
    variant.unit
  )}`;
};


/* =========================================================
   FIND PRODUCT
   ========================================================= */

async function getProduct(slug) {
  await connectDB();

  const product =
    await Product.findOne({
      slug,
      isActive: true,
    }).lean();

  if (!product) return null;

  return JSON.parse(
    JSON.stringify(product)
  );
}


/* =========================================================
   SEO METADATA
   ========================================================= */

export async function generateMetadata({
  params,
}) {
  const { slug } = await params;

  const product =
    await getProduct(slug);

  if (!product) {
    return {
      title:
        `Product Not Found | ${SITE_NAME}`,

      description:
        `Product not found on ${SITE_NAME}.`,
    };
  }


  const title =
    product.seoTitle?.trim() ||
    `${product.name} | ${SITE_NAME}`;


  const description =
    product.seoDescription?.trim() ||
    product.shortDescription?.trim() ||
    `${product.name} কিনুন Shalban Food থেকে।`;


  const canonical =
    product.canonicalUrl?.trim() ||
    `${SITE_URL}/product/${product.slug}`;


  const image =
    product.image ||
    `${SITE_URL}/og-image.png`;


  return {
    title,

    description,

    keywords:
      Array.isArray(
        product.keywords
      )
        ? product.keywords
        : [],

    alternates: {
      canonical,
    },

    openGraph: {
      title,

      description,

      url: canonical,

      siteName: SITE_NAME,

      type: 'website',

      locale: 'bn_BD',

      images: [
        {
          url: image,

          width: 1200,

          height: 1200,

          alt: product.name,
        },
      ],
    },

    twitter: {
      card:
        'summary_large_image',

      title,

      description,

      images: [image],
    },

    robots: {
      index: true,

      follow: true,

      googleBot: {
        index: true,

        follow: true,

        'max-image-preview':
          'large',

        'max-snippet':
          -1,

        'max-video-preview':
          -1,
      },
    },
  };
}


/* =========================================================
   PAGE
   ========================================================= */

export default async function ProductPage({
  params,
}) {
  const { slug } = await params;

  const product =
    await getProduct(slug);


  /* =======================================================
     404
     ======================================================= */

  if (!product) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">
          Product Not Found
        </h1>

        <p className="mt-3 text-gray-500">
          এই পণ্যটি পাওয়া যায়নি।
        </p>

        <Link
          href="/shop"
          className="
            mt-6
            inline-flex
            rounded-lg
            bg-green-600
            px-5
            py-3
            text-white
          "
        >
          Shop Now
        </Link>
      </main>
    );
  }


  /* =======================================================
     VARIANTS
     ======================================================= */

  const variants =
    Array.isArray(product.variants)
      ? product.variants
      : [];


  const availableVariants =
    variants.filter(
      (variant) =>
        Number(variant.stock) > 0
    );


  const minPrice =
    variants.length
      ? Math.min(
          ...variants.map(
            (variant) =>
              Number(
                variant.sellPrice
              )
          )
        )
      : 0;


  const maxPrice =
    variants.length
      ? Math.max(
          ...variants.map(
            (variant) =>
              Number(
                variant.sellPrice
              )
          )
        )
      : 0;


  /* =======================================================
     PRODUCT URL
     ======================================================= */

  const productUrl =
    `${SITE_URL}/product/${product.slug}`;


  /* =======================================================
     JSON-LD
     ======================================================= */

  const productJsonLd = {
    '@context':
      'https://schema.org',

    '@type':
      'Product',

    '@id':
      `${productUrl}#product`,

    name:
      product.name,

    description:
      product.description ||
      product.shortDescription ||
      product.seoDescription ||
      '',

    image:
      product.image
        ? [product.image]
        : [],

    sku:
      product.sku || undefined,

    brand: product.brand
      ? {
          '@type':
            'Brand',

          name:
            product.brand,
        }
      : {
          '@type':
            'Brand',

          name:
            SITE_NAME,
        },

    category:
      product.category,

    url:
      productUrl,

    offers: variants.map(
      (variant) => ({
        '@type':
          'Offer',

        url:
          productUrl,

        priceCurrency:
          'BDT',

        price:
          Number(
            variant.sellPrice
          ).toFixed(2),

        availability:
          Number(
            variant.stock
          ) > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',

        itemCondition:
          'https://schema.org/NewCondition',

        seller: {
          '@type':
            'Organization',

          name:
            SITE_NAME,

          url:
            SITE_URL,
        },

        name:
          `${product.name} - ${formatSize(
            variant
          )}`,
      })
    ),
  };


  /* =======================================================
     BREADCRUMB JSON-LD
     ======================================================= */

  const breadcrumbJsonLd = {
    '@context':
      'https://schema.org',

    '@type':
      'BreadcrumbList',

    itemListElement: [
      {
        '@type':
          'ListItem',

        position: 1,

        name:
          'Home',

        item:
          SITE_URL,
      },

      {
        '@type':
          'ListItem',

        position: 2,

        name:
          'Shop',

        item:
          `${SITE_URL}/shop`,
      },

      {
        '@type':
          'ListItem',

        position: 3,

        name:
          product.name,

        item:
          productUrl,
      },
    ],
  };


  return (
    <main className="min-h-screen bg-white">

      {/* ===================================================
          STRUCTURED DATA
      =================================================== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              productJsonLd
            ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              breadcrumbJsonLd
            ),
        }}
      />


      {/* ===================================================
          BREADCRUMB
      =================================================== */}

      <div
        className="
          border-b
          border-gray-100
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-7xl
            items-center
            gap-1
            overflow-hidden
            px-4
            py-3
            text-xs
            text-gray-500
          "
        >

          <Link
            href="/"
            className="hover:text-green-600"
          >
            Home
          </Link>

          <ChevronRight size={14} />

          <Link
            href="/shop"
            className="hover:text-green-600"
          >
            Shop
          </Link>

          <ChevronRight size={14} />

          <span className="truncate text-gray-700">
            {product.name}
          </span>

        </div>
      </div>


      {/* ===================================================
          PRODUCT
      =================================================== */}

      <section
        className="
          mx-auto
          max-w-7xl
          px-4
          py-8
          sm:py-12
        "
      >

        <div
          className="
            grid
            gap-8
            lg:grid-cols-2
          "
        >

          {/* =================================================
              IMAGE
          ================================================= */}

          <div>

            <div
              className="
                relative
                aspect-square
                overflow-hidden
                rounded-2xl
                bg-gray-50
              "
            >

              {product.image ? (
                <Image
                  src={
                    product.image
                  }
                  alt={
                    product.name
                  }
                  fill
                  priority
                  sizes="
                    (max-width: 768px) 100vw,
                    50vw
                  "
                  className="
                    object-contain
                    p-5
                  "
                />
              ) : (
                <div
                  className="
                    flex
                    h-full
                    items-center
                    justify-center
                    text-gray-400
                  "
                >
                  No Image
                </div>
              )}

            </div>

          </div>


          {/* =================================================
              INFORMATION
          ================================================= */}

          <div>

            {/* category */}

            <Link
              href={`/category/${product.category}`}
              className="
                text-sm
                font-medium
                text-green-600
                hover:underline
              "
            >
              {product.category}
            </Link>


            {/* title */}

            <h1
              className="
                mt-2
                text-3xl
                font-bold
                leading-tight
                text-gray-900
                sm:text-4xl
              "
            >
              {product.name}
            </h1>


            {/* brand */}

            {product.brand && (
              <p
                className="
                  mt-2
                  text-sm
                  text-gray-500
                "
              >
                Brand: {product.brand}
              </p>
            )}


            {/* rating placeholder */}

            <div
              className="
                mt-4
                flex
                items-center
                gap-2
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-1
                  text-yellow-500
                "
              >
                <Star
                  size={16}
                  fill="currentColor"
                />

                <span className="text-sm">
                  New Product
                </span>
              </div>
            </div>


            {/* price */}

            <div
              className="
                mt-5
                text-2xl
                font-bold
                text-green-600
              "
            >
              {minPrice === maxPrice
                ? `৳${minPrice}`
                : `৳${minPrice} - ৳${maxPrice}`}
            </div>


            {/* short description */}

            {product.shortDescription && (
              <p
                className="
                  mt-5
                  leading-7
                  text-gray-600
                "
              >
                {
                  product.shortDescription
                }
              </p>
            )}


            {/* variants */}

            <div className="mt-7">

              <h2
                className="
                  mb-3
                  text-sm
                  font-semibold
                  text-gray-900
                "
              >
                Available Sizes
              </h2>


              <div
                className="
                  flex
                  flex-wrap
                  gap-2
                "
              >
                {variants.map(
                  (variant) => (
                    <div
                      key={
                        variant._id
                      }
                      className="
                        rounded-lg
                        border
                        border-gray-200
                        px-4
                        py-3
                      "
                    >
                      <div
                        className="
                          font-semibold
                          text-gray-900
                        "
                      >
                        {formatSize(
                          variant
                        )}
                      </div>

                      <div
                        className="
                          mt-1
                          text-sm
                          font-medium
                          text-green-600
                        "
                      >
                        ৳
                        {
                          variant.sellPrice
                        }
                      </div>

                      <div
                        className="
                          mt-1
                          text-xs
                          text-gray-500
                        "
                      >
                        {Number(
                          variant.stock
                        ) > 0
                          ? 'In Stock'
                          : 'Out of Stock'}
                      </div>
                    </div>
                  )
                )}
              </div>

            </div>


            {/* features */}

            <div
              className="
                mt-7
                grid
                gap-3
                sm:grid-cols-3
              "
            >

              <div
                className="
                  rounded-xl
                  bg-gray-50
                  p-3
                "
              >
                <Truck
                  size={20}
                  className="text-green-600"
                />

                <p
                  className="
                    mt-2
                    text-xs
                    text-gray-600
                  "
                >
                  বাংলাদেশজুড়ে
                  ডেলিভারি
                </p>
              </div>


              <div
                className="
                  rounded-xl
                  bg-gray-50
                  p-3
                "
              >
                <ShieldCheck
                  size={20}
                  className="text-green-600"
                />

                <p
                  className="
                    mt-2
                    text-xs
                    text-gray-600
                  "
                >
                  Quality
                  Checked
                </p>
              </div>


              <div
                className="
                  rounded-xl
                  bg-gray-50
                  p-3
                "
              >
                <ShoppingCart
                  size={20}
                  className="text-green-600"
                />

                <p
                  className="
                    mt-2
                    text-xs
                    text-gray-600
                  "
                >
                  Easy
                  Ordering
                </p>
              </div>

            </div>


            {/* CTA */}

            <button
              type="button"
              className="
                mt-7
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-green-600
                px-6
                py-4
                font-semibold
                text-white
                transition
                hover:bg-green-700
              "
            >
              <ShoppingCart
                size={20}
              />

              Add to Cart
            </button>

          </div>

        </div>


        {/* =================================================
            DESCRIPTION
        ================================================= */}

        {product.description && (
          <section
            className="
              mt-12
              border-t
              border-gray-100
              pt-10
            "
          >

            <h2
              className="
                text-2xl
                font-bold
                text-gray-900
              "
            >
              Product Details
            </h2>

            <div
              className="
                mt-5
                max-w-4xl
                whitespace-pre-line
                leading-8
                text-gray-600
              "
            >
              {
                product.description
              }
            </div>

          </section>
        )}

      </section>

    </main>
  );
}