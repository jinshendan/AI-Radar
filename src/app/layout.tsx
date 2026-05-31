import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Radar",
  description: "A focused dashboard for AI lab, people, and GitHub signals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
