# CitizenSpace - Coworking Space Management Platform

A modern, full-stack coworking space management platform built with Next.js, TypeScript, Supabase, and Stripe.

## Features

- **Workspace Booking System**: Hot desks, meeting rooms, and collaboration spaces
- **Membership Management**: Flexible plans with credits and benefits
- **NFT Integration**: Special benefits for NFT holders via Web3 wallet connection
- **Payment Processing**: Secure payments with Stripe
- **Real-time Availability**: Live workspace availability updates
- **Cafe Integration**: Order food and beverages with member discounts
- **Admin Dashboard**: Comprehensive analytics and management tools
- **Mobile Responsive**: Fully responsive design for all devices

## Tech Stack

### Frontend
- **Framework**: Next.js 13.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + Tanstack Query
- **Forms**: React Hook Form + Zod validation

### Backend
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **API**: Next.js API Routes
- **Payment**: Stripe

### Web3
- **Wallet Connection**: WalletConnect + RainbowKit
- **Blockchain**: Ethereum/Polygon
- **Libraries**: wagmi, viem

### DevOps
- **Testing**: Jest + React Testing Library
- **CI/CD**: GitHub Actions
- **Containerization**: Docker + Docker Compose
- **Linting**: ESLint + Prettier

## Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CitizenSpace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## Documentation

- **[Development Setup Guide](./docs/development-setup.md)** - Complete setup instructions
- **[API Documentation](./docs/api-documentation.md)** - API endpoints reference
- **[Database Schema](./docs/database-schema.md)** - Database structure
- **[Deployment Guide](./docs/deployment.md)** - Production deployment

## Available Scripts

### Development
```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
```

### Code Quality
```bash
npm run lint            # Lint code
npm run lint:fix        # Fix linting errors
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting
npm run typecheck       # TypeScript type checking
npm run validate        # Run all checks (lint + typecheck + test)
```

### Testing
```bash
npm test                # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
npm run test:ci         # Run tests in CI mode
```

### Database
```bash
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed database with test data
npm run db:reset        # Reset database (WARNING: deletes all data)
npm run db:status       # Check migration status
```

### Supabase
```bash
npm run supabase:start  # Start local Supabase
npm run supabase:stop   # Stop local Supabase
npm run supabase:types  # Generate TypeScript types from schema
```

## Docker Setup

### Development Environment

Start all services (app + database + cache):

```bash
docker-compose up
```

Services:
- **App**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Adminer**: http://localhost:8080

### Production Build

```bash
docker build -t citizenspace:latest .
docker run -p 3000:3000 citizenspace:latest
```

## Environment Variables

### Required Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

See `.env.example` for complete list of variables.

## Project Structure

```
CitizenSpace/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Base UI components
│   └── features/         # Feature-specific components
├── lib/                   # Utilities and configurations
├── hooks/                # Custom React hooks
├── types/                # TypeScript types
├── docs/                 # Documentation
├── .github/              # GitHub Actions workflows
└── tests/                # Test utilities
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Coverage Requirements

- **Minimum Coverage**: 80% across all metrics
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## CI/CD Pipeline

GitHub Actions workflow runs on every PR:

1. **Install** - Install and cache dependencies
2. **Lint** - Run ESLint and format check
3. **Type Check** - Run TypeScript compiler
4. **Test** - Run Jest tests with coverage
5. **Build** - Build Next.js application

All checks must pass before merging.

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test: `npm run validate`
3. Commit changes: `git commit -m "feat: add feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Create a Pull Request

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy

### Docker

```bash
# Build production image
docker build -t citizenspace:latest .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY \
  citizenspace:latest
```

## License

MIT License - see LICENSE file for details

## Support

- **Documentation**: [/docs](./docs)
- **Issues**: [GitHub Issues](https://github.com/your-org/citizenspace/issues)
- **Email**: support@citizenspace.com

---

Built with ❤️ by the CitizenSpace Team