"""
database.py — SQLite database configuration and utility functions

This module sets up a shared SQLite database connection for use in the API.
It also includes a helper function to retrieve the schema of the database,
which can be used for inspection, validation, or prompting in LLM workflows.
"""

import sqlite3

# Set the database path
DATABASE_PATH = "data/fitness.db"

# Initialize a single database connection
db_connection = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
db_connection.row_factory = sqlite3.Row  # Allows column access by name

def get_schema():
    """Retrieve the table schema from SQLite database."""
    cursor = db_connection.cursor()

    # Get all table names
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()

    # For each table, retrieve its column names
    table_info = {}
    for table in tables:
        table_name = table[0]
        cursor.execute(f"PRAGMA table_info({table_name});")
        columns = cursor.fetchall()
        table_info[table_name] = [column[1] for column in columns]

    # Build the schema string
    schema_string = "\n".join([f"{table}: {', '.join(columns)}" for table, columns in table_info.items()])

    return schema_string 

# Dependency to get the shared database connection
def get_db():
    try:
        yield db_connection
    finally:
        pass 