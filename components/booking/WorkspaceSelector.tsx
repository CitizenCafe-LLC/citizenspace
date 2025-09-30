/**
 * WorkspaceSelector Component
 * Displays workspace type options (hot desk vs meeting room)
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useBookingStore } from '@/lib/stores/bookingStore'
import { Laptop, Users, Check } from 'lucide-react'

const workspaceTypes = [
  {
    id: 'hot-desk' as const,
    name: 'Hot Desk',
    description: 'Flexible desk space in our coworking area',
    icon: Laptop,
    features: [
      'Any available desk',
      'High-speed WiFi',
      'Power outlets',
      'Access to common areas',
    ],
    basePrice: 2.5,
    unit: 'hour',
    popular: false,
  },
  {
    id: 'meeting-room' as const,
    name: 'Meeting Room',
    description: 'Private rooms for focused work or meetings',
    icon: Users,
    features: [
      'Privacy for meetings',
      'Whiteboard & AV equipment',
      'Video conferencing setup',
      'Use member credits',
    ],
    basePrice: 25,
    unit: 'hour',
    popular: true,
  },
]

export function WorkspaceSelector() {
  const { selectedWorkspaceType, setWorkspaceType, isNftHolder } = useBookingStore()

  const handleSelect = (type: 'hot-desk' | 'meeting-room') => {
    setWorkspaceType(type)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Choose Workspace Type</h2>
        <p className="text-muted-foreground">
          Select the type of workspace that best fits your needs
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {workspaceTypes.map((workspace) => {
          const Icon = workspace.icon
          const isSelected = selectedWorkspaceType === workspace.id
          const discountedPrice = isNftHolder
            ? workspace.basePrice * 0.5
            : workspace.basePrice

          return (
            <Card
              key={workspace.id}
              className={`relative cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-cs-blue shadow-lg' : ''
              }`}
              onClick={() => handleSelect(workspace.id)}
            >
              {workspace.popular && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-cs-sun text-white">Popular</Badge>
                </div>
              )}

              {isSelected && (
                <div className="absolute -top-3 left-4">
                  <Badge className="bg-cs-blue text-white">
                    <Check className="h-3 w-3 mr-1" />
                    Selected
                  </Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-cs-blue" />
                      {workspace.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {workspace.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-cs-blue">
                      ${discountedPrice.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">/{workspace.unit}</span>
                  </div>
                  {isNftHolder && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm line-through text-muted-foreground">
                        ${workspace.basePrice.toFixed(2)}
                      </span>
                      <Badge variant="outline" className="text-green-600">
                        50% NFT Discount
                      </Badge>
                    </div>
                  )}
                </div>

                <ul className="space-y-2">
                  {workspace.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    isSelected ? 'btn-primary' : 'btn-secondary'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelect(workspace.id)
                  }}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {!isNftHolder && (
        <Card className="border-cs-blue/20 bg-gradient-to-r from-cs-blue/5 to-cs-sun/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">NFT Holder Benefits</h4>
                <p className="text-sm text-muted-foreground">
                  Get 50% off all bookings. Connect your wallet to apply discount.
                </p>
              </div>
              <Button variant="outline">Connect Wallet</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}