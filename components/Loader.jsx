"use client";

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
      <div className="animate-spin w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full"></div>
    </div>
  );
}