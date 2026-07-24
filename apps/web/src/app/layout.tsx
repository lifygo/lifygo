import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { LayoutWrapper } from "@/components/layout-wrapper";
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
  title: "Simple Email Delivery & Cron Job API for Developers | LifyGo",
  description:
    "The simplest email delivery and cron job scheduler for developers. Send transactional emails, verify OTPs, and run scheduled tasks with one open-source API.",
  keywords: [
    "simple email delivery",
    "cron job scheduler",
    "cron job API",
    "transactional email API",
    "developer email tool",
    "OTP verification",
    "self-hosted email",
    "open source email API",
    "Resend alternative",
    "SendGrid alternative",
  ],
  authors: [{ name: "LifyGo" }],
  creator: "LifyGo",
  publisher: "LifyGo",
  metadataBase: new URL("https://lifygo.com"),
  alternates: {
    canonical: "/", 
  },
  icons: {
    icon: [{ url: "/favicon.jpg?v=1", type: "image/jpeg", sizes: "any" }],
    shortcut: ["/favicon.jpg?v=1"],
    apple: [{ url: "/favicon.jpg?v=1", sizes: "180x180", type: "image/jpeg" }],
  },
  openGraph: {
    type: "website",
    url: "https://lifygo.com",
    title: "LifyGo — Simple Email Delivery & Cron Jobs API",
    description:
      "Send transactional emails, verify OTPs, and schedule cron jobs with one simple API. Free hosted or self-hosted.",
    siteName: "LifyGo",
    images: [
      {
        url: "/og-image.png", 
        width: 1200,
        height: 630,
        alt: "LifyGo — Simple Email Delivery & Cron Jobs for Developers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LifyGo — Simple Email Delivery & Cron Jobs API",
    description:
      "Send transactional emails, verify OTPs, and schedule cron jobs with one simple API. Free hosted or self-hosted.",
    images: ["/og-image.png"], 
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large", 
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}