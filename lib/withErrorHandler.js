import { NextResponse } from "next/server";

export function withErrorHandler(handler) {
	return async (req, context) => {
		try {
			return await handler(req, context);
		} catch (error) {
			console.error("SERVER ERROR:", error);

			return NextResponse.json(
				{
					success: false,
					message: error.message || "Internal server error",
				},
				{ status: error.statusCode || 500 }
			);
		}
	};
}
