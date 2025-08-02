from typing import Dict, Any, List, Optional
import re
import json
import asyncio
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class LLMService:
    """Real LLM service for generating SQL from natural language using OpenAI and Anthropic"""
    
    def __init__(self):
        self.openai_client = None
        self.anthropic_client = None
        
        # Initialize clients if API keys are provided
        if settings.OPENAI_API_KEY:
            self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        
        if settings.ANTHROPIC_API_KEY:
            self.anthropic_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    
    async def natural_language_to_sql(self, prompt: str, schema_info: Dict[str, Any] = None) -> Dict[str, Any]:
        """Convert natural language to SQL using real LLM"""
        try:
            # Try OpenAI first, then Anthropic, then fallback to mock
            if self.openai_client:
                return await self._openai_generate_sql(prompt, schema_info)
            elif self.anthropic_client:
                return await self._anthropic_generate_sql(prompt, schema_info)
            else:
                # Fallback to mock if no API keys provided
                logger.warning("No LLM API keys provided, falling back to mock service")
                from app.services.llm_mock import MockLLMService
                return MockLLMService.natural_language_to_sql(prompt, schema_info)
        
        except Exception as e:
            logger.error(f"LLM service error: {str(e)}")
            # Fallback to mock on error
            from app.services.llm_mock import MockLLMService
            return MockLLMService.natural_language_to_sql(prompt, schema_info)
    
    async def _openai_generate_sql(self, prompt: str, schema_info: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate SQL using OpenAI GPT"""
        system_prompt = self._build_system_prompt(schema_info)
        user_prompt = self._build_user_prompt(prompt)
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",  # Use the affordable mini model
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.1,
                max_tokens=1000
            )
            
            content = response.choices[0].message.content
            return self._parse_llm_response(content, prompt)
        
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise
    
    async def _anthropic_generate_sql(self, prompt: str, schema_info: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate SQL using Anthropic Claude"""
        system_prompt = self._build_system_prompt(schema_info)
        user_prompt = self._build_user_prompt(prompt)
        
        try:
            response = await self.anthropic_client.messages.create(
                model="claude-3-haiku-20240307",  # Use the affordable Haiku model
                max_tokens=1000,
                temperature=0.1,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": user_prompt}
                ]
            )
            
            content = response.content[0].text
            return self._parse_llm_response(content, prompt)
        
        except Exception as e:
            logger.error(f"Anthropic API error: {str(e)}")
            raise
    
    def _build_system_prompt(self, schema_info: Dict[str, Any] = None) -> str:
        """Build system prompt for SQL generation"""
        base_prompt = """You are an expert SQL query generator. Your task is to convert natural language requests into safe, efficient SQL queries.

CRITICAL SAFETY RULES:
1. ONLY generate SELECT statements - never DELETE, UPDATE, INSERT, DROP, CREATE, ALTER, or any DDL/DML
2. Always include LIMIT clauses to prevent large result sets (default LIMIT 100 unless user specifies)
3. Use parameterized queries when possible
4. Validate that queries are read-only and safe
5. If the request is unsafe or unclear, explain why and suggest alternatives

RESPONSE FORMAT:
Return a JSON object with exactly these fields:
{
    "sql": "SELECT statement here",
    "explanation": "Clear explanation of what the query does",
    "confidence": 0.85,
    "warnings": ["List of any warnings about the query"]
}
"""
        
        if schema_info and schema_info.get('tables'):
            schema_text = "\n\nAVAILABLE TABLES AND COLUMNS:\n"
            for table in schema_info['tables']:
                schema_text += f"- {table}\n"
            base_prompt += schema_text
        
        return base_prompt
    
    def _build_user_prompt(self, prompt: str) -> str:
        """Build user prompt for the LLM"""
        return f"""Convert this natural language request to a SQL SELECT query:

"{prompt}"

Remember: Only generate safe SELECT queries with appropriate LIMIT clauses. Return the response as valid JSON."""
    
    def _parse_llm_response(self, content: str, original_prompt: str) -> Dict[str, Any]:
        """Parse LLM response and extract SQL, explanation, and metadata"""
        try:
            # Try to parse as JSON first
            if content.strip().startswith('{'):
                data = json.loads(content)
                return {
                    "success": True,
                    "sql": data.get("sql", ""),
                    "explanation": data.get("explanation", "Generated SQL query from natural language."),
                    "confidence": data.get("confidence", 0.85),
                    "warnings": data.get("warnings", [])
                }
            
            # Fallback: extract SQL from response
            sql_match = re.search(r'```sql\n(.*?)\n```', content, re.DOTALL)
            if sql_match:
                sql = sql_match.group(1).strip()
            else:
                # Look for SELECT statements
                select_match = re.search(r'(SELECT.*?;?)', content, re.DOTALL | re.IGNORECASE)
                sql = select_match.group(1).strip() if select_match else ""
            
            # Validate SQL is safe
            warnings = self._validate_sql_safety(sql)
            
            return {
                "success": True,
                "sql": sql,
                "explanation": f"Generated SQL query for: '{original_prompt}'",
                "confidence": 0.80,
                "warnings": warnings
            }
        
        except Exception as e:
            logger.error(f"Failed to parse LLM response: {str(e)}")
            return {
                "success": False,
                "sql": "",
                "explanation": f"Failed to generate SQL: {str(e)}",
                "confidence": 0.0,
                "warnings": ["Failed to parse LLM response"]
            }
    
    def _validate_sql_safety(self, sql: str) -> List[str]:
        """Validate SQL query safety and return warnings"""
        warnings = []
        sql_upper = sql.upper()
        
        # Check for dangerous operations
        dangerous_keywords = ['DELETE', 'UPDATE', 'INSERT', 'DROP', 'CREATE', 'ALTER', 'TRUNCATE']
        for keyword in dangerous_keywords:
            if keyword in sql_upper:
                warnings.append(f"Dangerous operation detected: {keyword}")
        
        # Check for missing LIMIT
        if 'LIMIT' not in sql_upper and 'COUNT(' not in sql_upper:
            warnings.append("Query doesn't have a LIMIT clause - results might be large")
        
        # Check for SELECT *
        if 'SELECT *' in sql_upper:
            warnings.append("Query selects all columns - consider specifying only needed columns")
        
        # Check for expensive operations
        if 'ORDER BY' in sql_upper and 'LIMIT' not in sql_upper:
            warnings.append("Sorting without LIMIT can be expensive on large tables")
        
        return warnings
    
    async def explain_results(self, data: List[Dict], query: str, prompt: str) -> str:
        """Generate explanation for query results using LLM"""
        row_count = len(data)
        
        if row_count == 0:
            return "No data was found matching your criteria."
        
        # For larger result sets, use LLM to generate better explanations
        if self.openai_client or self.anthropic_client:
            try:
                explanation_prompt = f"""
Explain these query results in simple terms:
- Original question: "{prompt}"
- SQL query: {query}
- Number of results: {row_count}
- Sample data (first few rows): {str(data[:3]) if data else "No data"}

Provide a brief, user-friendly summary of what the results show.
"""
                
                if self.openai_client:
                    response = await self.openai_client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=[{"role": "user", "content": explanation_prompt}],
                        temperature=0.3,
                        max_tokens=200
                    )
                    return response.choices[0].message.content.strip()
                
                elif self.anthropic_client:
                    response = await self.anthropic_client.messages.create(
                        model="claude-3-haiku-20240307",
                        max_tokens=200,
                        temperature=0.3,
                        messages=[{"role": "user", "content": explanation_prompt}]
                    )
                    return response.content[0].text.strip()
            
            except Exception as e:
                logger.error(f"Failed to generate result explanation: {str(e)}")
        
        # Fallback explanation
        if row_count == 1:
            return f"Found 1 record that matches your request: '{prompt}'"
        else:
            return f"Found {row_count} records that match your request: '{prompt}'. The data shows the relevant information from your database."
    
    async def suggest_followup_questions(self, data: List[Dict], original_prompt: str) -> List[str]:
        """Suggest follow-up questions based on results using LLM"""
        if not (self.openai_client or self.anthropic_client) or not data:
            # Fallback to simple suggestions
            return self._fallback_suggestions(original_prompt)
        
        try:
            columns = list(data[0].keys()) if data else []
            suggestion_prompt = f"""
Based on this database query and results, suggest 3 good follow-up questions:
- Original question: "{original_prompt}"
- Result columns: {columns}
- Number of results: {len(data)}

Suggest specific, actionable follow-up questions that would provide additional insights.
Return as a simple list, one question per line.
"""
            
            if self.openai_client:
                response = await self.openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": suggestion_prompt}],
                    temperature=0.5,
                    max_tokens=150
                )
                suggestions = response.choices[0].message.content.strip().split('\n')
            
            elif self.anthropic_client:
                response = await self.anthropic_client.messages.create(
                    model="claude-3-haiku-20240307",
                    max_tokens=150,
                    temperature=0.5,
                    messages=[{"role": "user", "content": suggestion_prompt}]
                )
                suggestions = response.content[0].text.strip().split('\n')
            
            # Clean up suggestions
            suggestions = [s.strip('- ').strip() for s in suggestions if s.strip()]
            return suggestions[:3]
        
        except Exception as e:
            logger.error(f"Failed to generate follow-up suggestions: {str(e)}")
            return self._fallback_suggestions(original_prompt)
    
    def _fallback_suggestions(self, original_prompt: str) -> List[str]:
        """Fallback suggestions when LLM is not available"""
        prompt_lower = original_prompt.lower()
        
        if 'customer' in prompt_lower:
            return [
                "Show me the orders for these customers",
                "What cities do these customers come from?",
                "Which customers have the highest order totals?"
            ]
        elif 'order' in prompt_lower:
            return [
                "Show me the customer details for these orders",
                "What products were ordered?",
                "Group these orders by month"
            ]
        elif 'product' in prompt_lower:
            return [
                "Which customers bought these products?",
                "Show me sales data for these products",
                "What categories do these products belong to?"
            ]
        else:
            return [
                "Show me the total count of records",
                "Filter this data by a specific criteria",
                "Group this data by a common field"
            ]

# Global instance
llm_service = LLMService()