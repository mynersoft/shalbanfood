import { NextResponse } from "next/server";

export class ApiError extends Error {
	constructor(message, status = 500) {
		super(message);
		this.status = status;
	}
}

export function handleApiError(error) {
	console.error(error);

	return NextResponse.json(
		{
			success: false,
			message: error.message || "Server error",
		},
		{ status: error.status || 500 }
	);
}
