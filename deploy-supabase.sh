#!/bin/bash

# Supabase Edge Functions Deployment Script
# This script helps you deploy the Supabase edge functions for Daash

set -e

echo "🚀 Daash - Supabase Edge Functions Deployment"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI is not installed${NC}"
    echo ""
    echo "Please install it first:"
    echo "  macOS:   brew install supabase/tap/supabase"
    echo "  Linux:   See DEPLOY_SUPABASE.md for installation instructions"
    echo "  Windows: scoop install supabase"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Supabase CLI found${NC}"
echo ""

# Project reference
PROJECT_REF="emzlmbpuwxmzpgdsywkc"

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Supabase${NC}"
    echo "Logging in now..."
    supabase login
    echo ""
fi

echo -e "${GREEN}✓ Logged in to Supabase${NC}"
echo ""

# Link project if not already linked
if [ ! -f ".supabase/config.toml" ]; then
    echo "🔗 Linking to Supabase project..."
    supabase link --project-ref $PROJECT_REF
    echo -e "${GREEN}✓ Project linked${NC}"
    echo ""
fi

# Check if Firebase secrets are set
echo "🔐 Checking Firebase secrets..."
echo ""
echo -e "${YELLOW}Important:${NC} Make sure you've set these secrets:"
echo "  • FIREBASE_PROJECT_ID"
echo "  • FIREBASE_CLIENT_EMAIL"
echo "  • FIREBASE_PRIVATE_KEY"
echo ""
echo "Set them with:"
echo "  supabase secrets set FIREBASE_PROJECT_ID=your-project-id"
echo "  supabase secrets set FIREBASE_CLIENT_EMAIL=your-client-email"
echo "  supabase secrets set FIREBASE_PRIVATE_KEY='your-private-key'"
echo ""

read -p "Have you set all Firebase secrets? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Please set the Firebase secrets first${NC}"
    exit 1
fi

echo ""
echo "📦 Deploying edge functions..."
echo ""

# Deploy send-push-notification function
echo "Deploying send-push-notification..."
if supabase functions deploy send-push-notification; then
    echo -e "${GREEN}✓ send-push-notification deployed${NC}"
else
    echo -e "${RED}❌ Failed to deploy send-push-notification${NC}"
fi
echo ""

# Deploy monitor-transactions function
echo "Deploying monitor-transactions..."
if supabase functions deploy monitor-transactions; then
    echo -e "${GREEN}✓ monitor-transactions deployed${NC}"
else
    echo -e "${RED}❌ Failed to deploy monitor-transactions${NC}"
fi
echo ""

echo "=============================================="
echo -e "${GREEN}✨ Deployment complete!${NC}"
echo ""
echo "Your functions are available at:"
echo "  • https://$PROJECT_REF.supabase.co/functions/v1/send-push-notification"
echo "  • https://$PROJECT_REF.supabase.co/functions/v1/monitor-transactions"
echo ""
echo "View logs:"
echo "  supabase functions logs send-push-notification"
echo "  supabase functions logs monitor-transactions"
echo ""
echo "Or view in dashboard:"
echo "  https://supabase.com/dashboard/project/$PROJECT_REF/functions"
echo ""
