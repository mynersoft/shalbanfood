'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from 'next-auth/react';
import MobileHeaderNavigation from './MobileHeaderNavigation';
import {
  ShoppingCart,
  User,
  Heart,
  Menu,
  X,
  Search,
  ChevronDown,
  Package,
  LogOut,
  Settings,
  PackageOpen,
  CreditCard,
  Bell,
  HelpCircle,
  History,
  UserCircle,
  MapPin,
  Truck,
  Shield,
  Phone,
  Tag,
  Zap,
} from 'lucide-react';

import useLoginUser from '@/hooks/useAuth';
import TopBar from './TopBar';
import { useRouter } from 'next/navigation';
import CardDrawer from './CardDrawer';
import HeaderNavigation from './HeaderNavigation';

export default function Header() {
  const router = useRouter();
  const { items, qty } = useSelector((state) => state.cart);

 
  const { categories } = useSelector((state) => state.category);
  const { user } = useLoginUser();

  const [mounted, setMounted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const userMenuRef = useRef(null);
  const cartRef = useRef(null);
  const headerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => setMounted(true), []);

  // Safe cart total calculation that won't cause hydration errors
  const cartTotal = useMemo(() => {
	if (!mounted || !items || !Array.isArray(items) || items.length === 0) {
	  return '0.00';
	}

	try {
	  const total = items.reduce((sum, item) => {
		const price = Number(item.price) || 0;
		const quantity = Number(item.quantity) || 0;
		return sum + price * quantity;
	  }, 0);

	  return total.toFixed(2);
	} catch (error) {
	  return '0.00';
	}
  }, [items, mounted]);

  // Handle scroll effect
  useEffect(() => {
	const handleScroll = () => {
	  setScrolled(window.scrollY > 20);
	};
	window.addEventListener('scroll', handleScroll);
	return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
	const handleClickOutside = (event) => {
	  if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
		setIsUserMenuOpen(false);
	  }
	  if (cartRef.current && !cartRef.current.contains(event.target)) {
		setIsCartOpen(false);
	  }
	};
	document.addEventListener('mousedown', handleClickOutside);
	return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus search when opened
  useEffect(() => {
	if (isSearchOpen && searchInputRef.current) {
	  setTimeout(() => searchInputRef.current?.focus(), 100);
	}
  }, [isSearchOpen]);

  const handleSearch = (e) => {
	e.preventDefault();
	if (searchQuery.trim()) {
	  router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
	  setIsSearchOpen(false);
	  setIsMenuOpen(false);
	  setSearchQuery('');
	}
  };

  const handleQuickSearch = (term) => {
	setSearchQuery(term);
	router.push(`/search?q=${encodeURIComponent(term)}`);
	setIsSearchOpen(false);
	setIsMenuOpen(false);
  };

  const userMenuItems =
	user?.role === 'admin'
	  ? [
		  {
			icon: <Package size={18} />,
			label: 'Admin Panel',
			href: '/admin',
			badge: 'Admin',
		  },
		  {
			icon: <Settings size={18} />,
			label: 'Settings',
			href: '/settings',
		  },
		  {
			icon: <Bell size={18} />,
			label: 'Notifications',
			href: '/notifications',
			badge: '3',
		  },
		  { divider: true },
		  {
			icon: <LogOut size={18} />,
			label: 'Logout',
			action: () => signOut({ callbackUrl: '/' }),
		  },
		]
	  : [
		  {
			icon: <UserCircle size={18} />,
			label: 'My Profile',
			href: '/user/profile',
		  },
		  {
			icon: <PackageOpen size={18} />,
			label: 'My Orders',
			href: '/orders',
			badge: '2',
		  },
		  {
			icon: <Heart size={18} />,
			label: 'Wishlist',
			href: '/wishlist',
			badge: '3',
		  },
		  {
			icon: <History size={18} />,
			label: 'Order History',
			href: '/order-history',
		  },
		  {
			icon: <CreditCard size={18} />,
			label: 'Payment Methods',
			href: '/payments',
		  },
		  {
			icon: <Settings size={18} />,
			label: 'Settings',
			href: '/settings',
		  },
		  { divider: true },
		  {
			icon: <HelpCircle size={18} />,
			label: 'Help Center',
			href: '/help',
		  },
		  {
			icon: <Truck size={18} />,
			label: 'Track Order',
			href: '/track-order',
		  },
		  { divider: true },
		  {
			icon: <LogOut size={18} />,
			label: 'Logout',
			action: () => signOut({ callbackUrl: '/' }),
		  },
		];

  return (
	<>
	  <TopBar />

	  {/* ================= SEARCH OVERLAY ================= */}
	  {isSearchOpen && (
		<div className="fixed inset-0 z-50 bg-white animate-fadeIn">
		  <div className="max-w-4xl mx-auto px-4 pt-20 pb-8">
			<div className="flex items-center justify-between mb-8">
			  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
				What are you looking for?
			  </h2>
			  <button
				onClick={() => setIsSearchOpen(false)}
				className="p-2 hover:bg-gray-100 rounded-full transition-colors"
				aria-label="Close search"
			  >
				<X size={28} className="text-gray-600" />
			  </button>
			</div>

			<form onSubmit={handleSearch} className="relative mb-10">
			  <input
				ref={searchInputRef}
				type="text"
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				placeholder="Search products, brands, and categories..."
				className="w-full p-4 pl-14 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
				autoFocus
			  />
			  <Search
				className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400"
				size={24}
			  />
			  <button
				type="submit"
				className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-gray-700 transition-colors font-medium"
			  >
				Search
			  </button>
			</form>

			<div className="mb-8">
			  <h3 className="text-lg font-semibold mb-4 text-gray-800">
				Trending Searches
			  </h3>
			  <div className="flex flex-wrap gap-3">
				{[
				  'iPhone 15',
				  'Laptop Gaming',
				  'Headphones',
				  'Smart Watch',
				  'Running Shoes',
				  'Backpack',
				].map((term) => (
				  <button
					key={term}
					onClick={() => handleQuickSearch(term)}
					className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-700"
				  >
					<Search size={14} />
					{term}
				  </button>
				))}
			  </div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			  <div>
				<h4 className="font-semibold mb-3 text-gray-700">
				  Popular Categories
				</h4>
				<div className="space-y-2">
				  {categories.slice(0, 5).map((cat) => (
					<button
					  key={cat.name}
					  onClick={() => handleQuickSearch(cat.name)}
					  className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-lg transition-colors"
					>
					  <span className="text-xl">{cat.icon}</span>
					  <span className="text-gray-700">{cat.name}</span>
					</button>
				  ))}
				</div>
			  </div>
			  <div>
				<h4 className="font-semibold mb-3 text-gray-700">
				  Recently Viewed
				</h4>
				<div className="space-y-2 text-gray-600">
				  <p className="p-3">No recent searches</p>
				</div>
			  </div>
			</div>
		  </div>
		</div>
	  )}

	  {/* ================= CART DRAWER ================= */}
	  <CardDrawer
		items={items}
		isCartOpen={isCartOpen}
		cartRef={cartRef}
		setIsCartOpen={setIsCartOpen}
		qty={qty}

	  />

	  {/* ================= MAIN HEADER ================= */}
	  <header>
		<div className="mx-auto container">
		  <div
			className={` container mx-auto    transition-all duration-300 z-[999] ${
			  scrolled
				? 'bg-white fixed w-full  duration-300  top-0'
				: 'bg-white  duration-300 top-9 border-b border-gray-100'
			}`}
		  >
			<div className="flex items-center justify-between gap-4">
			  {/* Logo */}
			  <Link
				href="/"
				className="shrink-0 flex items-center gap-3 group"
				onClick={() => setIsMenuOpen(false)}
			  >
				<div className="flex flex-col">
				  <span className="text-2xl font-bold text-gray-900 leading-tight">
					Tomart<span className="text-orange-500">BD</span>
				  </span>
				</div>
			  </Link>

			  {/* Search Bar - Desktop */}
			  <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
				<form onSubmit={handleSearch} className="w-full relative">
				  <input
					type="text"
					placeholder="Search for products, brands, and more..."
					className="w-full p-3.5 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-700 placeholder-gray-400"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				  />
				  <Search
					className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
					size={20}
				  />
				  <button
					type="submit"
					className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
				  >
					Search
				  </button>
				</form>
			  </div>

			  {/* Actions */}
			  <div className="flex items-center gap-2 sm:gap-4">
				{/* Search - Mobile */}
				<button
				  onClick={() => setIsSearchOpen(true)}
				  className="lg:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
				  aria-label="Search"
				>
				  <Search size={22} className="text-gray-600" />
				</button>

				{/* Wishlist */}
				<Link
				  href="/wishlist"
				  className="hidden sm:flex items-center gap-2 p-2.5 hover:bg-gray-50 rounded-xl transition-colors group relative"
				  aria-label="Wishlist"
				>
				  <div className="relative">
					<Heart
					  size={22}
					  className="text-gray-600 group-hover:text-red-500 group-hover:fill-red-500 transition-colors"
					/>
					{mounted && (
					  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
						<span className="text-xs text-white font-bold">3</span>
					  </div>
					)}
				  </div>
				  <span className="text-sm font-medium text-gray-700 hidden xl:inline">
					Wishlist
				  </span>
				</Link>

				{/* Cart - FIXED: Safe cart total display */}
				<button
				  onClick={() => setIsCartOpen(true)}
				  className="relative flex items-center gap-2 p-2.5 hover:bg-gray-50 rounded-xl transition-colors group"
				  aria-label="Open cart"
				>
				  <div className="relative">
					<ShoppingCart
					  size={22}
					  className="text-gray-600 group-hover:text-blue-600 transition-colors"
					/>
					{mounted && qty > 0 && (
					  <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white">
						<span className="text-xs text-white font-bold">
						  {qty}
						</span>
					  </div>
					)}
				  </div>
				  <div className="hidden xl:block text-left">
					<span className="text-sm font-medium text-gray-700">
					  Cart
					</span>
					<p className="text-xs text-gray-500">${cartTotal}</p>
				  </div>
				</button>

				{/* User Account */}
				<div className="relative" ref={userMenuRef}>
				  {user ? (
					<>
					  <button
						onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
						className="hidden sm:flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors group"
						aria-label="Account menu"
					  >
						<div className="w-9 h-9 rounded-full overflow-hidden border-2 border-transparent group-hover:border-blue-200 transition-colors">
						  {user.image ? (
							<Image
							  src={user.image}
							  alt={user.name}
							  width={36}
							  height={36}
							  className="w-full h-full object-cover"
							/>
						  ) : (
							<div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
							  <User size={18} className="text-blue-600" />
							</div>
						  )}
						</div>
						<div className="hidden xl:block text-left">
						  <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
							Hi, {user.name?.split(' ')[0]}
						  </p>
						  <p className="text-xs text-gray-500">
							{user.role === 'admin'
							  ? 'Administrator'
							  : 'Premium Member'}
						  </p>
						</div>
						<ChevronDown
						  size={16}
						  className={`text-gray-400 transition-transform ${
							isUserMenuOpen ? 'rotate-180' : ''
						  }`}
						/>
					  </button>

					  {/* User Dropdown */}
					  {isUserMenuOpen && (
						<div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-fadeIn">
						  <div className="px-4 py-3 border-b border-gray-100">
							<div className="flex items-center gap-3">
							  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
								{user.image ? (
								  <Image
									src={user.image}
									alt={user.name}
									width={40}
									height={40}
									className="w-full h-full object-cover"
								  />
								) : (
								  <div className="w-full h-full flex items-center justify-center">
									<User size={20} className="text-blue-600" />
								  </div>
								)}
							  </div>
							  <div className="flex-1 min-w-0">
								<p className="font-semibold text-gray-900 truncate">
								  {user.name}
								</p>
								<p className="text-sm text-gray-500 truncate">
								  {user.email}
								</p>
							  </div>
							</div>
							<div className="mt-2 flex items-center gap-2">
							  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
								<Shield size={10} />
								{user.role === 'admin'
								  ? 'Administrator'
								  : 'Premium'}
							  </span>
							  <span className="text-xs text-gray-500">
								Member since 2024
							  </span>
							</div>
						  </div>

						  <div className="py-2 max-h-[60vh] overflow-y-auto">
							{userMenuItems.map((item, index) => (
							  <div key={index}>
								{item.divider ? (
								  <div className="border-t border-gray-100 my-2" />
								) : item.href ? (
								  <Link
									href={item.href}
									className="flex items-center justify-between gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors group/item"
									onClick={() => setIsUserMenuOpen(false)}
								  >
									<div className="flex items-center gap-3">
									  <div className="text-gray-400 group-hover/item:text-blue-600">
										{item.icon}
									  </div>
									  <span className="font-medium">
										{item.label}
									  </span>
									</div>
									{item.badge && (
									  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
										{item.badge}
									  </span>
									)}
								  </Link>
								) : (
								  <button
									onClick={() => {
									  item.action?.();
									  setIsUserMenuOpen(false);
									}}
									className="flex items-center justify-between w-full px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors text-left"
								  >
									<div className="flex items-center gap-3">
									  {item.icon}
									  <span className="font-medium">
										{item.label}
									  </span>
									</div>
								  </button>
								)}
							  </div>
							))}
						  </div>
						</div>
					  )}

					  {/* Mobile User Button */}
					  <Link
						href="/user/profile"
						className="sm:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
						aria-label="User account"
					  >
						<User size={22} className="text-gray-600" />
					  </Link>
					</>
				  ) : (
					<Link
					  href="/auth/login"
					  className="hidden sm:flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-xl transition-all duration-300 group"
					  aria-label="Login"
					>
					  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-blue-300 transition-colors">
						<User size={16} className="text-blue-600" />
					  </div>
					  <div className="hidden xl:block text-left">
						<p className="text-sm font-medium text-gray-900">
						  Sign In
						</p>
						<p className="text-xs text-gray-500">
						  Account & Orders
						</p>
					  </div>
					</Link>
				  )}
				</div>

				{/* Mobile Menu Toggle */}
				<button
				  onClick={() => setIsMenuOpen(!isMenuOpen)}
				  className="lg:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
				  aria-label="Menu"
				>
				  {isMenuOpen ? (
					<X size={22} className="text-gray-600" />
				  ) : (
					<Menu size={22} className="text-gray-600" />
				  )}
				</button>
			  </div>
			</div>
		  </div>
		</div>
		{/* Navigation Menu (Desktop) */}
		<nav className="hidden lg:flex items-center justify-between py-3 mt-2 border-t border-gray-100 container mx-auto">
		  <div className="flex items-center gap-1">
			<HeaderNavigation />
		  </div>

		  <div className="flex items-center gap-6 text-sm">
			<div className="flex items-center gap-2 text-blue-600">
			  <Phone size={16} />
			  <span className="font-medium">Support: 09678-123456</span>
			</div>
			<Link
			  href="/track-order"
			  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
			>
			  <Truck size={16} />
			  <span>Track Order</span>
			</Link>
			<Link
			  href="/help"
			  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
			>
			  <HelpCircle size={16} />
			  <span>Help Center</span>
			</Link>
		  </div>
		</nav>
		{/* Mobile Menu */}
		<div
		  className={`lg:hidden fixed inset-0 z-30 bg-white transform transition-transform duration-300 ease-in-out ${
			isMenuOpen ? 'translate-x-0' : 'translate-x-full'
		  }`}
		>
		  <div className="flex flex-col h-full overflow-y-auto">
			{/* Mobile Header */}
			<div className="flex items-center justify-between p-4 border-b border-gray-200">
			  <Link
				href="/"
				className="flex items-center gap-3"
				onClick={() => setIsMenuOpen(false)}
			  >
				<div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
				  <span className="text-white font-bold text-xl">T</span>
				</div>
				<span className="text-xl font-bold">
				  Tomart<span className="text-orange-500">BD</span>
				</span>
			  </Link>
			  <button
				onClick={() => setIsMenuOpen(false)}
				className="p-2 hover:bg-gray-100 rounded-lg"
			  >
				<X size={24} />
			  </button>
			</div>

			{/* Mobile Navigation */}
			<div className="flex-1 overflow-y-auto">
			  <div className="p-4">
				<MobileHeaderNavigation />
			  </div>
			</div>
		  </div>
		</div>
	  </header>
	</>
  );
}
