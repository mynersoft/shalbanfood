
"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTransactions,
  deleteTransaction,
  updateTransaction,
  setFilterType,
} from "@/redux/transactionSlice";

export default function TransactionTable() {
  const dispatch = useDispatch();
  const { items, filterType } = useSelector((s) => s.transactions);

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: "", amount: "", type: "" });

  useEffect(() => {
    dispatch(fetchTransactions());
  }, []);

  // Filter Logic
  const filtered = items.filter((i) =>
    filterType === "all" ? true : i.type === filterType
  );

  const startEdit = (item) => {
    setEditId(item._id);
    setEditData({
      name: item.name,
      amount: item.amount,
      type: item.type,
    });
  };

  const saveEdit = async () => {
    await dispatch(updateTransaction({ id: editId, changes: editData }));
    setEditId(null);
  };

  return (
    <div style={{ marginTop: 20 }}>

      {/* Filter */}
      <div style={{ marginBottom: 10 }}>
        <label>Filter by Type: </label>
        <select
          value={filterType}
          onChange={(e) => dispatch(setFilterType(e.target.value))}
        >
          <option value="all">All</option>
          <option value="ay">Ay (Income)</option>
          <option value="invest">Invest</option>
        </select>
      </div>

      {/* Table */}
      <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((item) =>
            editId === item._id ? (
              <tr key={item._id}>
                <td>
                  <input
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={editData.amount}
                    onChange={(e) =>
                      setEditData({ ...editData, amount: e.target.value })
                    }
                  />
                </td>
                <td>
                  <select
                    value={editData.type}
                    onChange={(e) =>
                      setEditData({ ...editData, type: e.target.value })
                    }
                  >
                    <option value="ay">Ay</option>
                    <option value="invest">Invest</option>
                  </select>
                </td>
                <td>
                  <button onClick={saveEdit}>Save</button>
                  <button onClick={() => setEditId(null)}>Cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.amount}</td>
                <td>{item.type}</td>
                <td>
                  <button onClick={() => startEdit(item)}>Edit</button>
                  <button onClick={() => dispatch(deleteTransaction(item._id))}>
                    Delete
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}