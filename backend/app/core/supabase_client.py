"""
Supabase client configuration for the PDF Quiz Platform
"""

import os
from supabase import create_client, Client
from app.core.config import settings

# Initialize Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def get_supabase_client() -> Client:
    """Get Supabase client instance"""
    return supabase

# Helper functions for common operations
async def authenticate_user(email: str, password: str):
    """Authenticate user with Supabase Auth"""
    try:
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        return response
    except Exception as e:
        print(f"Authentication error: {e}")
        return None

async def create_user(email: str, password: str, user_data: dict):
    """Create new user with Supabase Auth"""
    try:
        # Create auth user
        auth_response = supabase.auth.sign_up({
            "email": email,
            "password": password
        })
        
        if auth_response.user:
            # Create user record in our users table
            user_record = {
                "id": auth_response.user.id,
                "email": email,
                **user_data
            }
            
            db_response = supabase.table("users").insert(user_record).execute()
            return db_response
            
    except Exception as e:
        print(f"User creation error: {e}")
        return None

async def get_user_by_id(user_id: str):
    """Get user by ID from database"""
    try:
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Get user error: {e}")
        return None