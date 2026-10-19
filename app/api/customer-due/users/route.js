
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import User from '@/models/User';
import { checkAuthRole } from '@/lib/auth';

export async function GET(request) {
    try {
        const auth = await checkAuthRole();

        if (!auth) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const search = (searchParams.get('search') || '').trim();

        if (!search) {
            return NextResponse.json({ success: true, users: [] });
        }

        const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const users = await User.find({
            $or: [
                { name: { $regex: safeSearch, $options: 'i' } },
                { phone: { $regex: safeSearch, $options: 'i' } },
            ],
        })
            .select('_id name phone email role')
            .limit(10)
            .lean();

        return NextResponse.json({
            success: true,
            users: users.map((user) => ({
                customerId: user._id.toString(),
                name: user.name || '',
                phone: user.phone || '',
                email: user.email || '',
            })),
        });
    } catch (error) {
        console.error('Customer search error:', error);

        return NextResponse.json(
            { success: false, message: 'কাস্টমার সার্চ করা যায়নি।' },
            { status: 500 }
        );
    }
}
