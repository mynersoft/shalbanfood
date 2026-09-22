import { connectDB } from "@/lib/dbConnect";
import CustomerDue from "@/models/Due";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
	await connectDB();

	try {
		const body = await req.json();

		// 1. Find the current due record
		const due = await CustomerDue.findById(params.id);
		if (!due) {
			return NextResponse.json(
				{ success: false, message: "Due record not found" },
				{ status: 404 }
			);
		}

		// 2. New amount calculation
		const newAmount = Number(due.amount) - Number(body.amount);

		// Prevent negative values (optional)
		const finalAmount = newAmount < 0 ? 0 : newAmount;

		// 3. Update record
		const updated = await CustomerDue.findByIdAndUpdate(
			params.id,
			{ ...body, amount: finalAmount },
			{ new: true }
		);

		return NextResponse.json({ success: true, updated });
	} catch (error) {
		return NextResponse.json(
			{ success: false, message: error.message },
			{ status: 500 }
		);
	}
}


export async function DELETE(req, { params }) {
	await connectDB();
	await CustomerDue.findByIdAndDelete(params.id);
	return NextResponse.json({ message: "Deleted successfully" });
}
