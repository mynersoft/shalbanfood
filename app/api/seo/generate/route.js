import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'OPENAI_API_KEY is not configured.',
                },
                { status: 503 }
            );
        }

        const body = await req.json();

        const {
            name,
            description,
            shortDescription,
            category,
            subCategory,
            brand,
            variants,
        } = body;

        if (!name?.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Product name is required.',
                },
                { status: 400 }
            );
        }

        const prompt = `
You are an expert e-commerce SEO specialist for Shalban Food,
a Bangladesh-based online natural food store.

Generate SEO metadata for this product.

Product name: ${name}
Category: ${category || ''}
Subcategory: ${subCategory || ''}
Brand: ${brand || 'Shalban Food'}
Short description: ${shortDescription || ''}
Full description: ${description || ''}
Variants: ${JSON.stringify(variants || [])}

Requirements:
- Target Bangladesh customers.
- Write naturally in Bangla when the product information is Bangla.
- Use English when the product name and information are English.
- Never invent certifications, health benefits, ingredients, origin,
  availability, or product qualities that were not supplied.
- Use relevant search keywords, not keyword stuffing.
- SEO title: concise, ideally 50-60 characters, maximum 70.
- SEO description: compelling, ideally 140-160 characters, maximum 160.
- Keywords: 5-10 relevant keywords as an array of strings.
- Slug: short, readable, lowercase, hyphen-separated.
  For Bangla products, a short English transliteration or meaningful
  English slug is preferred.
- Canonical URL: return an empty string. The application will construct it.
- Return valid JSON only. Do not include Markdown fences.

Required JSON structure:
{
  "seoTitle": "string",
  "seoDescription": "string",
  "keywords": ["string"],
  "slug": "string",
  "canonicalUrl": ""
}
`;

        const response = await fetch(
            'https://api.openai.com/v1/responses',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: process.env.OPENAI_SEO_MODEL || 'gpt-4.1-mini',
                    instructions:
                        'Return only valid JSON. Follow the requested schema and never fabricate product claims.',
                    input: prompt,
                    max_output_tokens: 700,
                }),
                signal: AbortSignal.timeout(30000),
            }
        );

        if (!response.ok) {
            const errorBody = await response.text();

            console.error('OpenAI SEO API error:', errorBody);

            return NextResponse.json(
                {
                    success: false,
                    message: 'AI SEO generation failed. Please try again.',
                },
                { status: 502 }
            );
        }

        const result = await response.json();

        const outputText = result.output
            ?.filter((item) => item.type === 'message')
            .flatMap((item) => item.content || [])
            .filter((item) => item.type === 'output_text')
            .map((item) => item.text)
            .join('\n');

        if (!outputText) {
            throw new Error('AI returned an empty response.');
        }

        const cleaned = outputText
            .trim()
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/\s*```$/, '');

        const seo = JSON.parse(cleaned);

        const keywords = Array.isArray(seo.keywords)
            ? [...new Set(
                seo.keywords
                    .map((keyword) => String(keyword).trim())
                    .filter(Boolean)
                    .map((keyword) => keyword.slice(0, 100))
            )].slice(0, 10)
            : [];

        const seoTitle = String(seo.seoTitle || '')
            .trim()
            .slice(0, 70);

        const seoDescription = String(seo.seoDescription || '')
            .trim()
            .slice(0, 160);

        const slug = String(seo.slug || '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 150);

        return NextResponse.json({
            success: true,
            seo: {
                seoTitle,
                seoDescription,
                keywords,
                slug,
                canonicalUrl: '',
            },
        });
    } catch (error) {
        console.error('SEO GENERATION ERROR:', error);

        return NextResponse.json(
            {
                success: false,
                message:
                    error.name === 'TimeoutError'
                        ? 'AI request timed out. Please try again.'
                        : 'Unable to generate SEO metadata.',
            },
            { status: 500 }
        );
    }
}