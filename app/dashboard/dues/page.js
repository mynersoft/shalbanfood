"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  Wallet,
  Save,
  RefreshCw,
  UserRound,
  Pencil,
} from "lucide-react";
import toast from "react-hot-toast";

const money = (amount) =>
  new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

export default function CustomerDuePage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [totalDue, setTotalDue] = useState("");
  const [dues, setDues] = useState([]);
  const [listSearch, setListSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingDues, setLoadingDues] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadDues = useCallback(async () => {
    setLoadingDues(true);

    try {
      const response = await fetch("/api/customer-due", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "তথ্য লোড করা যায়নি");
      }

      setDues(data.dues || []);
    } catch (error) {
      toast.error(error.message || "বকেয়ার তালিকা লোড হয়নি");
    } finally {
      setLoadingDues(false);
    }
  }, []);

  useEffect(() => {
    loadDues();
  }, [loadDues]);

  useEffect(() => {
    const q = query.trim();

    if (q.length < 2) {
      setUsers([]);
      setLoadingUsers(false);
      return;
    }

    let active = true;

    const timer = setTimeout(async () => {
      setLoadingUsers(true);

      try {
        const response = await fetch(
          `/api/customer-due/users?q=${encodeURIComponent(q)}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "সার্চ করা যায়নি");
        }

        if (active) setUsers(data.users || []);
      } catch (error) {
        if (active) {
          setUsers([]);
          toast.error(error.message || "কাস্টমার সার্চ করা যায়নি");
        }
      } finally {
        if (active) setLoadingUsers(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const chooseUser = (user) => {
    setSelected(user);
    setQuery(user.name);
    setUsers([]);

    const existing = dues.find(
      (item) => item.customerId === user.customerId
    );

    setTotalDue(
      existing ? String(existing.totalDue) : "0"
    );
  };

  const editDue = (item) => {
    setSelected({
      customerId: item.customerId,
      name: item.customerName,
      phone: "",
    });
    setQuery(item.customerName);
    setTotalDue(String(item.totalDue));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveDue = async (event) => {
    event.preventDefault();

    if (!selected?.customerId) {
      toast.error("আগে একজন কাস্টমার নির্বাচন করুন");
      return;
    }

    if (totalDue.trim() === "") {
      toast.error("বকেয়ার পরিমাণ লিখুন");
      return;
    }

    const amount = Number(totalDue);

    if (!Number.isFinite(amount) || amount < 0) {
      toast.error("সঠিক বকেয়ার পরিমাণ লিখুন");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/customer-due", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selected.customerId,
          totalDue: amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "আপডেট করা যায়নি");
      }

      toast.success(data.message || "বকেয়া আপডেট হয়েছে");
      setSelected(null);
      setQuery("");
      setUsers([]);
      setTotalDue("");
      await loadDues();
    } catch (error) {
      toast.error(error.message || "বকেয়া আপডেট করা যায়নি");
    } finally {
      setSaving(false);
    }
  };

  const filteredDues = useMemo(() => {
    const q = listSearch.trim().toLowerCase();

    return dues.filter((item) => {
      const name = (item.customerName || "").toLowerCase();
      const id = (item.customerId || "").toLowerCase();

      return name.includes(q) || id.includes(q);
    });
  }, [dues, listSearch]);

  const totalOutstanding = useMemo(
    () =>
      dues.reduce(
        (sum, item) => sum + Number(item.totalDue || 0),
        0
      ),
    [dues]
  );

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Customer Due Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          কাস্টমার নির্বাচন করে মোট বকেয়া যোগ বা আপডেট করুন।
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-100 p-3 text-green-700">
              <Wallet size={23} />
            </div>
            <div>
              <p className="text-sm text-gray-500">মোট বকেয়া</p>
              <p className="text-2xl font-bold text-green-700">
                {money(totalOutstanding)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
              <Users size={23} />
            </div>
            <div>
              <p className="text-sm text-gray-500">বকেয়া রেকর্ড</p>
              <p className="text-2xl font-bold">
                {dues.length.toLocaleString("bn-BD")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Pencil size={19} />
          কাস্টমারের বকেয়া যোগ / আপডেট
        </h2>

        <form onSubmit={saveDue} className="space-y-4">
          <div className="relative">
            <label className="mb-2 block text-sm font-medium">
              কাস্টমারের নাম বা ফোন নম্বর দিয়ে সার্চ করুন
            </label>

            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={19}
              />

              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelected(null);
                  setTotalDue("");
                }}
                placeholder="নাম, ফোন নম্বর বা User ID..."
                className="w-full rounded-xl border bg-transparent py-3 pl-10 pr-4 outline-none focus:border-green-600"
                autoComplete="off"
              />
            </div>

            {loadingUsers && (
              <p className="mt-2 text-sm text-gray-500">
                কাস্টমার খোঁজা হচ্ছে...
              </p>
            )}

            {!loadingUsers && query.trim().length >= 2 &&
              users.length > 0 && (
                <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                  {users.map((user) => (
                    <button
                      key={user.customerId}
                      type="button"
                      onClick={() => chooseUser(user)}
                      className="flex w-full items-center gap-3 border-b p-3 text-left last:border-0 hover:bg-green-50 dark:hover:bg-gray-800"
                    >
                      <span className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
                        <UserRound size={19} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">
                          {user.name}
                        </span>
                        <span className="block text-sm text-gray-500">
                          {user.phone || user.email || "ফোন/ইমেইল নেই"}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

            {!loadingUsers &&
              query.trim().length >= 2 &&
              users.length === 0 &&
              !selected && (
                <p className="mt-2 text-sm text-gray-500">
                  কোনো কাস্টমার পাওয়া যায়নি।
                </p>
              )}
          </div>

          {selected && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                নির্বাচিত কাস্টমার
              </p>
              <p className="mt-2 font-medium">{selected.name}</p>
              <p className="mt-1 break-all text-xs text-gray-500">
                Customer ID: {selected.customerId}
              </p>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium">
              মোট বকেয়া (৳)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={totalDue}
              onChange={(event) => setTotalDue(event.target.value)}
              placeholder="যেমন: 1500"
              className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none focus:border-green-600"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              এখানে কাস্টমারের সম্পূর্ণ বর্তমান বকেয়ার পরিমাণ লিখুন।
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!selected || saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? "সেভ হচ্ছে..." : "Save / Update Due"}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setQuery("");
                setUsers([]);
                setTotalDue("");
              }}
              className="rounded-xl border px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">কাস্টমার বকেয়ার তালিকা</h2>
            <p className="text-sm text-gray-500">
              যেকোনো রেকর্ড থেকে Edit করে বকেয়া পরিবর্তন করুন।
            </p>
          </div>

          <button
            type="button"
            onClick={loadDues}
            disabled={loadingDues}
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="px-5 pb-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              value={listSearch}
              onChange={(event) => setListSearch(event.target.value)}
              placeholder="তালিকায় নাম বা Customer ID খুঁজুন..."
              className="w-full rounded-xl border bg-transparent py-3 pl-10 pr-4 outline-none focus:border-green-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th className="px-5 py-3">কাস্টমার</th>
                <th className="px-5 py-3">Customer ID</th>
                <th className="px-5 py-3">মোট বকেয়া</th>
                <th className="px-5 py-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>

            <tbody className="divide-y dark:divide-gray-800">
              {loadingDues ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-gray-500">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : filteredDues.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-gray-500">
                    কোনো বকেয়ার রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredDues.map((item) => (
                  <tr key={item.customerId}>
                    <td className="px-5 py-4 font-medium">
                      {item.customerName}
                    </td>
                    <td className="max-w-[220px] truncate px-5 py-4 text-xs text-gray-500">
                      {item.customerId}
                    </td>
                    <td className="px-5 py-4 font-semibold text-red-600">
                      {money(item.totalDue)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => editDue(item)}
                        className="rounded-lg border px-3 py-2 font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}