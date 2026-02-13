import os
import httpx
from supabase import create_client

def test_connectivity():
    url = "https://kbsurkwjqnpptgvaficy.supabase.co"
    key = "sb_publishable_DAySdd5M_qtExcZB-aigAA_7uR6xhGy"
    
    print(f"Testing connectivity to {url}...")
    
    # 1. Test Health Endpoint directly via HTTPX
    print("\n1. Testing /auth/v1/health...")
    try:
        headers = {"apikey": key, "Authorization": f"Bearer {key}"}
        with httpx.Client(timeout=10.0, headers=headers) as client:
            resp = client.get(f"{url}/auth/v1/health")
            print(f"Response: {resp.status_code}")
            print(f"Content: {resp.text[:100]}")
    except Exception as e:
        print(f"Error: {e}")

    # 2. Test Supabase Client
    print("\n2. Testing Supabase Client (maybe_single query)...")
    try:
        supabase = create_client(url, key)
        # Using a simple query that should return empty or error if table missing, 
        # but shouldn't timeout if connection is OK
        res = supabase.table("users_profile").select("*").limit(1).execute()
        print(f"Response data: {res.data}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_connectivity()
