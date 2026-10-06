@echo off
REM HilbertShield Deployment Script for Windows
REM Installs dependencies, trains model, and starts the API server

echo =========================================
echo HilbertShield Deployment
echo =========================================

REM Install dependencies
echo Installing dependencies...
python -m pip install -r requirements.txt --quiet

REM Check if model exists, train if not
if not exist "model_v1.pkl" (
    echo Model not found. Training new model...
    python engine/trainer.py
) else (
    echo Model found. Skipping training.
)

REM Start the API server with Gunicorn
echo Starting HilbertShield API server...
echo Server will be available at http://0.0.0.0:5000
echo =========================================

gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 30 api.server:app
