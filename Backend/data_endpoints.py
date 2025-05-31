"""
data_endpoints.py — Fitness Data API Endpoints

This module contains all FastAPI routes related to accessing and updating fitness tracking data. It includes:

- Retrieving raw fitness data (daily, weekly, heart rate, etc.) from SQLite
- Working with fitness goals (get, update, create)
- Accessing conversation history stored in CSV
- Updating weight logs across multiple tables
- Logging UI events such as button clicks for user analytics

These endpoints are mounted under `/data` in the main API application.
"""

from fastapi import APIRouter, Query, Request
from fastapi.responses import JSONResponse
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from datetime import datetime, timedelta
from pydantic import BaseModel
import sqlite3
import os
import csv

# Create APIRouter
router = APIRouter()

# Database file path
DB_PATH = "data/fitness.db"

# Define valid table names that are accessible via the API
VALID_TABLES = [
    "daily_data", "daily_activity", "weekly_data", "weight_log",
    "minute_sleep", "hourly_merged", "heartrate_minutes", "fitness_goals",
    "sleep_data"
]

# Preload selected CSV files into memory
dataframes = {
    "goals": pd.read_csv("data/fitness_goals.csv"),
    "conversation_subjects": pd.read_csv("data/conversation_subjects.csv", dtype={"user_id": str}, quotechar='"', encoding="utf-8"),
    "conversation_messages": pd.read_csv("data/conversation_messages.csv", dtype={"user_id": str}, quotechar='"', encoding="utf-8"),
}

# CSV reload utilities
def reload_subjects():
    """Reload the conversation subjects CSV into the in-memory DataFrame."""
    dataframes["conversation_subjects"] = pd.read_csv(
        "data/conversation_subjects.csv", dtype={"user_id": str}, quotechar='"', encoding="utf-8")

def reload_messages():
    """Reload the conversation messages CSV into the in-memory DataFrame."""
    dataframes["conversation_messages"] = pd.read_csv(
        "data/conversation_messages.csv", dtype={"user_id": str}, quotechar='"', encoding="utf-8")

def reload_goals():
    """Reload the fitness goals CSV into the in-memory DataFrame."""
    dataframes["goals"] = pd.read_csv("data/fitness_goals.csv")


# SQLite fetch utility
def fetch_from_db(query: str, params: tuple):
    """
    Run a parameterized query on the SQLite database and return results as a list of dicts.

    Args:
        query (str): SQL query string with placeholders.
        params (tuple): Parameters for the query.

    Returns:
        list of dicts or error message.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        cursor.execute(query, params)
        records = cursor.fetchall()

        return [dict(record) for record in records] if records else None
    except Exception as e:
        return {"error": str(e)}
    finally:
        conn.close()

@router.get("/")
async def root():
    """Root endpoint to verify the data router is active."""
    return {"message": "Welcome to the Fitness Data API"}

@router.get("/{dataset_name}")
async def get_data(dataset_name: str, user_id: int = Query(..., description="User ID to filter the data")):
    """Retrieve data for a specific dataset from the database."""
    if dataset_name not in VALID_TABLES:
        return JSONResponse(content={"error": "Dataset not found"}, status_code=404)

    query = f"SELECT * FROM {dataset_name} WHERE id = ?"
    data = fetch_from_db(query, (user_id,))

    if not data:
        return JSONResponse(content={"message": f"No data found for user ID {user_id}"}, status_code=404)

    return JSONResponse(content=data)

@router.get("/{dataset_name}/by-date")
async def get_data_by_date(
    dataset_name: str,
    date: str = Query(..., description="The date to filter by (YYYY-MM-DD)"),
    user_id: int = Query(..., description="User ID to filter the data")
):
    """Retrieve data for a given date and user from a dataset."""
    if dataset_name not in VALID_TABLES:
        return JSONResponse(content={"error": "Dataset not found"}, status_code=404)

    query = f"SELECT * FROM {dataset_name} WHERE id = ? AND date = ?"
    data = fetch_from_db(query, (user_id, date))

    if not data:
        return JSONResponse(content={"message": f"No data found for user ID {user_id} on date {date}"}, status_code=404)

    return JSONResponse(content=data)


@router.get("/{dataset_name}/week-back")
async def get_data_one_week_back(
    dataset_name: str,
    date: str = Query(..., description="End date for the week (YYYY-MM-DD)"),
    user_id: int = Query(..., description="User ID to filter the data")
):
    """Retrieve data for a week ending on a specific date."""
    if dataset_name not in VALID_TABLES:
        return JSONResponse(content={"error": "Dataset not found"}, status_code=404)

    try:
        end_date = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        return JSONResponse(content={"error": "Invalid date format. Use YYYY-MM-DD."}, status_code=400)

    week_dates = [(end_date - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]
    placeholders = ",".join(["?"] * 7)

    query = f"SELECT * FROM {dataset_name} WHERE id = ? AND date IN ({placeholders})"
    data = fetch_from_db(query, (user_id, *week_dates))

    return JSONResponse(content={"requested_week": week_dates, "available_data": data if data else []})

@router.get("/daily_data/sleep-week-back")
async def get_sleep_data_one_week_back(
    date: str = Query(..., description="End date for the week (YYYY-MM-DD)"),
    user_id: int = Query(..., description="User ID to filter the data")
):
    """Retrieve total sleep minutes for a user across the last 7 days."""
    try:
        end_date = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        return JSONResponse(content={"error": "Invalid date format. Use YYYY-MM-DD."}, status_code=400)

    week_dates = [(end_date - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]
    placeholders = ",".join(["?"] * 7)

    query = f"SELECT * FROM daily_data WHERE id = ? AND date IN ({placeholders})"
    data = fetch_from_db(query, (user_id, *week_dates))

    return JSONResponse(content={"available_sleep_data": data if data else []})


@router.get("/heartrate/minute")
async def get_heartrate_data_by_date(
    bydate: str = Query(..., description="Date for which to retrieve heart rate data (YYYY-MM-DD)"),
    user_id: int = Query(..., description="User ID to filter the data")
):
    """Retrieve minute-level heart rate values for a specific date."""
    
    query = "SELECT value FROM heartrate_minutes WHERE id = ? AND strftime('%Y-%m-%d', minute) = ?"
    data = fetch_from_db(query, (user_id, bydate))

    if isinstance(data, dict) and "error" in data:
        return JSONResponse(content=data, status_code=400)
    
    if not data:
        return JSONResponse(content={"date": bydate, "heart_rate_values": []})

    heart_rate_values = [record["value"] for record in data]
    return JSONResponse(content={"date": bydate, "heart_rate_values": heart_rate_values})

@router.get("/goals/{user_id}")
async def get_goals_by_id(user_id: int):
    """Retrieve all fitness goals for a specific user."""
    query = "SELECT * FROM fitness_goals WHERE id = ?"
    data = fetch_from_db(query, (user_id,))

    if data is None:
        return JSONResponse(content={"message": f"No goals found for user ID {user_id}"}, status_code=404)

    return JSONResponse(content=data)

@router.get("/goals/{user_id}/{goal_metric}")
async def get_specific_goal(user_id: int, goal_metric: str):
    """Retrieve a specific fitness goal for a given user ID and metric."""
    query = "SELECT * FROM fitness_goals WHERE id = ? AND metric = ?"
    data = fetch_from_db(query, (user_id, goal_metric))

    if data is None:
        return JSONResponse(content={"message": f"No goal found for user ID {user_id} and metric '{goal_metric}'"}, status_code=404)

    return JSONResponse(content=data[0])

@router.post("/goals/{user_id}/{goal_metric}")
async def update_goal(user_id: int, goal_metric: str, goal_value: int):
    """Update or create a fitness goal for a specific user and metric."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Check if goal exists
        check_query = "SELECT * FROM fitness_goals WHERE id = ? AND metric = ?"
        cursor.execute(check_query, (user_id, goal_metric))
        existing_goal = cursor.fetchone()

        if existing_goal:
            # Update existing goal
            update_query = "UPDATE fitness_goals SET goal = ? WHERE id = ? AND metric = ?"
            cursor.execute(update_query, (goal_value, user_id, goal_metric))
            message = f"Updated goal for user ID {user_id} and metric '{goal_metric}' to {goal_value}."
        else:
            # Insert new goal
            insert_query = "INSERT INTO fitness_goals (id, metric, goal) VALUES (?, ?, ?)"
            cursor.execute(insert_query, (user_id, goal_metric, goal_value))
            message = f"Created new goal for user ID {user_id} and metric '{goal_metric}' with value {goal_value}."

        conn.commit()
        return {"message": message}

    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    finally:
        conn.close()

@router.get("/conversation_subjects/{user_id}")
async def get_conversation_subjects(user_id: str, offset: int = Query(0, ge=0), limit: int = Query(5, gt=0)):
    """Retrieve paginated conversation subjects for a given user."""
    if "conversation_subjects" not in dataframes:
        return JSONResponse(content={"error": "Conversation subjects dataset not found"}, status_code=404)
    
    subjects_df = dataframes["conversation_subjects"]
    
    if "user_id" not in subjects_df.columns:
        return JSONResponse(content={"error": "The 'conversation_subjects' dataset does not have the required column 'user_id'"}, status_code=400)
    
    user_subjects = subjects_df[subjects_df["user_id"] == user_id]
    
    if user_subjects.empty:
        return JSONResponse(content={"message": f"No conversation subjects found for user ID {user_id}"}, status_code=404)
    
    user_subjects["subject"] = user_subjects["subject"].str.strip('"')
    user_subjects = user_subjects.sort_values(by="timestamp", ascending=False)
    paginated_subjects = user_subjects.iloc[offset:offset + limit]
    
    return {
        "conversations": paginated_subjects.to_dict(orient="records"),
        "total": len(user_subjects),
        "offset": offset,
        "limit": limit
    }

@router.get("/conversation_messages/{conversation_id}")
async def get_conversation_messages(conversation_id: str):
    """Retrieve messages for a specific conversation."""
    if "conversation_messages" not in dataframes:
        return JSONResponse(content={"error": "Conversation messages dataset not found"}, status_code=404)
    
    messages_df = dataframes["conversation_messages"]
    
    if "conversation_id" not in messages_df.columns:
        return JSONResponse(content={"error": "The 'conversation_messages' dataset does not have the required column 'conversation_id'"}, status_code=400)
    
    conversation_msgs = messages_df[messages_df["conversation_id"] == conversation_id]
    
    if conversation_msgs.empty:
        return JSONResponse(content={"message": f"No conversation messages found for conversation ID {conversation_id}"}, status_code=404)
    
    return conversation_msgs.to_dict(orient="records")

@router.post("/weight_log/update_weight/{user_id}")
async def update_weight_log_entry(
    user_id: int,
    weight: float,
    date: str = Query(..., description="Date for which to update the weight (YYYY-MM-DD)")
):
    """Update weight data for a user and date in both weight_log and daily_data tables."""
    try:
        datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT * FROM weight_log WHERE id = ? AND date = ?", (user_id, date))
        weight_log_entry = cursor.fetchone()

        if weight_log_entry:
            cursor.execute(
                "UPDATE weight_log SET weightkg = ? WHERE id = ? AND date = ?",
                (weight, user_id, date)
            )
        else:
            raise HTTPException(status_code=404, detail="No matching weight log entry found for the specified user and date.")

        cursor.execute("SELECT * FROM daily_data WHERE id = ? AND date = ?", (user_id, date))
        daily_data_entry = cursor.fetchone()

        if daily_data_entry:
            cursor.execute(
                "UPDATE daily_data SET weightkg = ? WHERE id = ? AND date = ?",
                (weight, user_id, date)
            )
        else:
            raise HTTPException(status_code=404, detail="No matching daily data entry found for the specified user and date.")

        conn.commit()
        return {"message": "Weight log and daily data entry updated successfully."}

    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    finally:
        conn.close()

@router.post("/log-click")
async def log_click(request: Request):
    """Log user interaction events and store them in a local CSV file."""
    data = await request.json()
    session_id = data.get("session_id")
    event_type = data.get("event_type")
    component = data.get("component")
    timestamp = datetime.now().isoformat()

    if not session_id or not event_type or not component:
        raise HTTPException(status_code=400, detail="Missing required fields")

    logs_dir = "click_logs"
    os.makedirs(logs_dir, exist_ok=True)
    file_path = os.path.join(logs_dir, f"clicks_{session_id}.csv")
    file_exists = os.path.isfile(file_path)

    with open(file_path, mode="a", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        if not file_exists:
            writer.writerow(["timestamp", "event_type", "component"])
        writer.writerow([timestamp, event_type, component])

    return {"message": "Click logged successfully"}

