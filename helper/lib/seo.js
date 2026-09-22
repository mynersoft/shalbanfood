const SITE_NAME = "TomartBD";
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://tomartbd.com";
const DEFAULT_DESCRIPTION =
  "TomartBD offers quality products at the best price. Shop featured and best-selling items with fast delivery.";

export function generateMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = [],
  path = "",
  image = "/og-image.png",
} = {}) {
  // Ensure title is a string and handle undefined/null
  const safeTitle = typeof title === 'string' ? title.trim() : '';
  const fullTitle = safeTitle ? `${safeTitle} | ${SITE_NAME}` : SITE_NAME;
  
  // Ensure path is a string
  const safePath = typeof path === 'string' ? path : '';
  const url = `${SITE_URL}${safePath}`;
  
  // Handle image URL safely
  let ogImage;
  if (typeof image === 'string' && image.startsWith("http")) {
    ogImage = image;
  } else {
    const safeImage = typeof image === 'string' ? image : "/og-image.png";
    ogImage = `${SITE_URL}${safeImage}`;
  }

  return {
    title: fullTitle,
    description: description || DEFAULT_DESCRIPTION,
    keywords: ["tomartbd", "online shop", "ecommerce Bangladesh", ...(Array.isArray(keywords) ? keywords : [])],
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: description || DEFAULT_DESCRIPTION,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [{ 
        url: ogImage, 
        width: 1200, 
        height: 630, 
        alt: fullTitle 
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: description || DEFAULT_DESCRIPTION,
      images: [ogImage],
    },
  };
}

// Alternative: Async version if you need to fetch data
export async function generateMetadataAsync(config) {
  return generateMetadata(config);
}