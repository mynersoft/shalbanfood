// app/api/service/[id]/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/dbConnect";
import ServiceRecords from "@/models/ServiceRecords";

export async function GET(req, { params }) {
	await connectDB();
	try {
		const rec = await ServiceRecords.findById(params.id).lean();
		if (!rec)
			return NextResponse.json(
				{ success: false, message: "Not found" },
				{ status: 404 }
			);
		return NextResponse.json(
			{ success: true, record: rec },
			{ status: 200 }
		);
	} catch (err) {
		console.error("GET /api/service/[id] error:", err);
		return NextResponse.json(
			{ success: false, message: err.message },
			{ status: 500 }
		);
	}
}

export async function PUT(req, { params }) {
    	await connectDB();
	try {
		const body = await req.json();
		const updated = await ServiceRecords.findByIdAndUpdate(params.id, body, {
			new: true,
			runValidators: true,
		}).lean();
		if (!updated)
			return NextResponse.json(
				{ success: false, message: "Not found" },
				{ status: 404 }
			);
		return NextResponse.json(
			{ success: true, record: updated },
			{ status: 200 }
		);
	} catch (err) {
		console.error("PUT /api/service/[id] error:", err);
		return NextResponse.json(
			{ success: false, message: err.message },
			{ status: 500 }
		);
	}
}

export async function DELETE(req, { params }) {
    	await connectDB();
	try {
		const rec = await ServiceRecords.findById(params.id);
		if (!rec)
			return NextResponse.json(
				{ success: false, message: "Not found" },
				{ status: 404 }
			);
		await rec.deleteOne();
		return NextResponse.json(
			{ success: true, message: "Deleted" },
			{ status: 200 }
		);
	} catch (err) {
		console.error("DELETE /api/service/[id] error:", err);
		return NextResponse.json(
			{ success: false, message: err.message },
			{ status: 500 }
		);
	}
}
