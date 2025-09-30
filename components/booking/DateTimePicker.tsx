/**
 * DateTimePicker Component
 * Handles date and time selection with real-time availability checking
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useBookingStore } from '@/lib/stores/bookingStore'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react'

// Generate time slots from 7 AM to 10 PM in 30-minute intervals
const generateTimeSlots = () => {
  const slots = []
  for (let hour = 7; hour < 22; hour++) {
    for (let minute of [0, 30]) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const displayTime = new Date(2000, 0, 1, hour, minute).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      slots.push({ value: time, label: displayTime })
    }
  }
  // Add 10:00 PM as the last possible end time
  slots.push({ value: '22:00', label: '10:00 PM' })
  return slots
}

const timeSlots = generateTimeSlots()

// Generate duration options from 0.5 to 8 hours
const generateDurations = () => {
  const durations = []
  for (let i = 1; i <= 16; i++) {
    const hours = i * 0.5
    durations.push({
      value: hours,
      label: hours === 1 ? '1 hour' : `${hours} hours`,
    })
  }
  return durations
}

const durations = generateDurations()

interface AvailabilityStatus {
  available: boolean
  checking: boolean
  error: string | null
}

export function DateTimePicker() {
  const {
    bookingDate,
    startTime,
    endTime,
    duration,
    selectedWorkspaceType,
    setBookingDate,
    setStartTime,
    setEndTime,
    setDuration,
  } = useBookingStore()

  const [availability, setAvailability] = useState<AvailabilityStatus>({
    available: true,
    checking: false,
    error: null,
  })

  // Calculate end time based on start time and duration
  const calculateEndTime = useCallback((start: string, durationHours: number) => {
    const [hour, minute] = start.split(':').map(Number)
    const startMinutes = hour * 60 + minute
    const endMinutes = startMinutes + durationHours * 60
    const endHour = Math.floor(endMinutes / 60)
    const endMinute = endMinutes % 60

    // Check if end time exceeds 10 PM
    if (endHour > 22 || (endHour === 22 && endMinute > 0)) {
      return null
    }

    return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
  }, [])

  // Update end time when start time or duration changes
  useEffect(() => {
    if (startTime && duration) {
      const newEndTime = calculateEndTime(startTime, duration)
      if (newEndTime) {
        setEndTime(newEndTime)
      } else {
        setEndTime(null)
      }
    }
  }, [startTime, duration, calculateEndTime, setEndTime])

  // Check availability when date/time changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (!bookingDate || !startTime || !endTime) {
        setAvailability({ available: true, checking: false, error: null })
        return
      }

      setAvailability({ available: true, checking: true, error: null })

      try {
        const dateStr = format(bookingDate, 'yyyy-MM-dd')
        const params = new URLSearchParams({
          date: dateStr,
          start_time: startTime,
          end_time: endTime,
        })

        if (selectedWorkspaceType) {
          params.append(
            'resource_category',
            selectedWorkspaceType === 'hot-desk' ? 'desk' : 'meeting-room'
          )
        }

        const response = await fetch(`/api/workspaces/availability?${params}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to check availability')
        }

        const hasAvailableWorkspaces = data.data.summary.available_workspaces > 0
        setAvailability({
          available: hasAvailableWorkspaces,
          checking: false,
          error: hasAvailableWorkspaces ? null : 'No workspaces available for this time slot',
        })
      } catch (error) {
        console.error('Error checking availability:', error)
        setAvailability({
          available: false,
          checking: false,
          error: 'Failed to check availability. Please try again.',
        })
      }
    }

    const timeoutId = setTimeout(checkAvailability, 500) // Debounce
    return () => clearTimeout(timeoutId)
  }, [bookingDate, startTime, endTime, selectedWorkspaceType])

  // Filter end time options based on start time
  const getAvailableEndTimes = () => {
    if (!startTime) return []

    const [startHour, startMinute] = startTime.split(':').map(Number)
    const startMinutes = startHour * 60 + startMinute

    return timeSlots.filter((slot) => {
      const [hour, minute] = slot.value.split(':').map(Number)
      const slotMinutes = hour * 60 + minute
      return slotMinutes > startMinutes + 30 // Minimum 30 minutes
    })
  }

  const handleStartTimeChange = (time: string) => {
    setStartTime(time)
    // Reset end time if it's now invalid
    if (endTime) {
      const [startHour, startMinute] = time.split(':').map(Number)
      const [endHour, endMinute] = endTime.split(':').map(Number)
      if (endHour * 60 + endMinute <= startHour * 60 + startMinute) {
        setEndTime(null)
      }
    }
  }

  const maxDurationHours = startTime
    ? (() => {
        const [hour, minute] = startTime.split(':').map(Number)
        const startMinutes = hour * 60 + minute
        const maxEndMinutes = 22 * 60 // 10 PM
        const maxDuration = (maxEndMinutes - startMinutes) / 60
        return Math.floor(maxDuration * 2) / 2 // Round down to nearest 0.5
      })()
    : 8

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Date & Time</h2>
        <p className="text-muted-foreground">Choose when you'd like to book your workspace</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Calendar */}
        <Card>
          <CardContent className="pt-6">
            <Label className="flex items-center gap-2 mb-4">
              <CalendarIcon className="h-4 w-4" />
              Select Date
            </Label>
            <Calendar
              mode="single"
              selected={bookingDate || undefined}
              onSelect={(date) => setBookingDate(date || null)}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Time Selection */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="start-time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Start Time
                </Label>
                <Select value={startTime || ''} onValueChange={handleStartTimeChange}>
                  <SelectTrigger id="start-time" className="mt-2">
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.slice(0, -1).map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration</Label>
                <Select
                  value={duration.toString()}
                  onValueChange={(value) => setDuration(parseFloat(value))}
                >
                  <SelectTrigger id="duration" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {durations
                      .filter((d) => d.value <= maxDurationHours)
                      .map((d) => (
                        <SelectItem key={d.value} value={d.value.toString()}>
                          {d.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {startTime && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Maximum duration: {maxDurationHours} hours (until 10 PM)
                  </p>
                )}
              </div>

              {endTime && (
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">End Time:</span>
                    <span className="font-semibold">
                      {timeSlots.find((s) => s.value === endTime)?.label || endTime}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Availability Status */}
          {bookingDate && startTime && endTime && (
            <Card>
              <CardContent className="pt-6">
                {availability.checking ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : availability.available ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Badge variant="outline" className="border-green-600 text-green-600">
                      Available
                    </Badge>
                    <span className="text-sm">This time slot is available</span>
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {availability.error || 'This time slot is not available'}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Selected Summary */}
      {bookingDate && startTime && endTime && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-2">Selected Booking Time</h4>
            <p className="text-sm">
              <span className="font-medium">{format(bookingDate, 'EEEE, MMMM d, yyyy')}</span>
              {' from '}
              <span className="font-medium">
                {timeSlots.find((s) => s.value === startTime)?.label}
              </span>
              {' to '}
              <span className="font-medium">
                {timeSlots.find((s) => s.value === endTime)?.label}
              </span>
              {' '}({duration} {duration === 1 ? 'hour' : 'hours'})
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}