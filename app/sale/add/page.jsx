"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { addSale, fetchSale } from "@/redux/saleSlice";
import { generateInvoiceNumber } from "@/lib/generateInvoice";

export default function SellPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const products = useSelector((state) =>
    state?.products?.items?.filter((p) => p.stock > 0) || []
  ); // filter out stock 0

  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [itemMemo, setItemsMemo] = useState([
    { name: "", qty: 1, price: 0, total: 0 },
  ]);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [invoiceNo, setInvoiceNo] = useState(null);
  const [date, setDate] = useState("");

  useEffect(() => {
    dispatch(fetchSale());
    setDate(new Date().toLocaleDateString());
    setInvoiceNo(generateInvoiceNumber());
  }, [dispatch]);

  // Update row values
  const handleChange = (index, field, value) => {
    const newItems = [...itemMemo];
    if (field === "name") {
      newItems[index].name = value;
      const prod = products.find((p) => p.name === value);
      if (prod) {
        newItems[index].price = prod.sellPrice;
      }
    } else if (field === "qty" || field === "price") {
      newItems[index][field] = Number(value);
    }
    newItems[index].total = newItems[index].qty * newItems[index].price;
    setItemsMemo(newItems);
  };

  // Add row
  const handleAddItem = () => {
    setItemsMemo([...itemMemo, { name: "", qty: 1, price: 0, total: 0 }]);
  };

  // Remove row
  const handleRemoveItem = (idx) => {
    setItemsMemo(itemMemo.filter((_, i) => i !== idx));
  };

  // Update total
  useEffect(() => {
    const subtotal = itemMemo.reduce((sum, it) => sum + it.total, 0);
    setTotal(subtotal - discount);
  }, [itemMemo, discount]);

  // Save sale
  const handleSave = async () => {
    if (!customer.name) return toast.error("Customer name required");
    if (itemMemo.some((it) => !it.name || !it.qty)) {
      return toast.error("Fill all item fields");
    }

    const subtotal = itemMemo.reduce((sum, it) => sum + it.total, 0);
    const saleData = {
      customer,
      items: itemMemo,
      discount,
      subtotal,
      total: subtotal - discount,
      invoice: invoiceNo,
      date,
    };

    try {
      const sale = await dispatch(addSale(saleData)).unwrap();
      toast.success("Sale saved successfully!");
      router.push(`/sale/${sale._id}`);
    } catch (err) {
      toast.error(err.message || "Failed to save sale");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto bg-gray-900 p-6 rounded-xl border border-gray-700">
        <h1 className="text-2xl font-bold text-center mb-6">
          🧾 Sell Entry — Bismillah Telecom & Servicing
        </h1>

        {/* CUSTOMER */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="Customer Name"
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            className="bg-gray-800 p-2 rounded border border-gray-700"
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={customer.phone}
            onChange={(e) =>
              setCustomer({ ...customer, phone: e.target.value })
            }
            className="bg-gray-800 p-2 rounded border border-gray-700"
          />
        </div>

        {/* MEMO TABLE */}
        <table className="w-full text-sm border border-gray-700 mb-3">
          <thead className="bg-gray-800">
            <tr>
              <th>#</th>
              <th>Item Name</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {itemMemo.map((it, idx) => (
              <tr key={idx}>
                <td className="border border-gray-700">{idx + 1}</td>
                <td className="border border-gray-700">
                  <input
                    list={`products-${idx}`}
                    value={it.name}
                    onChange={(e) => handleChange(idx, "name", e.target.value)}
                    placeholder="Select or type product"
                    className="w-full bg-gray-900 p-1 rounded border border-gray-700"
                  />
                  <datalist id={`products-${idx}`}>
                    {products.map((p, i) => (
                      <option key={i} value={p.name} />
                    ))}
                  </datalist>
                </td>
                <td className="border border-gray-700 text-center">
                  <input
                    type="number"
                    min="1"
                    value={it.qty}
                    onChange={(e) => handleChange(idx, "qty", e.target.value)}
                    className="w-16 bg-gray-900 p-1 rounded border border-gray-700 text-center"
                  />
                </td>
                <td className="border border-gray-700 text-right">
                  <input
                    type="number"
                    min="0"
                    value={it.price}
                    onChange={(e) => handleChange(idx, "price", e.target.value)}
                    className="w-24 bg-gray-900 p-1 rounded border border-gray-700 text-right"
                  />
                </td>
                <td className="border border-gray-700 text-right">{it.total}</td>
                <td className="border border-gray-700 text-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="text-red-500 hover:text-red-400"
                  >
                    ✖
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between mb-3">
          <button
            type="button"
            onClick={handleAddItem}
            className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
          >
            ➕ Add Item
          </button>

          <div>
            <label className="mr-2">Discount: </label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 p-1 rounded w-28 text-right"
            />
          </div>
        </div>

        <div className="text-right text-lg font-semibold border-t border-gray-700 pt-2">
          Total: {total} Tk
        </div>

        <div className="flex gap-4 justify-center mt-4">
          <button
            type="button"
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-semibold"
          >
            💾 Save
          </button>
        </div>
      </div>
    </div>
  );
}