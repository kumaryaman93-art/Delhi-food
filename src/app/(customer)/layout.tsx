import { getSession } from "@/lib/session";
import CustomerHeader from "@/components/customer/header";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  const user = session
    ? {
        name: session.name ?? null,
        email: session.email ?? null,
        image: session.picture ?? null,
      }
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <CustomerHeader user={user} />
      <main className="flex-1 pb-24">{children}</main>
    </div>
  );
}
