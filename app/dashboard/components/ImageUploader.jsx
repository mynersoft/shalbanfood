'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Upload,
  ImagePlus,
  Trash2,
  Star,
  LoaderCircle,
  CheckCircle2,
  FileImage,
} from 'lucide-react';

const DEFAULT_SEO = {
  title: '',
  alt: '',
  caption: '',
  description: '',
  keywords: '',
};

const TYPE_LABELS = {
  product: 'Product',
  blog: 'Blog',
  combo: 'Combo Offer',
  category: 'Category',
  general: 'General',
};

export default function ImageUploader({
  type = 'general',
  value = [],
  onChange,
  multiple = true,
  maxImages = 10,
  maxSizeMB = 10,
  requiredAlt = true,
}) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [localPreview, setLocalPreview] = useState('');
  const [seo, setSeo] = useState(DEFAULT_SEO);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const images = Array.isArray(value) ? value : [];

  useEffect(() => {
    if (!file) {
      setLocalPreview('');
      return;
    }

    const url = URL.createObjectURL(file);
    setLocalPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  function updateSeo(key, nextValue) {
    setSeo((prev) => ({ ...prev, [key]: nextValue }));
    setError('');
  }

  function chooseFile(nextFile) {
    setError('');
    setNotice('');

    if (!nextFile) return;

    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
    ];

    if (!allowed.includes(nextFile.type)) {
      setError('JPEG, PNG, WebP অথবা AVIF ছবি নির্বাচন করুন।');
      return;
    }

    if (nextFile.size > maxSizeMB * 1024 * 1024) {
      setError(`ছবির সাইজ সর্বোচ্চ ${maxSizeMB} MB হতে পারবে।`);
      return;
    }

    if (!multiple && images.length >= 1) {
      setError('নতুন ছবি দেওয়ার আগে বর্তমান ছবিটি সরান।');
      return;
    }

    if (images.length >= maxImages) {
      setError(`সর্বোচ্চ ${maxImages}টি ছবি যোগ করা যাবে।`);
      return;
    }

    const baseName = nextFile.name.replace(/\.[^.]+$/, '');

    setFile(nextFile);
    setSeo({
      ...DEFAULT_SEO,
      title: baseName,
    });
  }

  function makeSuggestedSEO() {
    if (!seo.title.trim()) {
      setError('প্রথমে Image Title লিখুন।');
      return;
    }

    setSeo((prev) => ({
      ...prev,
      alt: prev.alt || prev.title,
      caption: prev.caption || prev.title,
      description:
        prev.description ||
        `${prev.title} — Shalban Food-এর ছবির বিবরণ।`,
      keywords:
        prev.keywords ||
        `${prev.title}, Shalban Food`,
    }));

    setError('');
  }

  async function uploadImage() {
    if (!file) {
      setError('প্রথমে একটি ছবি নির্বাচন করুন।');
      return;
    }

    if (requiredAlt && !seo.alt.trim()) {
      setError('ছবির Alt Text লিখুন।');
      return;
    }

    if (images.length >= maxImages) {
      setError(`সর্বোচ্চ ${maxImages}টি ছবি যোগ করা যাবে।`);
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('title', seo.title);
      formData.append('alt', seo.alt);
      formData.append('caption', seo.caption);
      formData.append('description', seo.description);
      formData.append('keywords', seo.keywords);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.image) {
        throw new Error(data.message || 'Image upload failed');
      }

      const newImage = {
        ...data.image,
        isPrimary: images.length === 0,
      };

      onChange?.([...images, newImage]);

      setFile(null);
      setSeo(DEFAULT_SEO);
      if (inputRef.current) inputRef.current.value = '';

      setNotice('ছবি ও SEO তথ্য সফলভাবে আপলোড হয়েছে।');
    } catch (err) {
      setError(err.message || 'ছবি আপলোড করা যায়নি।');
    } finally {
      setBusy(false);
    }
  }

  function setPrimary(publicId) {
    onChange?.(
      images.map((image) => ({
        ...image,
        isPrimary: image.publicId === publicId,
      }))
    );
  }

  function removeImage(publicId) {
    const remaining = images.filter(
      (image) => image.publicId !== publicId
    );

    if (remaining.length && !remaining.some((image) => image.isPrimary)) {
      remaining[0] = { ...remaining[0], isPrimary: true };
    }

    onChange?.(remaining);
  }

  function updateUploadedImage(publicId, key, nextValue) {
    onChange?.(
      images.map((image) =>
        image.publicId === publicId
          ? { ...image, [key]: nextValue }
          : image
      )
    );
  }

  return (
    <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <ImagePlus className="text-emerald-700" size={22} />
            Image Uploader & SEO
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {TYPE_LABELS[type] || 'General'} · {images.length}/{maxImages} images
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
          Cloudinary
        </span>
      </header>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {notice && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          <CheckCircle2 size={17} className="mr-1 inline" />
          {notice}
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-3">
          <h3 className="font-semibold">ছবি নির্বাচন</h3>

          {localPreview ? (
            <div className="flex min-h-52 items-center justify-center overflow-hidden rounded-xl bg-gray-50 p-3">
              <img
                src={localPreview}
                alt={seo.alt || 'Selected image preview'}
                className="max-h-72 max-w-full object-contain"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy || images.length >= maxImages}
              className="flex min-h-52 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-5 text-center hover:border-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
            >
              <Upload size={32} className="mb-3 text-emerald-700" />
              <span className="font-semibold">ছবি নির্বাচন করুন</span>
              <span className="mt-2 text-xs text-gray-500">
                JPEG, PNG, WebP, AVIF · Max {maxSizeMB} MB
              </span>
            </button>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            hidden
            onChange={(event) => chooseFile(event.target.files?.[0])}
          />

          {file && (
            <div className="rounded-lg bg-gray-50 p-3 text-sm">
              <p className="break-all font-medium">{file.name}</p>
              <p className="mt-1 text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (inputRef.current) inputRef.current.value = '';
                }}
                className="mt-2 text-sm text-red-600"
              >
                অন্য ছবি নির্বাচন করুন
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Image SEO তথ্য</h3>

          {[
            ['title', 'Image Title', 'কালোজিরা ফুলের মধু'],
            ['alt', 'Alt Text *', 'ছবিতে কী দেখা যাচ্ছে?'],
            ['caption', 'Caption', 'ছবির নিচে দেখানোর লেখা'],
          ].map(([key, label, placeholder]) => (
            <div key={key}>
              <label className="mb-1 block text-sm font-medium" htmlFor={`seo-${key}`}>
                {label}
              </label>
              <input
                id={`seo-${key}`}
                value={seo[key]}
                onChange={(event) => updateSeo(key, event.target.value)}
                placeholder={placeholder}
                maxLength={250}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          ))}

          <div>
            <label htmlFor="seo-description" className="mb-1 block text-sm font-medium">
              Image Description
            </label>
            <textarea
              id="seo-description"
              rows={3}
              maxLength={1000}
              value={seo.description}
              onChange={(event) => updateSeo('description', event.target.value)}
              placeholder="ছবির সঠিক বর্ণনা লিখুন..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label htmlFor="seo-keywords" className="mb-1 block text-sm font-medium">
              Keywords
            </label>
            <input
              id="seo-keywords"
              value={seo.keywords}
              onChange={(event) => updateSeo('keywords', event.target.value)}
              placeholder="কালোজিরা ফুলের মধু, Shalban Food"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-emerald-600"
            />
          </div>

          <button
            type="button"
            onClick={makeSuggestedSEO}
            className="w-full rounded-lg border border-emerald-700 px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
          >
            Suggest SEO Text
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={uploadImage}
        disabled={!file || busy || images.length >= maxImages}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? (
          <LoaderCircle size={20} className="animate-spin" />
        ) : (
          <Upload size={20} />
        )}
        {busy ? 'Uploading image...' : 'Upload Image + SEO'}
      </button>

      {images.length > 0 && (
        <div className="space-y-3 border-t pt-5">
          <h3 className="font-semibold">আপলোড করা ছবি ({images.length})</h3>

          {images.map((image) => (
            <article
              key={image.publicId}
              className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row"
            >
              <img
                src={image.url}
                alt={image.alt || ''}
                className="h-28 w-full rounded-lg bg-gray-50 object-contain sm:w-28"
              />

              <div className="min-w-0 flex-1 space-y-2">
                <p className="break-all text-xs text-gray-500">
                  {image.publicId}
                </p>

                <label className="block text-sm">
                  <span className="mb-1 block font-medium">Alt Text</span>
                  <input
                    value={image.alt || ''}
                    maxLength={250}
                    onChange={(event) =>
                      updateUploadedImage(
                        image.publicId,
                        'alt',
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block font-medium">Title</span>
                  <input
                    value={image.title || ''}
                    maxLength={250}
                    onChange={(event) =>
                      updateUploadedImage(
                        image.publicId,
                        'title',
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPrimary(image.publicId)}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold ${
                      image.isPrimary
                        ? 'bg-amber-100 text-amber-900'
                        : 'border text-gray-600'
                    }`}
                  >
                    <Star size={15} />
                    {image.isPrimary ? 'Main Image' : 'Set as Main'}
                  </button>

                  <button
                    type="button"
                    onClick={() => removeImage(image.publicId)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                  >
                    <Trash2 size={15} />
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="text-xs leading-5 text-gray-500">
        <FileImage size={14} className="mr-1 inline" />
        আপলোডের পরে SEO field পরিবর্তন করলে তা parent form-এর value-তে
        পরিবর্তিত হয়। Cloudinary-তে আগের metadata স্বয়ংক্রিয়ভাবে
        আপডেট হয় না; পরিবর্তিত তথ্য Product/Blog/Combo-র database-এ
        সংরক্ষণ করতে হবে।
      </p>
    </section>
  );
}