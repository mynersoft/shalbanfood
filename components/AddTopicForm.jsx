// components/AddTopicForm.jsx
"use client";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addTopic } from "@/redux/topicSlice";
import { uploadToCloudinary } from "@/lib/cloudinary";

export default function AddTopicForm() {
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title required");
    if (!file) return alert("Select a PDF file");

    try {
      setSaving(true);
      const url = await uploadToCloudinary(file); // will call raw upload for PDFs
      await dispatch(addTopic({ title: title.trim(), pdfUrl: url })).unwrap();
      setTitle("");
      setFile(null);
      alert("Uploaded");
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-800 text-white space-y-2">
      <div>
        <input className="w-full p-2 rounded bg-gray-700" placeholder="Topic title" value={title} onChange={(e)=>setTitle(e.target.value)} />
      </div>
      <div>
        <input type="file" accept="application/pdf" onChange={(e)=>setFile(e.target.files[0])} />
      </div>
      <div>
        <button disabled={saving} className="px-4 py-2 bg-green-600 rounded">
          {saving ? "Uploading..." : "Upload PDF"}
        </button>
      </div>
    </form>
  );
}