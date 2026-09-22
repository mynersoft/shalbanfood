/**
 * 
 * @param {*} param
 * @returns 
 */

export const handleImageUpload = async ({
  e,
  field,
  multiple = false,
  form,
  setForm,
  setIsUploading,
  toast,
}) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  setIsUploading(true);
  toast.loading('Uploading images...');

  const uploaded = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'upload_preset',
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await res.json();
      if (data.secure_url) uploaded.push(data.secure_url);
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(`Failed to upload ${file.name}`);
    }
  }

  toast.dismiss();

  if (uploaded.length > 0) {
    setForm((prev) => ({
      ...prev,
      [field]: multiple ? [...prev[field], ...uploaded] : uploaded[0],
    }));
    toast.success('Images uploaded!');
  }

  setIsUploading(false);
  e.target.value = '';
};
