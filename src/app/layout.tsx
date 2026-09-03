import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IndoLicense",
  description: "License and entitlement infrastructure for software vendors.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
