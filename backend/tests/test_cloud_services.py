import pytest
from app.services.database_cloud import CloudDatabaseService
from app.services.llm_mock import MockLLMService

def test_cloud_database_validation():
    """Test that only cloud database connections are allowed"""
    
    # Should reject local connections
    with pytest.raises(ValueError, match="Local database connections are not allowed"):
        CloudDatabaseService.validate_connection_string("postgresql://user:pass@localhost:5432/db")
    
    with pytest.raises(ValueError, match="Local database connections are not allowed"):
        CloudDatabaseService.validate_connection_string("mysql://user:pass@127.0.0.1:3306/db")
    
    # Should accept cloud providers
    assert CloudDatabaseService.validate_connection_string("postgresql://user:pass@host.neon.tech/db")
    assert CloudDatabaseService.validate_connection_string("postgresql://user:pass@host.supabase.co:5432/db")
    assert CloudDatabaseService.validate_connection_string("mysql://user:pass@host.planetscale.sh/db")

def test_provider_detection():
    """Test cloud provider detection"""
    
    assert CloudDatabaseService._detect_provider("postgresql://user:pass@host.neon.tech/db") == "Neon"
    assert CloudDatabaseService._detect_provider("postgresql://user:pass@host.supabase.co:5432/db") == "Supabase"
    assert CloudDatabaseService._detect_provider("mysql://user:pass@host.planetscale.sh/db") == "PlanetScale"

def test_mock_llm_service():
    """Test mock LLM service generates appropriate SQL"""
    
    # Test customer queries
    result = MockLLMService.natural_language_to_sql("show me all customers from Germany")
    assert result["success"]
    assert "customers" in result["sql"].lower()
    assert "germany" in result["sql"].lower()
    
    # Test count queries
    result = MockLLMService.natural_language_to_sql("how many orders are there?")
    assert result["success"]
    assert "count" in result["sql"].lower()
    assert "orders" in result["sql"].lower()

def test_sql_safety_validation():
    """Test that only safe SELECT queries are allowed"""
    
    # Should succeed with SELECT
    result = CloudDatabaseService.execute_read_only_query(
        "postgresql://fake:fake@fake.neon.tech/fake",  # Will fail connection but pass validation
        "SELECT * FROM customers LIMIT 10"
    )
    assert not result["success"]  # Connection will fail, but query is valid
    assert "connection" in result["message"].lower()  # Should be connection error, not SQL error
    
    # Should fail with dangerous operations
    result = CloudDatabaseService.execute_read_only_query(
        "postgresql://fake:fake@fake.neon.tech/fake",
        "DELETE FROM customers"
    )
    assert not result["success"]
    assert "prohibited keyword" in result["message"]

def test_no_local_persistence():
    """Test that no data is persisted locally"""
    
    # Test that queries don't create files
    import os
    import tempfile
    
    original_cwd = os.getcwd()
    with tempfile.TemporaryDirectory() as temp_dir:
        os.chdir(temp_dir)
        
        # Generate SQL
        MockLLMService.natural_language_to_sql("test query")
        
        # Check no files were created
        files_created = os.listdir(temp_dir)
        assert len(files_created) == 0, f"Files created: {files_created}"
        
        os.chdir(original_cwd)

def test_cloud_only_architecture():
    """Test that the application enforces cloud-only architecture"""
    
    # All database connections must be cloud-based
    local_patterns = ["localhost", "127.0.0.1", "0.0.0.0", "::1"]
    
    for pattern in local_patterns:
        connection_string = f"postgresql://user:pass@{pattern}:5432/db"
        with pytest.raises(ValueError, match="Local database connections are not allowed"):
            CloudDatabaseService.validate_connection_string(connection_string)

if __name__ == "__main__":
    pytest.main([__file__])