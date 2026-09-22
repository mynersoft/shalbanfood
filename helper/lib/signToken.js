import jwt from "jsonwebtoken";



export function signToken(payload) {
	if (!process.env.JWT_SECRET) {
		throw new Error("JWT_SECRET is not defined");
	}

	return jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});
}
