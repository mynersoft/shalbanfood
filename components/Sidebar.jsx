// components/Sidebar.jsx
"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTopics } from "@/redux/topicSlice";

export default function Sidebar({ onSelect }) {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.topics);

  useEffect(() => {
    dispatch(fetchTopics());
  }, [dispatch]);

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen overflow-y-auto p-4">
      <h2 className="text-lg font-semibold mb-4">Topics</h2>
      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      <ul className="space-y-2">
        {items.map((t) => (
          <li
            key={t._id}
            onClick={() => onSelect(t)}
            className="p-2 rounded hover:bg-gray-800 cursor-pointer"
          >
            <div className="font-medium">{t.title}</div>
            <div className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</div>
          </li>
        ))}
      </ul>
    </aside>
  );
}