'use client'

import { useAuth } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import axios from 'axios'

export interface DashboardStats {
  activeProjects: number
  proposalsSent: number
  portfolioItems: number
  profileViews: number
}

export interface RecentProposal {
  id: string
  bidAmount: number
  timeline: string
  createdAt: string
  freelancer: { name: string; image: string; email: string }
  project: { title: string }
}

export interface RecentProject {
  id: string
  title: string
  budget: number
  deadline: string
  createdAt: string
  proposals: { id: string }[]
}

export interface UserProfile {
  id: string
  name: string
  email: string
  image: string
  role: 'FREELANCER' | 'CLIENT' | 'BOTH' | null
  bio: string | null
}

export interface DashboardData {
  user: UserProfile
  stats: DashboardStats
  recentProposals: RecentProposal[]
  recentProjects: RecentProject[]
}

export function useDashboard() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/dashboard-stats`,
        { headers: { Authorization: token! } }
      )
      setData(res.data)
    } catch (err) {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    fetchDashboard()
  }, [isLoaded, isSignedIn])

  const updateRole = async (role: 'FREELANCER' | 'CLIENT' | 'BOTH') => {
    try {
      const token = await getToken()
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/role`,
        { role },
        { headers: { Authorization: token! } }
      )
      await fetchDashboard()
    } catch (err) {
      setError('Failed to update role')
    }
  }

  return { data, loading, error, updateRole, refetch: fetchDashboard }
}