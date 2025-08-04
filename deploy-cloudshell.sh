#!/bin/bash

# Symmersive AI Platform - Google Cloud Shell Optimized Deployment Script
# This script is specifically designed for Google Cloud Shell environment

set -e

echo "🌐 Google Cloud Shell Deployment Started..."
echo "📍 Current directory: $(pwd)"
echo "🔧 Using pre-installed gcloud CLI in Cloud Shell"

# Verify we're in Cloud Shell
if [[ -z "$CLOUD_SHELL" ]]; then
    echo "⚠️  Warning: Not running in Google Cloud Shell. This script is optimized for Cloud Shell."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get current project
PROJECT_ID=$(gcloud config get-value project)
if [[ -z "$PROJECT_ID" ]]; then
    echo "❌ No Google Cloud project set. Please run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📋 Using project: $PROJECT_ID"

# Enable required APIs
echo "🔌 Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Install dependencies (Cloud Shell has Node.js pre-installed)
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🏗️  Building application..."
npm run build

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy symmersive-ai-platform \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 10 \
    --set-env-vars NODE_ENV=production

# Get the service URL
SERVICE_URL=$(gcloud run services describe symmersive-ai-platform --region=us-central1 --format='value(status.url)')

echo "✅ Deployment completed successfully!"
echo "🌍 Your application is live at: $SERVICE_URL"
echo "📊 View logs: gcloud run services logs read symmersive-ai-platform --region us-central1"
echo "⚙️  Manage service: https://console.cloud.google.com/run/detail/us-central1/symmersive-ai-platform"

# Optional: Open the application
read -p "🔗 Open application in Cloud Shell web preview? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cloudshell open-web-preview --url="$SERVICE_URL"
fi