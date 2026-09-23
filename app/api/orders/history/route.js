import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		await connectDB();
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const orders = await Order.find({ user: session.user.id })
			.sort({ createdAt: -1 })
			.populate("products.productId");

		return NextResponse.json(orders, { status: 200 });
	} catch (err) {
		console.error(err);
		return NextResponse.json({ message: "Server Error" }, { status: 500 });
	}
}