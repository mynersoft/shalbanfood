
"use client";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addTransaction  } from "@/redux/transactionSlice";

export default function AddTransactionForm() {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: "", amount: "", type: "invest" });

  const submit = async (e) => {
    e.preventDefault();
    await dispatch(addTransaction(form));
    setForm({ name: "", amount: "", type: "invest" });
  };

  return (
    <form onSubmit={submit} style={{ marginBottom: 20 }}>
      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        type="number"
        placeholder="Amount"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
      />

      <select
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
      >
        <option value="income">Income</option>
        <option value="invest">Invest</option>
      </select>

      <button>Add</button>
    </form>
  );
}