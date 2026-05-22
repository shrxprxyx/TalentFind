import type { Metadata } from 'next'
// Ignore TS warning for side-effect CSS import in Next.js app router
// @ts-ignore
import './globals.css'
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}