// Content Management System Types
export interface SiteSettings {
  name: string
  tagline: string
  description: string
  logo: string
  address: {
    street: string
    city: string
    state: string
    zip: string
  }
  hours: {
    [key: string]: string
  }
  contact: {
    phone: string
    email: string
  }
  social: {
    [key: string]: string
  }
}

export interface MenuItem {
  id: string
  title: string
  description: string
  price: number
  category: 'coffee' | 'tea' | 'pastries' | 'meals'
  dietaryTags: string[]
  image?: string
  orderable: boolean
  featured?: boolean
}

export interface Workspace {
  id: string
  type: 'desk' | 'room' | 'pod'
  name: string
  capacity: number
  amenities: string[]
  images: string[]
  basePrice: number
  hourlyPrice?: number
  dailyPrice?: number
  monthlyPrice?: number
  description: string
  available: boolean
}

export interface MembershipPlan {
  id: string
  name: string
  price: number
  cadence: 'hourly' | 'daily' | 'monthly'
  perks: string[]
  legalNotes: string[]
  popular?: boolean
  stripePriceId?: string
}

export interface Event {
  id: string
  title: string
  slug: string
  description: string
  startTime: Date
  endTime: Date
  location: string
  host: string
  externalRSVPUrl?: string
  image?: string
  tags: string[]
  capacity?: number
  price?: number
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  image?: string
  author: {
    name: string
    avatar?: string
    bio?: string
  }
  tags: string[]
  publishedAt: Date
  readingTime: number
}

export interface Partner {
  id: string
  name: string
  type: 'roaster' | 'bakery' | 'vendor'
  logo?: string
  description: string
  website?: string
  established?: number
  location?: string
  specialty?: string
}

export interface Testimonial {
  id: string
  quote: string
  author: string
  role: string
  avatar?: string
  sourceLink?: string
}

// Booking & Reservation Types
export interface BookingRequest {
  resourceType: 'desk' | 'room' | 'pod'
  resourceId?: string
  date: Date
  startTime: string
  endTime: string
  duration: number
  attendees?: number
  customerEmail: string
  customerName?: string
  specialRequests?: string
}

export interface Reservation {
  id: string
  bookingRequest: BookingRequest
  status: 'pending' | 'confirmed' | 'cancelled'
  totalPrice: number
  paymentStatus: 'pending' | 'paid' | 'refunded'
  stripeSessionId?: string
  confirmationCode: string
  createdAt: Date
}

// Analytics Events
export interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  timestamp?: Date
}

// Common UI Types
export interface NavItem {
  name: string
  href: string
  children?: NavItem[]
  description?: string
}

export interface FeatureCard {
  title: string
  description: string
  icon: React.ComponentType
  href?: string
}

// Form Types
export interface ContactForm {
  name: string
  email: string
  topic: 'general' | 'booking' | 'partnership' | 'press'
  message: string
}

export interface NewsletterForm {
  email: string
  preferences?: string[]
}
