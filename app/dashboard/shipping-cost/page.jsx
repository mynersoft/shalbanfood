
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Truck,
  Save,
  RefreshCw,
  MapPin,
  Gift,
  CheckCircle2,
  XCircle,
  Package,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";

const DEFAULTS = {
  insideDhaka: 70,
  outsideDhaka: 120,
  freeDeliveryEnabled: false,
  freeDeliveryMinimum: 2000,
};

// Separate component: input focus stays stable while typing.
function NumberField({
  label,
  name,
  value,
  onChange,
  description,
  disabled = false,
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
          name={name}
          type="number"
          min="0"
          max="1000000"
          step="1"
          required
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-9 pr-3 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
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

function ShippingCostRow({
  icon: Icon,
  title,
  description,
  charge,
  color = "green",
}) {
  const iconColors = {
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-4 last:border-0">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`rounded-xl p-3 ${
            iconColors[color] || iconColors.green
          }`}
        >
          <Icon size={21} />
        </div>

        <div className="min-w-0">
          <p className="font-semibold text-gray-800">
            {title}
          </p>
          <p className="text-sm text-gray-500">
            {description}
          </p>
        </div>
      </div>

      <strong className="shrink-0 text-lg text-gray-900">
        {charge}
      </strong>
    </div>
  );
}

export default function ShippingPage() {
  const [form, setForm] = useState(DEFAULTS);
  const [savedForm, setSavedForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/shipping", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Shipping settings লোড হয়নি"
        );
      }

      const settings = {
        ...DEFAULTS,
        ...data.settings,
      };

      setForm(settings);
      setSavedForm(settings);
    } catch (error) {
      toast.error(error.message || "সেটিংস লোড হয়নি");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  function updateField(name, value) {
    setForm((previous) => ({
      ...previous,
      [name]:
        name === "freeDeliveryEnabled"
          ? value
          : value === ""
            ? ""
            : Number(value),
    }));
  }

  function resetForm() {
    setForm({ ...savedForm });
    toast.success("Saved settings ফিরিয়ে আনা হয়েছে");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    const amounts = [
      form.insideDhaka,
      form.outsideDhaka,
      form.freeDeliveryMinimum,
    ];

    if (
      amounts.some(
        (value) =>
          value === "" ||
          !Number.isFinite(value) ||
          value < 0 ||
          value > 1000000
      )
    ) {
      toast.error("সঠিক টাকার পরিমাণ লিখুন");
      return;
    }

    if (amounts.some((value) => !Number.isInteger(value))) {
      toast.error("টাকার পরিমাণ পূর্ণ সংখ্যা হতে হবে");
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
          data.message || "Shipping settings আপডেট হয়নি"
        );
      }

      const settings = {
        ...DEFAULTS,
        ...data.settings,
      };

      setForm(settings);
      setSavedForm(settings);

      toast.success("Shipping settings সফলভাবে আপডেট হয়েছে");
    } catch (error) {
      toast.error(error.message || "আপডেট করা যায়নি");
    } finally {
      setSaving(false);
    }
  }

  const money = (amount) =>
    `৳${Number(amount || 0).toLocaleString("en-BD")}`;

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-gray-600">
        <RefreshCw className="animate-spin" size={20} />
        <span>Shipping settings লোড হচ্ছে...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="text-green-800" size={28} />

            <h1 className="text-2xl font-bold text-gray-900">
              Shipping Management
            </h1>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            ডেলিভারি চার্জ, Free Delivery এবং Shipping Cost List
            পরিচালনা করুন।
          </p>
        </div>

        <button
          type="button"
          onClick={loadSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Shipping cost list */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-3">
          <Package className="text-green-800" size={23} />

          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Shipping Cost List
            </h2>
            <p className="text-sm text-gray-500">
              বর্তমানে সেট করা ডেলিভারি চার্জ
            </p>
          </div>
        </div>

        <ShippingCostRow
          icon={MapPin}
          title="ঢাকার ভিতরে"
          description="Inside Dhaka"
          charge={money(form.insideDhaka)}
          color="green"
        />

        <ShippingCostRow
          icon={Truck}
          title="ঢাকার বাইরে"
          description="Outside Dhaka"
          charge={money(form.outsideDhaka)}
          color="blue"
        />

        <ShippingCostRow
          icon={Gift}
          title="Free Delivery"
          description={
            form.freeDeliveryEnabled
              ? `ন্যূনতম অর্ডার ${money(form.freeDeliveryMinimum)}`
              : "বর্তমানে বন্ধ"
          }
          charge={
            form.freeDeliveryEnabled
              ? "চালু"
              : "বন্ধ"
          }
          color="amber"
        />
      </section>

      {/* Status cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <MapPin className="mb-3 text-green-700" size={23} />
          <p className="text-sm text-gray-500">Inside Dhaka</p>
          <p className="mt-1 text-2xl font-bold">
            {money(form.insideDhaka)}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <Truck className="mb-3 text-blue-700" size={23} />
          <p className="text-sm text-gray-500">Outside Dhaka</p>
          <p className="mt-1 text-2xl font-bold">
            {money(form.outsideDhaka)}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          {form.freeDeliveryEnabled ? (
            <CheckCircle2 className="mb-3 text-green-700" size={23} />
          ) : (
            <XCircle className="mb-3 text-red-600" size={23} />
          )}

          <p className="text-sm text-gray-500">Free Delivery</p>
          <p className="mt-1 text-xl font-bold">
            {form.freeDeliveryEnabled ? "Enabled" : "Disabled"}
          </p>
        </div>
      </div>

      {/* Edit settings */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-900">
            Update Delivery Charges
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <NumberField
              label="ঢাকার ভিতরে Delivery Charge"
              name="insideDhaka"
              value={form.insideDhaka}
              onChange={updateField}
              description="ঢাকার ভিতরের প্রতিটি অর্ডারের চার্জ"
              disabled={saving}
            />

            <NumberField
              label="ঢাকার বাইরে Delivery Charge"
              name="outsideDhaka"
              value={form.outsideDhaka}
              onChange={updateField}
              description="ঢাকার বাইরের প্রতিটি অর্ডারের চার্জ"
              disabled={saving}
            />
          </div>
        </section>

        {/* Free delivery settings */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                <Gift size={23} />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Free Delivery Settings
                </h2>

                <p className="text-sm text-gray-500">
                  নির্দিষ্ট অর্ডারের জন্য ডেলিভারি চার্জ মওকুফ করুন।
                </p>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3">
              <span className="text-sm font-semibold">
                {form.freeDeliveryEnabled ? "চালু" : "বন্ধ"}
              </span>

              <input
                type="checkbox"
                checked={form.freeDeliveryEnabled}
                disabled={saving}
                onChange={(event) =>
                  updateField(
                    "freeDeliveryEnabled",
                    event.target.checked
                  )
                }
                className="h-5 w-5 accent-green-700"
              />
            </label>
          </div>

          {form.freeDeliveryEnabled && (
            <div className="mt-5 max-w-md">
              <NumberField
                label="Minimum Order for Free Delivery"
                name="freeDeliveryMinimum"
                value={form.freeDeliveryMinimum}
                onChange={updateField}
                description="পণ্যের মোট মূল্য এই পরিমাণ বা তার বেশি হলে ডেলিভারি ফ্রি হবে।"
                disabled={saving}
              />
            </div>
          )}

          {!form.freeDeliveryEnabled && (
            <p className="mt-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
              Free Delivery বন্ধ আছে। সব অর্ডারে নির্বাচিত এলাকার
              ডেলিভারি চার্জ প্রযোজ্য হবে।
            </p>
          )}
        </section>

        {/* Live preview */}
        <section className="rounded-2xl border bg-gray-50 p-5">
          <h2 className="mb-4 font-bold text-gray-900">
            Updated Settings Preview
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span>ঢাকার ভিতরে</span>
              <strong>{money(form.insideDhaka)}</strong>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span>ঢাকার বাইরে</span>
              <strong>{money(form.outsideDhaka)}</strong>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span>Free Delivery</span>
              <strong>
                {form.freeDeliveryEnabled
                  ? `${money(form.freeDeliveryMinimum)}+ অর্ডারে`
                  : "বন্ধ"}
              </strong>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={resetForm}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl border bg-white px-5 py-3 font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            <RotateCcw size={17} />
            Reset Changes
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-green-800 px-6 py-3 font-semibold text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <RefreshCw className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}

            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
