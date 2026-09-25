export async function generateMetadata({ params }) {
  const slug = params?.slug ?? '';

  if (!slug) {
    return {
      title: 'Product Details | TomartBD',
      description: 'Product details page',
    };
  }

  return {
    title: `${slug.replace(/-/g, ' ')} | TomartBD`,
    description:
      'Buy original products online in Bangladesh with best price, warranty and fast delivery.',
  };
}
