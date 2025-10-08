#!/bin/bash
#
# Vercel Deployment Script for Toombos Frontend
# This script configures environment variables and deploys to Vercel
#

set -e

echo "🚀 Toombos Frontend - Vercel Deployment Script"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Vercel CLI is installed
print_info "Checking Vercel CLI installation..."
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed"
    echo ""
    echo "Please install Vercel CLI:"
    echo "  npm install -g vercel"
    echo ""
    exit 1
fi
print_success "Vercel CLI is installed"

# Check if user is logged in
print_info "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    print_warning "Not logged in to Vercel"
    echo ""
    print_info "Please login to Vercel:"
    vercel login
    print_success "Logged in successfully"
else
    USER=$(vercel whoami)
    print_success "Logged in as: $USER"
fi

echo ""
echo "================================================"
echo "Environment Variables Configuration"
echo "================================================"
echo ""

# Prompt for backend API URL
print_info "Please enter your toombos-backend URLs:"
echo ""

read -p "Production API URL (e.g., https://api.toombos.com): " API_URL
if [ -z "$API_URL" ]; then
    print_error "API URL is required"
    exit 1
fi

read -p "Production WebSocket URL (e.g., wss://api.toombos.com): " WS_URL
if [ -z "$WS_URL" ]; then
    print_error "WebSocket URL is required"
    exit 1
fi

echo ""
print_info "Optional configuration:"
read -p "Google Analytics ID (press Enter to skip): " GA_ID
read -p "Sentry DSN (press Enter to skip): " SENTRY_DSN

echo ""
echo "================================================"
echo "Configuration Summary"
echo "================================================"
echo ""
echo "API URL:     $API_URL"
echo "WebSocket:   $WS_URL"
echo "Analytics:   ${GA_ID:-Not configured}"
echo "Sentry:      ${SENTRY_DSN:-Not configured}"
echo ""

read -p "Continue with this configuration? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    print_warning "Deployment cancelled"
    exit 0
fi

echo ""
print_info "Configuring environment variables in Vercel..."

# Add required environment variables
print_info "Adding NEXT_PUBLIC_API_URL..."
echo "$API_URL" | vercel env add NEXT_PUBLIC_API_URL production

print_info "Adding NEXT_PUBLIC_WS_URL..."
echo "$WS_URL" | vercel env add NEXT_PUBLIC_WS_URL production

# Add recommended variables
print_info "Adding NEXT_PUBLIC_ENABLE_ANALYTICS..."
echo "true" | vercel env add NEXT_PUBLIC_ENABLE_ANALYTICS production

print_info "Adding NEXT_PUBLIC_ENABLE_WEBSOCKET..."
echo "true" | vercel env add NEXT_PUBLIC_ENABLE_WEBSOCKET production

# Add optional variables
if [ -n "$GA_ID" ]; then
    print_info "Adding NEXT_PUBLIC_GA_ID..."
    echo "$GA_ID" | vercel env add NEXT_PUBLIC_GA_ID production
fi

if [ -n "$SENTRY_DSN" ]; then
    print_info "Adding NEXT_PUBLIC_SENTRY_DSN..."
    echo "$SENTRY_DSN" | vercel env add NEXT_PUBLIC_SENTRY_DSN production
fi

print_success "Environment variables configured successfully"

echo ""
echo "================================================"
echo "Deployment"
echo "================================================"
echo ""

read -p "Deploy to production now? (y/n): " DEPLOY
if [ "$DEPLOY" != "y" ]; then
    print_warning "Deployment skipped"
    print_info "You can deploy later with: vercel --prod"
    exit 0
fi

print_info "Deploying to Vercel production..."
vercel --prod

echo ""
print_success "Deployment complete!"
echo ""
print_info "Next steps:"
echo "1. Visit your deployment URL"
echo "2. Verify API connectivity"
echo "3. Test WebSocket connection"
echo "4. Check all pages load correctly"
echo ""
print_info "Documentation:"
echo "  - Backend Integration: docs/BACKEND-INTEGRATION.md"
echo "  - Vercel Deployment: docs/VERCEL-DEPLOYMENT.md"
echo ""
