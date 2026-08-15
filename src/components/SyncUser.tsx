"use client";

import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";

export default function SyncUser() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    const syncUser = async () => {
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/create`,
          {
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress,
            name: user.fullName || "",
            image: user.imageUrl || "",
          }
        );
      } catch (err) {
        console.error("Sync user error:", err);
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, user]);

  return null;
}