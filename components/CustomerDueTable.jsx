"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, CheckCircle } from "lucide-react";

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#1e293b] text-white p-6 rounded-xl shadow-lg w-full max-w-md">
        {children}
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CustomerDueTable() {
  const [dues, setDues] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    amount: "",
    date: "",
    note: "",
  });

  async function fetchDues() {
    const res = await fetch("/api/customer-due");
    const data = await res.json();
    setDues(data);
  }

  useEffect(() => {
    fetchDues();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (editing) {
      await fetch(`/api/customer-due/${editing._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    } else {
      await fetch("/api/customer-due", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    }
    setIsModalOpen(false);
    setEditing(null);
    setFormData({ name: "", phone: "", amount: "", date: "", note: "" });
    fetchDues();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this record?")) return;
    await fetch(`/api/customer-due/${id}`, { method: "DELETE" });
    fetchDues();
  }

  async function markAsPaid(id) {
    await fetch(`/api/customer-due/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid" }),
    });
    fetchDues();
  }

  return (
    <div className="p-4 bg-[#0f172a] text-white rounded-xl">
      <div className="flex justify-between mb-3">
        <h2 className="text-xl font-semibold">Customer Due List</h2>
        <Button
          onClick={() => {
            setEditing(null);
            setFormData({ name: "", phone: "", amount: "", date: "", note: "" });
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1" /> Add Due
        </Button>
      </div>

      <table className="w-full border border-gray-700 text-sm">
        <thead className="bg-[#1e293b]">
          <tr>
            <th className="px-3 py-2">Name</th>
            <th>Phone</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {dues.map((c) => (
            <tr
              key={c._id}
              className="border-t border-gray-700 hover:bg-[#334155]"
            >
              <td className="px-3 py-2">{c.name}</td>
              <td>{c.phone}</td>
              <td>৳{c.amount}</td>
              <td>{new Date(c.date).toLocaleDateString()}</td>
              <td>
                {c.status === "paid" ? (
                  <span className="text-green-400 font-semibold">Paid</span>
                ) : (
                  <span className="text-red-400 font-semibold">Due</span>
                )}
              </td>
              <td className="space-x-2">
                {c.status === "due" && (
                  <Button
                    size="sm"
                    onClick={() => markAsPaid(c._id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> Pay
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(c);
                    setFormData(c);
                    setIsModalOpen(true);
                  }}
                >
                  <Pencil className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(c._id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-lg font-semibold mb-3">
          {editing ? "Edit Record" : "Add New Due"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Customer Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-[#334155] text-white p-2 rounded-lg"
          />
          <input
            type="text"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-[#334155] text-white p-2 rounded-lg"
          />
          <input
            type="number"
            placeholder="Due Amount"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            className="w-full bg-[#334155] text-white p-2 rounded-lg"
          />
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full bg-[#334155] text-white p-2 rounded-lg"
          />
          <textarea
            placeholder="Note (optional)"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            className="w-full bg-[#334155] text-white p-2 rounded-lg"
          />
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            {editing ? "Update" : "Add"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}