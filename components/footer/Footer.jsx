'use client';
import { Mail, Phone, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { socailMediaLinks, contactInfo } from '@/constants';
import { FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
	const [openSection, setOpenSection] = useState(null);

	const toggleSection = (section) => {
		setOpenSection(openSection === section ? null : section);
	};

	const categories = ['মধু', 'ঘি', 'আচার'];

	const customerService = [
		'Help Center',
		'Track Your Order',
		'Returns & Refunds',
		'Shipping Policy',
	];

	const company = [
		'Shop',
		'Contact Us',
		'About Us',
		'Terms & Conditions',
		'Privacy Policy',
	];

	return (
		<footer className="bg-gray-900 text-white">
			{/* Main Footer */}
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
					{/* Brand Section - Always visible */}
					<div className="md:col-span-1">
						<Link
							href="/"
							className="flex items-center gap-2 mb-4 md:mb-6">
							<div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-lg md:text-xl">
									T
								</span>
							</div>
							<span className="text-xl md:text-2xl font-bold">
								Shalban
								<span className="text-orange-500">Food</span>
							</span>
						</Link>

						<p className="text-gray-400 text-sm md:text-base mb-4 md:mb-6 leading-relaxed">
							Bangladesh's fastest growing e-commerce platform.
							Quality products, amazing prices.
						</p>
						<div className="flex gap-3 md:gap-4">
							{socailMediaLinks.map(
								({ name, Icon, link, ariaLabel }) => (
									<a
										key={name}
										href={link}
										className="w-8 h-8 md:w-10 md:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-200"
										aria-label={ariaLabel}>
										<Icon className="w-4 h-4 md:w-5 md:h-5" /> 
									</a>
								)
							)}
						</div>
					</div>

					{/* Mobile Accordion Sections */}
					<div className="md:hidden space-y-4">
						{/* Categories Accordion */}
						<div className="border-b border-gray-800 pb-4">
							<button
								onClick={() => toggleSection('categories')}
								className="flex justify-between items-center w-full text-lg font-bold">
								<span>Shop by Category</span>
								{openSection === 'categories' ? (
									<ChevronUp className="w-5 h-5" />
								) : (
									<ChevronDown className="w-5 h-5" />
								)}
							</button>
							{openSection === 'categories' && (
								<ul className="mt-4 space-y-3 pl-2">
									{categories.map((cat) => (
										<li key={cat}>
											<Link
												href={`/category/${cat.toLowerCase()}`}
												className="text-gray-400 hover:text-white transition-colors duration-200 block py-1">
												{cat}
											</Link>
										</li>
									))}
								</ul>
							)}
						</div>

						{/* Customer Service Accordion */}
						<div className="border-b border-gray-800 pb-4">
							<button
								onClick={() => toggleSection('service')}
								className="flex justify-between items-center w-full text-lg font-bold">
								<span>Customer Service</span>
								{openSection === 'service' ? (
									<ChevronUp className="w-5 h-5" />
								) : (
									<ChevronDown className="w-5 h-5" />
								)}
							</button>
							{openSection === 'service' && (
								<ul className="mt-4 space-y-3 pl-2">
									{customerService.map((service) => (
										<li key={service}>
											<Link
												href={`/${service
													.toLowerCase()
													.replace(/\s+/g, '-')}`}
												className="text-gray-400 hover:text-white transition-colors duration-200 block py-1">
												{service}
											</Link>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>

					{/* Desktop Categories - Hidden on mobile */}
					<div className="hidden md:block">
						<h3 className="text-lg font-bold mb-4 md:mb-6">
							Shop by Category
						</h3>
						<ul className="space-y-2 md:space-y-3">
							{categories.map((cat) => (
								<li key={cat}>
									<Link
										href={`/category/${cat.toLowerCase()}`}
										className="text-gray-400 hover:text-white transition-colors duration-200 text-sm md:text-base">
										{cat}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Desktop Customer Service - Hidden on mobile */}
					<div className="hidden md:block">
						<h3 className="text-lg font-bold mb-4 md:mb-6">
							Customer Service
						</h3>
						<ul className="space-y-2 md:space-y-3">
							{customerService.map((service) => (
								<li key={service}>
									<Link
										href={`/${service
											.toLowerCase()
											.replace(/\s+/g, '-')}`}
										className="text-gray-400 hover:text-white transition-colors duration-200 text-sm md:text-base">
										{service}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Contact Info - Always visible */}
					<div className="mt-4 md:mt-0">
						<h3 className="text-lg font-bold mb-4 md:mb-6">
							Contact Info
						</h3>
						<div className="space-y-3 md:space-y-4">
							<div className="flex items-center gap-3">
								<FaWhatsapp className="w-5 h-5 text-green-400 flex-shrink-0" />
								<a
									href={`tel:{contactInfo.phone}`}
									className="text-gray-400 hover:text-white transition-colors duration-200 text-sm md:text-base">
									{contactInfo.whatsapp}
								</a>
							</div>
							<div className="flex items-center gap-3">
								<Phone className="w-5 h-5 text-green-400 flex-shrink-0" />
								<a
									href="tel:01868944080"
									className="text-gray-400 hover:text-white transition-colors duration-200 text-sm md:text-base">
									{contactInfo.phone}
								</a>
							</div>
							<div className="flex items-center gap-3">
								<Mail className="w-5 h-5 text-orange-400 flex-shrink-0" />
								<a
									href="mailto:support@tomartbd.com"
									className="text-gray-400 hover:text-white transition-colors duration-200 text-sm md:text-base break-all">
									{contactInfo.mail}
								</a>
							</div>
							<div className="flex items-start gap-3">
								<MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
								<span className="text-gray-400 text-sm md:text-base">
									{contactInfo.location}
								</span>
							</div>
						</div>

					
					
					</div>
				</div>
			</div>

		
			<div className="border-t border-gray-800">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<p className="text-gray-400 text-xs md:text-sm text-center md:text-left">
							©{new Date().getFullYear()} Shalban Food. All rights
							reserved.
						</p>
						<div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
							<img
								src="/secure.svg"
								alt="SSL Secure"
								className="h-6 md:h-8"
								loading="lazy"
							/>
							<img
								src="/mastercard.svg"
								alt="Payment Methods"
								className="h-6 md:h-8"
								loading="lazy"
							/>
							<img
								src="/cod.svg"
								alt="Cash on Delivery"
								className="h-6 md:h-8"
								loading="lazy"
							/>
						</div>
					</div>

				


				</div>
			</div>
		</footer>
	);
};

export default Footer;
