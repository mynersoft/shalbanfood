'use client';

export default function FancyLoader() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
    </div>
  );
}