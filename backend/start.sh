#!/bin/bash

# Render startup script for DataVibe Backend (2025)
echo "Starting DataVibe Backend on Render..."

# Start the FastAPI application with recommended settings
echo "Starting FastAPI application with Uvicorn..."
uvicorn main:app --host 0.0.0.0 --port ${PORT:-10000} --workers 1