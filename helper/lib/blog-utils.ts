export const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

export const stripHtml = (html: string) =>
  html.replace(/<[^>]*>?/gm, "");

export const makeExcerpt = (content: string, length = 160) =>
  stripHtml(content).substring(0, length);

export const makeSEO = (title: string, content: string) => ({
  metaTitle: title.substring(0, 60),
  metaDescription: makeExcerpt(content, 160),
});