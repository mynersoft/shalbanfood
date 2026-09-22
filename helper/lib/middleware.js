import { withAuth } from "next-auth/middleware";

// export default withAuth(
// 	function middleware(req) {},
// 	{
// 		callbacks: {
// 			authorized: ({ token }) => {
// 				return !!token; // logged in user only
// 			},
// 		},
// 	}
// );

// // Protected routes
// export const config = {
// 	matcher: [
// 		"/dashboard/:path*",
// 		"/admin/:path*",
// 		"/api/orders/:path*",
// 	],
// };



export default withAuth({
  callbacks: {
    authorized({ token, req }) {
      const path = req.nextUrl.pathname;

      if (path.startsWith("/dashboard/admin")) {
        return token?.role === "admin";
      }

      if (path.startsWith("/dashboard/user")) {
        return token?.role === "user";
      }

      return true;
    },
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
