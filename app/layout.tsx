import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  title: 'Do-Nothing:The Game',
  description: 'Created by Syntax-Surfer, this is a game where the objective is to do nothing.',
  generator: 'Syntax-Surfer',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />       
        <SpeedInsights />   
      </body>
    </html>
  )
}
