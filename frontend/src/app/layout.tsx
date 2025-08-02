import './globals.css'
import { Inter, Manrope } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const manrope = Manrope({ 
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata = {
  title: 'DataVibe - AI Database Assistant',
  description: 'Transform your data questions into insights with AI-powered natural language database queries',
  keywords: ['AI', 'database', 'SQL', 'natural language', 'analytics', 'data visualization'],
  authors: [{ name: 'DataVibe Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1d4ed8' }
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen">
              {children}
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}