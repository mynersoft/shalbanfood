'use client';

import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { removeFromCart, updateQuantity } from '@/redux/store/slices/cartSlice';


const CardDrawer = ({ items = [], isCartOpen, cartRef, setIsCartOpen }) => {
	const dispatch = useDispatch();

	const router = useRouter();

	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	const totalPrice = items.reduce(
		(sum, item) => sum + item.salePrice * item.quantity,
		0
	);



	const handleQuantityChange = (productId, qty) => {
		if (qty < 1) return;
		dispatch(updateQuantity({ productId, quantity: qty }));
	};

	const handleCheckout = () => {
		setIsCartOpen(false);
		router.push('/checkout');
	};

	return (
		<div
			className={`fixed inset-0 z-100 transition-opacity duration-300 ${
				isCartOpen
					? 'opacity-100 pointer-events-auto'
					: 'opacity-0 pointer-events-none'
			}`}
			aria-hidden={!isCartOpen}>
			{/* Overlay */}
			<div
				className="absolute inset-0 bg-black/40"
				onClick={() => setIsCartOpen(false)}
			/>

			{/* Drawer */}
			<aside
				ref={cartRef}
				className={`absolute top-0 right-0 h-full w-full md:w-[420px] bg-white shadow-xl transform transition-transform duration-300 ${
					isCartOpen ? 'translate-x-0' : 'translate-x-full'
				}`}>
				<div className="flex flex-col h-full">
					{/* ================= Header ================= */}
					<div className="flex items-center justify-between p-4 border-b">
						<h2 className="text-xl font-bold">Your Cart</h2>
						<button
							onClick={() => setIsCartOpen(false)}
							className="p-2 rounded-full hover:bg-gray-100"
							aria-label="Close cart">
							<X size={22} />
						</button>
					</div>

					{/* ================= Items ================= */}
					<div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3">
						{items.length > 0 ? (
							items.map((item) => (
								<div key={item._id} className="flex gap-3 p-3">
									<Image
										src={item.image || '/placeholder.png'}
										alt={item.name}
										width={60}
										height={60}
										className="rounded-lg object-cover h-20"
									/>

									<div className="flex-1">
										<h3 className="font-medium font-sm line-clamp-2">
											{item.name}
										</h3>

										<p className="text-base font-bold text-gray-600">
											৳ {item.salePrice}
										</p>

										{item.discount && (
											<p className="text-sm text-gray-400 line-through">
												৳{item.regularPrice}
											</p>
										)}

										{/* Quantity */}
										<div className="flex items-center justify-between mt-1">
											<div className="flex items-center border rounded border-gray-300">
												<button
													onClick={() =>
														handleQuantityChange(
															item._id,
															item.quantity - 1
														)
													}
													disabled={
														item.quantity <= 1
													}
													className="px-2 py-0.5  hover:bg-gray-100">
													<Minus size={16} />
												</button>

												<span className="w-8 py-0.5  text-center font-medium">
													{item.quantity}
												</span>

												<button
													onClick={() =>
														handleQuantityChange(
															item._id,
															item.quantity + 1
														)
													}
													className="px-2 py-0.5 hover:bg-gray-100">
													<Plus size={16} />
												</button>
											</div>

											<button
												onClick={() =>
													dispatch(
														removeFromCart(item._id)
													)
												}
												className="p-2 text-gray-500 hover:text-red-600">
												<Trash2 size={18} />
											</button>
										</div>
									</div>
								</div>
							))
						) : (
							<div className="text-center py-16">
								<ShoppingCart
									size={64}
									className="mx-auto text-gray-300 mb-4"
								/>
								<h3 className="text-xl font-semibold mb-2">
									Your cart is empty
								</h3>

								<button
									onClick={() => setIsCartOpen(false)}
									className="px-6 py-3 bg-green-600 text-white rounded-lg">
									Continue Shopping
								</button>
							</div>
						)}
					</div>

					{/* ================= Footer ================= */}
					{items.length > 0 && (
						<div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
							<div className="flex justify-between">
								<span className="text-gray-600">Subtotal</span>
								<span className="font-semibold">
									৳{totalPrice}
								</span>
							</div>

							

							{/* <div className="flex justify-between text-lg font-bold border-t pt-2 border-gray-200">
								<span>Total</span>
								<span>৳{grandTotal}</span>
							</div> */}

							<div className="grid grid-cols-2 gap-3 pt-2">
								<Link
									href="/cart"
									onClick={() => setIsCartOpen(false)}
									className="text-center  bg-gray-200 text-black py-3 rounded-lg hover:bg-green-600 hover:text-white">
									View Cart
								</Link>

								<button
									onClick={handleCheckout}
									className="bg-green-600 text-white py-3 rounded-lg hover:bg-[#003366]">
									Checkout
								</button>
							</div>
						</div>
					)}
				</div>
			</aside>
		</div>
	);
};

export default CardDrawer;
