import WishlistClient from './WishlistClient';
export const generateMetadata = () => ({
  title: 'My Wishlist | TomartBD',
  description: 'Your saved products in TomartBD wishlist',
  robots: {
    index: false,
    follow: false,
  },
});
function page() {
  return <WishlistClient />;
}

export default page;
