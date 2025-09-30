/**
 * WorkspaceForm Component
 * Form for creating/editing workspaces
 */

'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Upload, X } from 'lucide-react'

const workspaceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['hot-desk', 'dedicated-desk', 'private-office', 'meeting-room']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
  hourlyRate: z.coerce.number().min(0, 'Hourly rate must be positive'),
  dayRate: z.coerce.number().min(0, 'Day rate must be positive'),
  amenities: z.array(z.string()),
  available: z.boolean(),
})

type WorkspaceFormData = z.infer<typeof workspaceSchema>

const amenitiesList = [
  'WiFi',
  'Monitor',
  'Whiteboard',
  'Coffee',
  'Printer',
  'Phone',
  'TV',
  'Video Conference',
]

interface WorkspaceFormProps {
  defaultValues?: Partial<WorkspaceFormData>
  onSubmit: (data: WorkspaceFormData) => Promise<void>
  isLoading?: boolean
}

export function WorkspaceForm({ defaultValues, onSubmit, isLoading }: WorkspaceFormProps) {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    defaultValues?.amenities || []
  )
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      available: true,
      ...defaultValues,
    },
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
  }

  const toggleAmenity = (amenity: string) => {
    const updated = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((a) => a !== amenity)
      : [...selectedAmenities, amenity]
    setSelectedAmenities(updated)
    setValue('amenities', updated)
  }

  const handleFormSubmit = async (data: WorkspaceFormData) => {
    await onSubmit({ ...data, amenities: selectedAmenities })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name</Label>
            <Input id="name" {...register('name')} placeholder="e.g., Window Desk #1" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select defaultValue={defaultValues?.type} onValueChange={(value) => setValue('type', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select workspace type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hot-desk">Hot Desk</SelectItem>
                <SelectItem value="dedicated-desk">Dedicated Desk</SelectItem>
                <SelectItem value="private-office">Private Office</SelectItem>
                <SelectItem value="meeting-room">Meeting Room</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe the workspace..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                {...register('capacity')}
                placeholder="1"
              />
              {errors.capacity && (
                <p className="text-sm text-destructive">{errors.capacity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
              <Input
                id="hourlyRate"
                type="number"
                step="0.01"
                {...register('hourlyRate')}
                placeholder="10.00"
              />
              {errors.hourlyRate && (
                <p className="text-sm text-destructive">{errors.hourlyRate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dayRate">Day Rate ($)</Label>
              <Input
                id="dayRate"
                type="number"
                step="0.01"
                {...register('dayRate')}
                placeholder="40.00"
              />
              {errors.dayRate && (
                <p className="text-sm text-destructive">{errors.dayRate.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="available"
              defaultChecked={defaultValues?.available !== false}
              onCheckedChange={(checked) => setValue('available', checked as boolean)}
            />
            <Label htmlFor="available">Available for booking</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {amenitiesList.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity}
                  checked={selectedAmenities.includes(amenity)}
                  onCheckedChange={() => toggleAmenity(amenity)}
                />
                <Label htmlFor={amenity}>{amenity}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-48 w-full rounded-lg object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <Label htmlFor="image-upload" className="mt-4 cursor-pointer">
                    <span className="text-sm font-medium text-primary">Upload image</span>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {defaultValues ? 'Update Workspace' : 'Create Workspace'}
        </Button>
      </div>
    </form>
  )
}