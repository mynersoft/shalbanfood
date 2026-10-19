
'use client';

import { useEffect, useRef, useState } from 'react';
import {
    Save,
    X,
    Upload,
    Image as ImageIcon,
    Loader2,
    Search,
    FileText,
    Link as LinkIcon,
    Tag,
    CheckCircle2,
    AlertCircle,
    Eye,
} from 'lucide-react';

const SITE_URL = 'https://www.shalbanfood.shop';

const emptyForm = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    featuredImagePublicId: '',
    featuredImageAlt: '',
    category: 'Food & Nutrition',
    tags: '',
    author: 'Shalban Food',
    seoTitle: '',
    seoDescription: '',
    keywords: '',
    canonicalUrl: '',
    status: 'draft',
};

const inputClass =
    'w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/30';

const labelClass = 'mb-2 block text-sm font-medium text-zinc-200';

function slugify(value) {
    return String(value || '')
        .normalize('NFKC')
        .toLowerCase()
        .trim()
        // Preserve Bengali and other Unicode letters/numbers.
        .replace(/[^\p{L}\p{N}\s-]/gu, '')
        .replace(/[\s-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function splitList(value) {
    return [
        ...new Set(
            String(value || '')
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean)
        ),
    ];
}

function isValidUrl(value) {
    if (!value) return true;

    try {
        const url = new URL(value);
        return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
        return false;
    }
}

function getInitialForm(blog) {
    if (!blog) return { ...emptyForm };

    return {
        title: blog.title || '',
        slug: blog.slug || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        featuredImage: blog.featuredImage || '',
        featuredImagePublicId: blog.featuredImagePublicId || '',
        featuredImageAlt: blog.featuredImageAlt || '',
        category: blog.category || 'Food & Nutrition',
        tags: Array.isArray(blog.tags)
            ? blog.tags.join(', ')
            : '',
        author: blog.author || 'Shalban Food',
        seoTitle: blog.seoTitle || '',
        seoDescription: blog.seoDescription || '',
        keywords: Array.isArray(blog.keywords)
            ? blog.keywords.join(', ')
            : '',
        canonicalUrl: blog.canonicalUrl || '',
        status: blog.status || 'draft',
    };
}

function CharacterCount({ value, max, ideal }) {
    const length = value.length;

    let color = 'text-zinc-500';

    if (length > max) {
        color = 'text-red-400';
    } else if (ideal && length > ideal) {
        color = 'text-yellow-400';
    } else if (length > 0) {
        color = 'text-green-400';
    }

    return (
        <span className={`text-xs ${color}`}>
            {length}/{max}
        </span>
    );
}

export default function BlogForm({
    editingBlog,
    onSubmit,
    onCancel,
    loading = false,
}) {
    const [form, setForm] = useState(() =>
        getInitialForm(editingBlog)
    );

    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(
        Boolean(editingBlog?.slug)
    );

    const fileInputRef = useRef(null);

    // Load the selected blog when editing.
    useEffect(() => {
        setForm(getInitialForm(editingBlog));
        setSlugManuallyEdited(Boolean(editingBlog?.slug));
        setUploadError('');
        setSubmitError('');

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [editingBlog]);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setSubmitError('');
    }

    // Generate a Unicode-safe slug.
    function handleTitleChange(event) {
        const value = event.target.value;

        setForm((previous) => ({
            ...previous,
            title: value,
            slug: slugManuallyEdited
                ? previous.slug
                : slugify(value),
            seoTitle:
                !previous.seoTitle ||
                previous.seoTitle === previous.title
                    ? value
                    : previous.seoTitle,
        }));

        setSubmitError('');
    }

    function handleGenerateSlug() {
        if (!form.title.trim()) {
            setSubmitError('প্রথমে Blog title লিখুন।');
            return;
        }

        setForm((previous) => ({
            ...previous,
            slug: slugify(previous.title),
        }));

        setSlugManuallyEdited(false);
        setSubmitError('');
    }

    // Generate a canonical URL preview from the current slug.
    const canonicalPreview = form.slug.trim()
        ? `${SITE_URL}/blog/${encodeURIComponent(form.slug.trim())}`
        : `${SITE_URL}/blog/your-blog-slug`;

    function handleCanonicalAutoFill() {
        if (!form.slug.trim()) {
            setSubmitError('Canonical URL তৈরির আগে slug দিন।');
            return;
        }

        setForm((previous) => ({
            ...previous,
            canonicalUrl: `${SITE_URL}/blog/${encodeURIComponent(
                previous.slug.trim()
            )}`,
        }));

        setSubmitError('');
    }

    async function handleImageUpload(event) {
        const file = event.target.files?.[0];

        if (!file) return;

        setUploadError('');

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
        ];

        if (!allowedTypes.includes(file.type)) {
            setUploadError(
                'শুধু JPG, PNG অথবা WEBP image upload করুন।'
            );
            event.target.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Image size সর্বোচ্চ 5MB হতে পারবে।');
            event.target.value = '';
            return;
        }

        try {
            setUploadingImage(true);

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload/blog', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok || !data.success || !data.url) {
                throw new Error(
                    data.message || 'Image upload ব্যর্থ হয়েছে।'
                );
            }

            setForm((previous) => ({
                ...previous,
                featuredImage: data.url,
                featuredImagePublicId: data.public_id || '',
                featuredImageAlt:
                    previous.featuredImageAlt ||
                    previous.title ||
                    'Shalban Food blog image',
            }));
        } catch (error) {
            console.error('Blog image upload error:', error);

            setUploadError(
                error.message ||
                    'Image upload করতে সমস্যা হয়েছে।'
            );
        } finally {
            setUploadingImage(false);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }

    function removeImage() {
        setForm((previous) => ({
            ...previous,
            featuredImage: '',
            featuredImagePublicId: '',
        }));

        setUploadError('');

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setSubmitError('');
        setUploadError('');

        if (!form.title.trim()) {
            setSubmitError('Blog title লিখুন।');
            return;
        }

        if (!form.slug.trim()) {
            setSubmitError(
                'Slug লিখুন অথবা Generate from title চাপুন।'
            );
            return;
        }

        if (!form.content.trim()) {
            setSubmitError('Blog content লিখুন।');
            return;
        }

        if (form.seoTitle.length > 70) {
            setSubmitError('SEO title সর্বোচ্চ 70 characters রাখুন।');
            return;
        }

        if (form.seoDescription.length > 170) {
            setSubmitError(
                'SEO description সর্বোচ্চ 170 characters রাখুন।'
            );
            return;
        }

        if (!isValidUrl(form.canonicalUrl.trim())) {
            setSubmitError(
                'Canonical URL সঠিক HTTP/HTTPS URL হতে হবে।'
            );
            return;
        }

        if (
            form.featuredImage.trim() &&
            !isValidUrl(form.featuredImage.trim())
        ) {
            setSubmitError(
                'Featured image-এর URL সঠিক নয়।'
            );
            return;
        }

        const slug = slugify(form.slug);

        if (!slug) {
            setSubmitError('একটি বৈধ slug দিন।');
            return;
        }

        const blogData = {
            ...form,
            title: form.title.trim(),
            slug,
            excerpt: form.excerpt.trim(),
            content: form.content.trim(),
            featuredImage: form.featuredImage.trim(),
            featuredImagePublicId:
                form.featuredImagePublicId.trim(),
            featuredImageAlt: form.featuredImageAlt.trim(),
            category: form.category.trim() || 'Food & Nutrition',
            author: form.author.trim() || 'Shalban Food',
            seoTitle: form.seoTitle.trim(),
            seoDescription: form.seoDescription.trim(),
            canonicalUrl: form.canonicalUrl.trim(),
            tags: splitList(form.tags),
            keywords: splitList(form.keywords),
            status: form.status,
        };

        try {
            await onSubmit(blogData);
        } catch (error) {
            setSubmitError(
                error?.message || 'Blog save করতে সমস্যা হয়েছে।'
            );
        }
    }

    const pageTitle = editingBlog
        ? 'Edit Blog Post'
        : 'Create Blog Post';

    const previewTitle =
        form.seoTitle.trim() || form.title.trim() || 'Blog Title';

    const previewDescription =
        form.seoDescription.trim() ||
        form.excerpt.trim() ||
        'আপনার blog-এর SEO description এখানে দেখা যাবে।';

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-zinc-800 bg-[#131318] p-4 text-white sm:p-6"
        >
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-xl font-semibold">
                        {pageTitle}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-400">
                        Shalban Food-এর জন্য SEO-friendly blog তৈরি করুন।
                    </p>
                </div>

                <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                        form.status === 'published'
                            ? 'bg-green-950 text-green-400'
                            : 'bg-yellow-950 text-yellow-400'
                    }`}
                >
                    {form.status === 'published'
                        ? 'Published'
                        : 'Draft'}
                </span>
            </div>

            {/* General errors */}
            {submitError && (
                <div
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-red-800 bg-red-950/30 p-3 text-sm text-red-300"
                >
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <span>{submitError}</span>
                </div>
            )}

            {/* Basic information */}
            <section className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold">
                    <FileText size={18} className="text-green-400" />
                    Blog Information
                </h3>

                <div>
                    <label htmlFor="blog-title" className={labelClass}>
                        Blog Title *
                    </label>

                    <input
                        id="blog-title"
                        name="title"
                        value={form.title}
                        onChange={handleTitleChange}
                        required
                        maxLength={180}
                        className={inputClass}
                        placeholder="সুন্দরবনের মধু: উপকারিতা ও বৈশিষ্ট্য"
                    />

                    <div className="mt-1 flex justify-between">
                        <span className="text-xs text-zinc-500">
                            স্পষ্ট ও নির্দিষ্ট শিরোনাম ব্যবহার করুন।
                        </span>
                        <CharacterCount
                            value={form.title}
                            max={180}
                        />
                    </div>
                </div>

                <div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <label htmlFor="blog-slug" className="text-sm font-medium">
                            URL Slug *
                        </label>

                        <button
                            type="button"
                            onClick={handleGenerateSlug}
                            className="text-xs font-medium text-green-400 hover:text-green-300"
                        >
                            Generate from title
                        </button>
                    </div>

                    <input
                        id="blog-slug"
                        name="slug"
                        value={form.slug}
                        onChange={(event) => {
                            setSlugManuallyEdited(true);
                            handleChange(event);
                        }}
                        required
                        maxLength={180}
                        className={inputClass}
                        placeholder="sundarbans-honey-benefits"
                    />

                    <p className="mt-2 break-all text-xs text-zinc-500">
                        URL preview: {SITE_URL}/blog/{form.slug || 'your-blog-slug'}
                    </p>
                </div>

                <div>
                    <label htmlFor="blog-excerpt" className={labelClass}>
                        Excerpt / Short Description
                    </label>

                    <textarea
                        id="blog-excerpt"
                        name="excerpt"
                        value={form.excerpt}
                        onChange={handleChange}
                        rows={3}
                        maxLength={320}
                        className={inputClass}
                        placeholder="এই পোস্টে কী জানতে পারবেন, সংক্ষেপে লিখুন..."
                    />

                    <div className="mt-1 flex justify-end">
                        <CharacterCount
                            value={form.excerpt}
                            max={320}
                        />
                    </div>
                </div>
            </section>

            <div className="border-t border-zinc-800" />

            {/* Featured image */}
            <section className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold">
                    <ImageIcon size={18} className="text-green-400" />
                    Featured Image
                </h3>

                <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/60 p-5 text-center">
                    <ImageIcon
                        size={32}
                        className="mx-auto mb-3 text-zinc-500"
                    />

                    <p className="text-sm font-medium">
                        Blog-এর মূল ছবি আপলোড করুন
                    </p>

                    <p className="mb-4 mt-1 text-xs text-zinc-500">
                        JPG, PNG, WEBP · সর্বোচ্চ 5MB
                    </p>

                    <input
                        ref={fileInputRef}
                        id="blog-image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageUpload}
                        disabled={uploadingImage || loading}
                        className="hidden"
                    />

                    <label
                        htmlFor="blog-image"
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
                            uploadingImage || loading
                                ? 'cursor-not-allowed bg-zinc-700 text-zinc-400'
                                : 'cursor-pointer bg-green-600 hover:bg-green-700'
                        }`}
                    >
                        {uploadingImage ? (
                            <>
                                <Loader2 size={17} className="animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload size={17} />
                                Upload Image
                            </>
                        )}
                    </label>
                </div>

                {uploadError && (
                    <p role="alert" className="text-sm text-red-400">
                        {uploadError}
                    </p>
                )}

                {form.featuredImage && (
                    <div className="overflow-hidden rounded-xl border border-zinc-700">
                        <img
                            src={form.featuredImage}
                            alt={
                                form.featuredImageAlt ||
                                form.title ||
                                'Shalban Food blog image'
                            }
                            className="max-h-80 w-full object-contain"
                            loading="lazy"
                        />

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-700 p-3">
                            <p className="max-w-full break-all text-xs text-zinc-400">
                                {form.featuredImage}
                            </p>

                            <button
                                type="button"
                                onClick={removeImage}
                                disabled={uploadingImage || loading}
                                className="flex shrink-0 items-center gap-1 rounded-lg bg-red-950 px-3 py-2 text-sm text-red-300 hover:bg-red-900 disabled:opacity-50"
                            >
                                <X size={16} />
                                Remove
                            </button>
                        </div>
                    </div>
                )}

                <div>
                    <label
                        htmlFor="featured-image-url"
                        className={labelClass}
                    >
                        Image URL
                    </label>

                    <input
                        id="featured-image-url"
                        name="featuredImage"
                        type="url"
                        value={form.featuredImage}
                        onChange={(event) => {
                            setForm((previous) => ({
                                ...previous,
                                featuredImage: event.target.value,
                                featuredImagePublicId: '',
                            }));
                        }}
                        className={inputClass}
                        placeholder="https://res.cloudinary.com/..."
                    />
                </div>

                <div>
                    <label
                        htmlFor="featured-image-alt"
                        className={labelClass}
                    >
                        Image Alt Text
                    </label>

                    <input
                        id="featured-image-alt"
                        name="featuredImageAlt"
                        value={form.featuredImageAlt}
                        onChange={handleChange}
                        maxLength={200}
                        className={inputClass}
                        placeholder="যেমন: শালবন ফুডের সুন্দরবনের মধুর বোতল"
                    />

                    <p className="mt-1 text-xs text-zinc-500">
                        ছবিতে আসলে যা দেখা যাচ্ছে, সেটিই সংক্ষেপে লিখুন।
                    </p>
                </div>
            </section>

            <div className="border-t border-zinc-800" />

            {/* Content */}
            <section className="space-y-3">
                <h3 className="font-semibold">Blog Content *</h3>

                <label htmlFor="blog-content" className="text-xs text-zinc-400">
                    HTML content supported
                </label>

                <textarea
                    id="blog-content"
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    required
                    rows={20}
                    className={`${inputClass} resize-y font-mono text-sm leading-6`}
                    placeholder="<h2>ভূমিকা</h2><p>আপনার ব্লগের লেখা...</p>"
                />

                <p className="text-xs text-zinc-500">
                    Heading-এর জন্য h2/h3, paragraph-এর জন্য p এবং তালিকার জন্য ul/li ব্যবহার করতে পারেন।
                </p>
            </section>

            <div className="border-t border-zinc-800" />

            {/* Category and author */}
            <section className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="blog-category" className={labelClass}>
                        Category
                    </label>

                    <input
                        id="blog-category"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        maxLength={100}
                        className={inputClass}
                        placeholder="মধু ও প্রাকৃতিক খাবার"
                    />
                </div>

                <div>
                    <label htmlFor="blog-author" className={labelClass}>
                        Author
                    </label>

                    <input
                        id="blog-author"
                        name="author"
                        value={form.author}
                        onChange={handleChange}
                        maxLength={100}
                        className={inputClass}
                        placeholder="Shalban Food"
                    />
                </div>
            </section>

            {/* Tags */}
            <section>
                <label htmlFor="blog-tags" className={labelClass}>
                    <Tag size={16} className="mr-1 inline" />
                    Tags
                </label>

                <input
                    id="blog-tags"
                    name="tags"
                    value={form.tags}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="সুন্দরবনের মধু, খাঁটি মধু, প্রাকৃতিক খাবার"
                />

                <p className="mt-1 text-xs text-zinc-500">
                    কমা দিয়ে আলাদা করুন।
                </p>
            </section>

            <div className="border-t border-zinc-800" />

            {/* SEO */}
            <section className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold">
                    <Search size={18} className="text-green-400" />
                    SEO Settings
                </h3>

                <div>
                    <label htmlFor="seo-title" className={labelClass}>
                        SEO Title
                    </label>

                    <input
                        id="seo-title"
                        name="seoTitle"
                        value={form.seoTitle}
                        onChange={handleChange}
                        maxLength={70}
                        className={inputClass}
                        placeholder="সুন্দরবনের মধু: উপকারিতা | Shalban Food"
                    />

                    <div className="mt-1 flex justify-between gap-3">
                        <span className="text-xs text-zinc-500">
                            সংক্ষিপ্ত ও পেজের সঙ্গে প্রাসঙ্গিক রাখুন।
                        </span>
                        <CharacterCount
                            value={form.seoTitle}
                            max={70}
                            ideal={60}
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="seo-description"
                        className={labelClass}
                    >
                        SEO Description
                    </label>

                    <textarea
                        id="seo-description"
                        name="seoDescription"
                        value={form.seoDescription}
                        onChange={handleChange}
                        rows={3}
                        maxLength={170}
                        className={inputClass}
                        placeholder="সুন্দরবনের মধুর বৈশিষ্ট্য, উপকারিতা ও খাঁটি মধু যাচাইয়ের উপায় জানুন।"
                    />

                    <div className="mt-1 flex justify-between gap-3">
                        <span className="text-xs text-zinc-500">
                            পাঠকের জন্য পোস্টের সারাংশ লিখুন।
                        </span>
                        <CharacterCount
                            value={form.seoDescription}
                            max={170}
                            ideal={160}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="seo-keywords" className={labelClass}>
                        Keywords
                    </label>

                    <input
                        id="seo-keywords"
                        name="keywords"
                        value={form.keywords}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="সুন্দরবনের মধু, খাঁটি মধু, Sundarbans honey"
                    />

                    <p className="mt-1 text-xs text-zinc-500">
                        কমা দিয়ে আলাদা করুন। Google-এর meta keywords ranking factor নয়।
                    </p>
                </div>

                <div>
                    <label htmlFor="canonical-url" className={labelClass}>
                        <LinkIcon size={15} className="mr-1 inline" />
                        Canonical URL
                    </label>

                    <input
                        id="canonical-url"
                        name="canonicalUrl"
                        type="url"
                        value={form.canonicalUrl}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder={canonicalPreview}
                    />

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs text-zinc-500">
                            ফাঁকা রাখলে আপনার page metadata-তে self-canonical তৈরি করুন।
                        </p>

                        <button
                            type="button"
                            onClick={handleCanonicalAutoFill}
                            className="text-xs font-medium text-green-400 hover:text-green-300"
                        >
                            Generate URL
                        </button>
                    </div>
                </div>

                {/* Search preview */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                    <div className="mb-3 flex items-center gap-2 text-xs font-medium text-zinc-400">
                        <Eye size={15} />
                        Search Result Preview
                    </div>

                    <p className="break-all text-xs text-green-400">
                        www.shalbanfood.shop › blog › {form.slug || 'your-blog-slug'}
                    </p>

                    <h4 className="mt-1 line-clamp-2 text-lg text-blue-400">
                        {previewTitle}
                    </h4>

                    <p className="mt-1 line-clamp-3 text-sm leading-6 text-zinc-300">
                        {previewDescription}
                    </p>
                </div>
            </section>

            <div className="border-t border-zinc-800" />

            {/* Publish status */}
            <section>
                <label htmlFor="blog-status" className={labelClass}>
                    Publish Status
                </label>

                <select
                    id="blog-status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={inputClass}
                >
                    <option value="draft">Draft — পরে প্রকাশ করব</option>
                    <option value="published">Published — প্রকাশ করুন</option>
                </select>

                {form.status === 'published' && (
                    <p className="mt-2 flex items-center gap-2 text-xs text-green-400">
                        <CheckCircle2 size={15} />
                        Published status নির্বাচন করা হয়েছে।
                    </p>
                )}
            </section>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 border-t border-zinc-800 pt-5">
                <button
                    type="submit"
                    disabled={loading || uploadingImage}
                    className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-medium transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            {editingBlog ? 'Updating...' : 'Saving...'}
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            {editingBlog ? 'Update Blog' : 'Save Blog'}
                        </>
                    )}
                </button>

                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading || uploadingImage}
                        className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 font-medium transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X size={18} />
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
