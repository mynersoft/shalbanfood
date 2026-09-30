'use client';

import {
        Mail,
        Phone,
        MapPin,
        ChevronDown,
        ChevronUp,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { socailMediaLinks, contactInfo } from '@/constants';
import { FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
        const [openSection, setOpenSection] = useState(null);

        const toggleSection = (section) => {
                setOpenSection(openSection === section ? null : section);
        };

        const categories = [
                {
                        name: 'মধু',
                        slug: 'modhu',
                },
                {
                        name: 'ঘি',
                        slug: 'ghee',
                },
                {
                        name: 'আচার',
                        slug: 'achar',
                },
                {
                        name: 'নাটমিক্স',
                        slug: 'nut-mix',
                },
        ];

        const customerService = [
                {
                        name: 'Help Center',
                        slug: 'help-center',
                },
                {
                        name: 'Track Your Order',
                        slug: 'track-your-order',
                },
                {
                        name: 'Returns & Refunds',
                        slug: 'returns-refunds',
                },
                {
                        name: 'Shipping Policy',
                        slug: 'shipping-policy',
                },
        ];

        const company = [
                {
                        name: 'Shop',
                        slug: 'shop',
                },
                {
                        name: 'Contact Us',
                        slug: 'contact-us',
                },
                {
                        name: 'About Us',
                        slug: 'about-us',
                },
                {
                        name: 'Terms & Conditions',
                        slug: 'terms-conditions',
                },
                {
                        name: 'Privacy Policy',
                        slug: 'privacy-policy',
                },
        ];

        return (
                <footer className="bg-white text-gray-800 border-t border-gray-200">

                        {/* Main Footer */}
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">

                                        {/* Brand Section */}
                                        <div>
                                                <Link
                                                        href="/"
                                                        className="inline-flex items-center gap-2 mb-4"
                                                >
                                                        <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shadow-sm">
                                                                <span className="text-white font-bold text-xl">
                                                                        S
                                                                </span>
                                                        </div>

                                                        <span className="text-2xl font-bold text-gray-900">
                                                                Shalban
                                                                <span className="text-green-600">
                                                                        Food
                                                                </span>
                                                        </span>
                                                </Link>

                                                <p className="text-gray-500 text-sm md:text-base leading-7 mb-5 max-w-sm">
                                                        খাঁটি মধু, ঘি, নাটমিক্স ও প্রাকৃতিক
                                                        খাদ্যপণ্য নিয়ে Shalban Food আপনার
                                                        পরিবারের জন্য মানসম্মত খাবার পৌঁছে দিতে
                                                        কাজ করছে।
                                                </p>

                                                {/* Social Media */}
                                                <div className="flex items-center gap-3">
                                                        {socailMediaLinks.map(
                                                                ({
                                                                        name,
                                                                        Icon,
                                                                        link,
                                                                        ariaLabel,
                                                                }) => (
                                                                        <a
                                                                                key={name}
                                                                                href={link}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                aria-label={ariaLabel}
                                                                                className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all duration-200"
                                                                        >
                                                                                <Icon className="w-5 h-5" />
                                                                        </a>
                                                                )
                                                        )}
                                                </div>
                                        </div>

                                        {/* Desktop Categories */}
                                        <div className="hidden md:block">
                                                <h3 className="text-lg font-bold text-gray-900 mb-5">
                                                        পণ্যসমূহ
                                                </h3>

                                                <ul className="space-y-3">
                                                        {categories.map((category) => (
                                                                <li key={category.slug}>
                                                                        <Link
                                                                                href={`/category/${category.slug}`}
                                                                                className="text-gray-500 hover:text-green-600 transition-colors text-sm md:text-base"
                                                                        >
                                                                                {category.name}
                                                                        </Link>
                                                                </li>
                                                        ))}
                                                </ul>
                                        </div>

                                        {/* Desktop Customer Service */}
                                        <div className="hidden md:block">
                                                <h3 className="text-lg font-bold text-gray-900 mb-5">
                                                        Customer Service
                                                </h3>

                                                <ul className="space-y-3">
                                                        {customerService.map((service) => (
                                                                <li key={service.slug}>
                                                                        <Link
                                                                                href={`/${service.slug}`}
                                                                                className="text-gray-500 hover:text-green-600 transition-colors text-sm md:text-base"
                                                                        >
                                                                                {service.name}
                                                                        </Link>
                                                                </li>
                                                        ))}
                                                </ul>
                                        </div>

                                        {/* Contact Info */}
                                        <div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-5">
                                                        যোগাযোগ করুন
                                                </h3>

                                                <div className="space-y-4">

                                                        {/* WhatsApp */}
                                                        <div className="flex items-start gap-3">
                                                                <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                                                                        <FaWhatsapp className="w-5 h-5 text-green-600" />
                                                                </div>

                                                                <div>
                                                                        <p className="text-xs text-gray-400 mb-1">
                                                                                WhatsApp
                                                                        </p>

                                                                        <a
                                                                                href="https://wa.me/8801603816721"
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-gray-700 hover:text-green-600 transition-colors text-sm md:text-base font-medium"
                                                                        >
                                                                                {contactInfo.whatsapp ||
                                                                                        '01603816721'}
                                                                        </a>
                                                                </div>
                                                        </div>

                                                        {/* Phone */}
                                                        <div className="flex items-start gap-3">
                                                                <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                                                                        <Phone className="w-4 h-4 text-green-600" />
                                                                </div>

                                                                <div>
                                                                        <p className="text-xs text-gray-400 mb-1">
                                                                                Phone
                                                                        </p>

                                                                        <a
                                                                                href={`tel:${contactInfo.phone}`}
                                                                                className="text-gray-700 hover:text-green-600 transition-colors text-sm md:text-base font-medium"
                                                                        >
                                                                                {contactInfo.phone}
                                                                        </a>
                                                                </div>
                                                        </div>

                                                        {/* Email */}
                                                        <div className="flex items-start gap-3">
                                                                <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                                                                        <Mail className="w-4 h-4 text-orange-500" />
                                                                </div>

                                                                <div className="min-w-0">
                                                                        <p className="text-xs text-gray-400 mb-1">
                                                                                Email
                                                                        </p>

                                                                        <a
                                                                                href={`mailto:${contactInfo.mail}`}
                                                                                className="text-gray-700 hover:text-green-600 transition-colors text-sm md:text-base break-all"
                                                                        >
                                                                                {contactInfo.mail}
                                                                        </a>
                                                                </div>
                                                        </div>

                                                        {/* Location */}
                                                        <div className="flex items-start gap-3">
                                                                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                                        <MapPin className="w-4 h-4 text-blue-500" />
                                                                </div>

                                                                <div>
                                                                        <p className="text-xs text-gray-400 mb-1">
                                                                                Location
                                                                        </p>

                                                                        <span className="text-gray-700 text-sm md:text-base leading-6">
                                                                                {contactInfo.location}
                                                                        </span>
                                                                </div>
                                                        </div>

                                                </div>
                                        </div>

                                        {/* Mobile Accordion */}
                                        <div className="md:hidden col-span-1 space-y-3">

                                                {/* Categories */}
                                                <div className="border-t border-gray-200 pt-4">
                                                        <button
                                                                onClick={() =>
                                                                        toggleSection('categories')
                                                                }
                                                                className="w-full flex items-center justify-between text-left"
                                                        >
                                                                <span className="font-bold text-gray-900">
                                                                        পণ্যসমূহ
                                                                </span>

                                                                {openSection === 'categories' ? (
                                                                        <ChevronUp className="w-5 h-5 text-gray-500" />
                                                                ) : (
                                                                        <ChevronDown className="w-5 h-5 text-gray-500" />
                                                                )}
                                                        </button>

                                                        {openSection === 'categories' && (
                                                                <ul className="mt-4 space-y-3">
                                                                        {categories.map(
                                                                                (category) => (
                                                                                        <li
                                                                                                key={
                                                                                                        category.slug
                                                                                                }
                                                                                        >
                                                                                                <Link
                                                                                                        href={`/category/${category.slug}`}
                                                                                                        className="text-gray-500 hover:text-green-600 text-sm block"
                                                                                                >
                                                                                                        {
                                                                                                                category.name
                                                                                                        }
                                                                                                </Link>
                                                                                        </li>
                                                                                )
                                                                        )}
                                                                </ul>
                                                        )}
                                                </div>

                                                {/* Customer Service */}
                                                <div className="border-t border-gray-200 pt-4">
                                                        <button
                                                                onClick={() =>
                                                                        toggleSection('service')
                                                                }
                                                                className="w-full flex items-center justify-between text-left"
                                                        >
                                                                <span className="font-bold text-gray-900">
                                                                        Customer Service
                                                                </span>

                                                                {openSection === 'service' ? (
                                                                        <ChevronUp className="w-5 h-5 text-gray-500" />
                                                                ) : (
                                                                        <ChevronDown className="w-5 h-5 text-gray-500" />
                                                                )}
                                                        </button>

                                                        {openSection === 'service' && (
                                                                <ul className="mt-4 space-y-3">
                                                                        {customerService.map(
                                                                                (service) => (
                                                                                        <li
                                                                                                key={
                                                                                                        service.slug
                                                                                                }
                                                                                        >
                                                                                                <Link
                                                                                                        href={`/${service.slug}`}
                                                                                                        className="text-gray-500 hover:text-green-600 text-sm block"
                                                                                                >
                                                                                                        {
                                                                                                                service.name
                                                                                                        }
                                                                                                </Link>
                                                                                        </li>
                                                                               