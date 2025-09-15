import 'server-only';
import NextAuth, { type NextAuthConfig, type User, type Session } from "next-auth";
import { type JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";

// To make TypeScript aware of the custom properties on the session and token,
// you can augment the default types.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      // role: Role; // Uncomment this if you add 'role' to your User model
    } & {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        // role: Role; // Uncomment this if you add 'role' to your User model
    }
}

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      // Added a check to ensure user.id exists before assigning it
      if (user && user.id) {
        token.id = user.id;
        // The following lines are commented out because your 'User' model
        // in 'schema.prisma' does not have a 'role' field. This was causing an error.
        // To enable this, add a 'role' field to your User model in schema.prisma.
        // const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        // if (dbUser) {
        //   token.role = dbUser.role;
        // }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Added a check to ensure token.id exists before assigning it
      if (token.id && session.user) {
        session.user.id = token.id;
        // The following line is commented out for the same reason as above.
        // session.user.role = token.role;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

