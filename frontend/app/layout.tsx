import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '../lib/authContext'
import { FeatureFlagProvider } from '../lib/featureFlagContext'
import { ToastProvider } from '../components/Toast'

export const metadata: Metadata = {
  title: 'HDAS - Human Delay Accountability System',
  description: 'Enterprise Governance and Compliance Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <AuthProvider>
            <FeatureFlagProvider>
              {children}
            </FeatureFlagProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
