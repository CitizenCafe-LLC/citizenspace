/**
 * Citizen Space site content: the single source for prices, rooms, FAQ and menu.
 * Pricing comes from "Citizen Space: The Founding 50" deck (founding rates vs. the
 * lowest local listings). Keep this file free of placeholders: tests enforce it.
 */

export const BRAND = {
  paper: '#FAF7F1',
  bone: '#F0EAE0',
  ink: '#1E2422',
  muted: '#554F48',
  brick: '#9E5640',
  forest: '#1F3D33',
  oak: '#B08A5E',
  moss: '#6F8063',
  peach: '#E7B49B',
  mist: '#D9E3DC',
  hairline: '#D8CFC2',
} as const

export const ZONE_COLORS = {
  lobby: '#8C6D4F',
  kitchen: '#C8734F',
  conference: '#2E5E63',
  dropIn: '#1F3D33',
  hotDesks: '#6F8063',
  hallway: '#4F7A63',
  sharedRoom: '#4E6A7E',
  studio: '#1F2A36',
  founders: '#C49A4A',
} as const

export const SITE = {
  name: 'Citizen Space',
  legalName: 'Citizen Space, PBC',
  tagline: 'Santa Cruz Builder Lab',
  url: 'https://citizenspace.ainative.studio',
  description:
    'Community-run coworking for founders, freelancers, creators and remote workers at 819 Pacific Ave in downtown Santa Cruz.',
  address: {
    street: '819 Pacific Ave',
    city: 'Santa Cruz',
    region: 'CA',
    postalCode: '95060',
    country: 'US',
  },
  squareFeet: 1385,
  foundingSalesOpen: 'December 1, 2026',
  keys: 'January 1, 2027',
  doorsOpen: 'March 2027',
  publicBenefit:
    'Grow the Santa Cruz founder economy and the local economy. From 2027, the space’s profits are invested back into member companies.',
  internet: 'Two Cruzio lines: 2 Gbps down, 400 Mbps up',
  founding: { price: 1000, installments: 3, installment: 333, spots: 50 },
} as const

export type Rate = { name: string; founding: number; typical: number; unit: string; note?: string }

export const MEMBERSHIP_RATES: Rate[] = [
  { name: 'Day pass', founding: 12, typical: 25, unit: '' },
  { name: '10-day flex', founding: 74, typical: 149, unit: '/mo' },
  { name: 'Monthly flex desk', founding: 124, typical: 249, unit: '/mo' },
  { name: 'Virtual address with 2 day passes', founding: 39, typical: 79, unit: '/mo' },
  {
    name: 'Business Pro: address, registered agent, phone line',
    founding: 124,
    typical: 249,
    unit: '/mo',
  },
]

export const HOURLY_RATES: Rate[] = [
  { name: 'Conference room', founding: 7, typical: 15, unit: '/hr', note: 'Seats 8.' },
  { name: 'Content studio', founding: 12, typical: 25, unit: '/hr', note: 'Podcast and video.' },
  { name: 'Event use of common area', founding: 7, typical: 15, unit: '/hr' },
  {
    name: 'Notary',
    founding: 7.5,
    typical: 15,
    unit: ' per signature',
    note: 'California caps it at $15.',
  },
]

export const RATE_SOURCES =
  'Typical prices are the lowest local listings: Cruzioworks for the day pass and rooms, Pacific Workplaces for flex and virtual office, 101 Cooper St for the full virtual office.'

export const SPONSOR_TIERS = [
  {
    name: 'Founding Supporter',
    price: 1000,
    color: BRAND.oak,
    perks: '1 sponsor membership, logo on the founding wall.',
  },
  {
    name: 'Founding Partner',
    price: 2500,
    color: BRAND.moss,
    perks: '3 sponsor memberships, a bigger logo, 1 lounge event a quarter.',
  },
  {
    name: 'Room Sponsor',
    price: 5000,
    color: BRAND.forest,
    perks: 'Your name on one room, 5 sponsor memberships, a large logo.',
  },
  {
    name: 'Multi-Room Sponsor',
    price: 10000,
    color: BRAND.brick,
    perks:
      'Your name on 2 or 3 rooms, 10 sponsor memberships, top spot on the wall, “Builder Night presented by”.',
    limit: 'only 1',
  },
]

export type Zone = {
  id: string
  name: string
  color: string
  meta: string
  photo: string
  photoAlt: string
  plan?: string
  summary: string
  href: string
  cta: string
  workSeats?: number
}

const P = '/brand/photos/'
const PLAN = '/brand/plan/'

export const ZONES: Zone[] = [
  {
    id: 'hot-desks',
    name: 'Hot desks',
    color: ZONE_COLORS.hotDesks,
    meta: '8 seats · window room',
    photo: P + '03-hot-desks.jpg',
    photoAlt: 'Hot desks room today: brick wall and chalkboard',
    plan: PLAN + 'room-03-hot-desks.jpg',
    summary:
      'Keep the brick and the chalkboard. A moss accent on the plain wall, two 4-seat benches near the windows, LED panels plus desk lamps.',
    href: '/workspaces#desks',
    cta: 'See desk options',
    workSeats: 8,
  },
  {
    id: 'drop-in',
    name: 'Drop-in area',
    color: ZONE_COLORS.dropIn,
    meta: '12 drop-in seats',
    photo: P + '10-drop-in-area.jpg',
    photoAlt: 'Drop-in area today with the old chalk panel',
    plan: PLAN + 'room-02-drop-in.jpg',
    summary:
      'The old chalk panel goes forest green and becomes the member board. Two 6-seat oak benches, LED panels to brighten the floor.',
    href: '/workspaces#desks',
    cta: 'See desk options',
    workSeats: 12,
  },
  {
    id: 'shared-room',
    name: 'Main shared room',
    color: ZONE_COLORS.sharedRoom,
    meta: '4 founding desks',
    photo: P + '02-main-shared-room.jpg',
    photoAlt: 'Main shared room today: brick and the arched chalkboard',
    plan: PLAN + 'room-05-main-shared.jpg',
    summary:
      'The brick and arched chalkboard become the founders’ planning wall. Four founding desks in the middle, a couch under the Pacific Ave window.',
    href: '/workspaces#desks',
    cta: 'See desk options',
    workSeats: 4,
  },
  {
    id: 'conference',
    name: 'Conference room',
    color: ZONE_COLORS.conference,
    meta: 'Seats 8 · 167 sq ft',
    photo: P + '12-conference-room.jpg',
    photoAlt: 'Conference room today: fireplace and skylight',
    plan: PLAN + 'room-01-conference.jpg',
    summary:
      'Deep teal behind the white fireplace, a diffuser on the skylight for soft light on calls, an oak table for 8, a screen on the back wall.',
    href: '/workspaces#conference',
    cta: 'Conference room details',
  },
  {
    id: 'studio',
    name: 'Content studio',
    color: ZONE_COLORS.studio,
    meta: '4 seats · 118 sq ft',
    photo: P + '08-red-wall-room-wide.jpg',
    photoAlt: 'The room planned as the studio, today: red wall and French doors',
    summary:
      'Podcast and video, with a backdrop wall. Next to the main shared room. Book it by the hour.',
    href: '/workspaces#studio',
    cta: 'Studio details',
  },
  {
    id: 'hallway',
    name: 'Hallway lounge',
    color: ZONE_COLORS.hallway,
    meta: 'Lobby to the Pacific Ave window',
    photo: P + '06-hallway-lounge.jpg',
    photoAlt: 'Hallway today with the wood-plank wall',
    plan: PLAN + 'room-04-hallway-lounge.jpg',
    summary:
      'Keep the wood-plank wall for member photos and event posters. A couch, low table and two armchairs at the window end.',
    href: '/events',
    cta: 'See what’s on',
  },
  {
    id: 'kitchen',
    name: 'Kitchen pantry',
    color: ZONE_COLORS.kitchen,
    meta: 'Off the entry',
    photo: P + '14-kitchen-utility.jpg',
    photoAlt: 'Kitchen room today with tile floor and sink',
    summary: 'A new dishwasher, an updated sink, a fridge and the coffee bar.',
    href: '/cafe',
    cta: 'See the cafe menu',
  },
]

export const HERO_SLIDES = [
  {
    src: P + '02-main-shared-room.jpg',
    title: 'Main shared room',
    line: 'Sunlight on the brick. Four founding desks go here.',
    alt: 'Sunlit main shared room with exposed brick and an arched chalkboard',
  },
  {
    src: P + '12-conference-room.jpg',
    title: 'Conference room',
    line: 'Fireplace and skylight. Seats 8.',
    alt: 'Conference room with a white brick fireplace, skylight and French doors',
  },
  {
    src: P + '06-hallway-lounge.jpg',
    title: 'Hallway lounge',
    line: 'Wood-plank wall, a couch at the window end.',
    alt: 'Long hallway with a dark wood-plank wall',
  },
  {
    src: P + '03-hot-desks.jpg',
    title: 'Hot desks',
    line: 'Brick and chalkboard. 8 seats by the windows.',
    alt: 'Room with exposed brick wall and a large chalkboard',
  },
  {
    src: P + '10-drop-in-area.jpg',
    title: 'Drop-in area',
    line: '12 seats around the member board.',
    alt: 'Open common area with a freestanding chalk panel',
  },
  {
    src: P + '09-bay-window-corner.jpg',
    title: 'On Pacific Ave',
    line: 'Brick, tall windows, downtown Santa Cruz.',
    alt: 'Corner room with brick and a tall curtained window',
  },
]

export const GALLERY_PHOTOS = [
  [
    '02-main-shared-room',
    'Main shared room',
    'Afternoon sun across the brick and the arched chalkboard. The four founding desks go here.',
  ],
  [
    '12-conference-room',
    'Conference room',
    'The white brick fireplace under a skylight, with French doors that close for sound.',
  ],
  [
    '06-hallway-lounge',
    'Hallway lounge',
    'The wood-plank wall runs from the lobby to the Pacific Ave window.',
  ],
  ['03-hot-desks', 'Hot desks', 'Exposed brick and a big chalkboard in the window room.'],
  [
    '10-drop-in-area',
    'Drop-in area',
    'The open common room. The old chalk panel becomes the member board.',
  ],
  [
    '09-bay-window-corner',
    'On Pacific Ave',
    'Brick, tall windows and light from downtown Santa Cruz.',
  ],
  ['08-red-wall-room-wide', 'Content studio', 'The red-wall room with two sets of French doors.'],
  ['04-hot-desks-plain-wall', 'Hot desks', 'The long plain wall, ready for a coat of moss green.'],
  ['15-skylight-wood-wall', 'Skylight room', 'Daylight overhead and a dark wood-plank wall.'],
  [
    '05-french-doors-anteroom',
    'Into the conference room',
    'Glass French doors open off the pass-through.',
  ],
  ['13-red-wall-room-doors', 'Content studio', 'The red wall and glass doors, up close.'],
  [
    '01-passthrough-to-conference',
    'Pass-through',
    'Three doorways, with the fireplace glowing through the left one.',
  ],
  ['07-teal-room', 'Teal room', 'A deep teal wall and an old chalk panel.'],
  ['11-teal-panel-office', 'Small office', 'A white room with a teal panel and its own window.'],
  [
    '14-kitchen-utility',
    'Kitchen pantry',
    'Tile floor and plumbing in place, before the new sink and dishwasher.',
  ],
].map(([file, room, note]) => ({ src: `${P}${file}.jpg`, room, note, alt: `${room}: ${note}` }))

export const FACTS: [string, string][] = [
  ['Name', 'Citizen Space, the Santa Cruz Builder Lab'],
  ['What it is', 'Community-run coworking for founders, freelancers, creators and remote workers'],
  ['Address', '819 Pacific Ave, Santa Cruz, CA 95060, above Zachary’s'],
  ['Size', '1,385 sq ft on one floor, 24 work seats'],
  ['Opening', 'Founding sales December 1, 2026 · doors open March 2027'],
  ['Founding 50', '$1,000 once, or 3 payments of $333 · lowest rates for life · 50 spots'],
  ['Day pass', '$12 founding rate · $25 standard'],
  ['Desks', '10-day flex $74/mo · monthly flex desk $124/mo'],
  ['Rooms by the hour', 'Conference room $7 · content studio $12'],
  ['Internet', 'Two Cruzio lines: 2 Gbps down, 400 Mbps up'],
  ['Food', 'Member menu from Zachary’s, delivered upstairs Tue–Sun 7am–2:30pm'],
  ['Company', 'Citizen Space, PBC, a public benefit corporation'],
]

export type QA = { question: string; answer: string }
export type FaqGroup = { id: string; title: string; color: string; items: QA[] }

const qa = (pairs: [string, string][]): QA[] =>
  pairs.map(([question, answer]) => ({ question, answer }))

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'find',
    title: 'Finding coworking in Santa Cruz',
    color: BRAND.brick,
    items: qa([
      [
        'Where can I find affordable coworking in Santa Cruz?',
        'Citizen Space at 819 Pacific Ave in downtown Santa Cruz charges about half of what other Santa Cruz coworking spaces do. Founding rates are a $12 day pass, a 10-day flex membership for $74 a month and a monthly flex desk for $124 a month, against typical local prices of $25, $149 and $249.',
      ],
      [
        'What is the cheapest coworking day pass in downtown Santa Cruz?',
        'A day pass at Citizen Space, 819 Pacific Ave, is $12 at the founding rate. The typical day pass elsewhere in Santa Cruz is $25.',
      ],
      [
        'Is there a coworking space in Santa Cruz with a monthly desk under $150?',
        'Yes. Citizen Space in downtown Santa Cruz has a monthly flex desk for $124 a month and a 10-day flex membership for $74 a month at founding rates.',
      ],
      [
        'What is the best coworking space in Santa Cruz for startup founders?',
        'Citizen Space, the Santa Cruz Builder Lab at 819 Pacific Ave, is built for founders, freelancers and creators. It hosts Builder Night every Monday, runs a bounty board of paid tasks members can pick up for membership credits, and as a public benefit corporation invests its profits back into member companies starting in 2027.',
      ],
      [
        'Where can I work remotely in downtown Santa Cruz with fast internet?',
        'Citizen Space at 819 Pacific Ave has two Cruzio internet lines with 2 Gbps down and 400 Mbps up, plus 24 work seats: 8 hot desks, 12 drop-in seats and 4 founding desks. A day pass is $12.',
      ],
      [
        'Where can I work in Santa Cruz instead of a coffee shop?',
        'Citizen Space on Pacific Ave in downtown Santa Cruz is a quieter, faster alternative to working from a cafe: a $12 day pass gets you a seat, 2-gig internet, a coffee bar, and breakfast or lunch from Zachary’s delivered to your desk.',
      ],
      [
        'Is there a coworking space in Santa Cruz so I don’t have to commute over the hill?',
        'Yes. Citizen Space in downtown Santa Cruz gives remote workers who would otherwise drive Highway 17 to Silicon Valley a desk in town, with fast internet, meeting rooms and a builder community, from $12 a day or $124 a month.',
      ],
      [
        'Where can I rent a podcast or video studio by the hour in Santa Cruz?',
        'Citizen Space at 819 Pacific Ave rents its content studio by the hour for $12 at the founding rate. It seats 4 and has a backdrop wall for podcasts and video. Typical Santa Cruz studio rates are about $25 an hour.',
      ],
      [
        'Where can I book a meeting room by the hour in Santa Cruz?',
        'Citizen Space in downtown Santa Cruz has a conference room for 8 with a fireplace, a skylight and a screen, booked by the hour for $7 at the founding rate.',
      ],
      [
        'Where can I get a business address or virtual office in Santa Cruz?',
        'Citizen Space at 819 Pacific Ave offers a Santa Cruz business address with 2 day passes for $39 a month, and Business Pro with an address, a registered agent and a phone line for $124 a month.',
      ],
      [
        'Where can I get a document notarized in downtown Santa Cruz?',
        'Citizen Space at 819 Pacific Ave offers notary service for $7.50 per signature, plus Live Scan fingerprinting.',
      ],
      [
        'Where do startup founders and builders meet in Santa Cruz?',
        'Santa Cruz builders meet every Monday at Builder Night, hosted by Citizen Space. Until the space at 819 Pacific Ave opens in March 2027, Builder Night meets at Pleasure Pizza on Pacific Ave.',
      ],
      [
        'Where can I host a tech meetup or workshop in Santa Cruz?',
        'Citizen Space in downtown Santa Cruz rents its common area for events at $7 an hour at the founding rate, and members run Colearn classes and workshops there.',
      ],
      [
        'Is there a member-run or community-owned coworking space in Santa Cruz?',
        'Yes. Citizen Space at 819 Pacific Ave is run by its members with no paid staff, and it is a public benefit corporation whose mission is to grow the Santa Cruz founder economy and the local economy.',
      ],
      [
        'Is there a coworking space near UCSC?',
        'Citizen Space is in downtown Santa Cruz at 819 Pacific Ave, a direct Santa Cruz METRO bus ride from UC Santa Cruz. Students are welcome, and a day pass is $12.',
      ],
      [
        'Which Santa Cruz coworking space serves food?',
        'Citizen Space at 819 Pacific Ave has a member menu from Zachary’s, the breakfast and lunch restaurant downstairs since 1985. Members order on the website and Zachary’s brings it up, Tuesday to Sunday from 7am to 2:30pm.',
      ],
      [
        'What was one of the first coworking spaces in the world?',
        'Citizen Space, which opened in San Francisco, was one of the world’s first coworking spaces. It now has a permanent home at 819 Pacific Ave in Santa Cruz, opening March 2027.',
      ],
    ]),
  },
  {
    id: 'about',
    title: 'About Citizen Space',
    color: BRAND.forest,
    items: qa([
      [
        'What is Citizen Space?',
        'Citizen Space is a community-run coworking space at 819 Pacific Ave in downtown Santa Cruz, California. It’s the Santa Cruz Builder Lab: a place where founders, freelancers, creators and remote workers work side by side, run the place together and ship.',
      ],
      [
        'Where is Citizen Space?',
        'Citizen Space is at 819 Pacific Ave, Santa Cruz, CA 95060, in downtown Santa Cruz, upstairs from Zachary’s restaurant. Pacific Ave runs along our window wall.',
      ],
      [
        'When does Citizen Space open?',
        'Doors open in March 2027. Founding memberships go on sale December 1, 2026, the charter founders take the keys January 1, 2027, and early members can move in during the January build-out.',
      ],
      [
        'Who is Citizen Space for?',
        'Founders, freelancers, remote workers, creators and podcasters, students, and local companies that want to be part of the Santa Cruz builder scene.',
      ],
      [
        'Is Citizen Space a public benefit corporation?',
        'Yes. Citizen Space, PBC is a public benefit corporation. Its public benefit is to grow the Santa Cruz founder economy and the local economy. Starting in 2027, the space’s profits are invested back into member companies.',
      ],
      [
        'Who runs the space?',
        'The members do. There is no paid staff. Members open, close and care for the space, trusted members hold off-hours access, and every member signs a code of conduct.',
      ],
      [
        'Where did Citizen Space start?',
        'Citizen Space began in San Francisco as one of the world’s first coworking spaces. A Westside Santa Cruz pop-up proved the community is here, and 819 Pacific Ave is its permanent home.',
      ],
    ]),
  },
  {
    id: 'founding',
    title: 'The Founding 50',
    color: BRAND.brick,
    items: qa([
      [
        'What is the Founding 50?',
        'The Founding 50 is a one-time $1,000 founding membership, capped at 50 people. Founding members get the lowest rates for life, about half of what other Santa Cruz spaces charge, plus first pick of events and studio time and their name on the founding wall.',
      ],
      [
        'Can I pay the founding fee in installments?',
        'Yes. You can pay 3 monthly payments of $333. After the third payment you’re on founding rates for life, with the same spot on the wall.',
      ],
      [
        'What is the member NFT key?',
        'It’s your membership pass and door key. Your phone shows a QR code that opens the door. It carries no profit share and isn’t an investment.',
      ],
      [
        'Can I move in before March?',
        'Yes. Pay your first installment in December or January and you move in with the charter founders in January, while the space is built out.',
      ],
      [
        'What happens after the 50 spots are gone?',
        'Founding spots close for good and new members pay standard rates.',
      ],
      [
        'Can a company sponsor the space?',
        'Yes. Founding sponsor tiers are Founding Supporter $1,000, Founding Partner $2,500, Room Sponsor $5,000 and one Multi-Room Sponsor at $10,000. Sponsor spots are in addition to the Founding 50.',
      ],
    ]),
  },
  {
    id: 'pricing',
    title: 'Pricing and spaces',
    color: BRAND.moss,
    items: qa([
      [
        'How much is a day pass?',
        'A day pass is $12 at the founding rate. The typical Santa Cruz price is $25.',
      ],
      [
        'How much is a desk?',
        'A 10-day flex membership is $74 a month and a monthly flex desk is $124 a month at founding rates. Typical Santa Cruz prices are $149 and $249.',
      ],
      [
        'Do you offer a virtual office or business address?',
        'Yes. A virtual address with 2 day passes is $39 a month. Business Pro, with an address, a registered agent and a phone line, is $124 a month.',
      ],
      [
        'How many seats are there?',
        'There are 24 work seats in 1,385 sq ft: 8 hot desks in the window room, 12 drop-in seats, and 4 founding desks in the main shared room held by the charter founders.',
      ],
      [
        'Can I book a meeting room?',
        'Yes. The conference room seats 8 around one oak table, with a fireplace, a skylight and a screen. It’s $7 an hour at the founding rate.',
      ],
      [
        'Is there a podcast or video studio?',
        'Yes. The content studio seats 4, has a backdrop wall and is booked by the hour for $12.',
      ],
      ['How fast is the internet?', 'Two Cruzio lines: 2 Gbps down and 400 Mbps up.'],
      [
        'Do you offer notary or Live Scan?',
        'Yes. Notary is $7.50 per signature. Live Scan fingerprinting and a mail address are also offered as business services.',
      ],
      [
        'Can I host an event in the space?',
        'Yes. Event use of the common area is $7 an hour at the founding rate.',
      ],
    ]),
  },
  {
    id: 'access',
    title: 'Getting here and getting in',
    color: ZONE_COLORS.sharedRoom,
    items: qa([
      ['How do I get in?', 'With your phone. Your member QR code opens the door. No cards needed.'],
      [
        'Where do I park?',
        'Use the city’s downtown meters, lots and garages. Meters run 8am to 8pm daily. For all-day parking use the Locust Garage (124 Locust St) or the Soquel/Front Garage (601 Front St). Downtown workers can buy a city garage permit for $75 a month.',
      ],
      [
        'Can I take the bus?',
        'Yes. Santa Cruz METRO buses stop at the River Front Transit Center on Front St, Soquel Ave and River St while Pacific Station is rebuilt, a short walk from the space.',
      ],
      [
        'Where do I park my bike?',
        'There’s no bike storage inside the suite. Use the racks along Pacific Ave, or rent a smart bike locker in a downtown garage with a BikeLink card or a Santa Cruz ParkCard.',
      ],
      [
        'What are the hours?',
        'Members open and close the space themselves, and trusted members hold off-hours access.',
      ],
    ]),
  },
  {
    id: 'food',
    title: 'Food and coffee',
    color: ZONE_COLORS.kitchen,
    items: qa([
      [
        'Is there food at Citizen Space?',
        'Yes. Members order from Zachary’s member menu on our website, and Zachary’s, right downstairs, brings it up to your seat. Kitchen orders run Tuesday to Sunday, 7am to 2:30pm.',
      ],
      [
        'Is there coffee?',
        'Yes. The kitchen pantry has a coffee bar for members, plus a fridge, a new sink and a dishwasher.',
      ],
    ]),
  },
  {
    id: 'community',
    title: 'Community and events',
    color: BRAND.oak,
    items: qa([
      [
        'What is Builder Night?',
        'Builder Night is a weekly night of demos and building together. Until our doors open, it meets Mondays at Pleasure Pizza on Pacific Ave.',
      ],
      [
        'What is the bounty board?',
        'The bounty board is a screen of paid tasks posted as GitHub issues. Members pull one, ship it and earn credits toward their membership fees.',
      ],
      ['What are Colearn classes?', 'Classes and workshops taught by members, for members.'],
    ]),
  },
]

export type MenuItem = { name: string; price: number; description: string }
export type MenuSection = { id: string; label: string; note: string; items: MenuItem[] }

const menu = (rows: [string, number, string][]): MenuItem[] =>
  rows.map(([name, price, description]) => ({ name, price, description }))

/** Member menu from Zachary’s (819 Pacific Ave, downstairs). Prices from zacharyssantacruz.com/our-menu. */
export const ZACHARYS_HOURS = 'Tue–Sun, 7am–2:30pm · closed Mondays'

export const MENU_SECTIONS: MenuSection[] = [
  {
    id: 'breakfast',
    label: 'Breakfast',
    note: 'Served with home-fries and your choice of house bread: oatmeal-molasses, sour white or dark rye.',
    items: menu([
      ['The Basic Breakfast', 10.5, 'Eggs any style, home-fries, toast.'],
      ['Basic with bacon, sausage or ham', 13.5, 'The Basic, plus your pick of meat.'],
      ['Steak & Eggs (6 oz)', 15.95, 'Rib-eye with homemade BBQ sauce.'],
      ['The Basic Tofu', 11.5, 'Scrambled tofu, home-fries, toast.'],
      ['Zach’s Breakfast Sandwich', 11.95, 'Egg, bacon and cheese on grilled toast.'],
      [
        'Sourdough Pancakes, half stack',
        8.25,
        'Three, from a starter said to date to the Gold Rush.',
      ],
      ['Sourdough Pancakes, full stack', 9.95, 'Five of them.'],
      ['Sourdough Belgian Waffle', 8.25, 'Made from the same starter.'],
      ['Fruit Pancakes, half stack', 9.95, 'Seasonal fruit and whipped cream.'],
      ['Pancake Breakfast', 12.95, 'Three pancakes, two eggs, bacon, sausage or ham.'],
      ['Multi-grain Cereal', 5.95, 'Hot. Add raisins or nuts.'],
    ]),
  },
  {
    id: 'brunch',
    label: 'Brunch specials',
    note: 'The house favorites, including the original Mike’s Mess.',
    items: menu([
      [
        'Mike’s Mess',
        15.5,
        'Home-fries, three eggs, bacon and mushrooms, topped with cheese, sour cream, tomatoes and green onions.',
      ],
      ['The Tofu Mess', 15.5, 'The Mess with tofu instead of eggs.'],
      ['Junior Mess', 12.95, 'A smaller Mess, regular or tofu.'],
      ['Zach’s “Old Fashioned”', 14.5, 'Poached eggs on an herb roll.'],
      ['Artichoke Frittata', 12.95, 'Artichoke hearts, Monterey Jack and herbs.'],
      ['Spicy Italian Scramble', 14.5, 'Italian sausage, mozzarella, tomatoes.'],
      ['Fresh Salsa Scramble', 14.5, 'Olives, jack cheese, avocado, salsa.'],
      ['Chili & Eggs', 14.5, 'Chili of the day, cheese, eggs, avocado.'],
      ['Corned Beef Hash & Eggs', 14.5, 'Two eggs on house hash.'],
      ['Special Omelet', 14.5, 'The kitchen’s pick of the day.'],
      ['Create an Omelet', 12.95, 'Three eggs and cheese. Add what you like.'],
    ]),
  },
  {
    id: 'lunch',
    label: 'Sandwiches, burgers & salads',
    note: 'Sandwiches on homemade bread with home-fries or fruit.',
    items: menu([
      ['Turkey', 12.5, 'Mayo, lettuce, tomato, red onion.'],
      ['Ham', 12.5, 'Mayo, lettuce, tomato, red onion.'],
      ['Bacon, Lettuce & Tomato', 12.95, 'The classic BLT.'],
      ['Avocado, Lettuce & Tomato', 12.95, 'The ALT.'],
      ['Hummus, Avocado, Lettuce & Tomato', 13.5, 'Vegan-friendly.'],
      ['Ahi Tuna Melt', 14.5, 'Tuna salad, Jarlsberg, grilled red onion.'],
      ['Grilled Cheese', 9.95, 'On house bread.'],
      ['The Basic Burger', 12.5, 'A third of a pound, char-broiled, house BBQ sauce.'],
      ['Gourmet Burger', 15.95, 'Pepper bacon, cheese, avocado.'],
      ['Patty Melt', 13.95, 'Dark rye, grilled onions, Swiss.'],
      ['Zach’s Breakfast Burger', 15.95, 'Two fried eggs, pepper bacon, cheddar.'],
      ['Spinach Salad', 11.5, 'Swiss, bacon, almonds, egg.'],
      ['Chili of the Day, cup', 4.25, 'Meat or veggie.'],
      ['Chili of the Day, bowl', 6.5, 'Meat or veggie.'],
    ]),
  },
  {
    id: 'bakery',
    label: 'Sides & bakery',
    note: 'Baked in-house every morning.',
    items: menu([
      ['Home-fried Potatoes', 5.5, 'The famous ones.'],
      ['Fresh Fruit, cup', 4.5, 'Seasonal.'],
      ['Bacon, Sausage or Ham', 4.35, 'On the side.'],
      ['Chicken-Apple Sausage', 4.75, 'Aidells smoked.'],
      ['Today’s Coffee Cake', 3.5, 'A slice.'],
      ['Jalapeño Cornbread', 2.95, 'A square.'],
      ['Buttermilk Bran Muffins (2)', 3.0, 'A pair.'],
      ['Rice Pudding', 1.5, 'House-made.'],
      ['Homemade Bread, loaf', 6.95, 'Oatmeal-molasses, sour white or dark rye.'],
    ]),
  },
  {
    id: 'drinks',
    label: 'Coffee & drinks',
    note: 'Organic Vienna Roast coffee, teas and fresh juices.',
    items: menu([
      ['Coffee', 3.25, 'Organic Vienna Roast, or French Roast decaf.'],
      ['Tea', 2.75, 'Black or herbal.'],
      ['Iced Tea', 2.95, 'House blend.'],
      ['Hot Chocolate', 2.95, 'Made to order.'],
      ['Fresh Juice, small', 4.25, '9 oz.'],
      ['Fresh Juice, large', 6.25, '16 oz.'],
      ['Martinelli’s Sparkling Apple', 2.95, 'Chilled.'],
      ['Sodas & Mineral Water', 2.95, 'Chilled.'],
    ]),
  },
]

export const MENU_PRICES: Record<string, number> = Object.fromEntries(
  MENU_SECTIONS.flatMap(s => s.items.map(i => [i.name, i.price]))
)

export const DELIVERY_SEATS = [
  'Hot desks · window room',
  'Drop-in area',
  'Main shared room',
  'Conference room',
  'Content studio',
  'Hallway lounge',
]
