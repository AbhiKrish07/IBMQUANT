"""
HilbertShield Configuration
"""
import logging
import json
from datetime import datetime

# Model Configuration
MODEL_PATH = "model_v1.pkl"
FRAUD_THRESHOLD = 0.5

# Training Configuration
DATASET_SIZE = 10000
FRAUD_RATE = 0.005  # 0.5%
RANDOM_SEED = 42

# API Configuration
API_HOST = "0.0.0.0"
API_PORT = 5000

# Performance Configuration
MAX_LATENCY_MS = 50

# Logging Configuration
LOG_LEVEL = logging.INFO
LOG_FORMAT = "json"


class StructuredLogger:
    """Structured JSON logger for HilbertShield"""
    
    def __init__(self, name):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(LOG_LEVEL)
        
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            handler.setLevel(LOG_LEVEL)
            self.logger.addHandler(handler)
    
    def _format_message(self, level, message, **kwargs):
        """Format log message as JSON"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": level,
            "message": message,
            **kwargs
        }
        return json.dumps(log_entry)
    
    def info(self, message, **kwargs):
        self.logger.info(self._format_message("INFO", message, **kwargs))
    
    def warning(self, message, **kwargs):
        self.logger.warning(self._format_message("WARNING", message, **kwargs))
    
    def error(self, message, **kwargs):
        self.logger.error(self._format_message("ERROR", message, **kwargs))
    
    def debug(self, message, **kwargs):
        self.logger.debug(self._format_message("DEBUG", message, **kwargs))
