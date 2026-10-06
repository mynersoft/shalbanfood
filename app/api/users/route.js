import { connectDB } from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
	await connectDB();
	try {
		const users = await User.find();
		return Response.json(
			{
				users,
			},
			{ status: 200 }
		);
	} catch (error) {
		return Response.json(
			{
				message: error.message,
			},
			{ status: 500 }
		);
	}
}
