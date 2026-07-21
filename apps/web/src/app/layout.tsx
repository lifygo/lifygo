import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LifyGo: Developer Email & Scheduling Platform",
  description: "Send transactional emails and schedule webhooks via a simple API.",
  icons: {
    icon: [
      {
        url: "/favicon.png?v=1",
        type: "image/png",
        sizes: "any",
      }
    ],
    shortcut: ["/favicon.png?v=1"],
    apple: [
      {
        url: "/favicon.png?v=1",
        sizes: "180x180",
        type: "image/png",
      }
    ],
  },
};

const AUTH_PROVIDER = process.env.NEXT_PUBLIC_AUTH_PROVIDER || "clerk";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="antialiased">
        {AUTH_PROVIDER === "clerk" ? (
          <ClerkProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <AuthProvider>{children}</AuthProvider>
            </ThemeProvider>
          </ClerkProvider>
        ) : (
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        )}
      </body>
    </html>
  );
}