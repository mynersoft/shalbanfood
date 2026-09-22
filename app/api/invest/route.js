import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Invest from "@/models/Invest";

import Bill from "@/models/Bill";

export async function GET() {
  try {
    await connectDB();

    // Fetch all invest records
    const allInvests = await Invest.find().sort({ createdAt: -1 });

    // Total invest (sum of all amounts)
    const totalInvest = allInvests.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    // Filter tools amount
    const totalToolsInvest = allInvests
      .filter((item) => item.investType === "tools")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    // Filter malamal amount
    const totalMalamalInvest = allInvests
      .filter((item) => item.investType === "malamal")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    // Fetch all Bills
    const allBills = await Bill.find();

    // Total Bill amount
    const totalBill = allBills.reduce(
      (sum, b) => sum + Number(b.amount || 0),
      0
    );

    // Final Total = totalBill + totalInvest
    const finalTotalInvest = totalBill + totalInvest;

    return NextResponse.json({
      success: true,
      items: allInvests,
      toolsAmount: totalToolsInvest,
      malamalsAmount: totalMalamalInvest,
      totalInvest,
     
      finalTotalInvest,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}





export async function POST(request) {
	try {
		await connectDB();
		const body = await request.json();
		const created = await Invest.create(body);
		return NextResponse.json(created);
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}

export async function PUT(request) {
	try {
		await connectDB();
		const body = await request.json();
		const updated = await Invest.findByIdAndUpdate(body._id, body, {
			new: true,
		});
		return NextResponse.json(updated);
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}

export async function DELETE(request) {
	try {
		await connectDB();
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		await Invest.findByIdAndDelete(id);
		return NextResponse.json({ success: true });
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}
