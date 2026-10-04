import { connectDB } from "@/lib/dbConnect";
import Cart from "@/models/Cart";

// GET cart for a user (optional if you have auth)
export async function GET(req) {
	try {
		await connectDB();
		const url = new URL(req.url);
		const userId = url.searchParams.get("userId"); // pass user id

		const cart = await Cart.findOne({ user: userId }).populate(
			"products.product"
		);
		return new Response(JSON.stringify({ success: true, cart }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err) {
		return new Response(
			JSON.stringify({ success: false, error: err.message }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}



export async function POST(req) {
	try {
		await connectDB();
		const { user, productId, quantity } = await req.json();

		if (!user || !productId) {
			return new Response(
				JSON.stringify({
					success: false,
					error: "User and product are required",
				}),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		let cart = await Cart.findOne({ user });

		if (!cart) {
			cart = new Cart({
				user,
				products: [{ product: productId, quantity }],
			});
		} else {
			const existingProduct = cart.products.find(
				(p) => p.product.toString() === productId
			);
			if (existingProduct) {
				existingProduct.quantity += quantity;
			} else {
				cart.products.push({ product: productId, quantity });
			}
		}

		await cart.save();

		return new Response(JSON.stringify({ success: true, cart }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err) {
		console.error("ADD TO CART ERROR:", err);
		return new Response(
			JSON.stringify({ success: false, error: err.message }),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
}



// DELETE product from cart
export async function DELETE(req) {
	try {
		await connectDB();
		const { searchParams } = new URL(req.url);
		const userId = searchParams.get("userId");
		const productId = searchParams.get("productId");

		let cart = await Cart.findOne({ user: userId });
		if (!cart) throw new Error("Cart not found");

		cart.products = cart.products.filter(
			(p) => p.product.toString() !== productId
		);

		await cart.save();
		return new Response(JSON.stringify({ success: true, cart }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err) {
		return new Response(
			JSON.stringify({ success: false, error: err.message }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
