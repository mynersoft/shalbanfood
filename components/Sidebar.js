"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTopics } from "@/redux/topicSlice";

export default function Sidebar({ onSelect }) {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.topics);

  useEffect(() => {
    dispatch(fetchTopics());
  }, [dispatch]);

  return (
    <div className="w-64 bg-gray-900 text-white p-4 h-screen overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Topics</h2>
      <ul>
        {items.map((t) => (
          <li
            key={t._id}
            onClick={() => onSelect(t)}
            className="p-2 hover:bg-gray-700 rounded cursor-pointer"
          >
            {t.title}
          </li>
        ))}
      </ul>
    </div>
  );
}