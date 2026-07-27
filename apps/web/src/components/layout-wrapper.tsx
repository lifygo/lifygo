"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export function LayoutWrapper({
  children,
  isDashboardHost = false,
}: {
  children: React.ReactNode;
  isDashboardHost?: boolean;
}) {
  const pathname = usePathname();
  const isDashboard = isDashboardHost || pathname.startsWith("/dashboard");

  return (
    <>
      {!isDashboard && <Navbar />}
      {children}
      {!isDashboard && <Footer />}
    </>
  );
}
