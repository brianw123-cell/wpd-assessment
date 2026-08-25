import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Readiness Assessment — West Product Development",
  description:
    "A free 4-minute self-assessment for roofing, solar, HVAC, plumbing, electrical, and general-contracting business owners. Fifteen questions. Get your score, where you'd hit friction, and one specific place to start with AI.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1e2d42",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
