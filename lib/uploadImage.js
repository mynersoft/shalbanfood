export async function uploadImageToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Upload failed");

  return data.url; // secure_url
}