import './globals.css'
import type { Metadata } from 'next'
import { UserProvider } from '@/lib/userContext';
import ClientShell from '@/components/layout/ClientShell';

export const metadata: Metadata = {
  title: 'HDAS - Human Delay Accountability System',
  description: 'Enterprise-grade accountability and workflow management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <ClientShell>{children}</ClientShell>
        </UserProvider>
      </body>
    </html>
  )
}
