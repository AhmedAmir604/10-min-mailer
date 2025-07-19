import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GhostBox - Ephemeral Email',
  description: 'Ultra-minimal temporary email service. Create disposable addresses that vanish without a trace.',
  keywords: 'temporary email, disposable email, ephemeral mail, minimal design, privacy',
  authors: [{ name: 'GhostBox' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-black text-white">
        <div className="min-h-screen bg-black">
          {children}
        </div>
      </body>
    </html>
  )
} 