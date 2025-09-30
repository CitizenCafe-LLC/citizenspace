import { 
  SiteSettings, 
  MenuItem, 
  MembershipPlan, 
  Event, 
  Partner,
  Testimonial,
  FeatureCard
} from './types';

// Site Configuration
export const siteSettings: SiteSettings = {
  name: 'Citizen Space',
  tagline: 'Where Coffee Meets Power',
  description: 'A caffeinated coworking hub with hourly seats, day passes, memberships, and great coffee in Santa Cruz.',
  logo: '/logo.svg',
  address: {
    street: '420 Pacific Ave',
    city: 'Santa Cruz',
    state: 'CA',
    zip: '95060',
  },
  hours: {
    'Monday': '7:00 AM - 10:00 PM',
    'Tuesday': '7:00 AM - 10:00 PM',
    'Wednesday': '7:00 AM - 10:00 PM',
    'Thursday': '7:00 AM - 10:00 PM',
    'Friday': '7:00 AM - 10:00 PM',
    'Saturday': '8:00 AM - 8:00 PM',
    'Sunday': '8:00 AM - 8:00 PM',
  },
  contact: {
    phone: '(831) 295-1482',
    email: 'hello@citizenspace.com',
  },
  social: {
    instagram: '@citizenspacesc',
    twitter: '@citizenspacesc',
    linkedin: 'company/citizen-space',
  },
};

// Membership Plans
export const membershipPlans: MembershipPlan[] = [
  {
    id: 'hourly',
    name: 'Hourly',
    price: 2.50,
    cadence: 'hourly',
    perks: [
      'Pay as you go',
      'Access to coworking zone',
      'High-speed WiFi',
      'Power at every seat',
       '50% off for NFT holders ($1.25/hr)',
    ],
    legalNotes: ['No minimum commitment', 'Hourly billing via app'],
  },
  {
    id: 'day-pass',
    name: 'Day Pass',
    price: 25,
    cadence: 'daily',
    perks: [
      'Full day access',
      'All coworking amenities',
      '10% off cafe purchases',
      'Meeting room credits (2 hours)',
       '50% off for NFT holders ($12.50/day)',
    ],
    legalNotes: ['Valid for one calendar day', 'Non-transferable'],
  },
  {
    id: 'resident',
    name: 'Resident Desk',
    price: 425,
    cadence: 'monthly',
    popular: true,
    perks: [
      'Dedicated desk space',
      '24/7 access',
      'Locker included',
      'Free printing (100 pages)',
      '20% off cafe purchases',
      'Meeting room credits (8 hours)',
      'Guest day passes (2 per month)',
       '50% off for NFT holders ($225/mo)',
    ],
    legalNotes: ['Monthly billing', '30-day notice to cancel'],
  },
  {
    id: 'cafe-membership',
    name: 'Cafe Membership',
    price: 150,
    cadence: 'monthly',
    perks: [
      'Any available desk',
      '9am-5pm access Monday-Friday',
      '10% off cafe purchases',
      'Meeting room credits (2 hours/month)',
      'Free printing (50 pages/month)',
      '50% off for NFT holders ($75/mo)',
    ],
    legalNotes: ['Monthly billing', '30-day notice to cancel', 'Business hours only'],
  },
];

// Sample Menu Items
export const menuItems: MenuItem[] = [
  {
    id: 'house-blend',
    title: 'House Blend',
    description: 'Our signature medium roast with chocolate and caramel notes',
    price: 3.50,
    category: 'coffee',
    dietaryTags: [],
    orderable: true,
  },
  {
    id: 'single-origin-pour-over',
    title: 'Single-Origin Pour Over',
    description: 'Rotating selection of premium beans, ask your barista',
    price: 4.50,
    category: 'coffee',
    dietaryTags: [],
    orderable: true,
    featured: true,
  },
  {
    id: 'almond-croissant',
    title: 'Almond Croissant',
    description: 'Buttery pastry with almond cream from Arsicault Bakery',
    price: 3.75,
    category: 'pastries',
    dietaryTags: ['vegetarian'],
    orderable: true,
    featured: true,
  },
  {
    id: 'avocado-toast',
    title: 'Avocado Toast',
    description: 'Sourdough with smashed avocado, radish, everything seasoning',
    price: 12.00,
    category: 'meals',
    dietaryTags: ['vegetarian', 'vegan option'],
    orderable: true,
  },
];

// Sample Events
export const upcomingEvents: Event[] = [
  {
    id: 'creative-workshop-1',
    title: 'Digital Art Basics Workshop',
    slug: 'digital-art-basics',
    description: 'Learn the fundamentals of digital art creation with local artist Maya Chen.',
    startTime: new Date('2024-01-15T19:00:00'),
    endTime: new Date('2024-01-15T21:00:00'),
    location: 'Citizen Space Main Floor',
    host: 'Maya Chen',
    image: '/events/digital-art-workshop.jpg',
    tags: ['workshop', 'art', 'creative'],
    capacity: 20,
    price: 25,
  },
  {
    id: 'networking-breakfast',
    title: 'Entrepreneur Breakfast',
    slug: 'entrepreneur-breakfast',
    description: 'Monthly networking breakfast for startup founders and entrepreneurs.',
    startTime: new Date('2024-01-20T08:00:00'),
    endTime: new Date('2024-01-20T10:00:00'),
    location: 'Citizen Space Cafe',
    host: 'SF Entrepreneurs Guild',
    image: '/events/networking-breakfast.jpg',
    tags: ['networking', 'business', 'breakfast'],
    capacity: 30,
  },
];

// Partners Data
export const partners: Partner[] = [
  {
    id: 'four-barrel',
    name: 'Four Barrel Coffee',
    type: 'roaster',
    description: 'Mission-based roaster known for their meticulous approach to sourcing and roasting.',
    website: 'https://fourbarrelcoffee.com',
    established: 2008,
    location: 'Mission District',
    specialty: 'Direct trade single origins',
  },
  {
    id: 'arsicault',
    name: 'Arsicault Bakery',
    type: 'bakery',
    description: 'Award-winning French bakery creating authentic croissants and pastries.',
    website: 'https://arsicaultbakery.com',
    established: 2016,
    location: 'Richmond District',
    specialty: 'Traditional French pastries',
  },
];

// Testimonials
export const testimonials: Testimonial[] = [
  {
    id: 'sarah-founder',
    quote: 'The perfect blend of community and productivity. I\'ve been a member for two years and can\'t imagine working anywhere else.',
    author: 'Sarah Johnson',
    role: 'Startup Founder',
    avatar: '/testimonials/sarah.jpg',
  },
  {
    id: 'mike-developer',
    quote: 'Great coffee, reliable internet, and a welcoming atmosphere. The day passes are perfect for when I need a change of scenery.',
    author: 'Mike Chen',
    role: 'Software Developer',
    avatar: '/testimonials/mike.jpg',
  },
];

// Navigation Data
export const navigationItems = [
  { name: 'Cafe', href: '/cafe' },
  {
    name: 'Workspaces',
    href: '/workspaces',
    children: [
      { 
        name: 'Desks', 
        href: '/workspaces/desks', 
        description: 'Hourly & daily workspace options' 
      },
      { 
        name: 'Meeting Rooms', 
        href: '/workspaces/meeting-rooms', 
        description: 'Private rooms for teams' 
      },
      { 
        name: 'Team Pods', 
        href: '/workspaces/team-pods', 
        description: 'Monthly dedicated spaces' 
      },
    ],
  },
  { name: 'Membership', href: '/membership' },
  { name: 'Events', href: '/events' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Blog', href: '/blog' },
  { name: 'Location', href: '/location' },
  { name: 'Contact', href: '/contact' },
];