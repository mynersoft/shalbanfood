import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?status=failed`
  );
}