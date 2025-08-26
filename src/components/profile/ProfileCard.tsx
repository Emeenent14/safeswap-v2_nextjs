"use client"

import React from 'react'
import { MapPin, Calendar, Star, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { TrustScoreDisplay } from './TrustScoreDisplay'
import { useTrustScore } from '@/hooks/useTrustScore'
import type { User, UserProfile } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProfileCardProps {
  user: User
  profile?: UserProfile
  variant?: 'default' | 'compact' | 'public'
  showActions?: boolean
  showTrustScore?: boolean
  showStats?: boolean
  className?: string
  onEdit?: () => void
  onMessage?: () => void
  onViewDeals?: () => void
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  profile,
  variant = 'default',
  showActions = false,
  showTrustScore = true,
  showStats = true,
  className,
  onEdit,
  onMessage,
  onViewDeals
}) => {
  const { calculateUserTrustLevel } = useTrustScore()

  // Get user display info
  const displayName = `${user.firstName} ${user.lastName}`
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
  
  // Calculate trust level
  const trustLevel = calculateUserTrustLevel(user)
  
  // Format join date
  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  // Get verification status
  const getVerificationStatus = () => {
    if (!user.isVerified) {
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        text: 'Unverified',
        variant: 'secondary' as const,
        className: 'text-muted-foreground'
      }
    }

    if (user.kycStatus === 'approved') {
      return {
        icon: <Shield className="h-4 w-4" />,
        text: 'KYC Verified',
        variant: 'default' as const,
        className: 'text-green-600'
      }
    }

    return {
      icon: <CheckCircle className="h-4 w-4" />,
      text: 'Verified',
      variant: 'secondary' as const,
      className: 'text-blue-600'
    }
  }

  const verificationStatus = getVerificationStatus()

  if (variant === 'compact') {
    return (
      <Card className={cn('p-4', className)}>
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{displayName}</h3>
              <div className={cn('flex items-center gap-1', verificationStatus.className)}>
                {verificationStatus.icon}
              </div>
            </div>
            
            {showTrustScore && (
              <div className="flex items-center gap-2 text-sm">
                <Star className={cn('h-4 w-4', trustLevel.color)} />
                <span className={trustLevel.color}>{user.trustScore}</span>
                <span className="text-muted-foreground">• {trustLevel.level}</span>
              </div>
            )}
            
            {profile?.location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>

          {showActions && (
            <div className="flex gap-2">
              {onMessage && (
                <Button size="sm" variant="outline" onClick={onMessage}>
                  Message
                </Button>
              )}
              {onViewDeals && (
                <Button size="sm" variant="outline" onClick={onViewDeals}>
                  View Deals
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            
            <div className="space-y-2">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">{displayName}</h2>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={verificationStatus.variant}
                    className={cn('gap-1', verificationStatus.className)}
                  >
                    {verificationStatus.icon}
                    {verificationStatus.text}
                  </Badge>
                  {user.role === 'admin' && (
                    <Badge variant="outline" className="gap-1">
                      <Shield className="h-3 w-3" />
                      Admin
                    </Badge>
                  )}
                </div>
              </div>

              {/* Join Date */}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined {joinDate}</span>
              </div>

              {/* Location */}
              {profile?.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" onClick={onEdit}>
                  Edit Profile
                </Button>
              )}
              {onMessage && (
                <Button onClick={onMessage}>
                  Send Message
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Trust Score */}
        {showTrustScore && (
          <div>
            <TrustScoreDisplay 
              user={user} 
              variant="detailed"
              showBreakdown={variant !== 'public'}
            />
          </div>
        )}

        {/* Bio */}
        {profile?.bio && (
          <div>
            <h3 className="font-medium mb-2">About</h3>
            <p className="text-muted-foreground leading-relaxed">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Languages */}
        {profile?.languages && profile.languages.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {profile.languages.map((language) => (
                <Badge key={language} variant="secondary">
                  {language}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Preferred Categories */}
        {profile?.preferredCategories && profile.preferredCategories.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {profile.preferredCategories.map((category) => (
                <Badge key={category} variant="outline">
                  {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {showStats && profile && (
          <>
            <Separator />
            <div>
              <h3 className="font-medium mb-3">Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {profile.completedDeals}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Completed Deals
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {profile.successRate}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Success Rate
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ${profile.totalVolume.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Volume
                  </div>
                </div>
                
                <div className="text-center">
                  <div className={cn('text-2xl font-bold', trustLevel.color)}>
                    {user.trustScore}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Trust Score
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Quick Actions */}
        {variant === 'public' && showActions && (
          <>
            <Separator />
            <div className="flex gap-2 justify-center">
              {onMessage && (
                <Button onClick={onMessage} className="flex-1">
                  Send Message
                </Button>
              )}
              {onViewDeals && (
                <Button onClick={onViewDeals} variant="outline" className="flex-1">
                  View Deals
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}