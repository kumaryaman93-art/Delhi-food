import { Suspense } from "react";
import LandingPage from "@/components/customer/landing-page";

export default function LoginPage() {
  return (
    <Suspense>
      <LandingPage />
    </Suspense>
  );
}
