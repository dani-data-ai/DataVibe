from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum
import uuid
import logging

logger = logging.getLogger(__name__)

class AuditEventType(str, Enum):
    """Types of audit events"""
    LOGIN = "login"
    LOGOUT = "logout"
    DATABASE_CONNECTION = "database_connection"
    QUERY_PREVIEW = "query_preview"
    QUERY_EXECUTION = "query_execution"
    SCHEMA_PROPOSAL = "schema_proposal"
    SCHEMA_APPROVAL = "schema_approval"
    SCHEMA_REJECTION = "schema_rejection"
    SCHEMA_EXECUTION = "schema_execution"
    SESSION_CREATE = "session_create"
    SESSION_DELETE = "session_delete"
    ERROR = "error"

class AuditEvent:
    """Individual audit event"""
    def __init__(self, event_type: AuditEventType, user_id: str, details: Dict[str, Any]):
        self.id = str(uuid.uuid4())
        self.event_type = event_type
        self.user_id = user_id
        self.timestamp = datetime.now()
        self.details = details
        self.session_id = details.get('session_id')
        self.ip_address = details.get('ip_address')

class AuditService:
    """Comprehensive audit logging service for DataVibe"""
    
    def __init__(self):
        # In-memory storage for audit logs (cloud-only compliance)
        self._audit_logs: List[AuditEvent] = []
        self._max_logs = 10000  # Limit to prevent memory issues
    
    def log_event(self, event_type: AuditEventType, user_id: str, details: Dict[str, Any]) -> str:
        """Log an audit event"""
        try:
            event = AuditEvent(event_type, user_id, details)
            self._audit_logs.append(event)
            
            # Maintain log size limit
            if len(self._audit_logs) > self._max_logs:
                self._audit_logs = self._audit_logs[-self._max_logs:]
            
            logger.info(f"Audit log: {event_type} by user {user_id} at {event.timestamp}")
            return event.id
            
        except Exception as e:
            logger.error(f"Failed to log audit event: {str(e)}")
            return ""
    
    def log_login(self, user_id: str, user_email: str, ip_address: str = None) -> str:
        """Log user login event"""
        return self.log_event(AuditEventType.LOGIN, user_id, {
            "user_email": user_email,
            "ip_address": ip_address,
            "timestamp": datetime.now().isoformat()
        })
    
    def log_logout(self, user_id: str, user_email: str, ip_address: str = None) -> str:
        """Log user logout event"""
        return self.log_event(AuditEventType.LOGOUT, user_id, {
            "user_email": user_email,
            "ip_address": ip_address,
            "timestamp": datetime.now().isoformat()
        })
    
    def log_database_connection(self, user_id: str, session_id: str, provider: str, 
                               success: bool, error_message: str = None) -> str:
        """Log database connection attempt"""
        return self.log_event(AuditEventType.DATABASE_CONNECTION, user_id, {
            "session_id": session_id,
            "provider": provider,
            "success": success,
            "error_message": error_message,
            "timestamp": datetime.now().isoformat()
        })
    
    def log_query_preview(self, user_id: str, session_id: str, natural_language: str,
                         generated_sql: str, confidence: float) -> str:
        """Log query preview generation"""
        return self.log_event(AuditEventType.QUERY_PREVIEW, user_id, {
            "session_id": session_id,
            "natural_language": natural_language,
            "generated_sql": generated_sql,
            "confidence": confidence,
            "timestamp": datetime.now().isoformat()
        })
    
    def log_query_execution(self, user_id: str, session_id: str, sql_query: str,
                           row_count: int, success: bool, error_message: str = None) -> str:
        """Log query execution"""
        return self.log_event(AuditEventType.QUERY_EXECUTION, user_id, {
            "session_id": session_id,
            "sql_query": sql_query,
            "row_count": row_count,
            "success": success,
            "error_message": error_message,
            "timestamp": datetime.now().isoformat()
        })
    
    def log_schema_proposal(self, user_id: str, session_id: str, proposal_id: str,
                           natural_language: str, migration_sql: str, environment: str) -> str:
        """Log schema change proposal"""
        return self.log_event(AuditEventType.SCHEMA_PROPOSAL, user_id, {
            "session_id": session_id,
            "proposal_id": proposal_id,
            "natural_language": natural_language,
            "migration_sql": migration_sql,
            "environment": environment,
            "timestamp": datetime.now().isoformat()
        })
    
    def log_schema_approval(self, admin_user_id: str, proposal_id: str, 
                           original_user_id: str, executed: bool) -> str:
        """Log schema proposal approval"""
        return self.log_event(AuditEventType.SCHEMA_APPROVAL, admin_user_id, {
            "proposal_id": proposal_id,
            "original_user_id": original_user_id,
            "executed": executed,
            "timestamp": datetime.now().isoformat()
        })
    
    def log_schema_rejection(self, admin_user_id: str, proposal_id: str,
                            original_user_id: str, reason: str) -> str:
        """Log schema proposal rejection"""
        return self.log_event(AuditEventType.SCHEMA_REJECTION, admin_user_id, {
            "proposal_id": proposal_id,
            "original_user_id": original_user_id,
            "reason": reason,
            "timestamp": datetime.now().isoformat()
        })
    
    def log_schema_execution(self, user_id: str, proposal_id: str, migration_sql: str,
                            success: bool, error_message: str = None) -> str:
        """Log schema migration execution"""
        return self.log_event(AuditEventType.SCHEMA_EXECUTION, user_id, {
            "proposal_id": proposal_id,
            "migration_sql": migration_sql,
            "success": success,
            "error_message": error_message,
            "timestamp": datetime.now().isoformat()
        })
    
    def log_session_create(self, user_id: str, session_id: str, provider: str) -> str:
        """Log session creation"""
        return self.log_event(AuditEventType.SESSION_CREATE, user_id, {
            "session_id": session_id,
            "provider": provider,
            "timestamp": datetime.now().isoformat()
        })
    
    def log_session_delete(self, user_id: str, session_id: str) -> str:
        """Log session deletion"""
        return self.log_event(AuditEventType.SESSION_DELETE, user_id, {
            "session_id": session_id,
            "timestamp": datetime.now().isoformat()
        })
    
    def log_error(self, user_id: str, error_type: str, error_message: str,
                  session_id: str = None, additional_context: Dict[str, Any] = None) -> str:
        """Log error event"""
        details = {
            "error_type": error_type,
            "error_message": error_message,
            "timestamp": datetime.now().isoformat()
        }
        
        if session_id:
            details["session_id"] = session_id
        
        if additional_context:
            details.update(additional_context)
        
        return self.log_event(AuditEventType.ERROR, user_id, details)
    
    def get_user_audit_logs(self, user_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Get audit logs for a specific user"""
        user_logs = [event for event in self._audit_logs if event.user_id == user_id]
        user_logs.sort(key=lambda x: x.timestamp, reverse=True)
        
        return [self._event_to_dict(event) for event in user_logs[:limit]]
    
    def get_all_audit_logs(self, limit: int = 100, 
                          event_type: AuditEventType = None) -> List[Dict[str, Any]]:
        """Get all audit logs (admin only)"""
        logs = self._audit_logs
        
        if event_type:
            logs = [event for event in logs if event.event_type == event_type]
        
        logs.sort(key=lambda x: x.timestamp, reverse=True)
        return [self._event_to_dict(event) for event in logs[:limit]]
    
    def get_session_audit_logs(self, session_id: str) -> List[Dict[str, Any]]:
        """Get audit logs for a specific session"""
        session_logs = [event for event in self._audit_logs 
                       if event.session_id == session_id]
        session_logs.sort(key=lambda x: x.timestamp, reverse=True)
        
        return [self._event_to_dict(event) for event in session_logs]
    
    def search_audit_logs(self, query: str, user_id: str = None, 
                         start_date: datetime = None, end_date: datetime = None,
                         limit: int = 100) -> List[Dict[str, Any]]:
        """Search audit logs with filters"""
        filtered_logs = []
        
        for event in self._audit_logs:
            # Filter by user if specified
            if user_id and event.user_id != user_id:
                continue
            
            # Filter by date range
            if start_date and event.timestamp < start_date:
                continue
            if end_date and event.timestamp > end_date:
                continue
            
            # Search in event details
            if query:
                event_text = f"{event.event_type} {str(event.details)}".lower()
                if query.lower() not in event_text:
                    continue
            
            filtered_logs.append(event)
        
        filtered_logs.sort(key=lambda x: x.timestamp, reverse=True)
        return [self._event_to_dict(event) for event in filtered_logs[:limit]]
    
    def get_audit_statistics(self) -> Dict[str, Any]:
        """Get audit log statistics"""
        stats = {
            "total_events": len(self._audit_logs),
            "events_by_type": {},
            "unique_users": set(),
            "date_range": {
                "earliest": None,
                "latest": None
            }
        }
        
        if not self._audit_logs:
            return stats
        
        # Count events by type and collect user IDs
        for event in self._audit_logs:
            event_type = event.event_type
            stats["events_by_type"][event_type] = stats["events_by_type"].get(event_type, 0) + 1
            stats["unique_users"].add(event.user_id)
        
        # Convert set to count
        stats["unique_users"] = len(stats["unique_users"])
        
        # Get date range
        timestamps = [event.timestamp for event in self._audit_logs]
        stats["date_range"]["earliest"] = min(timestamps).isoformat()
        stats["date_range"]["latest"] = max(timestamps).isoformat()
        
        return stats
    
    def _event_to_dict(self, event: AuditEvent) -> Dict[str, Any]:
        """Convert audit event to dictionary"""
        return {
            "id": event.id,
            "event_type": event.event_type,
            "user_id": event.user_id,
            "timestamp": event.timestamp.isoformat(),
            "session_id": event.session_id,
            "ip_address": event.ip_address,
            "details": event.details
        }
    
    def export_audit_logs(self, format: str = "json", 
                         user_id: str = None, 
                         start_date: datetime = None,
                         end_date: datetime = None) -> Dict[str, Any]:
        """Export audit logs in specified format"""
        # Get filtered logs
        if user_id:
            logs = self.get_user_audit_logs(user_id, limit=10000)
        else:
            logs = self.get_all_audit_logs(limit=10000)
        
        # Apply date filters
        if start_date or end_date:
            filtered_logs = []
            for log in logs:
                log_date = datetime.fromisoformat(log["timestamp"])
                if start_date and log_date < start_date:
                    continue
                if end_date and log_date > end_date:
                    continue
                filtered_logs.append(log)
            logs = filtered_logs
        
        if format == "csv":
            import csv
            import io
            
            output = io.StringIO()
            if logs:
                fieldnames = ["id", "event_type", "user_id", "timestamp", "session_id", "details"]
                writer = csv.DictWriter(output, fieldnames=fieldnames)
                writer.writeheader()
                
                for log in logs:
                    row = {k: v for k, v in log.items() if k in fieldnames}
                    row["details"] = str(row.get("details", ""))
                    writer.writerow(row)
            
            return {
                "success": True,
                "format": "csv",
                "content": output.getvalue(),
                "count": len(logs)
            }
        
        else:  # JSON format
            return {
                "success": True,
                "format": "json",
                "logs": logs,
                "count": len(logs),
                "exported_at": datetime.now().isoformat()
            }

# Global audit service instance
audit_service = AuditService()