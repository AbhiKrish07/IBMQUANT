# Production Dockerfile for Q-UPI Sentinel Master Application
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn pytest

# Copy codebase
COPY . /app

EXPOSE 8002

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8002

CMD ["python3", "unified_app.py"]
