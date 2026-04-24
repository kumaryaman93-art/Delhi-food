import { getSession } from "@/lib/session";
import CustomerHeader from "@/components/customer/header";

function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  const user = session
    ? {
        name: session.name ?? null,
        email: session.email ?? null,
        image: session.picture ?? null,
      }
    : null;

  const isAdmin = isAdminEmail(session?.email);

  return (
    <div className="min-h-screen flex flex-col">
      <CustomerHeader user={user} isAdmin={isAdmin} />
      <main className="flex-1 pb-24">{children}</main>
    </div>
  );
}
