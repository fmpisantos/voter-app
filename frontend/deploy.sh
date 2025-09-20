#!/bin/bash

# Voter App Frontend Deployment Script

echo "🚀 Starting Voter App Frontend deployment..."

# Check if we need to update API_BASE_URL for production
if [ "$ENV" = "production" ]; then
    echo "🔧 Updating API URL for production..."
    # Update the API_BASE_URL in script.js for production
    sed -i.bak 's|http://localhost:5001|https://your-api-domain.com|g' script.js
    echo "✅ API URL updated for production"
fi

echo "🌐 Frontend files are ready for deployment!"
echo ""
echo "To deploy:"
echo "1. Upload all files in the frontend/ directory to your web server"
echo "2. Ensure the API is running and accessible"
echo "3. Update CORS settings in the API for your domain"
echo ""
echo "For static hosting (Netlify, Vercel, etc.):"
echo "- Just upload the contents of the frontend/ directory"
echo "- No build process required"