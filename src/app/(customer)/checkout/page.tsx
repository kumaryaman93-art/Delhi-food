import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import CheckoutClient from "./checkout-client";

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) redirect("/login?returnTo=/checkout");

  return (
    <CheckoutClient
      userName={session.name ?? ""}
      userEmail={session.email ?? ""}
    />
  );
}
