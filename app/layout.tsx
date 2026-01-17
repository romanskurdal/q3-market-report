import Nav from './nav'
import './globals.css'

export const metadata = {
  title: 'Database Connection Tester',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
      </body>
    </html>
  )
}