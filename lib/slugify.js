const BANGLA_SLUG_MAP = {
    "মধু": "honey",
    "খেজুর": "dates",
    "গাওয়া ঘি": "ghee",
    "ঘি": "ghee",
    "বাদাম": "nuts",
    "শুকনা খাবার": "dry-foods",
    "শুকনা ফল": "dry-fruits",
    "ড্রাই ফ্রুটস": "dry-fruits",
    "প্রাকৃতিক খাবার": "natural-foods",
};

export function slugify(value = "") {
    const text = String(value).trim();

    if (!text) {
        return "";
    }

    const mapped = BANGLA_SLUG_MAP[text];

    if (mapped) {
        return mapped;
    }

    return text
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function createUniqueSlug(value = "") {
    return slugify(value);
}