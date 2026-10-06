@echo off
echo =========================================
echo Starting HilbertShield API Server
echo =========================================
echo.

REM Check if model exists
if not exist "model_v1.pkl" (
    echo Model not found. Training model first...
    python engine/trainer.py
    echo.
)

echo Starting API server at http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
echo To test the API, run in another terminal:
echo   python demo.py
echo.
echo =========================================

python api/server.py
