import asyncio
from datetime import datetime, timedelta
import logging
from app.core.security import secure_context

logger = logging.getLogger(__name__)

class BackgroundTasks:
    """Handles background tasks for the application"""
    
    def __init__(self):
        self._cleanup_task = None
        self._running = False
    
    async def start_cleanup_scheduler(self):
        """Start the automatic cleanup scheduler"""
        if self._running:
            return
        
        self._running = True
        self._cleanup_task = asyncio.create_task(self._cleanup_loop())
        logger.info("Background cleanup scheduler started")
    
    async def stop_cleanup_scheduler(self):
        """Stop the cleanup scheduler"""
        self._running = False
        if self._cleanup_task:
            self._cleanup_task.cancel()
            try:
                await self._cleanup_task
            except asyncio.CancelledError:
                pass
        logger.info("Background cleanup scheduler stopped")
    
    async def _cleanup_loop(self):
        """Main cleanup loop - runs every 10 minutes"""
        while self._running:
            try:
                # Clean up expired sessions
                cleaned = secure_context.cleanup_expired_sessions()
                if cleaned > 0:
                    logger.info(f"Cleaned up {cleaned} expired sessions")
                
                # Wait 10 minutes before next cleanup
                await asyncio.sleep(600)  # 10 minutes
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in cleanup loop: {e}")
                await asyncio.sleep(60)  # Wait 1 minute on error

# Global background tasks instance
background_tasks = BackgroundTasks()