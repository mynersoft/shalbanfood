'use client';

import { useState } from 'react';
import {
	Menu,
	ShoppingBag,
	X,
	Search,
	Heart,
	GitCompare,
	User,
	Home,
	Info,
	Mail,
	Youtube,
} from 'lucide-react';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { initCartFromStorage } from '@/redux/store/slices/cartSlice';
import CardDrawer from './CardDrawer';

/* ---------------- OVERLAY ---------------- */
const Overlay = ({ onClick }) => (
	<div
		onClick={onClick}
		className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
	/>
);

/* ---------------- CART ---------------- */
const ShoppingCart = ({ isOpen, onClose, cartItems }) => {
	if (!isOpen) return null;

	const subtotal = cartItems.reduce(
		(sum, i) => sum + i.salePrice * i.quantity,
		0
	);

	return (
		<>
			<Overlay onClick={onClose} />
			<aside className="fixed top-0 right-0 h-full w-[360px] bg-white z-40 shadow-2xl animate-slideIn flex flex-col">
				{/* Header */}
				<div className="flex justify-between items-center p-4 border-b">
					<h2 className="font-semibold text-lg">Your Cart</h2>
					<button onClick={onClose}>
						<X />
					</button>
				</div>

				{/* Items */}
				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					{cartItems.map((item) => (
						<div
							key={item.id}
							className="flex gap-3 border rounded-lg p-3">
							<Image
								src={item.image}
								alt={item.name}
								width={60}
								height={60}
								className="rounded"
							/>
							<div className="flex-1">
								<p className="font-medium text-sm leading-snug">
									{item.name}
								</p>
								<p className="text-xs text-gray-500">
									{item.quantity} × ৳{item.salePrice}
								</p>
							</div>
							<X
								size={18}
								className="text-gray-400 cursor-pointer"
							/>
						</div>
					))}
				</div>

				{/* Footer */}
				<div className="border-t p-4 space-y-3">
					<div className="flex justify-between font-semibold">
						<span>Total</span>
						<span>৳ {subtotal}</span>
					</div>

					<button className="w-full py-2 rounded bg-gray-200 font-medium hover:bg-gray-300">
						View Cart
					</button>
					<button className="w-full py-2 rounded bg-green-600 text-white font-medium hover:bg-green-700">
						Checkout
					</button>
				</div>
			</aside>
		</>
	);
};

/* ---------------- MOBILE MENU ---------------- */
const MobileMenu = ({ isOpen, onClose }) => {
	if (!isOpen) return null;

	const menuItems = [
		{ icon: Home, label: 'Home' },
		{ icon: ShoppingBag, label: 'Shop' },
		{ icon: Info, label: 'About Us' },
		{ icon: Mail, label: 'Contact' },
		{ icon: Youtube, label: 'Videos' },
		{ icon: Heart, label: 'Wishlist' },
		{ icon: User, label: 'Login / Register' },
	];

	return (
		<>
			<Overlay onClick={onClose} />
			<aside className="fixed top-0 left-0 h-full w-[280px] bg-white z-40 shadow-2xl animate-slideLeft">
				{/* Search */}
				<div className="p-4 border-b">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							placeholder="Search products..."
							className="w-full pl-10 pr-4 py-2 border rounded-lg"
						/>
					</div>
				</div>

				{/* Menu */}
				<nav className="p-2">
					{menuItems.map((item, i) => (
						<div
							key={i}
							className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 cursor-pointer">
							<item.icon size={20} />
							<span className="font-medium">{item.label}</span>
						</div>
					))}
				</nav>
			</aside>
		</>
	);
};

/* ---------------- HEADER ---------------- */
export default function Header() {
	const { items: cartItems, initCartFromStorage } = useSelector(
		(state) => state.cart
	);

	console.log(initCartFromStorage);
	

	const totalCartItems = cartItems.reduce((sum, i) => i.quantity, 0);

	const [menuOpen, setMenuOpen] = useState(false);
	const [cartOpen, setCartOpen] = useState(false);

	return (
		<>
			<header className="sticky top-0 z-20 bg-white border-b">
				<div className="flex items-center justify-between px-4 h-16">
					<button onClick={() => setMenuOpen(true)}>
						<Menu size={26} />
					</button>

					<div className="flex items-center gap-2">
						<div>
							<p className="font-bold text-sm">Shalban Food</p>
						</div>
					</div>

					<button
						onClick={() => setCartOpen(true)}
						className="relative">
						<ShoppingBag size={26} />
						<span className="absolute -top-1 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
							{totalCartItems || 0}
						</span>
					</button>
				</div>
			</header>

			<MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

			{/* <ShoppingCart
				isOpen={cartOpen}
				cartItems={cartItems}
				onClose={() => setCartOpen(false)}
			/> */}

			<CardDrawer
				items={cartItems}
				isCartOpen={cartOpen}
				setIsCartOpen={() => setCartOpen(false)}
			/>
		</>
	);
}
