import type { Metadata } from 'next'
// Ignore TS warning for side-effect CSS import in Next.js app router
// @ts-ignore
import './globals.css'
import { ClerkProvider } from "@clerk/nextjs";
import SyncUser from '@/components/SyncUser'

export const metadata: Metadata = {
  title: 'TalentStage — Creator & Freelancer Marketplace',
  description: 'Where creative and technical freelancers get discovered.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <div className="ambient-glow" />
          <SyncUser />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}