#!/usr/bin/env python3
"""
Script to create database tables using Supabase migrations
Run this after setting up your Supabase project
"""

import os
import sys
from pathlib import Path
from app.db.models import Base
from app.db.session import engine
from app.core.config import settings

def run_supabase_migrations():
    """Run Supabase SQL migrations"""
    migrations_dir = Path(__file__).parent / "supabase" / "migrations"
    
    if not migrations_dir.exists():
        print("No migrations directory found. Creating tables with SQLAlchemy...")
        create_tables_sqlalchemy()
        return
    
    print("Found Supabase migrations directory.")
    print("Please run the SQL migrations manually in your Supabase dashboard:")
    print(f"Migration files location: {migrations_dir}")
    
    for migration_file in sorted(migrations_dir.glob("*.sql")):
        print(f"  - {migration_file.name}")
    
    print("\nTo apply migrations:")
    print("1. Go to your Supabase dashboard")
    print("2. Navigate to SQL Editor")
    print("3. Copy and paste the content of each migration file")
    print("4. Run the SQL commands")
    
    # Also create tables with SQLAlchemy as fallback
    print("\nAlso creating tables with SQLAlchemy as fallback...")
    create_tables_sqlalchemy()

def create_tables_sqlalchemy():
    """Create all database tables"""
    print("Creating database tables...")
    
    # Check if we can connect to the database
    try:
        with engine.connect() as conn:
            print("✓ Database connection successful")
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        print("\nPlease check your database configuration:")
        print(f"  SUPABASE_DB_URL: {settings.SUPABASE_DB_URL[:50]}...")
        return False
    
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")
    return True

def verify_setup():
    """Verify Supabase configuration"""
    print("Verifying Supabase configuration...")
    
    required_vars = {
        "SUPABASE_URL": settings.SUPABASE_URL,
        "SUPABASE_KEY": settings.SUPABASE_KEY,
        "SUPABASE_DB_URL": settings.SUPABASE_DB_URL,
    }
    
    missing_vars = []
    for var_name, var_value in required_vars.items():
        if not var_value:
            missing_vars.append(var_name)
        else:
            print(f"✓ {var_name}: {var_value[:20]}...")
    
    if missing_vars:
        print(f"\n✗ Missing required environment variables: {', '.join(missing_vars)}")
        print("Please set these in your .env file")
        return False
    
    print("✓ All required environment variables are set")
    return True

if __name__ == "__main__":
    print("=== PDF Quiz Platform - Database Setup ===\n")
    
    if not verify_setup():
        sys.exit(1)
    
    run_supabase_migrations()
