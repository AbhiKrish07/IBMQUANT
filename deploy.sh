#!/bin/bash
# HilbertShield Deployment Script
# Installs dependencies, trains model, and starts the API server

set -e  # Exit on error

echo "========================================="
echo "HilbertShield Deployment"
echo "========================================="

# Install dependencies
echo "Installing dependencies..."
python -m pip install -r requirements.txt --quiet

# Check if model exists, train if not
if [ ! -f "model_v1.pkl" ]; then
    echo "Model not found. Training new model..."
    python engine/trainer.py
else
    echo "Model found. Skipping training."
fi

# Start the API server with Gunicorn
echo "Starting HilbertShield API server..."
echo "Server will be available at http://0.0.0.0:5000"
echo "========================================="

gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 30 api.server:app
