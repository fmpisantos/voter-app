#!/bin/bash

# Voter App API Deployment Script

echo "🚀 Starting Voter App API deployment..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Set environment variables for production
export ENV=production
export DEBUG=False
export HOST=0.0.0.0
export PORT=5000

echo "🌐 Starting API server..."
echo "API will be available at http://localhost:5000"
echo "Press Ctrl+C to stop the server"

# Start the server
python main.py