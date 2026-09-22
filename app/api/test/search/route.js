import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "shoes";

  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  const GOOGLE_CX = process.env.CX;

  try {
    const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&searchType=image&q=${encodeURIComponent(
      query
    )}&num=15`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    const images = (data.items || []).map((item) => ({
      src: item.link,
      title: item.title,
    }));

    return NextResponse.json({ images });
  } catch (e) {
    return NextResponse.json(
      { message: "Search error", error: e.message },
      { status: 500 }
    );
  }
}