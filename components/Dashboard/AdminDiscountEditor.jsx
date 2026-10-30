
'use client';

import { useState } from 'react';
import {
    Tag,
    Save,
    Loader2,
    Calculator,
    Info,
    CheckCircle2,
} from 'lucide-react';

import toast from 'react-hot-toast';

const formatPrice = (price) =>
    `৳${Number(price || 0).toLocaleString('en-BD')}`;

export default function AdminDiscountEditor({
    order,
    onUpdated,
}) {
    const [discount, setDiscount] = useState(
        String(order?.adminDiscount || 0)
    );

    const [note, setNote] = useState(
        order?.adminDiscountNote || ''
    );

    const [loading, setLoading] = useState(false);

    if (!order) return null;

    const subtotal = Number(order.subtotal || 0);
    const customerDiscount = Number(order.discount || 0);
    const shippingFee = Number(order.shippingFee || 0);

    const adminDiscount = Number(discount || 0);

    const maxDiscount = Math.max(
        0,
        subtotal - customerDiscount + shippingFee
    );

    const finalTotal = Math.max(
        0,
        subtotal -
        customerDiscount +
        shippingFee -
        adminDiscount
    );

    const isPaid = order.payment?.status === 'paid';

    const isClosed = ['cancelled', 'return'].includes(
        order.status
    );

    const invalid =
        discount.trim() === '' ||
        !Number.isFinite(adminDiscount) ||
        adminDiscount < 0 ||
        adminDiscount > maxDiscount;

    const handleSave = async () => {
        if (invalid) {
            toast.error('Please enter a valid discount amount');
            return;
        }

        if (isPaid || isClosed) {
            toast.error('This order cannot be modified');
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `/api/admin/orders/${order._id}/discount`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        adminDiscount,
                        adminDiscountNote: note,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Discount update failed'
                );
            }

            toast.success('Discount updated successfully');

            onUpdated?.(data.order);

        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#131318] sm:p-5">

            {/* Header */}
            <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-green-100 p-3 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                    <Tag size={21} />
                </div>

                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        Admin Discount
                    </h3>

                    <p className="text-xs text-gray-500">
                        Additional order discount
                    </p>
                </div>
            </div>

            {/* Price Summary */}
            <div className="space-y-3 rounded-xl bg-gray-50 p-3 dark:bg-[#1c1c24]">

                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                        Subtotal
                    </span>

                    <span className="font-medium">
                        {formatPrice(subtotal)}
                    </span>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                        Customer Discount
                    </span>

                    <span className="text-green-600">
                        - {formatPrice(customerDiscount)}
                    </span>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                        Shipping Fee
                    </span>

                    <span className="font-medium">
                        {formatPrice(shippingFee)}
                    </span>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                        Admin Discount
                    </span>

                    <span className="font-semibold text-green-600">
                        - {formatPrice(
                            Number.isFinite(adminDiscount)
                                ? adminDiscount
                                : 0
                        )}
                    </span>
                </div>

                <div className="border-t border-dashed border-gray-300 pt-3 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">
                            Final Total
                        </span>

                        <span className="text-2xl font-bold text-green-600">
                            {formatPrice(finalTotal)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Discount Input */}
            <div className="mt-5 space-y-4">

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Admin Discount Amount (৳)
                    </label>

                    <input
                        type="number"
                        min="0"
                        max={maxDiscount}
                        step="0.01"
                        value={discount}
                        onChange={(e) =>
                            setDiscount(e.target.value)
                        }
                        placeholder="Enter discount amount"
                        disabled={isPaid || isClosed || loading}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-lg font-semibold outline-none transition focus:border-green-500 dark:border-gray-700 dark:bg-[#1c1c24] dark:text-white disabled:opacity-50"
                    />

                    <p className="mt-1 text-xs text-gray-500">
                        Maximum discount: {formatPrice(maxDiscount)}
                    </p>

                    {invalid && (
                        <p className="mt-1 text-xs text-red-500">
                            Please enter a valid discount amount.
                        </p>
                    )}
                </div>

                {/* Note */}
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Discount Reason
                    </label>

                    <textarea
                        rows={2}
                        maxLength={300}
                        value={note}
                        onChange={(e) =>
                            setNote(e.target.value)
                        }
                        placeholder="e.g. Special customer discount"
                        disabled={isPaid || isClosed || loading}
                        className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500 dark:border-gray-700 dark:bg-[#1c1c24] dark:text-white disabled:opacity-50"
                    />
                </div>

                {/* Information */}
                <div className="flex gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                    <Info size={16} className="shrink-0" />

                    <p>
                        Admin discount is separate from customer
                        discount. Final total updates automatically.
                    </p>
                </div>

                {/* Save */}
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={
                        loading ||
                        invalid ||
                        isPaid ||
                        isClosed
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2
                                size={18}
                                className="animate-spin"
                            />
                            Updating...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            Update Discount
                        </>
                    )}
                </button>

                {isPaid && (
                    <p className="text-center text-xs text-amber-600">
                        Paid orders require payment adjustment or refund.
                    </p>
                )}

                {isClosed && (
                    <p className="text-center text-xs text-red-500">
                        This order is closed.
                    </p>
                )}

            </div>
        </div>
    );
}
