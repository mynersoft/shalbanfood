import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function checkAuthRole() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return {
      session: null,
      isAdmin: false,
      isUser: false,
      authenticated: false,
    };
  }

  const role = session.user.role;

  return {
    session,
    isAdmin: role === "admin",
    isUser: role === "user",
    authenticated: true,
  };
}