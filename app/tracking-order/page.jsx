
'use client';

import { useState } from 'react';
import {
    Search,
    PackageCheck,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    XCircle,
    LoaderCircle,
    ArrowRight,
    ShoppingBag,
} from 'lucide-react';

const ORDER_STEPS = [
	{
		status: 'pending',
		label: 'অর্ডার পেন্ডিং ',
		description: 'আপনার অর্ডারটি পেন্ডিং এ আছে।',
		icon: PackageCheck,
	},
	{
		status: 'confirmed',
		label: 'অর্ডার কনফার্মড',
		description: 'আপনার অর্ডারটি নিশ্চিত করা হয়েছে।',
		icon: PackageCheck,
	},
	{
		status: 'processing',
		label: 'Processing',
		description: 'আপনার পণ্য প্রস্তুত ও প্যাকেজিং করা হচ্ছে।',
		icon: Package,
	},
	{
		status: 'shipped',
		label: 'Shipped',
		description: 'আপনার অর্ডার কুরিয়ারে পাঠানো হয়েছে।',
		icon: Truck,
	},
	{
		status: 'delivered',
		label: 'Delivered',
		description: 'আপনার অর্ডার সফলভাবে পৌঁছে গেছে।',
		icon: CheckCircle2,
	},
];

const STATUS_MAP = {
    pending: 'pending',
    confirm: 'confirmed',
    confirmed: 'confirmed',
    processing: 'processing',
    shipped: 'shipped',
    dispatched: 'shipped',
    delivered: 'delivered',
};

function normalizeStatus(status) {
    return STATUS_MAP[String(status || '').toLowerCase().trim()] || null;
}

export default function TrackOrderPage() {
    const [invoiceNo, setInvoiceNo] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrackOrder = async (e) => {
        e.preventDefault();

        const invoice = invoiceNo.trim();

        if (!invoice) {
            setError('অনুগ্রহ করে আপনার Invoice Number লিখুন।');
            return;
        }

        setLoading(true);
        setError('');
        setOrder(null);

        try {
            const response = await fetch(
                `/api/orders/track?invoiceNo=${encodeURIComponent(invoice)}`,
                {
                    method: 'GET',
                    cache: 'no-store',
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success || !data.order) {
                throw new Error(
                    data.message || 'এই Invoice Number-এর অর্ডার পাওয়া যায়নি।'
                );
            }

            setOrder(data.order);
        } catch (err) {
            setError(
                err.message || 'অর্ডারের তথ্য আনতে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
            );
        } finally {
            setLoading(false);
        }
    };

    const rawStatus = order?.status;
    const currentStatus = normalizeStatus(rawStatus);
    const currentStepIndex = ORDER_STEPS.findIndex(
        (step) => step.status === currentStatus
    );

    const isCancelled = String(rawStatus || '')
        .toLowerCase()
        .trim() === 'cancelled';

    const isUnknownStatus = order && !isCancelled && currentStepIndex === -1;

    return (
        <main className="min-h-screen bg-[#f6f8f5] px-4 py-10 sm:py-16">
            <div className="mx-auto max-w-2xl">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-lg shadow-emerald-900/15">
                        <ShoppingBag size={30} />
                    </div>

                    <p className="mb-2 text-sm font-semibold tracking-[0.2em] text-emerald-800">
                        SHALBAN FOOD
                    </p>

                    <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                        অর্ডার ট্র্যাক করুন
                    </h1>

                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
                        আপনার অর্ডারের বর্তমান অবস্থা ও ডেলিভারির অগ্রগতি
                        সহজেই জেনে নিন।
                    </p>
                </div>

                {/* Search Form */}
                <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                    <form onSubmit={handleTrackOrder}>
                        <label
                            htmlFor="invoiceNo"
                            className="mb-2 block text-sm font-semibold text-gray-800"
                        >
                            Invoice Number
                        </label>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <Search
                                    size={19}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    id="invoiceNo"
                                    type="text"
                                    value={invoiceNo}
                                    onChange={(e) => setInvoiceNo(e.target.value)}
                                    placeholder="আপনার Invoice Number লিখুন"
                                    autoComplete="off"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <LoaderCircle size={18} className="animate-spin" />
                                        খোঁজা হচ্ছে...
                                    </>
                                ) : (
                                    <>
                                        ট্র্যাক করুন
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div
                            role="alert"
                            className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700"
                        >
                            <XCircle size={18} className="mt-0.5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}
                </section>

                {/* Order Status */}
                {order && (
                    <section
                        aria-live="polite"
                        className="mt-6 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
                    >
                        {isCancelled ? (
                            <div className="p-6 text-center sm:p-8">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
                                    <XCircle size={34} />
                                </div>

                                <h2 className="text-xl font-bold text-gray-900">
                                    অর্ডার বাতিল করা হয়েছে
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    এই অর্ডারটি বর্তমানে Cancelled অবস্থায় রয়েছে।
                                    প্রয়োজনে আমাদের সঙ্গে যোগাযোগ করুন।
                                </p>
                            </div>
                        ) : isUnknownStatus ? (
                            <div className="p-6 text-center sm:p-8">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                                    <Clock size={32} />
                                </div>

                                <h2 className="text-xl font-bold text-gray-900">
                                    অর্ডারের স্ট্যাটাস আপডেট হচ্ছে
                                </h2>

                                <p className="mt-2 text-sm text-gray-500">
                                    বর্তমান স্ট্যাটাস:
                                    {' '}
                                    <span className="font-semibold text-gray-800">
                                        {String(rawStatus || 'Unknown')}
                                    </span>
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Current Status Banner */}
                                <div className="bg-emerald-800 px-5 py-6 text-white sm:px-7">
                                    <p className="text-sm text-emerald-100">
                                        আপনার অর্ডারের বর্তমান অবস্থা
                                    </p>

                                    <div className="mt-2 flex items-center gap-3">
                                        {(() => {
                                            const Icon =
                                                ORDER_STEPS[currentStepIndex].icon;

                                            return <Icon size={30} />;
                                        })()}

                                        <h2 className="text-2xl font-bold">
                                            {ORDER_STEPS[currentStepIndex].label}
                                        </h2>
                                    </div>

                                    <p className="mt-2 text-sm leading-6 text-emerald-100">
                                        {ORDER_STEPS[currentStepIndex].description}
                                    </p>
                                </div>

                                {/* Progress Timeline */}
                                <div className="p-5 sm:p-8">
                                    <h3 className="mb-7 text-lg font-bold text-gray-900">
                                        অর্ডারের অগ্রগতি
                                    </h3>

                                    <div className="relative">
                                        {ORDER_STEPS.map((step, index) => {
                                            const Icon = step.icon;
                                            const completed =
                                                index < currentStepIndex;
                                            const active =
                                                index === currentStepIndex;
                                            const reached =
                                                index <= currentStepIndex;

                                            return (
                                                <div
                                                    key={step.status}
                                                    className="relative flex gap-4 pb-8 last:pb-0"
                                                >
                                                    {/* Connector */}
                                                    {index < ORDER_STEPS.length - 1 && (
                                                        <div
                                                            className={`absolute left-[19px] top-10 h-[calc(100%-16px)] w-0.5 ${
                                                                completed
                                                                    ? 'bg-emerald-600'
                                                                    : 'bg-gray-200'
                                                            }`}
                                                        />
                                                    )}

                                                    {/* Icon */}
                                                    <div
                                                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                                                            active
                                                                ? 'border-emerald-700 bg-emerald-700 text-white ring-4 ring-emerald-100'
                                                                : completed
                                                                  ? 'border-emerald-600 bg-emerald-600 text-white'
                                                                  : 'border-gray-200 bg-white text-gray-400'
                                                        }`}
                                                    >
                                                        {completed ? (
                                                            <CheckCircle2 size={21} />
                                                        ) : (
                                                            <Icon size={20} />
                                                        )}
                                                    </div>

                                                    {/* Step Text */}
                                                    <div className="flex-1 pt-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h4
                                                                className={`text-sm font-bold sm:text-base ${
                                                                    reached
                                                                        ? 'text-gray-900'
                                                                        : 'text-gray-400'
                                                                }`}
                                                            >
                                                                {step.label}
                                                            </h4>

                                                            {active && (
                                                                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                                                                    বর্তমান অবস্থা
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p
                                                            className={`mt-1 text-sm leading-6 ${
                                                                reached
                                                                    ? 'text-gray-500'
                                                                    : 'text-gray-400'
                                                            }`}
                                                        >
                                                            {step.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Footer */}
                        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 text-center sm:px-7">
                            <p className="text-xs text-gray-500 sm:text-sm">
                                Shalban Food — স্বাদের সাথে আস্থার বন্ধন
                            </p>
                        </div>
                    </section>
                )}

                {/* Empty State */}
                {!order && !loading && !error && (
                    <div className="mt-6 rounded-2xl border border-dashed border-gray-300 px-5 py-8 text-center">
                        <Package
                            size={30}
                            className="mx-auto mb-3 text-gray-400"
                        />
                        <p className="text-sm text-gray-500">
                            আপনার অর্ডারের আপডেট দেখতে Invoice Number দিয়ে
                            ট্র্যাক করুন।
                        </p>
                    </div>
                )}

                <p className="mt-6 text-center text-xs leading-5 text-gray-400">
                    অর্ডারের স্ট্যাটাস সম্পর্কে সাহায্য প্রয়োজন হলে Shalban Food-এর
                    সঙ্গে যোগাযোগ করুন।
                </p>
            </div>
        </main>
    );
}
