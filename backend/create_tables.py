#!/usr/bin/env python3
"""
Script to create database tables
Run this after setting up your database connection
"""

from app.db.models import Base
from app.db.session import engine

def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

if __name__ == "__main__":
    create_tables()
