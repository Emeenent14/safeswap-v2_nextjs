'use client'

import { useState, useEffect } from 'react'
import { Metadata } from 'next'
import AdminLayout from '@/components/layout/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Users, 
  Search, 
  Filter,
  MoreHorizontal,
  Shield,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  Star,
  TrendingUp
} from 'lucide-react'
import type { User, UserRole, KYCStatus } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'
import { useTrustScore } from '@/hooks/useTrustScore'
import { useNotificationStore } from '@/store/notificationStore'

// Mock user data expanded from types.ts patterns
const mockUsers: User[] = [
  {
    id: 'user_1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1-555-0123',
    avatar: undefined,
    trustScore: 85,
    isVerified: true,
    kycStatus: 'approved',
    role: 'user',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-08-20T14:45:00Z'
  },
  {
    id: 'user_2',
    email: 'alice.smith@example.com',
    firstName: 'Alice',
    lastName: 'Smith',
    phone: '+1-555-0124',
    avatar: undefined,
    trustScore: 92,
    isVerified: true,
    kycStatus: 'approved',
    role: 'user',
    createdAt: '2024-02-10T09:15:00Z',
    updatedAt: '2024-08-25T11:30:00Z'
  },
  {
    id: 'user_3',
    email: 'bob.wilson@example.com',
    firstName: 'Bob',
    lastName: 'Wilson',
    phone: undefined,
    avatar: undefined,
    trustScore: 45,
    isVerified: false,
    kycStatus: 'pending',
    role: 'user',
    createdAt: '2024-08-01T16:20:00Z',
    updatedAt: '2024-08-26T08:45:00Z'
  },
  {
    id: 'user_4',
    email: 'sarah.jones@example.com',
    firstName: 'Sarah',
    lastName: 'Jones',
    phone: '+1-555-0126',
    avatar: undefined,
    trustScore: 78,
    isVerified: true,
    kycStatus: 'rejected',
    role: 'user',
    createdAt: '2024-03-22T13:45:00Z',
    updatedAt: '2024-08-15T10:20:00Z'
  }
]

interface TrustScoreAdjustmentDialogProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (userId: string, adjustment: number, reason: string) => void
}

function TrustScoreAdjustmentDialog({ user, isOpen, onClose, onSubmit }: TrustScoreAdjustmentDialogProps) {
  const [adjustment, setAdjustment] = useState(0)
  const [reason, setReason] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (user && reason.trim().length >= 10) {
      onSubmit(user.id, adjustment, reason.trim())
      setAdjustment(0)
      setReason('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Trust Score</DialogTitle>
        </DialogHeader>
        
        {user && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Adjusting trust score for <strong>{user.firstName} {user.lastName}</strong>
              </p>
              <p className="text-sm">
                Current Score: <Badge>{user.trustScore}</Badge>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjustment">Adjustment (+/-)</Label>
              <Input
                id="adjustment"
                type="number"
                min="-50"
                max="50"
                value={adjustment}
                onChange={(e) => setAdjustment(Number(e.target.value))}
                placeholder="Enter adjustment amount"
                required
              />
              <p className="text-xs text-muted-foreground">
                New score will be: {Math.max(0, Math.min(100, user.trustScore + adjustment))}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the reason for this adjustment..."
                rows={3}
                required
                minLength={10}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 10 characters ({reason.length}/10)
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!reason.trim() || reason.length < 10}
              >
                Apply Adjustment
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

function UserCard({ user, onTrustScoreAdjust }: { 
  user: User
  onTrustScoreAdjust: (user: User) => void 
}) {
  const getKycStatusBadge = (status: KYCStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="outline">Not Submitted</Badge>
    }
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>
              {getUserInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">
                {user.firstName} {user.lastName}
              </h3>
              {user.role !== 'user' && (
                <Badge variant="secondary">
                  <Shield className="h-3 w-3 mr-1" />
                  {user.role.replace('_', ' ').toUpperCase()}
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
            {user.phone && (
              <p className="text-sm text-muted-foreground mb-2">{user.phone}</p>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
              {user.isVerified ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline">
                  <XCircle className="h-3 w-3 mr-1" />
                  Unverified
                </Badge>
              )}

              {getKycStatusBadge(user.kycStatus)}

              <Badge className={getTrustScoreColor(user.trustScore)}>
                <Star className="h-3 w-3 mr-1" />
                Trust: {user.trustScore}
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground">
              Joined: {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTrustScoreAdjust(user)}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Adjust Score
            </Button>
            
            <Button size="sm" variant="outline">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            
            <Button size="sm" variant="outline">
              <Ban className="h-4 w-4 mr-1" />
              Suspend
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminUsersPage() {
  const { isAdmin } = useAuth()
  const { addToast } = useNotificationStore()
  
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [kycFilter, setKycFilter] = useState<KYCStatus | ''>('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isTrustScoreDialogOpen, setIsTrustScoreDialogOpen] = useState(false)

  // Handle search and filtering
  useEffect(() => {
    let filtered = users

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Role filter
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // KYC filter
    if (kycFilter) {
      filtered = filtered.filter(user => user.kycStatus === kycFilter)
    }

    setFilteredUsers(filtered)
  }, [users, searchQuery, roleFilter, kycFilter])

  const handleTrustScoreAdjustment = async (userId: string, adjustment: number, reason: string) => {
    try {
      // In production, this would call the API
      // await fetch('/api/user/trust-score', { method: 'POST', ... })
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                trustScore: Math.max(0, Math.min(100, user.trustScore + adjustment)),
                updatedAt: new Date().toISOString()
              }
            : user
        )
      )

      addToast({
        type: 'success',
        title: 'Trust score updated',
        message: `Successfully ${adjustment > 0 ? 'increased' : 'decreased'} trust score by ${Math.abs(adjustment)} points`,
        duration: 4000
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Update failed',
        message: 'Failed to update trust score',
        duration: 5000
      })
    }
  }

  const handleTrustScoreDialogOpen = (user: User) => {
    setSelectedUser(user)
    setIsTrustScoreDialogOpen(true)
  }

  const stats = {
    total: users.length,
    verified: users.filter(u => u.isVerified).length,
    kycApproved: users.filter(u => u.kycStatus === 'approved').length,
    highTrustScore: users.filter(u => u.trustScore >= 75).length
  }

  return (
    <AdminLayout 
      title="User Management" 
      subtitle={`Manage ${users.length} platform users`}
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verified}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.verified / stats.total) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">KYC Approved</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.kycApproved}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.kycApproved / stats.total) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Trust</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.highTrustScore}</div>
              <p className="text-xs text-muted-foreground">
                Score ≥75 points
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={roleFilter} onValueChange={(value: UserRole | '') => setRoleFilter(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>

              <Select value={kycFilter} onValueChange={(value: KYCStatus | '') => setKycFilter(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All KYC" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All KYC</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="not_submitted">Not Submitted</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('')
                  setRoleFilter('')
                  setKycFilter('')
                }}
              >
                Clear Filters
              </Button>
            </div>

            {filteredUsers.length !== users.length && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredUsers.length} of {users.length} users
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User List */}
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || roleFilter || kycFilter 
                    ? "No users match your current filters."
                    : "No users to display."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onTrustScoreAdjust={handleTrustScoreDialogOpen}
              />
            ))
          )}
        </div>

        {/* Trust Score Adjustment Dialog */}
        <TrustScoreAdjustmentDialog
          user={selectedUser}
          isOpen={isTrustScoreDialogOpen}
          onClose={() => {
            setIsTrustScoreDialogOpen(false)
            setSelectedUser(null)
          }}
          onSubmit={handleTrustScoreAdjustment}
        />
      </div>
    </AdminLayout>
  )
}