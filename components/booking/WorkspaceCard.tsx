/**
 * WorkspaceCard Component
 * Displays detailed workspace information with selection
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useBookingStore, Workspace } from '@/lib/stores/bookingStore'
import { Users, Wifi, Monitor, Coffee, Check, MapPin } from 'lucide-react'

interface WorkspaceCardProps {
  workspace: Workspace
  onSelect?: (workspace: Workspace) => void
}

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  monitor: Monitor,
  coffee: Coffee,
  whiteboard: MapPin,
}

export function WorkspaceCard({ workspace, onSelect }: WorkspaceCardProps) {
  const { selectedWorkspace, setSelectedWorkspace, isNftHolder } = useBookingStore()
  const isSelected = selectedWorkspace?.id === workspace.id

  const discountedPrice = isNftHolder
    ? workspace.base_price_hourly * 0.5
    : workspace.base_price_hourly

  const handleSelect = () => {
    setSelectedWorkspace(workspace)
    onSelect?.(workspace)
  }

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-cs-blue shadow-lg' : ''
      }`}
      onClick={handleSelect}
    >
      {workspace.images && workspace.images.length > 0 && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <img
            src={workspace.images[0]}
            alt={workspace.name}
            className="h-full w-full object-cover"
          />
          {isSelected && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-cs-blue text-white">
                <Check className="h-3 w-3 mr-1" />
                Selected
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{workspace.name}</CardTitle>
            <CardDescription className="mt-1">
              {workspace.description || workspace.type}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pricing */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cs-blue">
              ${discountedPrice.toFixed(2)}
            </span>
            <span className="text-muted-foreground">/hour</span>
          </div>
          {isNftHolder && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm line-through text-muted-foreground">
                ${workspace.base_price_hourly.toFixed(2)}
              </span>
              <Badge variant="outline" className="text-green-600">
                50% NFT Discount
              </Badge>
            </div>
          )}
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            Capacity: {workspace.capacity} {workspace.capacity === 1 ? 'person' : 'people'}
          </span>
        </div>

        {/* Amenities */}
        {workspace.amenities && workspace.amenities.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Amenities:</p>
            <div className="flex flex-wrap gap-2">
              {workspace.amenities.map((amenity, index) => {
                const Icon = amenityIcons[amenity.toLowerCase()] || Check
                return (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Icon className="h-3 w-3 mr-1" />
                    {amenity}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}

        {/* Duration limits */}
        <div className="text-xs text-muted-foreground">
          Booking duration: {workspace.min_duration}-{workspace.max_duration} hours
        </div>

        <Button
          className={`w-full ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
          onClick={(e) => {
            e.stopPropagation()
            handleSelect()
          }}
        >
          {isSelected ? 'Selected' : 'Select This Space'}
        </Button>
      </CardContent>
    </Card>
  )
}