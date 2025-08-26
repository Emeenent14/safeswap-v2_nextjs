'use client'

import { ProfileCard } from "@/components/profile/ProfileCard"
import type { User, UserProfile } from "@/lib/types"

interface PublicProfileClientProps {
  user: User & { profile: UserProfile }
}

export function PublicProfileClient({ user }: PublicProfileClientProps) {
  const handleMessage = () => {
    window.location.href =
      "/login?redirect=" + encodeURIComponent(`/messages/new?user=${user.id}`)
  }

  const handleViewDeals = () => {
    window.location.href =
      "/login?redirect=" + encodeURIComponent(`/deals?user=${user.id}`)
  }

  return (
    <ProfileCard
      user={user}
      profile={user.profile}
      variant="public"
      showActions={true}
      showTrustScore={true}
      showStats={true}
      onMessage={handleMessage}
      onViewDeals={handleViewDeals}
    />
  )
}