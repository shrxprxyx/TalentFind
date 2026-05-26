'use client'

import { useAuth } from '@clerk/nextjs'
import { useEffect, useState, useRef } from 'react'
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

// Module-level cache — shared across all useDashboard instances
let cachedData: DashboardData | null = null
let isFetching = false
const listeners: Array<(data: DashboardData) => void> = []

export function useDashboard() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [data, setData] = useState<DashboardData | null>(cachedData)
  const [loading, setLoading] = useState(!cachedData)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = async () => {
    // If already fetching, subscribe to result
    if (isFetching) {
      listeners.push((d) => {
        setData(d)
        setLoading(false)
      })
      return
    }

    try {
      isFetching = true
      setLoading(true)
      const token = await getToken()
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/dashboard-stats`,
        { headers: { Authorization: token! } }
      )
      cachedData = res.data
      setData(res.data)
      // Notify all waiting listeners
      listeners.forEach((fn) => fn(res.data))
      listeners.length = 0
    } catch (err) {
      setError('Failed to load dashboard data')
    } finally {
      isFetching = false
      setLoading(false)
    }
  }

  const refetch = async () => {
    cachedData = null // clear cache on manual refetch
    await fetchDashboard()
  }

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    if (cachedData) {
      setData(cachedData)
      setLoading(false)
      return
    }
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
      cachedData = null
      await fetchDashboard()
    } catch (err) {
      setError('Failed to update role')
    }
  }

  return { data, loading, error, updateRole, refetch }
}