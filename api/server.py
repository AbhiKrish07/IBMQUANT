"""
HilbertShield API Server
Real-time fraud detection microservice using quantum kernel methods
"""
from flask import Flask, request, jsonify
import joblib
import numpy as np
import time
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import StructuredLogger, MODEL_PATH, FRAUD_THRESHOLD, MAX_LATENCY_MS

app = Flask(__name__)
logger = StructuredLogger(__name__)

# Global model pipeline
model_pipeline = None


def load_model():
    """Load the trained model pipeline on startup"""
    global model_pipeline
    
    if not os.path.exists(MODEL_PATH):
        logger.error("Model file not found", filepath=MODEL_PATH)
        raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")
    
    logger.info("Loading model", filepath=MODEL_PATH)
    model_pipeline = joblib.load(MODEL_PATH)
    logger.info("Model loaded successfully")


def validate_transaction(data):
    """
    Validate transaction input data
    
    Args:
        data: Request JSON data
    
    Returns:
        tuple: (is_valid, error_message, transaction_array)
    """
    required_fields = ['amount', 'time', 'merchant_category', 'distance_from_home']
    
    # Check all required fields present
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}", None
    
    try:
        amount = float(data['amount'])
        time = float(data['time'])
        merchant_category = int(data['merchant_category'])
        distance_from_home = float(data['distance_from_home'])
    except (ValueError, TypeError) as e:
        return False, f"Invalid data type: {str(e)}", None
    
    # Validate ranges
    if amount <= 0:
        return False, "Amount must be positive", None
    
    if time < 0 or time > 24:
        return False, "Time must be between 0 and 24 hours", None
    
    if merchant_category < 0 or merchant_category > 9:
        return False, "Merchant category must be between 0 and 9", None
    
    if distance_from_home < 0:
        return False, "Distance from home must be non-negative", None
    
    # Create transaction array
    transaction = np.array([[amount, time, merchant_category, distance_from_home]])
    
    return True, None, transaction


def sanitize_input(value):
    """
    Sanitize input to prevent injection attacks
    
    Args:
        value: Input value
    
    Returns:
        Sanitized value
    """
    if isinstance(value, str):
        # Remove potentially dangerous characters
        dangerous_chars = ['<', '>', '&', '"', "'", '\\', '/', ';']
        for char in dangerous_chars:
            value = value.replace(char, '')
    return value


@app.route('/scan', methods=['POST'])
def scan_transaction():
    """
    POST /scan - Score a transaction for fraud risk
    
    Request Body:
    {
        "amount": float,
        "time": float,
        "merchant_category": int,
        "distance_from_home": float
    }
    
    Response:
    {
        "risk_score": float (0.0-1.0),
        "verdict": str ("ALLOW" or "BLOCK"),
        "processing_time_ms": float
    }
    """
    start_time = time.time()
    
    try:
        # Get request data
        data = request.get_json()
        
        if data is None:
            logger.warning("Invalid JSON in request")
            return jsonify({
                "error": "Invalid JSON",
                "error_code": "VALIDATION_ERROR"
            }), 400
        
        # Sanitize inputs
        sanitized_data = {k: sanitize_input(v) for k, v in data.items()}
        
        # Validate transaction
        is_valid, error_msg, transaction = validate_transaction(sanitized_data)
        
        if not is_valid:
            logger.warning("Validation failed", error=error_msg, data=sanitized_data)
            return jsonify({
                "error": error_msg,
                "error_code": "VALIDATION_ERROR"
            }), 400
        
        # Check model loaded
        if model_pipeline is None:
            logger.error("Model not loaded")
            return jsonify({
                "error": "Model not available",
                "error_code": "SERVICE_UNAVAILABLE"
            }), 503
        
        # Make prediction
        risk_score = model_pipeline.predict_proba(transaction)[0, 1]
        verdict = "BLOCK" if risk_score > FRAUD_THRESHOLD else "ALLOW"
        
        # Calculate processing time
        processing_time_ms = (time.time() - start_time) * 1000
        
        # Log performance warning if needed
        if processing_time_ms > MAX_LATENCY_MS:
            logger.warning(
                "Prediction latency exceeded threshold",
                latency_ms=processing_time_ms,
                threshold_ms=MAX_LATENCY_MS
            )
        
        # Log request
        logger.info(
            "Transaction scored",
            risk_score=float(risk_score),
            verdict=verdict,
            processing_time_ms=processing_time_ms
        )
        
        return jsonify({
            "risk_score": float(risk_score),
            "verdict": verdict,
            "processing_time_ms": processing_time_ms
        }), 200
        
    except Exception as e:
        processing_time_ms = (time.time() - start_time) * 1000
        logger.error(
            "Internal error during prediction",
            error=str(e),
            processing_time_ms=processing_time_ms
        )
        return jsonify({
            "error": "Internal server error",
            "error_code": "INTERNAL_ERROR"
        }), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    if model_pipeline is None:
        return jsonify({"status": "unhealthy", "reason": "model not loaded"}), 503
    return jsonify({"status": "healthy"}), 200


def main():
    """Start the API server"""
    logger.info("HilbertShield API Server Starting")
    
    try:
        load_model()
    except FileNotFoundError as e:
        logger.error("Failed to start server", error=str(e))
        sys.exit(1)
    
    logger.info("Server ready", host="0.0.0.0", port=5000)
    app.run(host="0.0.0.0", port=5000, debug=False)


if __name__ == "__main__":
    main()
