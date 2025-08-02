from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid
import logging
from app.services.llm_service import llm_service
from app.services.database_cloud import CloudDatabaseService

logger = logging.getLogger(__name__)

class SchemaProposal:
    """In-memory schema proposal for cloud-only architecture"""
    def __init__(self, id: str, user_id: str, session_id: str, natural_language: str, 
                 migration_sql: str, explanation: str, environment: str = "development"):
        self.id = id
        self.user_id = user_id
        self.session_id = session_id
        self.natural_language = natural_language
        self.migration_sql = migration_sql
        self.explanation = explanation
        self.environment = environment
        self.status = "pending"  # pending, approved, rejected, executed
        self.created_at = datetime.now()
        self.approved_by = None
        self.approved_at = None
        self.executed_at = None
        self.warnings = []
        self.rollback_sql = None

class SchemaService:
    """Service for handling schema changes with approval workflow"""
    
    def __init__(self):
        # In-memory storage for proposals (no local persistence)
        self._proposals: Dict[str, SchemaProposal] = {}
    
    async def propose_schema_change(self, user_id: str, session_id: str, 
                                   natural_language: str, connection_string: str,
                                   environment: str = "development") -> Dict[str, Any]:
        """Create a schema change proposal with LLM-generated migration SQL"""
        try:
            # Get current schema info for context
            schema_result = CloudDatabaseService.get_schema_info(connection_string)
            schema_info = schema_result if schema_result["success"] else None
            
            # Generate migration SQL using LLM
            migration_result = await self._generate_migration_sql(
                natural_language, schema_info, environment
            )
            
            if not migration_result["success"]:
                return {
                    "success": False,
                    "message": migration_result["message"]
                }
            
            # Create proposal
            proposal_id = str(uuid.uuid4())
            proposal = SchemaProposal(
                id=proposal_id,
                user_id=user_id,
                session_id=session_id,
                natural_language=natural_language,
                migration_sql=migration_result["sql"],
                explanation=migration_result["explanation"],
                environment=environment
            )
            proposal.warnings = migration_result["warnings"]
            proposal.rollback_sql = migration_result.get("rollback_sql")
            
            # Store proposal
            self._proposals[proposal_id] = proposal
            
            return {
                "success": True,
                "proposal_id": proposal_id,
                "migration_sql": proposal.migration_sql,
                "explanation": proposal.explanation,
                "warnings": proposal.warnings,
                "environment": proposal.environment,
                "status": proposal.status,
                "requires_approval": environment == "production"
            }
            
        except Exception as e:
            logger.error(f"Schema proposal error: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to create schema proposal: {str(e)}"
            }
    
    async def _generate_migration_sql(self, natural_language: str, 
                                     schema_info: Dict[str, Any], 
                                     environment: str) -> Dict[str, Any]:
        """Generate migration SQL using LLM"""
        
        system_prompt = f"""You are an expert database migration generator. Convert natural language schema change requests into safe SQL DDL statements.

CRITICAL SAFETY RULES:
1. Only generate safe DDL operations: CREATE TABLE, ALTER TABLE (ADD COLUMN), CREATE INDEX, CREATE VIEW
2. NEVER generate DROP, DELETE, TRUNCATE, or destructive operations
3. Always include IF NOT EXISTS or IF EXISTS checks where appropriate
4. For production environment, be extra conservative
5. Include rollback SQL when possible

ENVIRONMENT: {environment}

RESPONSE FORMAT:
Return a JSON object with exactly these fields:
{{
    "success": true,
    "sql": "DDL statement here",
    "explanation": "Clear explanation of what the migration does",
    "warnings": ["List of any warnings"],
    "rollback_sql": "SQL to undo the change if possible"
}}

AVAILABLE SCHEMA:
{schema_info if schema_info else "No schema information available"}
"""
        
        user_prompt = f"""Generate a safe database migration for this request:

"{natural_language}"

Environment: {environment}
Requirements:
- Use safe DDL operations only
- Include proper checks (IF NOT EXISTS, etc.)
- Provide rollback SQL if possible
- Be extra careful for production environment

Return as valid JSON with the required fields."""
        
        try:
            if llm_service.openai_client:
                response = await llm_service.openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.1,
                    max_tokens=1000
                )
                content = response.choices[0].message.content
            
            elif llm_service.anthropic_client:
                response = await llm_service.anthropic_client.messages.create(
                    model="claude-3-haiku-20240307",
                    max_tokens=1000,
                    temperature=0.1,
                    system=system_prompt,
                    messages=[{"role": "user", "content": user_prompt}]
                )
                content = response.content[0].text
            
            else:
                # Fallback to simple migration generation
                return self._generate_simple_migration(natural_language, environment)
            
            # Parse LLM response
            import json
            try:
                result = json.loads(content)
                return result
            except json.JSONDecodeError:
                logger.error(f"Failed to parse LLM migration response: {content}")
                return self._generate_simple_migration(natural_language, environment)
        
        except Exception as e:
            logger.error(f"LLM migration generation error: {str(e)}")
            return self._generate_simple_migration(natural_language, environment)
    
    def _generate_simple_migration(self, natural_language: str, environment: str) -> Dict[str, Any]:
        """Fallback simple migration generation"""
        prompt_lower = natural_language.lower()
        
        warnings = ["Generated using simple pattern matching - review carefully"]
        if environment == "production":
            warnings.append("Production environment - requires admin approval")
        
        if "add column" in prompt_lower or "new column" in prompt_lower:
            return {
                "success": True,
                "sql": "-- ALTER TABLE example_table ADD COLUMN new_column VARCHAR(255);",
                "explanation": f"This would add a new column based on: '{natural_language}'. Please review and modify the SQL as needed.",
                "warnings": warnings,
                "rollback_sql": "-- ALTER TABLE example_table DROP COLUMN new_column;"
            }
        elif "create table" in prompt_lower or "new table" in prompt_lower:
            return {
                "success": True,
                "sql": "-- CREATE TABLE IF NOT EXISTS new_table (id SERIAL PRIMARY KEY, name VARCHAR(255));",
                "explanation": f"This would create a new table based on: '{natural_language}'. Please review and modify the SQL as needed.",
                "warnings": warnings,
                "rollback_sql": "-- DROP TABLE IF EXISTS new_table;"
            }
        elif "create index" in prompt_lower or "add index" in prompt_lower:
            return {
                "success": True,
                "sql": "-- CREATE INDEX IF NOT EXISTS idx_example ON table_name (column_name);",
                "explanation": f"This would create an index based on: '{natural_language}'. Please review and modify the SQL as needed.",
                "warnings": warnings,
                "rollback_sql": "-- DROP INDEX IF EXISTS idx_example;"
            }
        else:
            return {
                "success": False,
                "message": "Unable to generate migration SQL for this request. Please provide more specific instructions."
            }
    
    def get_user_proposals(self, user_id: str) -> List[Dict[str, Any]]:
        """Get proposals for a specific user"""
        user_proposals = []
        for proposal in self._proposals.values():
            if proposal.user_id == user_id:
                user_proposals.append(self._proposal_to_dict(proposal))
        
        return sorted(user_proposals, key=lambda x: x["created_at"], reverse=True)
    
    def get_all_proposals(self) -> List[Dict[str, Any]]:
        """Get all proposals (admin only)"""
        all_proposals = []
        for proposal in self._proposals.values():
            all_proposals.append(self._proposal_to_dict(proposal))
        
        return sorted(all_proposals, key=lambda x: x["created_at"], reverse=True)
    
    def get_proposal(self, proposal_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific proposal"""
        proposal = self._proposals.get(proposal_id)
        return self._proposal_to_dict(proposal) if proposal else None
    
    async def approve_proposal(self, proposal_id: str, admin_user_id: str,
                              connection_string: str = None) -> Dict[str, Any]:
        """Approve and optionally execute a schema proposal"""
        proposal = self._proposals.get(proposal_id)
        if not proposal:
            return {"success": False, "message": "Proposal not found"}
        
        if proposal.status != "pending":
            return {"success": False, "message": f"Proposal is already {proposal.status}"}
        
        # Update approval status
        proposal.status = "approved"
        proposal.approved_by = admin_user_id
        proposal.approved_at = datetime.now()
        
        # For development environment or if connection provided, execute immediately
        if proposal.environment == "development" and connection_string:
            execution_result = await self._execute_migration(proposal, connection_string)
            if execution_result["success"]:
                proposal.status = "executed"
                proposal.executed_at = datetime.now()
            
            return {
                "success": True,
                "message": "Proposal approved and executed",
                "proposal_id": proposal_id,
                "execution_result": execution_result
            }
        
        return {
            "success": True,
            "message": "Proposal approved",
            "proposal_id": proposal_id,
            "status": proposal.status
        }
    
    def reject_proposal(self, proposal_id: str, admin_user_id: str, reason: str = "") -> Dict[str, Any]:
        """Reject a schema proposal"""
        proposal = self._proposals.get(proposal_id)
        if not proposal:
            return {"success": False, "message": "Proposal not found"}
        
        if proposal.status != "pending":
            return {"success": False, "message": f"Proposal is already {proposal.status}"}
        
        proposal.status = "rejected"
        proposal.approved_by = admin_user_id
        proposal.approved_at = datetime.now()
        
        return {
            "success": True,
            "message": "Proposal rejected",
            "proposal_id": proposal_id,
            "reason": reason
        }
    
    async def _execute_migration(self, proposal: SchemaProposal, connection_string: str) -> Dict[str, Any]:
        """Execute the migration SQL"""
        try:
            # Validate SQL is safe DDL
            sql_upper = proposal.migration_sql.upper().strip()
            dangerous_keywords = ['DELETE', 'UPDATE', 'DROP', 'TRUNCATE']
            
            for keyword in dangerous_keywords:
                if keyword in sql_upper and 'DROP COLUMN' not in sql_upper:
                    return {
                        "success": False,
                        "message": f"Dangerous operation detected: {keyword}"
                    }
            
            # Execute DDL using database service
            result = CloudDatabaseService.execute_ddl_query(
                connection_string,
                proposal.migration_sql
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Migration execution error: {str(e)}")
            return {
                "success": False,
                "message": f"Migration execution failed: {str(e)}"
            }
    
    def _proposal_to_dict(self, proposal: SchemaProposal) -> Dict[str, Any]:
        """Convert proposal object to dictionary"""
        return {
            "id": proposal.id,
            "user_id": proposal.user_id,
            "session_id": proposal.session_id,
            "natural_language": proposal.natural_language,
            "migration_sql": proposal.migration_sql,
            "explanation": proposal.explanation,
            "environment": proposal.environment,
            "status": proposal.status,
            "created_at": proposal.created_at.isoformat(),
            "approved_by": proposal.approved_by,
            "approved_at": proposal.approved_at.isoformat() if proposal.approved_at else None,
            "executed_at": proposal.executed_at.isoformat() if proposal.executed_at else None,
            "warnings": proposal.warnings,
            "rollback_sql": proposal.rollback_sql
        }

# Global instance
schema_service = SchemaService()