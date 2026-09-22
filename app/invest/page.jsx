"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addInvest,
  fetchInvests,
  deleteInvest,
  updateInvest,
  setFilterType,
} from "@/redux/investSlice";

export default function InvestPage() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  // Redux state
  const { list, loading, actionLoading, filterType } = useSelector(
    (state) => state.invest
  );

  // Form State
  const [form, setForm] = useState({
    name: "",
    investType: "",
    amount: "",
  });

  const [editId, setEditId] = useState(null);

  // Date filter
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch investments
  useEffect(() => {
    dispatch(fetchInvests());
  }, [dispatch]);

  // Filter by type + date
  const filterItems = useMemo(() => {
    let items = Array.isArray(list) ? list.filter(Boolean) : [];

    // TYPE FILTER
    if (filterType !== "all") {
      items = items.filter((i) => i.investType === filterType);
    }

    // DATE FILTER
    if (startDate) {
      items = items.filter((i) => new Date(i.createdAt) >= new Date(startDate));
    }

    if (endDate) {
      items = items.filter((i) => new Date(i.createdAt) <= new Date(endDate));
    }

    return items;
  }, [list, filterType, startDate, endDate]);

  // Total amount
  const totalAmount = useMemo(() => {
    return filterItems.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [filterItems]);

  // Submit form (add or update)
  const submit = async () => {
    if (!form.name || !form.investType || !form.amount) {
      alert("Please fill all fields");
      return;
    }

    const payload = {
      name: form.name,
      investType: form.investType,
      amount: Number(form.amount),
    };

    try {
      if (editId) {
        await dispatch(updateInvest({ ...payload, _id: editId })).unwrap();
      } else {
        await dispatch(addInvest(payload)).unwrap();
      }

      // Reset
      setForm({ name: "", investType: "", amount: "" });
      setEditId(null);
      setOpen(false);
    } catch (err) {
      alert("Operation failed!");
    }
  };

  // Start Editing
  const startEdit = (item) => {
    setEditId(item._id);
    setForm({
      name: item.name,
      investType: item.investType,
      amount: item.amount.toString(),
    });
    setOpen(true);
  };

  // Delete
  const handleDelete = async (id) => {
    if (!confirm("Delete this invest?")) return;
    try {
      await dispatch(deleteInvest(id)).unwrap();
    } catch {
      alert("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Investments</h2>
          <button
            onClick={() => {
              setEditId(null);
              setForm({ name: "", investType: "", amount: "" });
              setOpen(true);
            }}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            + Add Invest
          </button>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-4 items-center mb-4">

          {/* Type Filter */}
          <select
            className="bg-gray-800 border border-gray-700 p-2 rounded"
            value={filterType}
            onChange={(e) => dispatch(setFilterType(e.target.value))}
          >
            <option value="all">All</option>
            <option value="malamal">Malamal</option>
            <option value="tools">Tools</option>
            <option value="others">Others</option>
          </select>

          {/* Start Date */}
          <input
            type="date"
            className="bg-gray-800 p-2 border border-gray-700 rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          {/* End Date */}
          <input
            type="date"
            className="bg-gray-800 p-2 border border-gray-700 rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <p className="text-lg font-semibold">
            Total: {totalAmount} Tk
          </p>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-800 h-14 rounded animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto shadow-lg border border-gray-700 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-800 text-gray-300">
                <tr>
                  <th className="p-3 border-b border-gray-700">Name</th>
                  <th className="p-3 border-b border-gray-700">Type</th>
                  <th className="p-3 border-b border-gray-700">Amount</th>
                  <th className="p-3 border-b border-gray-700">Date</th>
                  <th className="p-3 border-b border-gray-700 w-40">Action</th>
                </tr>
              </thead>

              <tbody>
                {filterItems.length > 0 ? (
                  filterItems.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-gray-800 hover:bg-gray-800"
                    >
                      <td className="p-3">{item.name}</td>
                      <td className="p-3 capitalize">{item.investType}</td>
                      <td className="p-3">{item.amount}</td>
                      <td className="p-3">
                        {new Date(item.createdAt).toLocaleDateString("en-GB")}
                      </td>

                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => startEdit(item)}
                          className="px-3 py-1 bg-green-600 rounded hover:bg-green-700"
                          disabled={actionLoading}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(item._id)}
                          className="px-3 py-1 bg-red-600 rounded hover:bg-red-700"
                          disabled={actionLoading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-400">
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {open && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg w-96 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">
                {editId ? "Edit Investment" : "Add Investment"}
              </h3>

              <input
                className="bg-gray-800 border border-gray-700 p-2 rounded w-full mb-3"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <select
                className="bg-gray-800 border border-gray-700 p-2 rounded w-full mb-3"
                value={form.investType}
                onChange={(e) =>
                  setForm({ ...form, investType: e.target.value })
                }
              >
                <option value="">Select Type</option>
                <option value="malamal">Malamal</option>
                <option value="tools">Tools</option>
                <option value="others">Others</option>
              </select>

              <input
                type="number"
                className="bg-gray-800 border border-gray-700 p-2 rounded w-full mb-4"
                placeholder="Amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    setEditId(null);
                    setForm({ name: "", investType: "", amount: "" });
                  }}
                  className="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>

                <button
                  onClick={submit}
                  className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700"
                  disabled={actionLoading}
                >
                  {editId ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}