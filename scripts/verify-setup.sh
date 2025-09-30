#!/bin/bash

# CitizenSpace Development Environment Verification Script
# This script verifies that all required tools and configurations are properly set up

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

# Function to print section header
print_header() {
    echo ""
    echo -e "${YELLOW}===== $1 =====${NC}"
    echo ""
}

# Start verification
echo -e "${GREEN}CitizenSpace Development Environment Verification${NC}"
echo "=================================================="

# Check Node.js
print_header "Checking Required Tools"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status 0 "Node.js installed: $NODE_VERSION"
else
    print_status 1 "Node.js is not installed"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status 0 "npm installed: $NPM_VERSION"
else
    print_status 1 "npm is not installed"
    exit 1
fi

# Check Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    print_status 0 "Git installed: $GIT_VERSION"
else
    print_status 1 "Git is not installed"
    exit 1
fi

# Check Docker (optional)
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_status 0 "Docker installed: $DOCKER_VERSION"
else
    print_status 1 "Docker is not installed (optional)"
fi

# Check configuration files
print_header "Checking Configuration Files"

check_file() {
    if [ -f "$1" ]; then
        print_status 0 "$1 exists"
        return 0
    else
        print_status 1 "$1 missing"
        return 1
    fi
}

check_file "package.json"
check_file "tsconfig.json"
check_file ".eslintrc.json"
check_file ".prettierrc"
check_file "jest.config.js"
check_file "jest.setup.js"
check_file "next.config.js"
check_file "tailwind.config.ts"
check_file ".env.example"
check_file "Dockerfile"
check_file "docker-compose.yml"
check_file ".github/workflows/ci.yml"

# Check if .env.local exists
print_header "Checking Environment Configuration"
if [ -f ".env.local" ]; then
    print_status 0 ".env.local exists"

    # Check for required environment variables
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        print_status 0 "Supabase URL configured"
    else
        print_status 1 "Supabase URL not configured"
    fi

    if grep -q "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" .env.local; then
        print_status 0 "Stripe key configured"
    else
        print_status 1 "Stripe key not configured"
    fi
else
    print_status 1 ".env.local missing - copy from .env.example"
fi

# Check node_modules
print_header "Checking Dependencies"
if [ -d "node_modules" ]; then
    print_status 0 "Dependencies installed"
else
    print_status 1 "Dependencies not installed - run 'npm install'"
fi

# Check if TypeScript compiles
print_header "Running Quick Checks"
if npm run typecheck > /dev/null 2>&1; then
    print_status 0 "TypeScript compilation successful"
else
    print_status 1 "TypeScript compilation failed"
fi

# Summary
print_header "Verification Summary"
echo "Environment setup verification complete!"
echo ""
echo "Next steps:"
echo "1. If .env.local is missing, copy from .env.example and configure"
echo "2. Run 'npm install' if dependencies are not installed"
echo "3. Run 'npm run dev' to start the development server"
echo "4. Visit http://localhost:3000 in your browser"
echo ""
echo "For detailed setup instructions, see docs/development-setup.md"