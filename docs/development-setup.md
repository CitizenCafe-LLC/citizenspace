# CitizenSpace Development Setup Guide

Welcome to the CitizenSpace development environment setup guide. This document will walk you through setting up your local development environment, running the application, and understanding the project structure.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Development Workflow](#development-workflow)
7. [Testing](#testing)
8. [Docker Setup](#docker-setup)
9. [Troubleshooting](#troubleshooting)
10. [Additional Resources](#additional-resources)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- **Node.js**: v18.x or higher
  - [Download Node.js](https://nodejs.org/)
  - Verify installation: `node --version`

- **npm**: v9.x or higher (comes with Node.js)
  - Verify installation: `npm --version`

- **Git**: Latest version
  - [Download Git](https://git-scm.com/)
  - Verify installation: `git --version`

### Optional (but recommended)

- **Docker Desktop**: For containerized development
  - [Download Docker](https://www.docker.com/products/docker-desktop/)
  - Verify installation: `docker --version && docker-compose --version`

- **VS Code**: Recommended IDE with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense

---

## Quick Start

Get up and running in under 5 minutes:

```bash
# 1. Clone the repository
git clone <repository-url>
cd CitizenSpace

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Configure your .env.local file
# Open .env.local and add your credentials

# 5. Start the development server
npm run dev

# 6. Open your browser
# Navigate to http://localhost:3000
```

---

## Environment Setup

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env.local
```

### 2. Configure Required Variables

Open `.env.local` and configure the following **required** variables:

#### Supabase Configuration

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
```

**How to get these:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Go to Settings > API
4. Copy the URL and keys

#### ZeroDB Configuration (Decentralized Database)

```bash
ZERODB_URL=https://your-zerodb-instance.com
ZERODB_API_KEY=your-zerodb-api-key
ZERODB_DATABASE_ID=your-zerodb-database-id
```

**How to get these:**
1. Contact ZeroDB provider or set up your own instance
2. Configure API credentials for secure access
3. Document database ID for the CitizenSpace project

#### Authentication Configuration

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

#### Email Server Configuration (SMTP)

```bash
# Option 1: Generic SMTP Connection String
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@citizenspace.com

# Option 2: Individual SMTP Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Email Templates
EMAIL_FROM_NAME=CitizenSpace
EMAIL_REPLY_TO=support@citizenspace.com
```

**SMTP Provider Examples:**
- **Gmail**: smtp.gmail.com:587 (requires App Password)
- **SendGrid**: smtp.sendgrid.net:587
- **AWS SES**: email-smtp.us-east-1.amazonaws.com:587
- **Mailgun**: smtp.mailgun.org:587
- **Outlook**: smtp-mail.outlook.com:587

#### Stripe Configuration

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

**How to get these:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to Developers > API keys
3. Copy the publishable key and secret key
4. **Important**: Use test keys for development

#### WalletConnect (for Web3 features)

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
```

**How to get this:**
1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy the Project ID

### 3. Optional Variables

Configure these for full functionality:

- **Alternative Email Providers**: SendGrid or Resend API keys
  ```bash
  SENDGRID_API_KEY=SG.your-sendgrid-api-key
  RESEND_API_KEY=re_your_resend_api_key
  ```
- **SMS**: Twilio credentials
  ```bash
  TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  TWILIO_AUTH_TOKEN=your-twilio-auth-token
  TWILIO_PHONE_NUMBER=+1234567890
  ```
- **Analytics**: Google Analytics, Sentry DSN
  ```bash
  NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
  NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
  ```
- **Storage**: AWS S3 or Supabase Storage
  ```bash
  AWS_ACCESS_KEY_ID=your-aws-access-key
  AWS_SECRET_ACCESS_KEY=your-aws-secret-key
  AWS_REGION=us-east-1
  AWS_S3_BUCKET=citizenspace-uploads
  ```
- **Caching**: Redis for session storage
  ```bash
  REDIS_URL=redis://localhost:6379
  REDIS_PASSWORD=your-redis-password
  ```

---

## Database Setup

### Option 1: Using Supabase Cloud (Recommended)

1. **Create Tables**: Execute the SQL schema from `database/schema.sql` in your Supabase SQL editor

2. **Run Migrations**:
   ```bash
   npm run db:migrate
   ```

3. **Seed Database** (optional):
   ```bash
   npm run db:seed
   ```

### Option 2: Using Local PostgreSQL

1. **Install PostgreSQL**:
   ```bash
   # macOS (Homebrew)
   brew install postgresql@15
   brew services start postgresql@15

   # Ubuntu/Debian
   sudo apt-get install postgresql-15
   sudo systemctl start postgresql
   ```

2. **Create Database**:
   ```bash
   createdb citizenspace
   ```

3. **Update DATABASE_URL**:
   ```bash
   DATABASE_URL=postgresql://postgres:password@localhost:5432/citizenspace
   ```

4. **Run Migrations**:
   ```bash
   npm run db:migrate
   ```

---

## Running the Application

### Development Server

Start the development server with hot-reload:

```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **API Routes**: http://localhost:3000/api/*

### Production Build

Build and run a production-optimized version:

```bash
# Build the application
npm run build

# Start production server
npm start
```

---

## Development Workflow

### Code Quality Commands

```bash
# Linting
npm run lint              # Check for linting errors
npm run lint:fix          # Auto-fix linting errors

# Formatting
npm run format            # Format all files with Prettier
npm run format:check      # Check formatting without changes

# Type Checking
npm run typecheck         # Run TypeScript type checking

# Validation (runs all checks)
npm run validate          # Lint + TypeCheck + Test
```

### Pre-commit Hooks (Automated)

The project uses **Husky** to automatically run quality checks before each commit:

```bash
# These run automatically on git commit:
1. Format code with Prettier
2. Fix linting issues with ESLint
3. Type check with TypeScript
```

If any check fails, the commit will be blocked. Fix the issues and try again.

**Manual pre-commit check:**
```bash
npm run pre-commit
```

**Bypass pre-commit hooks** (not recommended):
```bash
git commit --no-verify -m "message"
```

**Reinstall hooks** (if needed):
```bash
npm run prepare
```

### Testing Commands

```bash
# Run tests
npm test                  # Run all tests once
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Generate coverage report
npm run test:ci           # Run tests in CI mode
```

### Database Commands

```bash
# Supabase Commands
npm run supabase:start    # Start local Supabase
npm run supabase:stop     # Stop local Supabase
npm run supabase:types    # Generate TypeScript types

# Migration Commands
npm run db:migrate        # Run pending migrations
npm run db:migrate:dev    # Create new migration
npm run db:seed           # Seed database with test data
npm run db:reset          # Reset database (WARNING: deletes all data)
npm run db:status         # Check migration status
```

---

## Docker Setup

### Development with Docker Compose

Run the entire stack (app + database + cache) with Docker:

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Services Included

- **app**: Next.js application (http://localhost:3000)
- **postgres**: PostgreSQL database (port 5432)
- **redis**: Redis cache (port 6379)
- **adminer**: Database management UI (http://localhost:8080)

### Building Production Image

```bash
# Build production Docker image
docker build -t citizenspace:latest .

# Run production container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  citizenspace:latest
```

---

## Testing

### Writing Tests

Tests are located alongside source files with `.test.ts` or `.test.tsx` extensions.

#### Example Component Test

```typescript
// components/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

#### Example API Route Test

```typescript
// app/api/bookings/route.test.ts
import { POST } from './route'

describe('/api/bookings', () => {
  it('creates a booking', async () => {
    const request = new Request('http://localhost:3000/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ workspaceId: '123', date: '2025-09-30' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
  })
})
```

### Coverage Thresholds

The project maintains **80% coverage** across:
- Branches
- Functions
- Lines
- Statements

View coverage report:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

---

## Project Structure

```
CitizenSpace/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API routes
│   ├── (routes)/          # Page routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   └── ...               # Feature components
├── lib/                   # Utility functions and configurations
│   ├── supabase.ts       # Supabase client
│   ├── stripe.ts         # Stripe configuration
│   └── utils.ts          # Helper functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── public/               # Static assets
├── docs/                 # Documentation
├── .github/              # GitHub workflows
│   └── workflows/        # CI/CD pipelines
├── tests/                # Test utilities and mocks
├── .env.example          # Example environment variables
├── .env.local            # Your local environment (gitignored)
├── jest.config.js        # Jest configuration
├── jest.setup.js         # Jest setup file
├── tsconfig.json         # TypeScript configuration
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile            # Production Dockerfile
└── Dockerfile.dev        # Development Dockerfile
```

---

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Error: Port 3000 is already in use

# Solution: Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

#### Module Not Found Errors

```bash
# Solution: Clear cache and reinstall
rm -rf node_modules .next
npm install
```

#### TypeScript Errors After Git Pull

```bash
# Solution: Rebuild TypeScript
npm run build
```

#### Supabase Connection Issues

```bash
# Check if your Supabase URL and keys are correct
# Verify in .env.local

# Test connection
curl https://your-project.supabase.co/rest/v1/
```

#### Docker Issues

```bash
# Clear all Docker resources
docker-compose down -v
docker system prune -a

# Rebuild containers
docker-compose up --build
```

### Getting Help

If you encounter issues:

1. **Check the logs**: `npm run dev` output or `docker-compose logs`
2. **Search GitHub Issues**: Check if someone else had the same problem
3. **Create an Issue**: Provide error logs and steps to reproduce
4. **Contact Team**: Reach out on Slack/Discord

---

## Best Practices

### Code Style

- Follow TypeScript strict mode rules
- Use functional components with hooks
- Prefer named exports over default exports
- Write self-documenting code with clear variable names
- Add JSDoc comments for complex functions

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/your-feature-name
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

---

## Additional Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Project-Specific Docs

- [API Documentation](./api-documentation.md)
- [Database Schema](./database-schema.md)
- [Deployment Guide](./deployment.md)
- [Security Guidelines](./security.md)

---

## Quick Reference

### Essential Commands

```bash
# Development
npm run dev                # Start dev server
npm run build             # Build for production
npm run start             # Start production server

# Code Quality
npm run lint              # Lint code
npm run typecheck         # Type check
npm run format            # Format code
npm run validate          # Run all checks

# Testing
npm test                  # Run tests
npm run test:coverage     # Coverage report

# Database
npm run db:migrate        # Run migrations
npm run db:seed           # Seed database

# Docker
docker-compose up         # Start all services
docker-compose down       # Stop all services
```

---

## Support

For questions or support:
- **Email**: dev@citizenspace.com
- **Slack**: #dev-support
- **GitHub Issues**: [Create an issue](https://github.com/citizenspace/app/issues)

---

**Happy Coding!** 🚀