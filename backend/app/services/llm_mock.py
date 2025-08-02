from typing import Dict, Any, List
import re
import random

class MockLLMService:
    """Mock LLM service for generating SQL from natural language"""
    
    @staticmethod
    def natural_language_to_sql(prompt: str, schema_info: Dict[str, Any] = None) -> Dict[str, Any]:
        """Convert natural language to SQL with mock responses"""
        
        # Extract key patterns from the prompt
        prompt_lower = prompt.lower()
        
        # Mock SQL generation based on common patterns
        if 'customer' in prompt_lower:
            sql = MockLLMService._generate_customer_query(prompt_lower)
        elif 'order' in prompt_lower:
            sql = MockLLMService._generate_order_query(prompt_lower)
        elif 'product' in prompt_lower:
            sql = MockLLMService._generate_product_query(prompt_lower)
        elif 'count' in prompt_lower or 'how many' in prompt_lower:
            sql = MockLLMService._generate_count_query(prompt_lower)
        else:
            sql = "SELECT 'Hello from DataVibe!' as message, NOW() as timestamp"
        
        explanation = MockLLMService._generate_explanation(prompt, sql)
        
        return {
            "success": True,
            "sql": sql,
            "explanation": explanation,
            "confidence": random.uniform(0.85, 0.95),
            "warnings": MockLLMService._generate_warnings(sql)
        }
    
    @staticmethod
    def _generate_customer_query(prompt: str) -> str:
        """Generate customer-related queries"""
        if 'germany' in prompt or 'german' in prompt:
            return "SELECT * FROM customers WHERE country = 'Germany' ORDER BY customer_name LIMIT 20"
        elif 'all' in prompt:
            return "SELECT customer_id, customer_name, city, country FROM customers ORDER BY customer_name LIMIT 50"
        else:
            return "SELECT * FROM customers LIMIT 10"
    
    @staticmethod
    def _generate_order_query(prompt: str) -> str:
        """Generate order-related queries"""
        if 'recent' in prompt or 'latest' in prompt:
            return "SELECT order_id, customer_id, order_date, total_amount FROM orders ORDER BY order_date DESC LIMIT 20"
        elif 'total' in prompt or 'sum' in prompt:
            return "SELECT COUNT(*) as total_orders, SUM(total_amount) as total_revenue FROM orders"
        else:
            return "SELECT * FROM orders LIMIT 10"
    
    @staticmethod
    def _generate_product_query(prompt: str) -> str:
        """Generate product-related queries"""
        if 'expensive' in prompt or 'price' in prompt:
            return "SELECT product_name, price FROM products ORDER BY price DESC LIMIT 10"
        elif 'category' in prompt:
            return "SELECT category, COUNT(*) as product_count FROM products GROUP BY category"
        else:
            return "SELECT * FROM products LIMIT 10"
    
    @staticmethod
    def _generate_count_query(prompt: str) -> str:
        """Generate count queries"""
        if 'customer' in prompt:
            return "SELECT COUNT(*) as total_customers FROM customers"
        elif 'order' in prompt:
            return "SELECT COUNT(*) as total_orders FROM orders"
        elif 'product' in prompt:
            return "SELECT COUNT(*) as total_products FROM products"
        else:
            return "SELECT COUNT(*) as total_records FROM information_schema.tables WHERE table_schema = 'public'"
    
    @staticmethod
    def _generate_explanation(prompt: str, sql: str) -> str:
        """Generate explanation for the SQL query"""
        explanations = [
            f"I interpreted your request '{prompt}' and generated a SQL query that retrieves the relevant data.",
            f"Based on your question '{prompt}', this query will fetch the information you're looking for.",
            f"This SQL statement addresses your request: '{prompt}' by selecting the appropriate data from the database.",
        ]
        
        return random.choice(explanations)
    
    @staticmethod
    def _generate_warnings(sql: str) -> List[str]:
        """Generate warnings for potentially problematic queries"""
        warnings = []
        
        if 'LIMIT' not in sql.upper():
            warnings.append("Query doesn't have a LIMIT clause - results might be large")
        
        if '*' in sql:
            warnings.append("Query selects all columns - consider specifying only needed columns")
        
        if 'ORDER BY' in sql.upper() and 'LIMIT' not in sql.upper():
            warnings.append("Sorting without LIMIT can be expensive on large tables")
        
        return warnings
    
    @staticmethod
    def explain_results(data: List[Dict], query: str, prompt: str) -> str:
        """Generate explanation for query results"""
        row_count = len(data)
        
        if row_count == 0:
            return "No data was found matching your criteria."
        elif row_count == 1:
            return f"Found 1 record that matches your request: '{prompt}'"
        else:
            return f"Found {row_count} records that match your request: '{prompt}'. The data shows the relevant information from your database."
    
    @staticmethod
    def suggest_followup_questions(data: List[Dict], original_prompt: str) -> List[str]:
        """Suggest follow-up questions based on results"""
        suggestions = []
        
        if 'customer' in original_prompt.lower():
            suggestions.extend([
                "Show me the orders for these customers",
                "What cities do these customers come from?",
                "Which customers have the highest order totals?"
            ])
        elif 'order' in original_prompt.lower():
            suggestions.extend([
                "Show me the customer details for these orders",
                "What products were ordered?",
                "Group these orders by month"
            ])
        elif 'product' in original_prompt.lower():
            suggestions.extend([
                "Which customers bought these products?",
                "Show me sales data for these products",
                "What categories do these products belong to?"
            ])
        
        return suggestions[:3]  # Return max 3 suggestions