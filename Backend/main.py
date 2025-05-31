"""
main.py — Entry point for the Fitness Chatbot API

This FastAPI application serves two main purposes:
1. Exposes endpoints for retrieving fitness data (`/data`)
2. Enables chatbot interaction with SQL-based fitness data queries (`/chat`)

"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from data_endpoints import router as data_router # Endpoint for fitness data access
from chatbot_endpoints_sql import router as chat_router # Endpoint for chatbot communication



# Create the FastAPI app
app = FastAPI(
    title="Fitness Chatbot API",
    description="API for accessing fitness data and interacting with a conversational AI chatbot.",
    version="1.0"
)


# Enable CORS for cross-origin access (adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins; restrict in production
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(data_router, prefix="/data", tags=["Data"])
app.include_router(chat_router, prefix="/chat", tags=["Chat"])

# Base route
@app.get("/")
async def welcome():
    """Returns a welcome message to verify that the API is online."""
    return {"message": "Welcome to the Fitness Data and Chat API"}
