/**
 * AvailabilityCalendar Component
 * Visual calendar showing workspace availability with color coding
 */

'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { format, addDays, isSameDay } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

interface AvailabilityData {
  date: Date
  availableSpaces: number
  totalSpaces: number
  status: 'available' | 'limited' | 'full'
}

interface AvailabilityCalendarProps {
  resourceCategory?: 'desk' | 'meeting-room'
  onDateSelect?: (date: Date) => void
}

export function AvailabilityCalendar({
  resourceCategory,
  onDateSelect,
}: AvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [availability, setAvailability] = useState<Map<string, AvailabilityData>>(new Map())
  const [loading, setLoading] = useState(true)

  // Fetch availability for the next 30 days
  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true)
      const availabilityMap = new Map<string, AvailabilityData>()

      try {
        // Fetch availability for the next 30 days
        const promises = Array.from({ length: 30 }, (_, i) => {
          const date = addDays(new Date(), i)
          const dateStr = format(date, 'yyyy-MM-dd')

          const params = new URLSearchParams({ date: dateStr })
          if (resourceCategory) {
            params.append('resource_category', resourceCategory)
          }

          return fetch(`/api/workspaces/availability?${params}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.success && data.data) {
                const summary = data.data.summary
                const availableCount = summary.available_workspaces
                const totalCount = summary.total_workspaces

                let status: 'available' | 'limited' | 'full' = 'available'
                if (availableCount === 0) {
                  status = 'full'
                } else if (availableCount < totalCount * 0.5) {
                  status = 'limited'
                }

                availabilityMap.set(dateStr, {
                  date,
                  availableSpaces: availableCount,
                  totalSpaces: totalCount,
                  status,
                })
              }
            })
            .catch((error) => {
              console.error(`Error fetching availability for ${dateStr}:`, error)
            })
        })

        await Promise.all(promises)
        setAvailability(availabilityMap)
      } catch (error) {
        console.error('Error fetching availability:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAvailability()
  }, [resourceCategory])

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date && onDateSelect) {
      onDateSelect(date)
    }
  }

  const getDateStatus = (date: Date): AvailabilityData | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return availability.get(dateStr)
  }

  const modifiers = {
    available: (date: Date) => getDateStatus(date)?.status === 'available',
    limited: (date: Date) => getDateStatus(date)?.status === 'limited',
    full: (date: Date) => getDateStatus(date)?.status === 'full',
  }

  const modifiersClassNames = {
    available: 'bg-green-100 text-green-900 hover:bg-green-200',
    limited: 'bg-yellow-100 text-yellow-900 hover:bg-yellow-200',
    full: 'bg-red-100 text-red-900 hover:bg-red-200',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Availability Calendar
        </CardTitle>
        <CardDescription>
          View availability for the next 30 days. Select a date to see available time slots.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              className="rounded-md border"
            />

            {/* Legend */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Legend:</p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-green-100 border border-green-300" />
                  <span className="text-xs">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-yellow-100 border border-yellow-300" />
                  <span className="text-xs">Limited</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-red-100 border border-red-300" />
                  <span className="text-xs">Fully Booked</span>
                </div>
              </div>
            </div>

            {/* Selected Date Info */}
            {selectedDate && getDateStatus(selectedDate) && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h4>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      getDateStatus(selectedDate)?.status === 'available'
                        ? 'default'
                        : getDateStatus(selectedDate)?.status === 'limited'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {getDateStatus(selectedDate)?.availableSpaces} of{' '}
                    {getDateStatus(selectedDate)?.totalSpaces} spaces available
                  </Badge>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}