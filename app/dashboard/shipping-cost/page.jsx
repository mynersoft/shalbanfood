
"use client";

import { useEffect, useState } from "react";
import {
  Truck,
  Save,
  RefreshCw,
  MapPin,
  Gift,
} from "lucide-react";
import toast from "react-hot-toast";

const DEFAULTS = {
  insideDhaka: 70,
  outsideDhaka: 120,
  freeDeliveryEnabled: false,
  freeDeliveryMinimum: 2000,
};

export default function ShippingPage() {
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadSettings() {
    setLoading(true);

    try {
      const res = await fetch("/api/shipping", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "সেটিংস লোড হয়নি");
      }

      setForm({ ...DEFAULTS, ...data.settings });
    } catch (error) {
      toast.error(error.message || "সেটিংস লোড হয়নি");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function updateField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (saving) return;

    const amounts = [
      form.insideDhaka,
      form.outsideDhaka,
      form.freeDeliveryMinimum,
    ];

    if (
      amounts.some(
        (value) =>
          !Number.isFinite(value) ||
          value < 0 ||
          value > 1000000
      )
    ) {
      toast.error("সঠিক টাকার পরিমাণ লিখুন");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/shipping", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "আপডেট করা যায়নি"
        );
      }

      setForm({ ...DEFAULTS, ...data.settings });
      toast.success("Shipping settings আপডেট হয়েছে");
    } catch (error) {
      toast.error(error.message || "আপডেট করা যায়নি");
    } finally {
      setSaving(false);
    }
  }

  function NumberField({
    label,
    name,
    description,
  }) {
    return (
      <div>
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          {label}
        </label>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            ৳
          </span>

          <input
            id={name}
            type="number"
            min="0"
            max="1000000"
            step="1"
            required
            value={form[name]}
            onChange={(e) =>
              updateField(name, e.target.value === ""
                ? ""
                : Number(e.target.value))
            }
            className="w-full rounded-xl border border-gray-300 py-3 pl-9 pr-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
          />
        </div>

        {description && (
          <p className="mt-1 text-xs text-gray-500">
            {description}
          </p>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-gray-600">
        <RefreshCw className="mr-2 inline animate-spin" size={18} />
        Shipping settings লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Shipping Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Delivery charge ও free delivery নিয়ন্ত্রণ করুন।
          </p>
        </div>

        <button
          type="button"
          onClick={loadSettings}
          className="flex items-center gap-2 rounded-xl border px-4 py-2.5 hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-green-50 p-3 text-green-700">
                <MapPin size={23} />
              </div>
              <div>
                <h2 className="font-bold">ঢাকার ভিতরে</h2>
                <p className="text-sm text-gray-500">
                  Inside Dhaka delivery
                </p>
              </div>
            </div>

            <NumberField
              label="Delivery Charge (৳)"
              name="insideDhaka"
              description="ঢাকার ভিতরের অর্ডারের চার্জ"
            />
          </section>

          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                <Truck size={23} />
              </div>
              <div>
                <h2 className="font-bold">ঢাকার বাইরে</h2>
                <p className="text-sm text-gray-500">
                  Outside Dhaka delivery
                </p>
              </div>
            </div>

            <NumberField
              label="Delivery Charge (৳)"
              name="outsideDhaka"
              description="ঢাকার বাইরের অর্ডারের চার্জ"
            />
          </section>
        </div>

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                <Gift size={23} />
              </div>
              <div>
                <h2 className="font-bold">Free Delivery</h2>
                <p className="text-sm text-gray-500">
                  নির্দিষ্ট অর্ডারে ডেলিভারি ফ্রি করুন
                </p>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3">
              <span className="text-sm font-medium">
                {form.freeDeliveryEnabled ? "চালু" : "বন্ধ"}
              </span>
              <input
                type="checkbox"
                checked={form.freeDeliveryEnabled}
                onChange={(e) =>
                  updateField(
                    "freeDeliveryEnabled",
                    e.target.checked
                  )
                }
                className="h-5 w-5 accent-green-700"
              />
            </label>
          </div>

          {form.freeDeliveryEnabled && (
            <div className="mt-5 max-w-md">
              <NumberField
                label="Minimum Order for Free Delivery (৳)"
                name="freeDeliveryMinimum"
                description="এই পরিমাণ বা তার বেশি পণ্য কিনলে ডেলিভারি ফ্রি হবে"
              />
            </div>
          )}
        </section>

        <section className="rounded-2xl border bg-gray-50 p-5">
          <h2 className="mb-3 font-bold">বর্তমান সেটিংসের সারাংশ</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <span>ঢাকার ভিতরে</span>
              <strong>৳{form.insideDhaka}</strong>
            </div>
            <div className="flex justify-between gap-3">
              <span>ঢাকার বাইরে</span>
              <strong>৳{form.outsideDhaka}</strong>
            </div>
            <div className="flex justify-between gap-3">
              <span>Free Delivery</span>
              <strong>
                {form.freeDeliveryEnabled
                  ? `৳${form.freeDeliveryMinimum}+ অর্ডারে`
                  : "বন্ধ"}
              </strong>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={loadSettings}
            disabled={saving}
            className="rounded-xl border bg-white px-5 py-3 font-medium disabled:opacity-50"
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-green-800 px-6 py-3 font-semibold text-white hover:bg-green-900 disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
