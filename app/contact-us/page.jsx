'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
	ArrowRight,
	Clock,
	Mail,
	MapPin,
	MessageCircle,
	Phone,
	Send,
	ShieldCheck,
	ShoppingBag,
} from 'lucide-react';

const BRAND = '#1f5d3b';
const WHATSAPP_NUMBER = '8801603816721';

const contactItems = [
	{
		icon: MessageCircle,
		title: 'WhatsApp',
		description: 'অর্ডার ও পণ্য সম্পর্কে সরাসরি কথা বলুন।',
		value: '01603816721',
		href: `https://wa.me/${WHATSAPP_NUMBER}`,
		action: 'WhatsApp-এ যোগাযোগ',
	},
	{
		icon: Mail,
		title: 'Email',
		description: 'ব্যবসায়িক ও সাধারণ যোগাযোগের জন্য।',
		value: 'shalbanfood@gmail.com',
		href: 'mailto:shalbanfood@gmail.com',
		action: 'ইমেইল পাঠান',
	},
	{
		icon: MapPin,
		title: 'আমাদের ঠিকানা',
		description: 'আমাদের কার্যক্রমের অবস্থান।',
		value: 'Madhupur, Tangail, Bangladesh',
		href: 'https://www.google.com/maps/search/?api=1&query=Madhupur+Tangail+Bangladesh',
		action: 'ঠিকানা দেখুন',
	},
];

export default function ContactUsPage() {
	const [form, setForm] = useState({
		name: '',
		email: '',
		phone: '',
		subject: '',
		message: '',
	});

	const handleChange = (e) => {
		const { name, value } = e.target;

		setForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		const whatsappMessage = [
			'Shalban Food - Customer Message',
			'',
			`নাম: ${form.name}`,
			`ইমেইল: ${form.email || 'দেওয়া হয়নি'}`,
			`ফোন: ${form.phone}`,
			`বিষয়: ${form.subject || 'সাধারণ জিজ্ঞাসা'}`,
			'',
			'মেসেজ:',
			form.message,
		].join('\n');

		const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
			whatsappMessage
		)}`;

		window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
	};

	const inputClass =
		'w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#1f5d3b] focus:bg-white focus:ring-2 focus:ring-[#1f5d3b]/10';

	return (
		<main className="min-h-screen bg-[#fafcf9] text-gray-800">
			{/* Header */}
			<section className="border-b border-gray-100 bg-white">
				<div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
					<nav
						aria-label="Breadcrumb"
						className="flex items-center gap-2 text-xs sm:text-sm">
						<Link
							href="/"
							className="text-gray-500 transition hover:text-[#1f5d3b]">
							Home
						</Link>

						<span className="text-gray-300">/</span>

						<span
							className="font-medium text-gray-800"
							aria-current="page">
							Contact Us
						</span>
					</nav>
				</div>
			</section>

			{/* Hero */}
			<section className="bg-[#f0f5ef]">
				<div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 sm:py-14">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#1f5d3b] shadow-sm">
						<MessageCircle size={25} />
					</div>

					<p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[#1f5d3b]">
						Shalban Food
					</p>

					<h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
						যোগাযোগ করুন
					</h1>

					<p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-gray-600 sm:text-base">
						পণ্য, অর্ডার, ডেলিভারি অথবা যেকোনো তথ্যের জন্য আমাদের
						সঙ্গে যোগাযোগ করুন। আপনাকে সহযোগিতা করতে আমরা প্রস্তুত।
					</p>

					<p className="mt-3 text-xs font-medium text-[#1f5d3b]">
						স্বাদের সাথে আস্থার বন্ধন
					</p>
				</div>
			</section>

			{/* Main Content */}
			<section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
				<div className="grid items-start gap-7 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
					{/* Contact Form */}
					<div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
						<div className="mb-6">
							<p className="text-xs font-bold uppercase tracking-wider text-[#1f5d3b]">
								Send a Message
							</p>

							<h2 className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">
								আমাদের মেসেজ করুন
							</h2>

							<p className="mt-2 text-sm leading-6 text-gray-500">
								নিচের ফর্মটি পূরণ করে সরাসরি WhatsApp-এ আপনার
								মেসেজ পাঠাতে পারবেন।
							</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<label
										htmlFor="name"
										className="mb-2 block text-sm font-medium text-gray-700">
										আপনার নাম *
									</label>

									<input
										id="name"
										type="text"
										name="name"
										value={form.name}
										onChange={handleChange}
										required
										autoComplete="name"
										placeholder="আপনার পুরো নাম"
										className={inputClass}
									/>
								</div>

								<div>
									<label
										htmlFor="phone"
										className="mb-2 block text-sm font-medium text-gray-700">
										মোবাইল নম্বর *
									</label>

									<input
										id="phone"
										type="tel"
										name="phone"
										value={form.phone}
										onChange={handleChange}
										required
										autoComplete="tel"
										placeholder="01XXXXXXXXX"
										className={inputClass}
									/>
								</div>
							</div>

							<div>
								<label
									htmlFor="email"
									className="mb-2 block text-sm font-medium text-gray-700">
									ইমেইল
								</label>

								<input
									id="email"
									type="email"
									name="email"
									value={form.email}
									onChange={handleChange}
									autoComplete="email"
									placeholder="name@example.com"
									className={inputClass}
								/>
							</div>

							<div>
								<label
									htmlFor="subject"
									className="mb-2 block text-sm font-medium text-gray-700">
									বিষয়
								</label>

								<select
									id="subject"
									name="subject"
									value={form.subject}
									onChange={handleChange}
									className={inputClass}>
									<option value="">বিষয় নির্বাচন করুন</option>
									<option value="অর্ডার সম্পর্কিত">
										অর্ডার সম্পর্কিত
									</option>
									<option value="পণ্য সম্পর্কিত">
										পণ্য সম্পর্কিত
									</option>
									<option value="ডেলিভারি সম্পর্কিত">
										ডেলিভারি সম্পর্কিত
									</option>
									<option value="পাইকারি অর্ডার">
										পাইকারি অর্ডার
									</option>
									<option value="অন্যান্য">অন্যান্য</option>
								</select>
							</div>

							<div>
								<label
									htmlFor="message"
									className="mb-2 block text-sm font-medium text-gray-700">
									আপনার মেসেজ *
								</label>

								<textarea
									id="message"
									name="message"
									value={form.message}
									onChange={handleChange}
									required
									rows={5}
									placeholder="আপনার মেসেজ লিখুন..."
									className={`${inputClass} resize-y`}
								/>
							</div>

							<button
								type="submit"
								className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1f5d3b] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#17472d] active:scale-[0.99]">
								<Send size={17} />
								WhatsApp-এ মেসেজ পাঠান
								<ArrowRight size={17} />
							</button>

							<p className="text-center text-xs text-gray-400">
								আপনার মেসেজ WhatsApp-এর মাধ্যমে পাঠানো হবে।
							</p>
						</form>
					</div>

					{/* Contact Information */}
					<div className="space-y-4">
						<div className="mb-5">
							<p className="text-xs font-bold uppercase tracking-wider text-[#1f5d3b]">
								Get in Touch
							</p>

							<h2 className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">
								আমাদের সঙ্গে যোগাযোগ
							</h2>

							<p className="mt-2 text-sm leading-6 text-gray-500">
								আপনার প্রয়োজনে নিচের যেকোনো মাধ্যমে আমাদের সঙ্গে
								যোগাযোগ করতে পারেন।
							</p>
						</div>

						{contactItems.map((item) => {
							const Icon = item.icon;

							return (
								<div
									key={item.title}
									className="group rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-green-100 hover:shadow-md">
									<div className="flex items-start gap-4">
										<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf5ee] text-[#1f5d3b] transition group-hover:bg-[#1f5d3b] group-hover:text-white">
											<Icon size={21} />
										</div>

										<div className="min-w-0 flex-1">
											<h3 className="text-base font-bold text-gray-900">
												{item.title}
											</h3>

											<p className="mt-1 text-xs leading-6 text-gray-500">
												{item.description}
											</p>

											<p className="mt-2 break-words text-sm font-semibold text-[#1f5d3b]">
												{item.value}
											</p>

											<a
												href={item.href}
												target={
													item.href.startsWith(
														'https://'
													)
														? '_blank'
														: undefined
												}
												rel={
													item.href.startsWith(
														'https://'
													)
														? 'noopener noreferrer'
														: undefined
												}
												className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gray-600 transition hover:text-[#1f5d3b]">
												{item.action}
												<ArrowRight size={14} />
											</a>
										</div>
									</div>
								</div>
							);
						})}

						{/* Support Card */}
						<div className="rounded-xl bg-[#1f5d3b] p-6 text-white">
							<div className="flex items-center gap-2">
								<ShieldCheck size={20} />
								<h3 className="text-base font-bold">
									Shalban Food
								</h3>
							</div>

							<p className="mt-3 text-sm leading-7 text-green-50">
								খাঁটি মধু, গাওয়া ঘি, নাটমিক্স ও প্রাকৃতিক
								খাদ্যপণ্য—আপনার পরিবারের জন্য মানসম্মত খাবার
								পৌঁছে দিতে আমরা কাজ করছি।
							</p>

							<Link
								href="/shop"
								className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#1f5d3b] transition hover:bg-green-50">
								<ShoppingBag size={16} />
								আমাদের পণ্য দেখুন
								<ArrowRight size={16} />
							</Link>
						</div>

						{/* Business Hours */}
						<div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-[#1f5d3b]">
								<Clock size={19} />
							</div>

							<div>
								<p className="text-sm font-semibold text-gray-800">
									যোগাযোগের সময়
								</p>

								<p className="mt-1 text-xs text-gray-500">
									WhatsApp-এ আপনার সুবিধামতো মেসেজ পাঠাতে
									পারেন।
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Bottom CTA */}
			<section className="border-t border-gray-100 bg-white py-7">
				<div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
					<div>
						<h2 className="text-base font-bold text-gray-900">
							আপনার আস্থাই আমাদের শক্তি
						</h2>

						<p className="mt-1 text-xs text-gray-500">
							স্বাদের সাথে আস্থার বন্ধন — Shalban Food
						</p>
					</div>

					<a
						href={`https://wa.me/${WHATSAPP_NUMBER}`}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 rounded-lg bg-[#1f5d3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17472d]">
						<MessageCircle size={17} />
						সরাসরি যোগাযোগ করুন
					</a>
				</div>
			</section>
		</main>
	);
}
