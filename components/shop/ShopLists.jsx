"use client";

import { addToCart } from "@/redux/store/slices/cartSlice";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";



export default function ShopList({ products }) { 

  const dispatch = useDispatch();

   const handleAddToCart = (product) => {
    dispatch(addToCart({ product }));
    toast.success('Added to cart!');
  };
  
  return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
			{products.map((p) => (
				<div
					key={p.name}
					className="bg-gray-900 text-white p-4 rounded-lg shadow hover:bg-gray-800">
					<img
						src={p.featureImg}
						alt={p.name}
						className="w-full h-32 object-cover rounded"
					/>

					<h2 className="mt-2 text-lg font-semibold">{p.name}</h2>
					<p className="text-yellow-400">৳ {p.salePrice}</p>

					<button
						onClick={() => handleAddToCart(p)}
						className="mt-3 bg-blue-600 w-full py-1 rounded">
						Add to Cart
					</button>
				</div>
			))}
		</div>
  );
}