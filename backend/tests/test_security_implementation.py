import pytest
import asyncio
from datetime import datetime, timedelta
from app.core.security import SecureContextManager, create_session_token, verify_session_token
from app.core.background_tasks import BackgroundTasks

def test_connection_string_encryption():
    """Test that connection strings are properly encrypted"""
    manager = SecureContextManager()
    
    # Create session with sensitive data
    connection_data = {
        'connection_string': 'postgresql://user:password@host.neon.tech/db',
        'provider': 'Neon'
    }
    
    session_id = manager.create_session('user123', connection_data)
    
    # Verify session exists but connection string is encrypted
    session_info = manager.get_session_info(session_id, 'user123')
    assert session_info is not None
    assert 'connection_string' not in session_info  # Not exposed
    assert session_info['provider'] == 'Neon'
    
    # Verify connection string can be retrieved and decrypted
    decrypted = manager.get_connection_string(session_id, 'user123')
    assert decrypted == 'postgresql://user:password@host.neon.tech/db'

def test_session_authorization():
    """Test that users can only access their own sessions"""
    manager = SecureContextManager()
    
    connection_data = {'connection_string': 'postgresql://test@host.neon.tech/db'}
    
    # Create sessions for different users
    session1 = manager.create_session('user1', connection_data)
    session2 = manager.create_session('user2', connection_data)
    
    # User1 can access their session
    assert manager.get_connection_string(session1, 'user1') is not None
    assert manager.get_session_info(session1, 'user1') is not None
    
    # User1 cannot access user2's session
    assert manager.get_connection_string(session2, 'user1') is None
    assert manager.get_session_info(session2, 'user1') is None
    
    # User2 can access their session
    assert manager.get_connection_string(session2, 'user2') is not None
    assert manager.get_session_info(session2, 'user2') is not None

def test_session_expiration():
    """Test that sessions expire after 1 hour"""
    manager = SecureContextManager()
    
    connection_data = {'connection_string': 'postgresql://test@host.neon.tech/db'}
    session_id = manager.create_session('user1', connection_data)
    
    # Session should be accessible initially
    assert manager.get_connection_string(session_id, 'user1') is not None
    
    # Manually expire the session by modifying last_accessed
    session = manager._sessions[session_id]
    session['last_accessed'] = datetime.utcnow() - timedelta(hours=2)
    
    # Session should now be expired and cleaned up
    assert manager.get_connection_string(session_id, 'user1') is None
    assert session_id not in manager._sessions  # Should be cleaned up

def test_jwt_token_security():
    """Test JWT token creation and verification"""
    session_id = "test_session_123"
    user_id = "user_456"
    
    # Create token
    token = create_session_token(session_id, user_id)
    assert token is not None
    
    # Verify token
    context = verify_session_token(token)
    assert context is not None
    assert context['session_id'] == session_id
    assert context['user_id'] == user_id
    
    # Invalid token should return None
    invalid_context = verify_session_token("invalid.token.here")
    assert invalid_context is None

def test_automatic_cleanup():
    """Test automatic cleanup of expired sessions"""
    manager = SecureContextManager()
    
    # Create multiple sessions
    connection_data = {'connection_string': 'postgresql://test@host.neon.tech/db'}
    
    session1 = manager.create_session('user1', connection_data)
    session2 = manager.create_session('user2', connection_data)
    session3 = manager.create_session('user3', connection_data)
    
    # Expire some sessions
    manager._sessions[session1]['last_accessed'] = datetime.utcnow() - timedelta(hours=2)
    manager._sessions[session2]['last_accessed'] = datetime.utcnow() - timedelta(hours=3)
    # session3 remains current
    
    # Run cleanup
    cleaned_count = manager.cleanup_expired_sessions()
    
    # Verify cleanup results
    assert cleaned_count == 2
    assert session1 not in manager._sessions
    assert session2 not in manager._sessions
    assert session3 in manager._sessions

def test_no_data_persistence():
    """Test that no sensitive data is persisted to disk"""
    import tempfile
    import os
    
    # Create temporary directory to monitor
    with tempfile.TemporaryDirectory() as temp_dir:
        original_cwd = os.getcwd()
        os.chdir(temp_dir)
        
        try:
            # Create and use secure context manager
            manager = SecureContextManager()
            connection_data = {
                'connection_string': 'postgresql://sensitive:password@host.neon.tech/db'
            }
            
            session_id = manager.create_session('user1', connection_data)
            manager.get_connection_string(session_id, 'user1')
            manager.destroy_session(session_id)
            
            # Verify no files were created
            files_created = os.listdir(temp_dir)
            assert len(files_created) == 0, f"Files created: {files_created}"
            
        finally:
            os.chdir(original_cwd)

@pytest.mark.asyncio
async def test_background_cleanup_scheduler():
    """Test that background cleanup scheduler works"""
    tasks = BackgroundTasks()
    
    # Start scheduler
    await tasks.start_cleanup_scheduler()
    assert tasks._running is True
    assert tasks._cleanup_task is not None
    
    # Let it run briefly
    await asyncio.sleep(0.1)
    
    # Stop scheduler
    await tasks.stop_cleanup_scheduler()
    assert tasks._running is False

def test_memory_only_storage():
    """Verify all storage is in-memory only"""
    manager = SecureContextManager()
    
    # Verify storage is dictionary (in-memory)
    assert isinstance(manager._sessions, dict)
    assert hasattr(manager, '_encryption_key')
    
    # Create session
    connection_data = {'connection_string': 'test'}
    session_id = manager.create_session('user1', connection_data)
    
    # Verify data exists in memory
    assert session_id in manager._sessions
    
    # Create new manager instance (simulates restart)
    new_manager = SecureContextManager()
    
    # Verify session doesn't exist in new instance (no persistence)
    assert new_manager.get_session_info(session_id, 'user1') is None

if __name__ == "__main__":
    pytest.main([__file__])