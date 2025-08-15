#!/bin/bash

# Symmersive AI Platform - Google Cloud Deployment Script

set -e

echo "🚀 Starting deployment to Google Cloud..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Build the application
echo "📦 Building application..."
npm install
npm run build

# Deploy to Cloud Run (recommended)
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy symmersive-ai-platform \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10

echo "✅ Deployment complete!"
echo "🔗 Your app is now live at the URL shown above"
