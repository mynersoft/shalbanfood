export function errorHandler(err) {
	console.error(err);

	let statusCode = 500;
	let message = "Something went wrong";

	// Mongoose validation error
	if (err.name === "ValidationError") {
		statusCode = 400;
		message = Object.values(err.errors)
			.map((val) => val.message)
			.join(", ");
	}

	// Duplicate key error
	else if (err.code === 11000) {
		statusCode = 400;
		const field = Object.keys(err.keyPattern)[0];
		message = `${field} already exists`;
	}

	// Cast error (invalid ObjectId)
	else if (err.name === "CastError") {
		statusCode = 400;
		message = `Invalid ${err.path}: ${err.value}`;
	}

	// Other errors
	else if (err.message) {
		message = err.message;
	}

	return { statusCode, message };
}
