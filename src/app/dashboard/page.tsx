import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/DashboardClient'

export default async function Dashboard() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  return (
    <DashboardClient
      userName={user.fullName ?? 'there'}
      userImage={user.imageUrl}
      userEmail={user.primaryEmailAddress?.emailAddress ?? ''}
    />
  )
}