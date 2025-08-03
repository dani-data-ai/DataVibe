#!/usr/bin/env python3
import subprocess
import sys
import os

# Add the backend directory to path so we can import our modules
sys.path.insert(0, '/workspaces/DataVibe/backend')

try:
    from app.services.database_cloud import CloudDatabaseService
    print("✅ Successfully imported CloudDatabaseService")
except ImportError as e:
    print(f"❌ Import failed: {e}")
    print("Installing required packages...")
    subprocess.run([sys.executable, "-m", "pip", "install", "sqlalchemy", "psycopg2-binary"], check=True)
    from app.services.database_cloud import CloudDatabaseService

def test_connection_detailed(connection_string):
    print(f"\n🔍 Testing connection: {connection_string}")
    print("-" * 60)
    
    # Test our service
    print("1. Testing via CloudDatabaseService...")
    result = CloudDatabaseService.test_connection(connection_string)
    print(f"Result: {result}")
    
    # Test raw SQLAlchemy
    print("\n2. Testing raw SQLAlchemy connection...")
    try:
        import sqlalchemy
        from sqlalchemy import create_engine, text
        import urllib.parse
        
        # URL encode password
        password_encoded = urllib.parse.quote("P12345678!", safe="")
        encoded_conn = f"postgresql://postgres:{password_encoded}@db.jgvrrxmomqgjpsnhjaau.supabase.co:5432/postgres?sslmode=require"
        
        print(f"Encoded connection: {encoded_conn}")
        
        engine = create_engine(encoded_conn, connect_args={
            "connect_timeout": 15,
            "sslmode": "require"
        })
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1 as test, version() as version"))
            row = result.fetchone()
            print(f"✅ Raw SQLAlchemy SUCCESS: {dict(row)}")
            return True
            
    except Exception as e:
        print(f"❌ Raw SQLAlchemy FAILED: {e}")
        return False

if __name__ == "__main__":
    # Your connection string
    conn_str = "postgresql://postgres:P12345678!@db.jgvrrxmomqgjpsnhjaau.supabase.co:5432/postgres"
    
    print("🧪 Supabase Connection Test")
    print("=" * 60)
    
    # Check if we can resolve the hostname
    print("0. Testing hostname resolution...")
    try:
        import socket
        ip = socket.gethostbyname("db.jgvrrxmomqgjpsnhjaau.supabase.co")
        print(f"✅ Hostname resolves to: {ip}")
    except Exception as e:
        print(f"❌ Hostname resolution failed: {e}")
    
    test_connection_detailed(conn_str)