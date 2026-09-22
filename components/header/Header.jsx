'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Menu, X, ShoppingCart, ChevronRight, Trash2 } from 'lucide-react';


import {
	selectCartItems,
	selectCartTotalItems,
} from '@/redux/store/slices/cartSlice';

export default function Header() {
	const [menuOpen, setMenuOpen] = useState(false);
	const [cartOpen, setCartOpen] = useState(false);
	

	const cartQty = useSelector(selectCartTotalItems);

	const closeMenu = () => setMenuOpen(false);
	const closeCart = () => setCartOpen(false);

	return (
		<>
			{/* ================= HEADER ================= */}
			<header className="sticky top-0 z-40 border-b border-gray-100 bg-white">
				<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
					{/* Mobile Menu */}
					<button
						type="button"
						onClick={() => setMenuOpen(true)}
						className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 md:hidden"
						aria-label="Open menu">
						<Menu size={22} />
					</button>

					{/* Logo */}
					<Link
						href="/"
						className="text-xl font-bold tracking-tight text-gray-900">
						Shalban Food
					</Link>

					{/* Desktop Menu */}
					<nav className="hidden items-center gap-7 md:flex">
						<Link
							href="/"
							className="text-sm font-medium text-gray-700 hover:text-black">
							Home
						</Link>

						<Link
							href="/shop"
							className="text-sm font-medium text-gray-700 hover:text-black">
							Shop
						</Link>

						<Link
							href="/about"
							className="text-sm font-medium text-gray-700 hover:text-black">
							About
						</Link>

						<Link
							href="/contact"
							className="text-sm font-medium text-gray-700 hover:text-black">
							Contact
						</Link>
					</nav>

					{/* Cart */}
					<button
						type="button"
						onClick={() => setCartOpen(true)}
						className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
						aria-label="Open cart">
						<ShoppingCart size={21} />

						{cartQty > 0 && (
							<span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
								{cartQty > 99 ? '99+' : cartQty}
							</span>
						)}
					</button>
				</div>
			</header>

			{/* ================= OVERLAY ================= */}

			{(menuOpen || cartOpen) && (
				<div
					onClick={() => {
						closeMenu();
						closeCart();
					}}
					className="fixed inset-0 z-50 bg-black/40"
				/>
			)}

			{/* ================= MOBILE MENU ================= */}

			<aside
				className={`fixed left-0 top-0 z-[60] h-full w-[290px] max-w-[85vw] bg-white shadow-xl transition-transform duration-300 ${
					menuOpen ? 'translate-x-0' : '-translate-x-full'
				}`}>
				<div className="flex h-16 items-center justify-between border-b px-5">
					<span className="font-bold">Menu</span>

					<button
						type="button"
						onClick={closeMenu}
						className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100">
						<X size={20} />
					</button>
				</div>

				<nav className="p-4">
					<Link
						href="/"
						onClick={closeMenu}
						className="flex items-center justify-between border-b border-gray-100 py-4 text-sm font-medium">
						Home
						<ChevronRight size={17} />
					</Link>

					<Link
						href="/shop"
						onClick={closeMenu}
						className="flex items-center justify-between border-b border-gray-100 py-4 text-sm font-medium">
						Shop
						<ChevronRight size={17} />
					</Link>

					<Link
						href="/about"
						onClick={closeMenu}
						className="flex items-center justify-between border-b border-gray-100 py-4 text-sm font-medium">
						About
						<ChevronRight size={17} />
					</Link>

					<Link
						href="/contact"
						onClick={closeMenu}
						className="flex items-center justify-between border-b border-gray-100 py-4 text-sm font-medium">
						Contact
						<ChevronRight size={17} />
					</Link>
				</nav>
			</aside>

			{/* ================= CART DRAWER ================= */}

			<aside
				className={`fixed right-0 top-0 z-[60] flex h-full w-[380px] max-w-[92vw] flex-col bg-white shadow-xl transition-transform duration-300 ${
					cartOpen ? 'translate-x-0' : 'translate-x-full'
				}`}>
				{/* Cart Header */}
				<div className="flex h-16 shrink-0 items-center justify-between border-b px-5">
					<div>
						<h2 className="font-bold text-gray-900">Your Cart</h2>

						<p className="text-xs text-gray-500">
							{cartQty} item{cartQty !== 1 ? 's' : ''}
						</p>
					</div>

					<button
						type="button"
						onClick={closeCart}
						className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100">
						<X size={20} />
					</button>
				</div>

				{/* Cart Items */}
				<div className="flex-1 overflow-y-auto p-5">
					{cartItems.length === 0 ? (
						<div className="flex h-full flex-col items-center justify-center text-center">
							<ShoppingCart
								size={42}
								className="mb-4 text-gray-300"
							/>

							<h3 className="font-semibold text-gray-900">
								Your cart is empty
							</h3>

							<p className="mt-1 text-sm text-gray-500">
								Add products to your cart.
							</p>

							<Link
								href="/shop"
								onClick={closeCart}
								className="mt-5 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white">
								Start Shopping
							</Link>
						</div>
					) : (
						<div className="space-y-4">
							{cartItems.map((item) => {
								const price = Number(
									item.price ??
										item.salePrice ??
										item.regularPrice ??
										0
								);

								const safePrice = Number.isFinite(price)
									? price
									: 0;

								return (
									<div
										key={item._id}
										className="flex gap-3 border-b border-gray-100 pb-4">
										{/* Image */}
										<div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
											{item.featureImg && (
												<Image
													src={item.featureImg}
													alt={item.name}
													width={80}
													height={80}
													className="h-full w-full object-cover"
												/>
											)}
										</div>

										{/* Info */}
										<div className="min-w-0 flex-1">
											<Link
												href={`/product/${item.slug}`}
												onClick={closeCart}
												className="line-clamp-2 text-sm font-medium text-gray-900 hover:underline">
												{item.name}
											</Link>

											<p className="mt-1 text-sm font-semibold">
												৳{safePrice.toLocaleString()}
											</p>

											<p className="mt-1 text-xs text-gray-500">
												Quantity: {item.quantity}
											</p>
										</div>

										{/* Remove */}
										<button
											type="button"
											className="self-start text-gray-400 hover:text-red-500"
											aria-label="Remove item">
											<Trash2 size={17} />
										</button>
									</div>
								);
							})}
						</div>
					)}
				</div>

				{/* Cart Footer */}
				{cartItems.length > 0 && (
					<div className="shrink-0 border-t bg-white p-5">
						<Link
							href="/cart"
							onClick={closeCart}
							className="mb-3 flex w-full items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold hover:bg-gray-50">
							View Cart
						</Link>

						<Link
							href="/checkout"
							onClick={closeCart}
							className="flex w-full items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800">
							Checkout
						</Link>
					</div>
				)}
			</aside>
		</>
	);
}
