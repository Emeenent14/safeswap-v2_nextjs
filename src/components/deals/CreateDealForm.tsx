import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, X, Calendar as CalendarIcon, DollarSign, Trash2 } from 'lucide-react'
import { createDealSchema } from '@/lib/validations'
import { useDeals } from '@/hooks/useDeals'
import { useAuth } from '@/hooks/useAuth'
import type { CreateDealForm as CreateDealFormType, DealCategory } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MilestoneFormData {
  title: string
  description?: string
  amount: number
  dueDate?: string
}

const categoryOptions: { value: DealCategory, label: string, description: string }[] = [
  { value: 'digital_services', label: 'Digital Services', description: 'Web development, app development, etc.' },
  { value: 'freelancing', label: 'Freelancing', description: 'General freelance work and services' },
  { value: 'goods', label: 'Goods', description: 'Physical products and items' },
  { value: 'consulting', label: 'Consulting', description: 'Business and professional consulting' },
  { value: 'software', label: 'Software', description: 'Software development and licenses' },
  { value: 'design', label: 'Design', description: 'Graphic design, UI/UX, branding' },
  { value: 'marketing', label: 'Marketing', description: 'Digital marketing and advertising' },
  { value: 'writing', label: 'Writing', description: 'Content writing, copywriting, articles' },
  { value: 'other', label: 'Other', description: 'Other services and products' }
]

const currencyOptions = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'CAD', label: 'CAD (C$)', symbol: 'C$' }
]

export default function CreateDealForm() {
  const router = useRouter()
  const { user } = useAuth()
  const { createDeal, isLoading } = useDeals()
  const [selectedCategory, setSelectedCategory] = useState<DealCategory | ''>('')

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<CreateDealFormType>({
    resolver: yupResolver(createDealSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '' as DealCategory,
      amount: 0,
      currency: 'USD',
      milestones: [{
        title: '',
        description: '',
        amount: 0,
        dueDate: ''
      }]
    },
    mode: 'onChange'
  })

  const { fields: milestoneFields, append: appendMilestone, remove: removeMilestone } = useFieldArray({
    control,
    name: 'milestones'
  })

  const watchedAmount = watch('amount')
  const watchedCurrency = watch('currency')
  const watchedMilestones = watch('milestones')

  // Calculate total milestone amount
  const totalMilestoneAmount = watchedMilestones?.reduce((sum, milestone) => {
    return sum + (milestone.amount || 0)
  }, 0) || 0

  const amountMismatch = Math.abs(watchedAmount - totalMilestoneAmount) > 0.01

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    const currencyOption = currencyOptions.find(c => c.value === currency)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const addMilestone = () => {
    const remainingAmount = Math.max(0, watchedAmount - totalMilestoneAmount)
    appendMilestone({
      title: '',
      description: '',
      amount: remainingAmount,
      dueDate: ''
    })
  }

  const onSubmit = async (data: CreateDealFormType) => {
    try {
      const deal = await createDeal(data)
      router.push(`/dashboard/deals/${deal.id}`)
    } catch (error) {
      // Error is handled by the useDeals hook
    }
  }

  const handleCategorySelect = (category: DealCategory) => {
    setSelectedCategory(category)
    setValue('category', category)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create New Deal</h1>
        <p className="text-muted-foreground mt-2">
          Set up a secure escrow deal with milestones and clear terms
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Deal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Deal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Deal Title *</Label>
              <Input
                id="title"
                placeholder="E.g., Website Development for Small Business"
                {...register('title')}
                className={cn(errors.title && 'border-red-500')}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about what you're offering or looking for..."
                rows={4}
                {...register('description')}
                className={cn(errors.description && 'border-red-500')}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categoryOptions.map((category) => (
                  <div
                    key={category.value}
                    onClick={() => handleCategorySelect(category.value)}
                    className={cn(
                      'p-3 border rounded-lg cursor-pointer transition-all hover:border-primary',
                      selectedCategory === category.value && 'border-primary bg-primary/5'
                    )}
                  >
                    <div className="font-medium text-sm">{category.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {category.description}
                    </div>
                  </div>
                ))}
              </div>
              {errors.category && (
                <p className="text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            {/* Amount and Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Total Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="10"
                  placeholder="0.00"
                  {...register('amount', { valueAsNumber: true })}
                  className={cn(errors.amount && 'border-red-500')}
                />
                {errors.amount && (
                  <p className="text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <Select
                  value={watchedCurrency}
                  onValueChange={(value) => setValue('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amount Summary */}
            {watchedAmount > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium">
                  Deal Value: {formatCurrency(watchedAmount, watchedCurrency)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  This amount will be held in escrow until deal completion
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Milestones</span>
              <Badge variant={amountMismatch ? 'destructive' : 'default'}>
                {milestoneFields.length} milestone{milestoneFields.length !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Break down your deal into manageable milestones with specific deliverables and amounts.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {milestoneFields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Milestone {index + 1}</h4>
                  {milestoneFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMilestone(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor={`milestones.${index}.title`}>Title *</Label>
                    <Input
                      {...register(`milestones.${index}.title`)}
                      placeholder="E.g., Design mockups"
                      className={cn(errors.milestones?.[index]?.title && 'border-red-500')}
                    />
                    {errors.milestones?.[index]?.title && (
                      <p className="text-sm text-red-600">
                        {errors.milestones[index]?.title?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`milestones.${index}.amount`}>Amount *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="1"
                      {...register(`milestones.${index}.amount`, { valueAsNumber: true })}
                      placeholder="0.00"
                      className={cn(errors.milestones?.[index]?.amount && 'border-red-500')}
                    />
                    {errors.milestones?.[index]?.amount && (
                      <p className="text-sm text-red-600">
                        {errors.milestones[index]?.amount?.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`milestones.${index}.description`}>Description</Label>
                  <Textarea
                    {...register(`milestones.${index}.description`)}
                    placeholder="Describe what will be delivered for this milestone..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`milestones.${index}.dueDate`}>Due Date (Optional)</Label>
                  <Input
                    type="date"
                    {...register(`milestones.${index}.dueDate`)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            ))}

            {/* Milestone Summary */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span>Total Milestone Amount:</span>
                <span className={cn(
                  'font-medium',
                  amountMismatch ? 'text-red-600' : 'text-green-600'
                )}>
                  {formatCurrency(totalMilestoneAmount, watchedCurrency)}
                </span>
              </div>
              {amountMismatch && (
                <p className="text-xs text-red-600 mt-1">
                  Milestone amounts must equal the total deal amount
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addMilestone}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Milestone
            </Button>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isValid || isLoading || amountMismatch}
            className="order-1 sm:order-2"
          >
            {isLoading ? 'Creating...' : 'Create Deal'}
          </Button>
        </div>
      </form>
    </div>
  )
}