export async function POST(req) {
  try {
    const { query } = await req.json();

    const GOOGLE_API_KEY = AIzaSyAt78sBTwCqXnU3WERRTPgN25GVZRgYiio;
    const CX = "8321052658f004181";

    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${CX}&searchType=image&q=${encodeURIComponent(
      query
    )}`;

    const res = await fetch(url);
    const data = await res.json();

console.log(data.items);

    return Response.json({ images: data.items || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}