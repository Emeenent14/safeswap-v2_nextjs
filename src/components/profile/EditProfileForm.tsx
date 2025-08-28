"use client"

import React, { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Camera, X, Plus, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { uploadApi } from '@/lib/api'
import type { User, UserProfile, DealCategory } from '@/lib/types'
import { cn } from '@/lib/utils'

type UserUpdateData = Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'phone' | 'avatar'>> & 
                     Partial<UserProfile>


// Constants - you can move these to a constants file later
const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
  'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi',
  'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish'
]

const DEAL_CATEGORIES: { value: DealCategory; label: string; description: string }[] = [
  { value: 'digital_services', label: 'Digital Services', description: 'Online services and deliverables' },
  { value: 'freelancing', label: 'Freelancing', description: 'Freelance work and gigs' },
  { value: 'goods', label: 'Goods', description: 'Physical products and items' },
  { value: 'consulting', label: 'Consulting', description: 'Professional consulting services' },
  { value: 'software', label: 'Software', description: 'Software development and tools' },
  { value: 'design', label: 'Design', description: 'Graphic design and creative work' },
  { value: 'marketing', label: 'Marketing', description: 'Marketing and advertising services' },
  { value: 'writing', label: 'Writing', description: 'Content writing and copywriting' },
  { value: 'other', label: 'Other', description: 'Other categories not listed' }
]

// Form validation schema
const profileSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: yup
    .string()
    .matches(/^[+]?[\d\s\-()]+$/, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 digits')
    .optional(),
  bio: yup
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  location: yup
    .string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
  languages: yup
    .array()
    .of(yup.string().required())
    .max(5, 'Maximum 5 languages allowed')
    .optional(),
  preferredCategories: yup
    .array()
    .of(yup.string().required())
    .max(3, 'Maximum 3 specializations allowed')
    .optional()
})

type ProfileFormData = yup.InferType<typeof profileSchema>

interface EditProfileFormProps {
  user: User
  profile?: UserProfile
  onSave?: (updatedUser: User, updatedProfile: UserProfile) => void
  onCancel?: () => void
  className?: string
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({
  user,
  profile,
  onSave,
  onCancel,
  className
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null)
  const [newLanguage, setNewLanguage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { updateProfile } = useAuth()
  const { addToast } = useNotifications()

  // Initialize form
  const form = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      languages: profile?.languages || [],
      preferredCategories: profile?.preferredCategories || []
    }
  })

  const { watch, setValue, getValues } = form
  const watchedLanguages = watch('languages') || []
  const watchedCategories = watch('preferredCategories') || []

  // Get user initials
  const getUserInitials = useCallback((firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }, [])

  // Handle avatar upload
  const handleAvatarUpload = useCallback(async (file: File) => {
    if (!file) return

    // Validate file
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      addToast({
        type: 'error',
        title: 'File too large',
        message: 'Avatar must be less than 5MB',
        duration: 5000
      })
      return
    }

    if (!file.type.startsWith('image/')) {
      addToast({
        type: 'error',
        title: 'Invalid file type',
        message: 'Avatar must be an image file',
        duration: 5000
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file)
      setAvatarPreview(previewUrl)

      // Upload file
      const response = await uploadApi.uploadAvatar(file, (progress) => {
        setUploadProgress(progress)
      })

      // Update form with new avatar URL
      setAvatarPreview(response.data.url)

      addToast({
        type: 'success',
        title: 'Avatar uploaded',
        message: 'Your avatar has been updated',
        duration: 3000
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setAvatarPreview(user.avatar || null) // Revert to original
      
      addToast({
        type: 'error',
        title: 'Upload failed',
        message: errorMessage,
        duration: 5000
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [user.avatar, addToast])

  // Add language
  const addLanguage = useCallback(() => {
    if (!newLanguage.trim() || watchedLanguages.includes(newLanguage)) return

    if (watchedLanguages.length >= 5) {
      addToast({
        type: 'error',
        title: 'Maximum languages reached',
        message: 'You can only add up to 5 languages',
        duration: 3000
      })
      return
    }

    setValue('languages', [...watchedLanguages, newLanguage])
    setNewLanguage('')
  }, [newLanguage, watchedLanguages, setValue, addToast])

  // Remove language
  const removeLanguage = useCallback((language: string) => {
    setValue('languages', watchedLanguages.filter(l => l !== language))
  }, [watchedLanguages, setValue])

  // Add category
  const addCategory = useCallback((category: DealCategory) => {
    if (watchedCategories.includes(category)) return

    if (watchedCategories.length >= 3) {
      addToast({
        type: 'error',
        title: 'Maximum specializations reached',
        message: 'You can only add up to 3 specializations',
        duration: 3000
      })
      return
    }

    setValue('preferredCategories', [...watchedCategories, category])
  }, [watchedCategories, setValue, addToast])

  // Remove category
  const removeCategory = useCallback((category: string) => {
    setValue('preferredCategories', watchedCategories.filter(c => c !== category))
  }, [watchedCategories, setValue])

  // Handle form submission
  const onSubmit = async (data: ProfileFormData) => {
    setError(null)

    try {
      // Prepare update data with proper type handling
      const updateData: UserUpdateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        ...(data.phone && { phone: data.phone }),
        ...(avatarPreview && { avatar: avatarPreview }),
        ...(data.bio && { bio: data.bio }),
        ...(data.location && { location: data.location }),
        ...(data.languages && data.languages.length > 0 && { languages: data.languages }),
        ...(data.preferredCategories && data.preferredCategories.length > 0 && { 
          preferredCategories: data.preferredCategories 
        })
      }

      // Update profile - the useAuth hook handles the toast notifications
      await updateProfile(updateData)

      // Call onSave callback if provided
      if (onSave) {
        // Construct the updated user object with exact optional property handling
        const updatedUserBase = {
          ...user,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email
        }

        // Add optional properties only if they have values
        const updatedUser: User = {
          ...updatedUserBase,
          ...(data.phone && { phone: data.phone }),
          ...(avatarPreview && { avatar: avatarPreview })
        }

        const updatedProfile: UserProfile = {
          ...updatedUser,
          bio: data.bio || '',
          location: data.location || '',
          languages: data.languages || [],
          preferredCategories: data.preferredCategories || [],
          completedDeals: profile?.completedDeals || 0,
          successRate: profile?.successRate || 0,
          totalVolume: profile?.totalVolume || 0
        }
        onSave(updatedUser, updatedProfile)
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile'
      setError(errorMessage)
      
      // Error toast is handled by useAuth hook, but we'll set local error for UI
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Avatar Section */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarPreview || undefined} />
                  <AvatarFallback className="text-lg">
                    {getUserInitials(watch('firstName') || user.firstName, watch('lastName') || user.lastName)}
                  </AvatarFallback>
                </Avatar>
                
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="text-white text-xs">{uploadProgress}%</div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleAvatarUpload(file)
                      }
                    }}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Camera className="h-4 w-4 mr-2" />
                    )}
                    Change Avatar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or WebP. Max size 5MB.
                </p>
              </div>
            </div>

            <Separator />

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormDescription>
                      Changing your email will require re-verification
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" placeholder="+1 (555) 000-0000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="City, Country" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Bio Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">About You</h3>
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Tell others about yourself, your experience, and what you do..."
                        className="min-h-[100px]"
                        maxLength={500}
                      />
                    </FormControl>
                    <FormDescription>
                      {(field.value?.length || 0)}/500 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Languages Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Languages</h3>
              
              <div className="flex flex-wrap gap-2">
                {watchedLanguages.map((language) => (
                  <Badge key={language} variant="secondary" className="gap-1">
                    {language}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLanguage(language)}
                      className="h-auto p-0 hover:bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>

              {watchedLanguages.length < 5 && (
                <div className="flex gap-2">
                  <Select value={newLanguage} onValueChange={setNewLanguage}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.filter(lang => !watchedLanguages.includes(lang)).map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addLanguage}
                    disabled={!newLanguage}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              )}

              <FormDescription>
                Add languages you speak fluently (maximum 5)
              </FormDescription>
            </div>

            <Separator />

            {/* Specializations Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Specializations</h3>
              
              <div className="flex flex-wrap gap-2">
                {watchedCategories.map((category) => (
                  <Badge key={category} variant="outline" className="gap-1">
                    {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCategory(category)}
                      className="h-auto p-0 hover:bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>

              {watchedCategories.length < 3 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {DEAL_CATEGORIES.filter(cat => !watchedCategories.includes(cat.value)).map((category) => (
                    <Button
                      key={category.value}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addCategory(category.value)}
                      className="justify-start text-left h-auto py-2"
                    >
                      <Plus className="h-3 w-3 mr-2 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{category.label}</div>
                        <div className="text-xs text-muted-foreground">{category.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}

              <FormDescription>
                Choose up to 3 categories that best represent your expertise
              </FormDescription>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting || isUploading}
                className="flex-1 md:flex-none"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={form.formState.isSubmitting || isUploading}
                  className="flex-1 md:flex-none"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}