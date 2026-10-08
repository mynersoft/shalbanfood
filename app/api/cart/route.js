import { connectDB } from '@/lib/dbConnect';
import Cart from '@/models/Cart';
import Product from '@/models/Product';

/**
 * Convert value to positive integer
 */
function normalizeQuantity(value) {
	const qty = Number(value);

	if (!Number.isFinite(qty) || qty < 1) {
		return 1;
	}

	return Math.floor(qty);
}

/**
 * Compare product + variant
 *
 * Product without variant:
 * productId + null
 *
 * Product with variant:
 * productId + variantId
 */
function isSameCartItem(item, productId, variantId) {
	const sameProduct = item.product?.toString() === productId?.toString();

	const itemVariantId = item.variantId ? item.variantId.toString() : null;

	const requestedVariantId = variantId ? variantId.toString() : null;

	return sameProduct && itemVariantId === requestedVariantId;
}

/**
 * Get variant price
 */
function getVariantPrice(product, variantId) {
	if (!variantId) {
		const regularPrice = Number(product?.regularPrice || 0);
		const sellPrice = Number(product?.sellPrice || 0);

		return sellPrice > 0 ? sellPrice : regularPrice;
	}

	if (!Array.isArray(product?.variants)) {
		return null;
	}

	const variant = product.variants.find(
		(item) => item?._id?.toString() === variantId.toString()
	);

	if (!variant) {
		return null;
	}

	const regularPrice = Number(variant.regularPrice || 0);
	const sellPrice = Number(variant.sellPrice || 0);

	return sellPrice > 0 ? sellPrice : regularPrice;
}

/**
 * Find selected variant
 */
function getVariant(product, variantId) {
	if (!variantId || !Array.isArray(product?.variants)) {
		return null;
	}

	return (
		product.variants.find(
			(item) => item?._id?.toString() === variantId.toString()
		) || null
	);
}

/**
 * Convert cart DB item into frontend-friendly item
 */
function serializeCartItem(cartItem) {
	const product = cartItem.product;

	if (!product) {
		return null;
	}

	const variantId = cartItem.variantId ? cartItem.variantId.toString() : null;

	const variant = getVariant(product, variantId);

	const baseRegularPrice = Number(product.regularPrice || 0);

	const baseSellPrice = Number(product.sellPrice || 0);

	const variantRegularPrice = Number(
		variant?.regularPrice ?? baseRegularPrice
	);

	const variantSellPrice = Number(variant?.sellPrice ?? baseSellPrice);

	const price = Number(cartItem.price || 0);

	return {
		...product.toObject(),

		_id: product._id.toString(),

		quantity: Number(cartItem.quantity || 1),

		// Important
		variantId,

		// Stored cart price
		price,

		regularPrice: variantRegularPrice,

		sellPrice:
			variantSellPrice > 0 ? variantSellPrice : variantRegularPrice,

		// Variant-specific data
		sku: variant?.sku || product.sku || '',

		stock: Number(variant?.stock ?? product.stock ?? 0),

		size: variant
			? {
					value: variant.value,
					unit: variant.unit,
				}
			: product.size || null,

		// Useful for React key / cart operations
		cartItemId: cartItem._id.toString(),
	};
}

/* =========================================================
   GET CART
========================================================= */

export async function GET(req) {
	try {
		await connectDB();

		const url = new URL(req.url);
		const userId = url.searchParams.get('userId');

		if (!userId) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'userId is required',
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);
		}

		const cart = await Cart.findOne({
			user: userId,
		}).populate('products.product');

		if (!cart) {
			return new Response(
				JSON.stringify({
					success: true,
					cart: [],
				}),
				{
					status: 200,
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);
		}

		const items = cart.products.map(serializeCartItem).filter(Boolean);

		return new Response(
			JSON.stringify({
				success: true,

				// Frontend-এর জন্য সহজ flat array
				cart: items,

				// চাইলে raw cart-ও পাওয়া যাবে
				cartData: cart,
			}),
			{
				status: 200,
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);
	} catch (err) {
		console.error('GET CART ERROR:', err);

		return new Response(
			JSON.stringify({
				success: false,
				error: err.message,
			}),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);
	}
}

/* =========================================================
   POST / ADD TO CART
========================================================= */

export async function POST(req) {
	try {
		await connectDB();

		const body = await req.json();

		const { user, productId, variantId = null, quantity = 1 } = body;

		if (!user || !productId) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'User and product are required',
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);
		}

		const qty = normalizeQuantity(quantity);

		/* -------------------------------------------------------
       Find product
    ------------------------------------------------------- */

		const product = await Product.findById(productId);

		if (!product) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Product not found',
				}),
				{
					status: 404,
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);
		}

		/* -------------------------------------------------------
       Validate variant
    ------------------------------------------------------- */

		let selectedVariant = null;

		if (variantId) {
			selectedVariant = getVariant(product, variantId);

			if (!selectedVariant) {
				return new Response(
					JSON.stringify({
						success: false,
						error: 'Selected variant not found',
					}),
					{
						status: 400,
						headers: {
							'Content-Type': 'application/json',
						},
					}
				);
			}

			/* Check variant stock */

			const variantStock = Number(selectedVariant.stock || 0);

			if (variantStock <= 0) {
				return new Response(
					JSON.stringify({
						success: false,
						error: 'Selected variant is out of stock',
					}),
					{
						status: 400,
						headers: {
							'Content-Type': 'application/json',
						},
					}
				);
			}
		} else {
			/* -----------------------------------------------------
         Product without variant
      ----------------------------------------------------- */

			if (product.stock !== undefined && product.stock !== null) {
				const productStock = Number(product.stock || 0);

				if (productStock <= 0) {
					return new Response(
						JSON.stringify({
							success: false,
							error: 'Product is out of stock',
						}),
						{
							status: 400,
							headers: {
								'Content-Type': 'application/json',
							},
						}
					);
				}
			}
		}

		/* -------------------------------------------------------
       Calculate price
    ------------------------------------------------------- */

		const price = getVariantPrice(product, variantId);

		if (
			price === null ||
			!Number.isFinite(Number(price)) ||
			Number(price) < 0
		) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Invalid product price',
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);
		}

		/* -------------------------------------------------------
       Find user's cart
    ------------------------------------------------------- */

		let cart = await Cart.findOne({
			user,
		});

		/* -------------------------------------------------------
       Create new cart
    ------------------------------------------------------- */

		if (!cart) {
			cart = new Cart({
				user,
				products: [
					{
						product: productId,

						// variant থাকলে variantId,
						// না থাকলে null
						variantId: variantId || null,

						quantity: qty,

						price: Number(price),
					},
				],
			});
		} else {
			/* -----------------------------------------------------
         Find SAME product + SAME variant
      ----------------------------------------------------- */

			const existingProduct = cart.products.find((item) =>
				isSameCartItem(item, productId, variantId)
			);

			if (existingProduct) {
				/* Same variant -> quantity increase */

				existingProduct.quantity += qty;

				/*
				 * Keep latest price.
				 * Product price changed হলে cart-এ latest price রাখা হবে.
				 */
				existingProduct.price = Number(price);
			} else {
				/* Different variant -> NEW cart item */

				cart.products.push({
					product: productId,
					variantId: variantId || null,
					quantity: qty,
					price: Number(price),
				});
			}
		}

		await cart.save();

		/* Populate product */
		await cart.populate('products.product');

		const items = cart.products.map(serializeCartItem).filter(Boolean);

		return new Response(
			JSON.stringify({
				success: true,
				cart: items,
				cartData: cart,
			}),
			{
				status: 200,
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);
	} catch (err) {
		console.error('ADD TO CART ERROR:', err);

		return new Response(
			JSON.stringify({
				success: false,
				error: err.message,
			}),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);
	}
}

/* =========================================================
   DELETE / REMOVE CART ITEM
========================================================= */

export async function DELETE(req) {
	try {
		await connectDB();

		const { searchParams } = new URL(req.url);

		const userId = searchParams.get('userId');

		const productId = searchParams.get('productId');

		const variantId = searchParams.get('variantId');

		if (!userId || !productId) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'userId and productId are required',
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);
		}

		const cart = await Cart.findOne({
			user: userId,
		});

		if (!cart) {
			return new Response(
				JSON.stringify({
					success: true,
					cart: [],
				}),
				{
					status: 200,
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);
		}

		/* -------------------------------------------------------
       Remove ONLY matching product + variant
    ------------------------------------------------------- */

		cart.products = cart.products.filter(
			(item) => !isSameCartItem(item, productId, variantId)
		);

		await cart.save();

		await cart.populate('products.product');

		const items = cart.products.map(serializeCartItem).filter(Boolean);

		return new Response(
			JSON.stringify({
				success: true,
				cart: items,
				cartData: cart,
			}),
			{
				status: 200,
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);
	} catch (err) {
		console.error('DELETE CART ERROR:', err);

		return new Response(
			JSON.stringify({
				success: false,
				error: err.message,
			}),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);
	}
}
