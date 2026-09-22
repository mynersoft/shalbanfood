import CredentialsProvider from 'next-auth/providers/credentials';
import User from '@/models/User';
import { connectDB } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const authOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days (optional but recommended)
  },

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Missing credentials');
          }

          await connectDB();

          // ✅ Good: explicitly select password
          const user = await User.findOne({
            email: credentials.email,
          }).select('+password');

          if (!user) {
            throw new Error('Invalid email or password');
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            throw new Error('Invalid email or password');
          }

          // Return user object with all needed fields
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
            address: user.address || {}, // Ensure it's an object
            isVerified: user.isVerified,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Add user info to token on initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
        token.avatar = user.avatar;
        token.address = user.address; // Pass the full object
        token.isVerified = user.isVerified;
      }

      // Update token when session is updated (optional)
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },

    async session({ session, token }) {
      // Pass token data to session
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.phone = token.phone;
        session.user.avatar = token.avatar;
        session.user.address = token.address; // Pass the full object
        session.user.isVerified = token.isVerified;
      }

      return session;
    },

    pages: {
      signIn: '/auth/login',
      // Optional: Add more custom pages
      error: '/auth/error',
      signOut: '/',
    },

    secret: process.env.NEXTAUTH_SECRET,

    // Optional: Add debug in development
    debug: process.env.NODE_ENV === 'development',

    // Optional: Configure cookies
    cookies: {
      sessionToken: {
        name: `next-auth.session-token`,
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: process.env.NODE_ENV === 'production',
        },
      },
    },
  },
};
