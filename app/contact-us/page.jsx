'use client';

import React, { useState } from 'react';
import {
	Mail,
	Phone,
	MapPin,
	Clock,
	Send,
	CheckCircle,
	MessageSquare,
	Users,
	Globe,
	Facebook,
	Twitter,
	Instagram,
	Linkedin,
	Loader2,
	AlertCircle,
	ExternalLink,
	Calendar,
	Shield,
} from 'lucide-react';

export default function ContactPage() {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		subject: '',
		message: '',
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [submitError, setSubmitError] = useState('');
	const [errors, setErrors] = useState({});
	const [isTestMode, setIsTestMode] = useState(false);

	const contactInfo = [
		{
			icon: <Mail className="h-6 w-6" />,
			title: 'Email Us',
			details: ['hello@yourcompany.com', 'support@yourcompany.com'],
			color: 'bg-blue-500',
			action: 'mailto:hello@yourcompany.com',
		},
		{
			icon: <Phone className="h-6 w-6" />,
			title: 'Call Us',
			details: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
			color: 'bg-green-500',
			action: 'tel:+15551234567',
		},
		{
			icon: <MapPin className="h-6 w-6" />,
			title: 'Visit Us',
			details: [
				'123 Business Street',
				'New York, NY 10001',
				'United States',
			],
			color: 'bg-purple-500',
			action: 'https://maps.google.com/?q=123+Business+Street+New+York+NY+10001',
		},
		{
			icon: <Clock className="h-6 w-6" />,
			title: 'Business Hours',
			details: [
				'Mon-Fri: 9:00 AM - 6:00 PM',
				'Sat: 10:00 AM - 4:00 PM',
				'Sun: Closed',
			],
			color: 'bg-orange-500',
		},
	];

	const socialLinks = [
		{
			icon: <Facebook className="h-5 w-5" />,
			label: 'Facebook',
			href: 'https://facebook.com/yourcompany',
		},
		{
			icon: <Twitter className="h-5 w-5" />,
			label: 'Twitter',
			href: 'https://twitter.com/yourcompany',
		},
		{
			icon: <Instagram className="h-5 w-5" />,
			label: 'Instagram',
			href: 'https://instagram.com/yourcompany',
		},
		{
			icon: <Linkedin className="h-5 w-5" />,
			label: 'LinkedIn',
			href: 'https://linkedin.com/company/yourcompany',
		},
	];

	const faqs = [
		{
			question: 'How quickly do you respond to inquiries?',
			answer: 'We typically respond within 1-2 business hours during our working hours. Urgent matters are prioritized.',
		},
		{
			question: 'Do you offer 24/7 support?',
			answer: 'We offer 24/7 emergency support for our premium clients. Basic support is available during business hours.',
		},
		{
			question: 'Can I schedule a call with your team?',
			answer: 'Yes! Use our booking system or contact us to schedule a consultation at your convenience.',
		},
		{
			question: 'What information should I include in my message?',
			answer: 'Please include your name, contact details, and a clear description of your inquiry or project requirements.',
		},
	];

	const departments = [
		{
			name: 'Sales',
			email: 'sales@yourcompany.com',
			phone: '+1 (555) 123-4000',
			description: 'For pricing, quotes, and partnership inquiries',
		},
		{
			name: 'Support',
			email: 'support@yourcompany.com',
			phone: '+1 (555) 123-5000',
			description: 'Technical support and product assistance',
		},
		{
			name: 'Careers',
			email: 'careers@yourcompany.com',
			phone: '+1 (555) 123-6000',
			description: 'Job opportunities and recruitment',
		},
	];

	const validateForm = () => {
		const newErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = 'Name is required';
		} else if (formData.name.trim().length < 2) {
			newErrors.name = 'Name must be at least 2 characters';
		}

		if (!formData.email.trim()) {
			newErrors.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = 'Please enter a valid email address';
		}

		if (
			formData.phone &&
			!/^[\+]?[1-9][\d]{0,15}$/.test(
				formData.phone.replace(/[\s\-\(\)]/g, '')
			)
		) {
			newErrors.phone = 'Please enter a valid phone number';
		}

		if (!formData.message.trim()) {
			newErrors.message = 'Message is required';
		} else if (formData.message.trim().length < 10) {
			newErrors.message = 'Message must be at least 10 characters';
		} else if (formData.message.trim().length > 2000) {
			newErrors.message = 'Message must be less than 2000 characters';
		}

		return newErrors;
	};

	const handleChange = (e) => {
		const { name, value } = e.target;

		// Format phone number as user types
		if (name === 'phone') {
			const digits = value.replace(/\D/g, '');
			let formatted = digits;
			if (digits.length > 0) {
				formatted = `+${digits.substring(0, Math.min(digits.length, 15))}`;
			}
			setFormData((prev) => ({ ...prev, [name]: formatted }));
		} else {
			setFormData((prev) => ({ ...prev, [name]: value }));
		}

		// Clear errors when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: '' }));
		}

		// Clear submit error when form changes
		if (submitError) {
			setSubmitError('');
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Clear previous errors
		setSubmitError('');

		const validationErrors = validateForm();

		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);

			// Scroll to first error
			const firstErrorField = Object.keys(validationErrors)[0];
			const element = document.getElementById(firstErrorField);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth', block: 'center' });
				element.focus();
			}
			return;
		}

		setIsSubmitting(true);

		try {
			// Test mode: Log to console instead of sending
			if (isTestMode) {
				console.log('Test mode - Form data:', formData);
				await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay
			} else {
				// Production: Send to API
				const response = await fetch('/api/contact', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(formData),
				});

				const result = await response.json();

				if (!response.ok) {
					throw new Error(
						result.message ||
							`Failed to send message. Status: ${response.status}`
					);
				}

				if (!result.success) {
					throw new Error(result.message || 'Failed to send message');
				}
			}

			// Success
			setIsSubmitting(false);
			setIsSubmitted(true);
			setFormData({
				name: '',
				email: '',
				phone: '',
				subject: '',
				message: '',
			});
			setErrors({});

			// Scroll to success message
			window.scrollTo({ top: 0, behavior: 'smooth' });

			// Reset success message after 8 seconds
			setTimeout(() => setIsSubmitted(false), 8000);
		} catch (error) {
			console.error('Error submitting form:', error);
			setIsSubmitting(false);
			setSubmitError(
				error.message ||
					'Failed to send message. Please try again or use email directly.'
			);

			// Scroll to error
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	const testEmailConfig = async () => {
		try {
			const response = await fetch('/api/contact');
			const result = await response.json();

			if (result.success) {
				alert(
					`Email configuration is working!\n\nStatus: ${result.message}\nEnvironment: ${result.environment}\nEmail Configured: ${result.emailConfigured ? 'Yes' : 'No'}`
				);
			} else {
				alert(`Email configuration test failed:\n\n${result.message}`);
			}
		} catch (error) {
			alert(
				'Failed to test email configuration. Check console for details.'
			);
			console.error('Test error:', error);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
			{/* Success Banner */}
			{isSubmitted && (
				<div className="sticky top-0 z-50 bg-gradient-to-r from-green-500 to-emerald-600">
					<div className="max-w-7xl mx-auto px-4 py-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<CheckCircle className="h-6 w-6 text-white" />
								<p className="text-white font-medium">
									Thank you! Your message has been sent
									successfully. We'll contact you soon.
								</p>
							</div>
							<button
								onClick={() => setIsSubmitted(false)}
								className="text-white hover:text-green-100 transition-colors">
								<span className="sr-only">Dismiss</span>
								<svg
									className="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Error Banner */}
			{submitError && (
				<div className="sticky top-0 z-50 bg-gradient-to-r from-red-500 to-rose-600">
					<div className="max-w-7xl mx-auto px-4 py-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<AlertCircle className="h-6 w-6 text-white" />
								<p className="text-white font-medium">
									{submitError}
								</p>
							</div>
							<button
								onClick={() => setSubmitError('')}
								className="text-white hover:text-red-100 transition-colors">
								<span className="sr-only">Dismiss</span>
								<svg
									className="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Hero Section */}
			<div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700">
				<div className="absolute inset-0 bg-black/10" />
				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
					<div className="text-center">
						<h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
							Get in Touch
						</h1>
						<p className="text-xl text-blue-100 max-w-3xl mx-auto">
							We'd love to hear from you. Send us a message and
							we'll respond as soon as possible.
						</p>
						<div className="mt-8 flex flex-wrap items-center justify-center gap-4">
							<div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
								<Shield className="h-4 w-4 text-blue-200" />
								<span className="text-blue-100 text-sm">
									Your data is secure
								</span>
							</div>
							<div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
								<CheckCircle className="h-4 w-4 text-blue-200" />
								<span className="text-blue-100 text-sm">
									Response within 24h
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
				{/* Development Mode Alert */}
				{process.env.NODE_ENV === 'development' && (
					<div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
						<div className="flex items-start">
							<AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
							<div className="flex-1">
								<h3 className="text-sm font-medium text-yellow-800">
									Development Mode
								</h3>
								<div className="mt-2 text-sm text-yellow-700">
									<p>
										Email functionality is in test mode.
										Form submissions will be logged to
										console.
									</p>
									<div className="mt-3 flex items-center gap-4">
										<label className="inline-flex items-center">
											<input
												type="checkbox"
												checked={isTestMode}
												onChange={(e) =>
													setIsTestMode(
														e.target.checked
													)
												}
												className="rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500"
											/>
											<span className="ml-2 text-sm">
												Enable test mode
											</span>
										</label>
										<button
											onClick={testEmailConfig}
											className="text-sm text-yellow-700 hover:text-yellow-800 underline">
											Test email configuration
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Contact Methods Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
					{contactInfo.map((item, index) => (
						<div
							key={index}
							className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100">
							<div className={`${item.color} p-6`}>
								<div className="inline-flex items-center justify-center p-3 bg-white/20 rounded-xl backdrop-blur-sm">
									{React.cloneElement(item.icon, {
										className: 'h-6 w-6 text-white',
									})}
								</div>
							</div>
							<div className="p-6">
								<h3 className="text-xl font-semibold text-gray-900 mb-3">
									{item.title}
								</h3>
								<div className="space-y-2">
									{item.details.map((detail, idx) => (
										<p key={idx} className="text-gray-600">
											{detail}
										</p>
									))}
								</div>
								{item.action && (
									<a
										href={item.action}
										className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium group-hover:gap-3 transition-all"
										target={
											item.action.startsWith('http')
												? '_blank'
												: '_self'
										}
										rel={
											item.action.startsWith('http')
												? 'noopener noreferrer'
												: ''
										}>
										Contact via {item.title.split(' ')[0]}
										<ExternalLink className="h-4 w-4" />
									</a>
								)}
							</div>
						</div>
					))}
				</div>

				{/* Departments */}
				<div className="mb-12">
					<div className="flex items-center gap-3 mb-6">
						<div className="p-2 bg-indigo-100 rounded-lg">
							<Users className="h-6 w-6 text-indigo-600" />
						</div>
						<h2 className="text-2xl font-bold text-gray-900">
							Contact Specific Departments
						</h2>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{departments.map((dept, index) => (
							<div
								key={index}
								className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 transition-colors">
								<h3 className="font-bold text-lg text-gray-900 mb-2">
									{dept.name}
								</h3>
								<p className="text-gray-600 text-sm mb-4">
									{dept.description}
								</p>
								<div className="space-y-2">
									<a
										href={`mailto:${dept.email}`}
										className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm">
										<Mail className="h-4 w-4" />
										{dept.email}
									</a>
									<a
										href={`tel:${dept.phone.replace(/[^+\d]/g, '')}`}
										className="flex items-center gap-2 text-gray-700 hover:text-gray-900 text-sm">
										<Phone className="h-4 w-4" />
										{dept.phone}
									</a>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Main Content */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
					{/* Contact Form */}
					<div className="lg:col-span-2">
						<div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
							<div className="flex items-center justify-between mb-8">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-blue-100 rounded-lg">
										<MessageSquare className="h-6 w-6 text-blue-600" />
									</div>
									<h2 className="text-2xl font-bold text-gray-900">
										Send us a message
									</h2>
								</div>
								{isTestMode && (
									<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
										Test Mode
									</span>
								)}
							</div>

							{isSubmitted ? (
								<div className="text-center py-12">
									<div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-6">
										<CheckCircle className="h-10 w-10 text-green-600" />
									</div>
									<h3 className="text-2xl font-bold text-gray-900 mb-2">
										Message Sent Successfully!
									</h3>
									<p className="text-gray-600 mb-6 max-w-md mx-auto">
										Thank you for reaching out. We've sent a
										confirmation to your email and our team
										will get back to you within 24 hours.
									</p>
									<div className="space-y-4">
										<button
											onClick={() =>
												setIsSubmitted(false)
											}
											className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
											Send Another Message
										</button>
										<p className="text-sm text-gray-500">
											Reference ID: CONTACT-
											{Date.now().toString().slice(-8)}
										</p>
									</div>
								</div>
							) : (
								<form
									onSubmit={handleSubmit}
									className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label
												htmlFor="name"
												className="block text-sm font-medium text-gray-700 mb-2">
												Full Name *
											</label>
											<input
												type="text"
												id="name"
												name="name"
												value={formData.name}
												onChange={handleChange}
												className={`w-full px-4 py-3 border ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
												placeholder="John Doe"
												disabled={isSubmitting}
											/>
											{errors.name && (
												<div className="flex items-center gap-1 mt-2 text-sm text-red-600">
													<AlertCircle className="h-4 w-4" />
													{errors.name}
												</div>
											)}
										</div>
										<div>
											<label
												htmlFor="email"
												className="block text-sm font-medium text-gray-700 mb-2">
												Email Address *
											</label>
											<input
												type="email"
												id="email"
												name="email"
												value={formData.email}
												onChange={handleChange}
												className={`w-full px-4 py-3 border ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
												placeholder="john@example.com"
												disabled={isSubmitting}
											/>
											{errors.email && (
												<div className="flex items-center gap-1 mt-2 text-sm text-red-600">
													<AlertCircle className="h-4 w-4" />
													{errors.email}
												</div>
											)}
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label
												htmlFor="phone"
												className="block text-sm font-medium text-gray-700 mb-2">
												Phone Number (Optional)
											</label>
											<div className="relative">
												<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
													+1
												</span>
												<input
													type="tel"
													id="phone"
													name="phone"
													value={formData.phone}
													onChange={handleChange}
													className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
													placeholder="(555) 123-4567"
													disabled={isSubmitting}
												/>
											</div>
											{errors.phone && (
												<div className="flex items-center gap-1 mt-2 text-sm text-red-600">
													<AlertCircle className="h-4 w-4" />
													{errors.phone}
												</div>
											)}
											<p className="mt-1 text-xs text-gray-500">
												Include country code if
												international
											</p>
										</div>
										<div>
											<label
												htmlFor="subject"
												className="block text-sm font-medium text-gray-700 mb-2">
												Subject *
											</label>
											<select
												id="subject"
												name="subject"
												value={formData.subject}
												onChange={handleChange}
												className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white appearance-none"
												disabled={isSubmitting}>
												<option value="">
													Select a subject
												</option>
												<option value="general">
													General Inquiry
												</option>
												<option value="support">
													Technical Support
												</option>
												<option value="sales">
													Sales Question
												</option>
												<option value="partnership">
													Partnership Opportunity
												</option>
												<option value="feedback">
													Feedback & Suggestions
												</option>
												<option value="press">
													Press & Media
												</option>
												<option value="other">
													Other
												</option>
											</select>
										</div>
									</div>

									<div>
										<div className="flex items-center justify-between mb-2">
											<label
												htmlFor="message"
												className="block text-sm font-medium text-gray-700">
												Your Message *
											</label>
											<span
												className={`text-xs ${formData.message.length > 2000 ? 'text-red-600' : 'text-gray-500'}`}>
												{formData.message.length}/2000
											</span>
										</div>
										<textarea
											id="message"
											name="message"
											value={formData.message}
											onChange={handleChange}
											rows={8}
											className={`w-full px-4 py-3 border ${errors.message ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none font-sans`}
											placeholder="Please describe your inquiry in detail. Include any relevant information that will help us assist you better..."
											disabled={isSubmitting}
										/>
										{errors.message && (
											<div className="flex items-center gap-1 mt-2 text-sm text-red-600">
												<AlertCircle className="h-4 w-4" />
												{errors.message}
											</div>
										)}
										<p className="mt-2 text-xs text-gray-500">
											Provide as much detail as possible
											for a faster response.
										</p>
									</div>

									<div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
										<div className="flex items-start">
											<Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
											<div>
												<p className="text-sm text-blue-800">
													<strong>
														Privacy Notice:
													</strong>{' '}
													Your information is secure
													and will only be used to
													respond to your inquiry. We
													never share your data with
													third parties.
												</p>
											</div>
										</div>
									</div>

									<div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
										<div className="text-sm text-gray-500">
											<p className="flex items-center gap-2">
												<CheckCircle className="h-4 w-4 text-green-500" />
												* Required fields
											</p>
											<p className="mt-1">
												By submitting, you agree to our{' '}
												<a
													href="/privacy"
													className="text-blue-600 hover:text-blue-700 underline">
													Privacy Policy
												</a>
											</p>
										</div>
										<button
											type="submit"
											disabled={isSubmitting}
											className="inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl min-w-[180px]">
											{isSubmitting ? (
												<>
													<Loader2 className="h-5 w-5 animate-spin" />
													<span>Sending...</span>
												</>
											) : (
												<>
													<span>Send Message</span>
													<Send className="h-5 w-5" />
												</>
											)}
										</button>
									</div>
								</form>
							)}
						</div>
					</div>

					{/* Sidebar */}
					<div className="space-y-8">
						{/* Social Links */}
						<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
							<div className="flex items-center gap-3 mb-6">
								<div className="p-2 bg-purple-100 rounded-lg">
									<Users className="h-6 w-6 text-purple-600" />
								</div>
								<h3 className="text-xl font-bold text-gray-900">
									Connect With Us
								</h3>
							</div>
							<div className="space-y-3">
								{socialLinks.map((social, index) => (
									<a
										key={index}
										href={social.href}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-200">
										<div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
											{social.icon}
										</div>
										<div className="flex-1">
											<span className="font-medium text-gray-700">
												{social.label}
											</span>
											<p className="text-xs text-gray-500">
												Follow for updates
											</p>
										</div>
										<ExternalLink className="h-4 w-4 text-gray-400" />
									</a>
								))}
							</div>
						</div>

						{/* FAQ */}
						<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
							<div className="flex items-center gap-3 mb-6">
								<div className="p-2 bg-green-100 rounded-lg">
									<Globe className="h-6 w-6 text-green-600" />
								</div>
								<h3 className="text-xl font-bold text-gray-900">
									Frequently Asked Questions
								</h3>
							</div>
							<div className="space-y-6">
								{faqs.map((faq, index) => (
									<div
										key={index}
										className="border-l-4 border-blue-500 pl-4 py-2 hover:border-blue-600 transition-colors">
										<h4 className="font-semibold text-gray-900 mb-2">
											{faq.question}
										</h4>
										<p className="text-sm text-gray-600">
											{faq.answer}
										</p>
									</div>
								))}
							</div>
							<div className="mt-6 pt-6 border-t border-gray-200">
								<a
									href="/faq"
									className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
									View all FAQs
									<ExternalLink className="h-4 w-4" />
								</a>
							</div>
						</div>

						{/* Map Placeholder */}
						<div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
							<div className="p-6">
								<h3 className="text-xl font-bold text-gray-900 mb-4">
									Find Our Office
								</h3>
								<div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 overflow-hidden">
									<div className="relative w-full h-full">
										<div className="absolute inset-0 flex items-center justify-center">
											<div className="text-center">
												<div className="relative">
													<MapPin className="h-12 w-12 text-blue-500 mx-auto mb-3 animate-pulse" />
													<div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
												</div>
												<p className="text-gray-500 font-medium">
													Interactive map loading...
												</p>
												<p className="text-sm text-gray-400 mt-1">
													123 Business Street, NY
												</p>
											</div>
										</div>
									</div>
								</div>
								<div className="mt-6 space-y-3">
									<a
										href="https://maps.google.com/?q=123+Business+Street+New+York+NY+10001"
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors">
										<MapPin className="h-5 w-5" />
										Open in Google Maps
										<ExternalLink className="h-4 w-4" />
									</a>
									<a
										href="https://www.apple.com/maps/"
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
										<MapPin className="h-5 w-5" />
										Open in Apple Maps
										<ExternalLink className="h-4 w-4" />
									</a>
								</div>
							</div>
						</div>

						{/* Call Scheduling */}
						<div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
							<div className="flex items-center gap-3 mb-4">
								<div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
									<Calendar className="h-6 w-6" />
								</div>
								<h3 className="text-xl font-bold">
									Schedule a Call
								</h3>
							</div>
							<p className="text-blue-100 mb-6">
								Prefer a direct conversation? Book a time that
								works for you.
							</p>
							<a
								href="https://calendly.com/yourcompany"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition-colors">
								<Calendar className="h-5 w-5" />
								Book Appointment
								<ExternalLink className="h-4 w-4" />
							</a>
						</div>
					</div>
				</div>

				{/* Newsletter Signup */}
				<div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 relative overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20"></div>
					<div className="relative max-w-2xl mx-auto text-center">
						<h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
							Stay Updated
						</h2>
						<p className="text-blue-100 mb-8">
							Subscribe to our newsletter for the latest updates,
							tips, and exclusive offers.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
							<input
								type="email"
								placeholder="Enter your email"
								className="flex-1 px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200"
							/>
							<button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg">
								Subscribe
							</button>
						</div>
						<p className="mt-4 text-sm text-blue-200">
							We respect your privacy. Unsubscribe at any time.
						</p>
					</div>
				</div>

				{/* Footer Info */}
				<div className="mt-12 pt-8 border-t border-gray-200">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div>
							<h4 className="font-semibold text-gray-900 mb-3">
								Response Time
							</h4>
							<p className="text-gray-600 text-sm">
								We typically respond within 1-2 business hours
								during our working hours.
							</p>
						</div>
						<div>
							<h4 className="font-semibold text-gray-900 mb-3">
								Emergency Support
							</h4>
							<p className="text-gray-600 text-sm">
								For urgent matters, call our emergency line: +1
								(555) 123-9999
							</p>
						</div>
						<div>
							<h4 className="font-semibold text-gray-900 mb-3">
								Privacy & Security
							</h4>
							<p className="text-gray-600 text-sm">
								All communications are encrypted and secure.
								Read our{' '}
								<a
									href="/privacy"
									className="text-blue-600 hover:text-blue-700 underline">
									Privacy Policy
								</a>
								.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
