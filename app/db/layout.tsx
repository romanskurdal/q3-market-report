import { notFound } from 'next/navigation'

export default function DbLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if admin mode is enabled
  const adminMode = process.env.ADMIN_MODE === 'true'
  
  // If admin mode is off, show 404 (appears as page not found)
  // This prevents any hint that an admin tool exists
  if (!adminMode) {
    notFound()
  }
  
  return <>{children}</>
}