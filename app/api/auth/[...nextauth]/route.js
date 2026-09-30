import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

import {connectDB} from '@/lib/dbConnect';
import User from '@/models/User';

function normalizePhone(phone) {
	if (!phone) return null;

	let value = phone.trim().replace(/\s+/g, '');

	if (value.startsWith('+880')) {
		value = '0' + value.substring(4);
	}

	if (value.startsWith('880')) {
		value = '0' + value.substring(3);
	}

	return value;
}

function isPhone(value) {
	return /^01[3-9]\d{8}$/.test(value);
}

function normalizeIdentifier(identifier) {
	if (!identifier) return '';

	const value = identifier.trim();

	// Email
	if (value.includes('@')) {
		return value.toLowerCase();
	}

	// Phone
	return normalizePhone(value);
}

const handler = NextAuth({
	providers: [
		CredentialsProvider({
			name: 'Credentials',

			credentials: {
				identifier: {
					label: 'Email or Phone',
					type: 'text',
				},

				password: {
					label: 'Password',
					type: 'password',
				},
			},

			async authorize(credentials) {
				try {
					const identifier = normalizeIdentifier(
						credentials?.identifier
					);

					const password = credentials?.password;

					if (!identifier || !password) {
						return null;
					}

					await connectDB();

					let user = null;

					// Email login
					if (identifier.includes('@')) {
						user = await User.findOne({
							email: identifier,
						}).select('+password');
					}

					// Phone login
					else if (isPhone(identifier)) {
						user = await User.findOne({
							phone: identifier,
						}).select('+password');
					}

					if (!user) {
						return null;
					}

					// Check password
					const passwordMatch = await bcrypt.compare(
						password,
						user.password
					);

					if (!passwordMatch) {
						return null;
					}

					return {
						id: user._id.toString(),
						name: user.name,
						email: user.email || null,
						phone: user.phone || null,
						role: user.role,
					};
				} catch (error) {
					console.error('NEXTAUTH AUTHORIZE ERROR:', error);
					return null;
				}
			},
		}),
	],

	session: {
		strategy: 'jwt',
	},

	pages: {
		signIn: '/auth/login',
	},

	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.role = user.role;
				token.phone = user.phone || null;
			}

			return token;
		},

		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id;
				session.user.role = token.role;
				session.user.phone = token.phone || null;
			}

			return session;
		},
	},

	secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
