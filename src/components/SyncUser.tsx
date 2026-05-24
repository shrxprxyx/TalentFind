'use client'
import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import axios from 'axios'
export default function SyncUser() {
    const { user } = useUser()
    useEffect(() => {
        if (!user) return
        const syncUser = async () => {
            try {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/users/create`,
                    {
                        clerkId: user.id,
                        email: user.primaryEmailAddress?.emailAddress,
                        name: user.fullName,
                        image: user.imageUrl,
                    }
                )
            } catch (error) {
                console.log(error)
            }
        }
        syncUser()
    }, [user])
    return null
}
