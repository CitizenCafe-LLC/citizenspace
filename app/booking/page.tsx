'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  MapPin,
  Calculator,
  CreditCard,
  ArrowRight,
  Smartphone,
  Wallet
} from 'lucide-react';
import type { Metadata } from 'next';

const workspaceOptions = [
  {
    id: 'hot-desk',
    name: 'Hot Desk',
    description: 'Any available desk in the coworking zone',
    basePrice: 2.50,
    unit: 'hour',
    minDuration: 1,
    maxDuration: 12,
    capacity: 1
  },
  {
    id: 'focus-room',
    name: 'Focus Room',
    description: 'Private meeting room for 2-4 people',
    basePrice: 25,
    unit: 'hour',
    minDuration: 0.5,
    maxDuration: 8,
    capacity: 4
  },
  {
    id: 'collaborate-room',
    name: 'Collaborate Room',
    description: 'Meeting room with AV equipment for 4-6 people',
    basePrice: 40,
    unit: 'hour',
    minDuration: 0.5,
    maxDuration: 8,
    capacity: 6
  },
  {
    id: 'boardroom',
    name: 'Boardroom',
    description: 'Executive meeting space for 6-8 people',
    basePrice: 60,
    unit: 'hour',
    minDuration: 0.5,
    maxDuration: 8,
    capacity: 8
  },
  {
    id: 'communications-pod',
    name: 'Communications Pod',
    description: 'Private phone booth for calls and video meetings',
    basePrice: 5,
    unit: 'hour',
    minDuration: 0.5,
    maxDuration: 4,
    capacity: 1
  }
];

const timeSlots = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
  '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM'
];

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedWorkspace, setSelectedWorkspace] = useState('hot-desk');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(2);
  const [attendees, setAttendees] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const workspace = workspaceOptions.find(w => w.id === selectedWorkspace);
  const totalPrice = workspace ? workspace.basePrice * duration : 0;
  const hasApp = false; // This would be detected in a real app

  const handleBooking = () => {
    // In a real app, this would process the booking
    console.log('Booking:', {
      workspace: selectedWorkspace,
      date: selectedDate,
      startTime,
      duration,
      attendees,
      customerName,
      customerEmail,
      specialRequests,
      totalPrice
    });
  };

  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="pb-12">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              Book Your Space
            </Badge>
            <h1 className="font-display text-4xl lg:text-5xl font-bold mb-6">
              Reserve Your{' '}
              <span className="gradient-text">Perfect Workspace</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Choose your ideal workspace and book instantly. From hot desks to private meeting rooms.
            </p>
          </div>
        </div>
      </section>

      {/* App Promotion */}
      {!hasApp && (
        <section className="pb-12">
          <div className="container">
            <Card className="max-w-4xl mx-auto bg-gradient-to-r from-cs-blue/10 to-cs-sun/10 border-cs-blue/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Smartphone className="h-8 w-8 text-cs-blue" />
                    <div>
                      <h3 className="font-display text-lg font-semibold">Get Our Mobile App</h3>
                      <p className="text-sm text-muted-foreground">
                        Faster booking, real-time availability, and in-seat cafe ordering
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline">
                    <Link href="/app">Download App</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Booking Form */}
      <section className="pb-20">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Booking Steps */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-2xl">Book Your Space</CardTitle>
                    <CardDescription>
                      Select your workspace, date, and time preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Step 1: Choose Workspace */}
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        1. Choose Your Workspace
                      </h3>
                      
                      <Tabs value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                          {workspaceOptions.map((option) => (
                            <TabsTrigger key={option.id} value={option.id} className="text-xs">
                              {option.name}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        
                        {workspaceOptions.map((option) => (
                          <TabsContent key={option.id} value={option.id}>
                            <Card>
                              <CardContent className="pt-6">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-semibold">{option.name}</h4>
                                    <p className="text-sm text-muted-foreground">{option.description}</p>
                                  </div>
                                  <Badge variant="outline" className="text-cs-blue">
                                    ${option.basePrice}/{option.unit}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Capacity: {option.capacity} {option.capacity === 1 ? 'person' : 'people'} • 
                                  Duration: {option.minDuration}-{option.maxDuration} hours
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </div>

                    {/* Step 2: Select Date & Time */}
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center">
                        <CalendarIcon className="h-5 w-5 mr-2" />
                        2. Select Date & Time
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="date">Date</Label>
                          <div className="mt-2">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              disabled={(date) => date < new Date()}
                              className="rounded-md border"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="start-time">Start Time</Label>
                            <Select value={startTime} onValueChange={setStartTime}>
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select start time" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeSlots.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="duration">Duration (hours)</Label>
                            <Select value={duration.toString()} onValueChange={(value) => setDuration(parseFloat(value))}>
                              <SelectTrigger className="mt-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 16 }, (_, i) => (i + 1) * 0.5).map((hours) => (
                                  <SelectItem key={hours} value={hours.toString()}>
                                    {hours} {hours === 1 ? 'hour' : 'hours'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {workspace && workspace.capacity > 1 && (
                            <div>
                              <Label htmlFor="attendees">Number of Attendees</Label>
                              <Select value={attendees.toString()} onValueChange={(value) => setAttendees(parseInt(value))}>
                                <SelectTrigger className="mt-2">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: workspace.capacity }, (_, i) => i + 1).map((num) => (
                                    <SelectItem key={num} value={num.toString()}>
                                      {num} {num === 1 ? 'person' : 'people'}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Contact Information */}
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        3. Contact Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Your full name"
                            className="mt-2"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="mt-2"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Label htmlFor="requests">Special Requests (Optional)</Label>
                        <Textarea
                          id="requests"
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          placeholder="Any special requirements or requests..."
                          className="mt-2"
                          rows={3}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Booking Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="font-display text-xl flex items-center">
                      <Calculator className="h-5 w-5 mr-2" />
                      Booking Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold">Workspace</h4>
                      <p className="text-sm text-muted-foreground">
                        {workspace?.name || 'Select workspace'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold">Date & Time</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedDate ? selectedDate.toLocaleDateString() : 'Select date'}
                        {startTime && ` at ${startTime}`}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold">Duration</h4>
                      <p className="text-sm text-muted-foreground">
                        {duration} {duration === 1 ? 'hour' : 'hours'}
                      </p>
                    </div>
                    
                    {workspace && workspace.capacity > 1 && (
                      <div>
                        <h4 className="font-semibold">Attendees</h4>
                        <p className="text-sm text-muted-foreground">
                          {attendees} {attendees === 1 ? 'person' : 'people'}
                        </p>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing Fee:</span>
                        <span>$2.00</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>NFT Holder Discount:</span>
                        <span>Connect wallet to apply</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span className="text-cs-blue">${(totalPrice + 2).toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full mb-2">
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect Wallet for 50% Off
                    </Button>
                    
                    <Button 
                      className="w-full btn-primary" 
                      onClick={handleBooking}
                      disabled={!selectedDate || !startTime || !customerEmail || !workspace}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Complete Booking
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      Secure payment processed by Stripe. You'll receive a confirmation email with access details.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alternative Options */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                Other Options
              </h2>
              <p className="text-lg text-muted-foreground">
                Not sure about committing? Try these flexible alternatives
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Day Pass</CardTitle>
                  <div className="text-2xl font-bold text-cs-sun">$25/day</div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Full day access with 10% cafe discount and meeting room credits included.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/membership">Buy Day Pass</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Schedule a Tour</CardTitle>
                  <div className="text-2xl font-bold text-cs-blue">Free</div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    See our space in person before committing. Tours available daily.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/contact">Book Tour</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}