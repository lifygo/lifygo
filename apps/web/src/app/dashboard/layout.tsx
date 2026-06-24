import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/smtp", label: "SMTP Config" },
  { href: "/dashboard/api-keys", label: "API Keys" },
  { href: "/dashboard/send", label: "Send Test" },
  { href: "/dashboard/logs", label: "Logs" },
  { href: "/dashboard/jobs", label: "Jobs" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 border-r p-4 flex flex-col gap-2">
        <div className="font-bold text-lg mb-4">LifyGo</div>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm px-3 py-2 rounded hover:bg-gray-100"
          >
            {link.label}
          </Link>
        ))}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="border-b p-4 flex justify-end">
          <UserButton />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}