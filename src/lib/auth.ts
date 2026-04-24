import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await prisma.user.upsert({
            where: { email: user.email! },
            update: {
              googleId: account.providerAccountId,
              name: user.name ?? "",
              avatarUrl: user.image,
              authProvider: "google",
              lastLogin: new Date(),
            },
            create: {
              googleId: account.providerAccountId,
              name: user.name ?? "",
              email: user.email ?? "",
              avatarUrl: user.image,
              authProvider: "google",
            },
          });
        } catch {
          return false;
        }
      }
      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, phone: true },
        });
        if (dbUser) {
          (session.user as typeof session.user & { id: string; phone: string | null }).id = dbUser.id;
          (session.user as typeof session.user & { id: string; phone: string | null }).phone = dbUser.phone;
        }
      }
      return session;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async jwt({ token, account }) {
      if (account?.providerAccountId) {
        token.sub = account.providerAccountId;
      }
      return token;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
