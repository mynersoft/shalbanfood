// components/PdfViewer.jsx
"use client";
export default function PdfViewer({ pdfUrl }) {
  if (!pdfUrl) return <div className="p-6 text-center text-gray-500">Select a topic to view PDF</div>;
  // Using Google Docs viewer for cross-browser embed (works if URL accessible)
  const embedUrl = `https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
  return (
    <div className="p-4">
      <iframe src={embedUrl} className="w-full h-[80vh] border" title="PDF Viewer" />
    </div>
  );
}