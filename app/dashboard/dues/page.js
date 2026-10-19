
'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    Search,
    Users,
    Wallet,
    Save,
    RefreshCw,
    UserRound,
    Pencil,
    UserPlus,
} from 'lucide-react';
import toast from 'react-hot-toast';

const money = (amount) =>
    `৳${Number(amount || 0).toLocaleString('en-BD', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export default function CustomerDuePage() {
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState([]);
    const [dues, setDues] = useState([]);
    const [selected, setSelected] = useState(null);
    const [totalDueInput, setTotalDueInput] = useState('');
    const [totalDue, setTotalDue] = useState(0);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingDues, setLoadingDues] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const loadDues = useCallback(async () => {
        setLoadingDues(true);

        try {
            const response = await fetch('/api/customer-due', {
                cache: 'no-store',
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'বকেয়ার তালিকা লোড হয়নি।');
            }

            setDues(data.dues || []);
            setTotalDue(Number(data.totalDue || 0));
        } catch (error) {
            toast.error(error.message || 'বকেয়ার তালিকা লোড হয়নি।');
        } finally {
            setLoadingDues(false);
        }
    }, []);

    useEffect(() => {
        loadDues();
    }, [loadDues]);

    const searchUsers = async () => {
        const term = search.trim();

        if (!term) {
            setUsers([]);
            toast.error('কাস্টমারের নাম বা ফোন নম্বর লিখুন।');
            return;
        }

        setLoadingUsers(true);
        setSelected(null);
        setEditingId(null);

        try {
            const response = await fetch(
                `/api/customer-due/users?search=${encodeURIComponent(term)}`,
                { cache: 'no-store' }
            );
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'সার্চ করা যায়নি।');
            }

            setUsers(data.users || []);

            // Registered User না থাকলেও search value manual name হিসেবে রাখা হবে
            if (!data.users?.length) {
                setSelected({
                    customerId: null,
                    name: term,
                    phone: '',
                    isManual: true,
                });
                setTotalDueInput('');
            }
        } catch (error) {
            toast.error(error.message || 'সার্চ করা যায়নি।');
        } finally {
            setLoadingUsers(false);
        }
    };

    const chooseUser = (user) => {
        setSelected({
            customerId: user.customerId,
            name: user.name,
            phone: user.phone,
            isManual: false,
        });

        setSearch(user.name);
        setEditingId(null);

        const existing = dues.find(
            (item) => item.customerId === user.customerId
        );

        setTotalDueInput(
            existing ? String(existing.totalDue) : ''
        );
    };

    const chooseManualName = () => {
        const name = search.trim();

        if (!name) {
            toast.error('কাস্টমারের নাম লিখুন।');
            return;
        }

        setSelected({
            customerId: null,
            name,
            phone: '',
            isManual: true,
        });
        setEditingId(null);

        const existing = dues.find(
            (item) =>
                !item.customerId &&
                item.customerName.toLocaleLowerCase('en-US') ===
                    name.toLocaleLowerCase('en-US')
        );

        setTotalDueInput(
            existing ? String(existing.totalDue) : ''
        );
    };

    const editDue = (item) => {
        setSelected({
            customerId: item.customerId || null,
            name: item.customerName,
            phone: '',
            isManual: !item.customerId,
        });

        setSearch(item.customerName);
        setTotalDueInput(String(item.totalDue));
        setEditingId(item._id);
        setUsers([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const saveDue = async (event) => {
        event.preventDefault();

        if (!selected?.name?.trim()) {
            toast.error('আগে কাস্টমার সিলেক্ট করুন অথবা নতুন নাম লিখুন।');
            return;
        }

        if (
            totalDueInput.trim() === '' ||
            !Number.isFinite(Number(totalDueInput)) ||
            Number(totalDueInput) < 0
        ) {
            toast.error('সঠিক বকেয়ার পরিমাণ লিখুন।');
            return;
        }

        setSaving(true);

        try {
            const response = await fetch('/api/customer-due', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: selected.customerId || null,
                    customerName: selected.name.trim(),
                    totalDue: Number(totalDueInput),
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'সংরক্ষণ করা যায়নি।');
            }

            toast.success(data.message || 'বকেয়া সংরক্ষণ হয়েছে।');

            setSearch('');
            setUsers([]);
            setSelected(null);
            setTotalDueInput('');
            setEditingId(null);

            await loadDues();
        } catch (error) {
            toast.error(error.message || 'বকেয়া সংরক্ষণ করা যায়নি।');
        } finally {
            setSaving(false);
        }
    };

    const cancelSelection = () => {
        setSelected(null);
        setTotalDueInput('');
        setEditingId(null);
        setUsers([]);
        setSearch('');
    };

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Customer Due Management
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    কাস্টমারের বকেয়া তৈরি করুন এবং আপডেট করুন।
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                            <Users size={22} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">
                                মোট কাস্টমার
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {dues.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
                            <Wallet size={22} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">
                                মোট বকেয়া
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {money(totalDue)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <section className="rounded-xl border bg-white p-4 shadow-sm md:p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    {editingId ? 'বকেয়া এডিট করুন' : 'কাস্টমার খুঁজুন'}
                </h2>

                <form onSubmit={saveDue} className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                        কাস্টমারের নাম অথবা ফোন নম্বর
                    </label>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="relative flex-1">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    setUsers([]);
                                    setSelected(null);
                                    setEditingId(null);
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        searchUsers();
                                    }
                                }}
                                placeholder="নাম বা ফোন নম্বর লিখুন..."
                                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={searchUsers}
                            disabled={loadingUsers}
                            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            <Search size={18} />
                            {loadingUsers ? 'খুঁজছে...' : 'সার্চ'}
                        </button>
                    </div>

                    {users.length > 0 && (
                        <div className="overflow-hidden rounded-lg border">
                            <p className="bg-gray-50 px-3 py-2 text-sm font-medium text-gray-600">
                                পাওয়া কাস্টমার — একজনকে সিলেক্ট করুন
                            </p>

                            {users.map((user) => (
                                <button
                                    key={user.customerId}
                                    type="button"
                                    onClick={() => chooseUser(user)}
                                    className="flex w-full items-center gap-3 border-t p-3 text-left hover:bg-blue-50"
                                >
                                    <UserRound
                                        size={20}
                                        className="shrink-0 text-gray-500"
                                    />
                                    <span className="min-w-0 flex-1">
                                        <span className="block font-medium text-gray-900">
                                            {user.name || 'নাম নেই'}
                                        </span>
                                        <span className="block text-sm text-gray-500">
                                            {user.phone || user.email || 'যোগাযোগের তথ্য নেই'}
                                        </span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {search.trim() &&
                        !loadingUsers &&
                        users.length === 0 &&
                        selected?.isManual && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                                <div className="flex items-start gap-3">
                                    <UserPlus
                                        size={22}
                                        className="mt-0.5 shrink-0 text-amber-700"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">
                                            “{selected.name}” নামে User পাওয়া যায়নি।
                                        </p>
                                        <p className="mt-1 text-sm text-gray-600">
                                            এই নামটিই নতুন Customer Due-এর নাম হিসেবে ব্যবহার হবে। আলাদা Customer ID লাগবে না।
                                        </p>
                                        <button
                                            type="button"
                                            onClick={chooseManualName}
                                            className="mt-3 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
                                        >
                                            এই নাম দিয়ে চালিয়ে যান
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    {selected && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <p className="text-sm text-blue-700">
                                {selected.isManual
                                    ? 'নতুন manual customer'
                                    : 'Registered customer সিলেক্ট করা হয়েছে'}
                            </p>
                            <p className="mt-1 font-semibold text-gray-900">
                                {selected.name}
                            </p>
                            {selected.phone && (
                                <p className="text-sm text-gray-600">
                                    {selected.phone}
                                </p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            মোট বকেয়া (টাকা)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={totalDueInput}
                            onChange={(event) =>
                                setTotalDueInput(event.target.value)
                            }
                            placeholder="যেমন: 1500"
                            className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            এখানে বর্তমান মোট বকেয়া লিখবেন। আগের বকেয়ার সঙ্গে স্বয়ংক্রিয়ভাবে যোগ হবে না।
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="submit"
                            disabled={!selected || saving}
                            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save size={18} />
                            {saving
                                ? 'সংরক্ষণ হচ্ছে...'
                                : editingId
                                  ? 'বকেয়া আপডেট করুন'
                                  : 'বকেয়া সংরক্ষণ করুন'}
                        </button>

                        <button
                            type="button"
                            onClick={cancelSelection}
                            className="rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
                        >
                            বাতিল
                        </button>
                    </div>
                </form>
            </section>

            <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4 md:p-5">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            কাস্টমার বকেয়ার তালিকা
                        </h2>
                        <p className="text-sm text-gray-500">
                            সব registered ও manual customer
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={loadDues}
                        disabled={loadingDues}
                        className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
                    >
                        <RefreshCw
                            size={16}
                            className={loadingDues ? 'animate-spin' : ''}
                        />
                        রিফ্রেশ
                    </button>
                </div>

                {loadingDues ? (
                    <div className="p-8 text-center text-gray-500">
                        বকেয়ার তালিকা লোড হচ্ছে...
                    </div>
                ) : dues.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        এখনো কোনো Customer Due তৈরি করা হয়নি।
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[520px] text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="px-4 py-3 font-medium">কাস্টমারের নাম</th>
                                    <th className="px-4 py-3 font-medium">ধরন</th>
                                    <th className="px-4 py-3 font-medium">বকেয়া</th>
                                    <th className="px-4 py-3 text-right font-medium">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {dues.map((item) => (
                                    <tr key={item._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {item.customerName}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    item.isManual
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}
                                            >
                                                {item.isManual ? 'Manual' : 'Registered'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-gray-900">
                                            {money(item.totalDue)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => editDue(item)}
                                                className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700"
                                            >
                                                <Pencil size={15} />
                                                এডিট
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t bg-gray-50">
                                <tr>
                                    <td
                                        colSpan={2}
                                        className="px-4 py-4 font-bold text-gray-900"
                                    >
                                        মোট বকেয়া
                                    </td>
                                    <td
                                        colSpan={2}
                                        className="px-4 py-4 font-bold text-gray-900"
                                    >
                                        {money(totalDue)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
