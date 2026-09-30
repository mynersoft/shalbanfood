'use client';

import { useState } from 'react';

export default function ContactUsPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const whatsappMessage = `
নাম: ${form.name}
ইমেইল: ${form.email}
ফোন: ${form.phone}
বিষয়: ${form.subject}

মেসেজ:
${form.message}
    `;

    const whatsappUrl = `https://wa.me/8801603816721?text=${encodeURIComponent(
      whatsappMessage
    )}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-6xl px-4">

        {/* Header */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-green-600">
            Shalban Food
          </p>

          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            যোগাযোগ করুন
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            পণ্য, অর্ডার, ডেলিভারি অথবা যেকোনো তথ্যের জন্য আমাদের সাথে
            যোগাযোগ করুন। আমরা আপনাকে সাহায্য করতে প্রস্তুত।
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">

          {/* Contact Form */}
          <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              আমাদের মেসেজ করুন
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  আপনার নাম *
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="আপনার পুরো নাম"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  ইমেইল
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  মোবাইল নম্বর *
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="01XXXXXXXXX"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  বিষয়
                </label>

                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="যেমন: অর্ডার / পণ্য / ডেলিভারি"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  আপনার মেসেজ *
                </label>

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="আপনার মেসেজ লিখুন..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
              >
                WhatsApp-এ মেসেজ পাঠান
              </button>

            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-5">

            {/* WhatsApp */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl">
                💬
              </div>

              <h3 className="text-xl font-bold text-gray-900">
                WhatsApp
              </h3>

              <p className="mt-2 text-gray-600">
                অর্ডার বা যেকোনো তথ্যের জন্য সরাসরি WhatsApp-এ যোগাযোগ করুন।
              </p>

              <a
                href="https://wa.me/8801603816721"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block font-semibold text-green-600 hover:text-green-700"
              >
                01603816721 →
              </a>
            </div>

            {/* Email */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl">
                ✉️
              </div>

              <h3 className="text-xl font-bold text-gray-900">
                Email
              </h3>

              <p className="mt-2 text-gray-600">
                ব্যবসায়িক যোগাযোগের জন্য আমাদের ইমেইল ব্যবহার করতে পারেন।
              </p>

              <a
                href="mailto:info@shalbanfood.com"
                className="mt-4 inline-block font-semibold text-green-600"
              >
                info@shalbanfood.com
              </a>
            </div>

            {/* Location */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl">
                📍
              </div>

              <h3 className="text-xl font-bold text-gray-900">
                আমাদের ঠিকানা
              </h3>

              <p className="mt-2 leading-7 text-gray-600">
                Bangladesh
                <br />
                Shalban Food
              </p>
            </div>

            {/* Business */}
            <div className="rounded-2xl bg-green-600 p-6 text-white shadow-sm">
              <h3 className="text-xl font-bold">
                Shalban Food
              </h3>

              <p className="mt-2 leading-7 text-green-50">
                খাঁটি মধু, ঘি, নাটমিক্স ও প্রাকৃতিক খাদ্যপণ্য—
                আপনার পরিবারের জন্য মানসম্মত খাবার পৌঁছে দিতে আমরা কাজ করছি।
              </p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}