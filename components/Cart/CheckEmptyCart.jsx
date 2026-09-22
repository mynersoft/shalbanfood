import { ArrowRight, ShoppingBag, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

const CheckEmptyCart = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center py-16">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
            <ShoppingCart size={48} className="text-gray-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          Your Cart is Empty
        </h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Looks like you haven&apos;t added any items to your cart yet. Start
          shopping to discover amazing products!
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <ShoppingBag size={20} />
          Start Shopping
        </Link>
      </div>
    </div>
  );
};

export default CheckEmptyCart;
