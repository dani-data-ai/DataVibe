import sqlalchemy
from sqlalchemy import create_engine, text
from typing import Dict, Any, List, Optional
import re

class CloudDatabaseService:
    """Service for connecting to remote cloud databases"""
    
    @staticmethod
    def validate_connection_string(connection_string: str) -> bool:
        """Validate that connection string is for a cloud provider"""
        cloud_patterns = [
            r'.*\.neon\.tech',
            r'.*\.supabase\.co',
            r'.*\.planetscale\.sh',
            r'.*\.psdb\.cloud',
            r'.*\.amazonaws\.com',
            r'.*\.googleapis\.com',
            r'.*\.azure\.com',
        ]
        
        for pattern in cloud_patterns:
            if re.search(pattern, connection_string, re.IGNORECASE):
                return True
        
        # Block local connections
        local_patterns = [
            r'localhost',
            r'127\.0\.0\.1',
            r'0\.0\.0\.0',
            r'::1',
        ]
        
        for pattern in local_patterns:
            if re.search(pattern, connection_string, re.IGNORECASE):
                raise ValueError(f"Local database connections are not allowed. Use a cloud provider like Neon, Supabase, or PlanetScale.")
        
        return True
    
    @staticmethod
    def test_connection(connection_string: str) -> Dict[str, Any]:
        """Test connection to remote database"""
        try:
            # Validate connection string format
            CloudDatabaseService.validate_connection_string(connection_string)
            
            # Detect provider for better error messages
            provider = CloudDatabaseService._detect_provider(connection_string)
            
            # Create engine with appropriate settings for cloud databases
            engine_args = {"connect_timeout": 15}
            
            # Add SSL settings for cloud providers
            if any(domain in connection_string.lower() for domain in ['.supabase.co', '.neon.tech', '.psdb.cloud']):
                engine_args["sslmode"] = "require"
            
            engine = create_engine(connection_string, connect_args=engine_args)
            
            # Test the connection
            with engine.connect() as conn:
                result = conn.execute(text("SELECT 1 as test"))
                row = result.fetchone()
                
                if row and row[0] == 1:
                    return {
                        "success": True,
                        "message": f"Successfully connected to {provider}",
                        "provider": provider
                    }
                else:
                    return {
                        "success": False,
                        "message": "Connection test query failed",
                        "provider": provider
                    }
                
        except ValueError as ve:
            # Validation errors (cloud provider check, etc.)
            return {
                "success": False,
                "message": str(ve),
                "provider": None
            }
        except Exception as e:
            error_msg = str(e).lower()
            provider = CloudDatabaseService._detect_provider(connection_string)
            
            # Provide specific error messages for common issues
            if "timeout" in error_msg:
                message = f"Connection timeout. Please check your {provider} database is running and accessible."
            elif "authentication" in error_msg or "password" in error_msg:
                message = f"Authentication failed. Please check your {provider} username and password."
            elif "database" in error_msg and "does not exist" in error_msg:
                message = f"Database not found. Please check your {provider} database name."
            elif "connection refused" in error_msg:
                message = f"Connection refused. Please check your {provider} host and port."
            elif "ssl" in error_msg:
                message = f"SSL connection issue with {provider}. This is usually a temporary network issue."
            else:
                message = f"Connection failed: {str(e)}"
            
            return {
                "success": False,
                "message": message,
                "provider": provider,
                "error_details": str(e)
            }
    
    @staticmethod
    def _detect_provider(connection_string: str) -> str:
        """Detect cloud database provider from connection string"""
        if '.neon.tech' in connection_string.lower():
            return 'Neon'
        elif '.supabase.co' in connection_string.lower():
            return 'Supabase'
        elif '.planetscale.sh' in connection_string.lower() or '.psdb.cloud' in connection_string.lower():
            return 'PlanetScale'
        elif '.amazonaws.com' in connection_string.lower():
            return 'AWS RDS'
        elif '.googleapis.com' in connection_string.lower():
            return 'Google Cloud SQL'
        elif '.azure.com' in connection_string.lower():
            return 'Azure Database'
        else:
            return 'Unknown Cloud Provider'
    
    @staticmethod
    def execute_read_only_query(connection_string: str, sql_query: str) -> Dict[str, Any]:
        """Execute read-only query on remote database"""
        try:
            # Validate it's a SELECT query
            sql_clean = sql_query.strip().upper()
            if not sql_clean.startswith('SELECT'):
                raise ValueError("Only SELECT queries are allowed")
            
            # Block potentially dangerous operations
            dangerous_keywords = ['DELETE', 'UPDATE', 'INSERT', 'DROP', 'ALTER', 'CREATE', 'TRUNCATE']
            for keyword in dangerous_keywords:
                if keyword in sql_clean:
                    raise ValueError(f"Query contains prohibited keyword: {keyword}")
            
            CloudDatabaseService.validate_connection_string(connection_string)
            
            engine = create_engine(connection_string, connect_args={"connect_timeout": 10})
            
            with engine.connect() as conn:
                result = conn.execute(text(sql_query))
                rows = result.fetchall()
                columns = list(result.keys())
                
                # Convert to list of dictionaries
                data = [dict(zip(columns, row)) for row in rows]
                
            return {
                "success": True,
                "data": data,
                "columns": columns,
                "row_count": len(data),
                "message": f"Query executed successfully. {len(data)} rows returned."
            }
            
        except Exception as e:
            return {
                "success": False,
                "data": [],
                "columns": [],
                "row_count": 0,
                "message": f"Query failed: {str(e)}"
            }
    
    @staticmethod
    def get_schema_info(connection_string: str) -> Dict[str, Any]:
        """Get basic schema information from remote database"""
        try:
            CloudDatabaseService.validate_connection_string(connection_string)
            
            engine = create_engine(connection_string, connect_args={"connect_timeout": 10})
            
            with engine.connect() as conn:
                # Get table names (works with most SQL databases)
                result = conn.execute(text("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' OR table_schema = DATABASE()
                    ORDER BY table_name
                """))
                tables = [row[0] for row in result.fetchall()]
                
            return {
                "success": True,
                "tables": tables,
                "message": f"Found {len(tables)} tables"
            }
            
        except Exception as e:
            return {
                "success": False,
                "tables": [],
                "message": f"Schema query failed: {str(e)}"
            }
    
    @staticmethod
    def execute_ddl_query(connection_string: str, ddl_query: str) -> Dict[str, Any]:
        """Execute DDL query (CREATE, ALTER, etc.) on remote database"""
        try:
            # Validate it's a safe DDL query
            sql_clean = ddl_query.strip().upper()
            allowed_ddl = ['CREATE TABLE', 'ALTER TABLE', 'CREATE INDEX', 'CREATE VIEW']
            
            is_allowed = False
            for ddl in allowed_ddl:
                if sql_clean.startswith(ddl):
                    is_allowed = True
                    break
            
            if not is_allowed:
                raise ValueError("Only safe DDL operations are allowed (CREATE TABLE, ALTER TABLE ADD COLUMN, CREATE INDEX, CREATE VIEW)")
            
            # Block dangerous operations
            dangerous_keywords = ['DELETE', 'UPDATE', 'INSERT', 'DROP', 'TRUNCATE']
            for keyword in dangerous_keywords:
                if keyword in sql_clean and 'DROP COLUMN' not in sql_clean:
                    raise ValueError(f"Query contains prohibited keyword: {keyword}")
            
            CloudDatabaseService.validate_connection_string(connection_string)
            
            engine = create_engine(connection_string, connect_args={"connect_timeout": 10})
            
            with engine.connect() as conn:
                # Begin transaction for DDL
                trans = conn.begin()
                try:
                    conn.execute(text(ddl_query))
                    trans.commit()
                except Exception as e:
                    trans.rollback()
                    raise e
                
            return {
                "success": True,
                "message": "DDL query executed successfully",
                "query": ddl_query
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": f"DDL query failed: {str(e)}",
                "query": ddl_query
            }