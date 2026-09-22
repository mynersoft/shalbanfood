"use client";

import { useState } from "react";

export default function ShopFilters({ onFilter }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  const handleChange = () => {
    onFilter({ search, sort });
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 bg-gray-900 text-white p-4 rounded mb-6">
      {/* Search */}
      <input
        type="text"
        placeholder="Search by name..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          handleChange();
        }}
        className="bg-gray-800 p-2 rounded w-full"
      />

      {/* Sort */}
      <select
        value={sort}
        onChange={(e) => {
          setSort(e.target.value);
          handleChange();
        }}
        className="bg-gray-800 p-2 rounded w-full md:w-48"
      >
        <option value="">Sort</option>
        <option value="low">Price: Low to High</option>
        <option value="high">Price: High to Low</option>
      </select>
    </div>
  );
}