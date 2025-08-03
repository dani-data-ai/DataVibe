# DataVibe - User Guide & Tutorials

## 🚀 Getting Started with DataVibe

DataVibe is an AI-powered database assistant that lets you interact with your databases using natural language. This guide will walk you through every feature step-by-step.

---

## 📋 Table of Contents

1. [Initial Setup](#initial-setup)
2. [Tutorial 1: User Authentication](#tutorial-1-user-authentication)
3. [Tutorial 2: Connecting to Your Database](#tutorial-2-connecting-to-your-database)
4. [Tutorial 3: Natural Language Querying](#tutorial-3-natural-language-querying)
5. [Tutorial 4: Schema Management](#tutorial-4-schema-management)
6. [Tutorial 5: Admin Features](#tutorial-5-admin-features)
7. [Best Practices & Tips](#best-practices--tips)
8. [Troubleshooting](#troubleshooting)

---

## Initial Setup

### Prerequisites
- A cloud database (Neon, Supabase, PlanetScale, or other PostgreSQL/MySQL)
- Database connection string
- Web browser
- Internet connection

### Supported Database Providers
- **Neon** (PostgreSQL) - Free tier available
- **Supabase** (PostgreSQL) - Free tier available  
- **PlanetScale** (MySQL) - Free tier available
- **AWS RDS** (PostgreSQL/MySQL)
- **Google Cloud SQL** (PostgreSQL/MySQL)
- **Azure Database** (PostgreSQL/MySQL)

---

## Tutorial 1: User Authentication

### Step 1: Access the Application
1. Open your web browser
2. Navigate to the DataVibe application URL
3. You'll see the main landing page with authentication required

### Step 2: Sign Up for a New Account
1. Click the **"Sign In"** button in the top-right corner
2. In the authentication modal, click **"Sign Up"**
3. Fill in your details:
   - **Email**: Your email address
   - **Password**: Choose a strong password (min 8 characters)
   - **Confirm Password**: Re-enter your password
4. Click **"Create Account"**
5. Check your email for a verification link and click it

### Step 3: Sign In to Existing Account
1. Click the **"Sign In"** button
2. Enter your email and password
3. Click **"Sign In"**
4. You'll be redirected to the main application

### Step 4: Password Reset (if needed)
1. On the sign-in modal, click **"Forgot Password?"**
2. Enter your email address
3. Click **"Send Reset Link"**
4. Check your email and follow the reset instructions

---

## Tutorial 2: Connecting to Your Database

### Step 1: Prepare Your Database Connection
Before connecting, gather your database information:
- **Host/Server**: Database server address
- **Port**: Database port (usually 5432 for PostgreSQL, 3306 for MySQL)
- **Database Name**: The specific database you want to query
- **Username**: Database username
- **Password**: Database password

### Step 2: Connect Using Connection String
1. After signing in, you'll see the **"Connect to Database"** card
2. Click in the connection string field
3. Enter your connection string in one of these formats:

**PostgreSQL (Neon/Supabase):**
```
postgresql://username:password@host:port/database
```

**MySQL (PlanetScale):**
```
mysql://username:password@host:port/database
```

### Step 3: Test and Save Connection
1. Click **"Test Connection"** to verify your credentials
2. If successful, you'll see a green checkmark
3. Click **"Connect"** to establish the session
4. Your connection will be encrypted and stored for the session

### Step 4: Connection Examples

**Example: Neon Database**
```
postgresql://alex:AbC123dEf@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb
```

**Example: Supabase Database**
```
postgresql://postgres:your-password@db.abcdefghijklmnop.supabase.co:5432/postgres
```

**Example: PlanetScale Database**
```
mysql://username:pscale_pw_password@aws.connect.psdb.cloud/database-name?sslaccept=strict
```

---

## Tutorial 3: Natural Language Querying

### Step 1: Understanding the Query Interface
Once connected, you'll see the query interface with:
- **Natural Language Input**: Large text area for your questions
- **Template Suggestions**: Pre-built query examples
- **Query Type Toggle**: Switch between natural language and SQL

### Step 2: Ask Your First Question
1. In the query input field, type a natural language question:
   ```
   Show me all customers from Germany
   ```
2. Click **"Generate SQL"** or press Enter
3. Wait for the AI to process your request

### Step 3: Review the Generated SQL
1. The AI will show you:
   - **Generated SQL Query**: The actual SQL code
   - **Explanation**: What the query does
   - **Confidence Score**: How confident the AI is
   - **Warnings**: Any potential issues

Example output:
```sql
SELECT * FROM customers 
WHERE country = 'Germany'
ORDER BY customer_name;
```

### Step 4: Execute the Query
1. Review the generated SQL carefully
2. You can edit the SQL if needed
3. Click **"Execute Query"** to run it
4. Results will appear in a formatted table

### Step 5: Working with Results
The results interface provides:
- **Table View**: Formatted data table
- **Card View**: Individual record cards
- **JSON View**: Raw JSON data
- **Export Options**: Download as CSV or JSON
- **Pagination**: Navigate through large result sets
- **Sorting**: Click column headers to sort
- **Filtering**: Search within results

### Step 6: Example Queries to Try

**Basic Data Retrieval:**
```
Show me the top 10 highest-paid employees
How many orders were placed last month?
List all products with low inventory
```

**Analytics Queries:**
```
What's the average order value by customer segment?
Show sales trends for the last 6 months
Which products are selling best this quarter?
```

**Complex Queries:**
```
Find customers who haven't placed an order in the last 90 days
Show the top 5 customers by total purchase amount
List all orders with their customer details from last week
```

---

## Tutorial 4: Schema Management

### Step 1: Access Schema Management
1. Click **"Schema"** in the navigation menu
2. You'll see the Schema Management interface
3. Ensure you have an active database connection

### Step 2: Create a Schema Proposal
1. Click **"Create Proposal"** button
2. Choose your target environment:
   - **Development**: Changes apply immediately
   - **Production**: Requires admin approval

### Step 3: Describe Your Schema Change
1. In the description field, explain what you want to change:
   ```
   Add a new column 'email' to the customers table
   ```
2. Use the **Templates** button for common schema changes:
   - Add new table
   - Add column
   - Create index
   - Add foreign key

### Step 4: Review the Generated Migration
1. The AI will generate:
   - **Migration SQL**: The DDL statements
   - **Explanation**: What the changes will do
   - **Warnings**: Potential risks or considerations
   - **Rollback SQL**: How to undo the changes

### Step 5: Submit the Proposal
1. Review all details carefully
2. Click **"Create Proposal"**
3. Note the Proposal ID for tracking
4. For production changes, wait for admin approval

### Step 6: Track Proposal Status
1. Go to **"View Proposals"** tab
2. See all your proposals with status:
   - **Pending**: Waiting for approval
   - **Approved**: Ready for execution
   - **Rejected**: Not approved (with reason)
   - **Executed**: Successfully applied

---

## Tutorial 5: Admin Features

*Note: Admin features are only available to users with admin role.*

### Step 1: Access Admin Dashboard
1. Click **"Admin"** in the navigation menu
2. You'll see the admin dashboard with system overview

### Step 2: Monitor System Activity
The overview dashboard shows:
- **Total Users**: Number of registered users
- **Active Sessions**: Current database connections
- **Total Queries**: Queries executed
- **Schema Proposals**: Total proposals created
- **Pending Approvals**: Proposals waiting for review

### Step 3: Review Schema Proposals
1. Click **"Schema Management"** or go to `/schema`
2. As an admin, you can see all proposals from all users
3. Click on any proposal to review details

### Step 4: Approve/Reject Proposals
1. Open a pending proposal
2. Review the migration SQL and explanation
3. Click **"Approve"** to approve the change
4. Click **"Reject"** to reject (provide a reason)
5. For immediate execution, use **"Execute Now"**

### Step 5: Monitor Audit Logs
1. In the admin dashboard, click **"Audit Logs"** tab
2. View all system activity:
   - User logins/logouts
   - Query executions
   - Schema proposals
   - Connection events

### Step 6: Export Audit Data
1. Use the search and filter options to find specific events
2. Click **"Export CSV"** to download audit logs
3. Use this for compliance and monitoring

---

## Best Practices & Tips

### 🔒 Security Best Practices
1. **Use Read-Only Credentials**: For production databases, use read-only database users
2. **Review Generated SQL**: Always check SQL before execution
3. **Test in Development**: Try schema changes in dev environment first
4. **Monitor Audit Logs**: Regularly review system activity

### 🎯 Query Writing Tips
1. **Be Specific**: "Show customers from Germany" vs "Show customers"
2. **Use Table Names**: "Show orders from the orders table"
3. **Specify Time Ranges**: "Orders from last month" vs "recent orders"
4. **Include Limits**: "Top 10 products" instead of "best products"

### 📊 Result Management
1. **Use Filters**: Filter large result sets for better performance
2. **Export Data**: Download results for further analysis
3. **Save Queries**: Note successful query patterns for reuse

### 🏗️ Schema Management
1. **Plan Changes**: Think through schema modifications carefully
2. **Use Descriptive Names**: Clear column and table names
3. **Test Thoroughly**: Validate changes in development first
4. **Document Changes**: Provide clear descriptions in proposals

---

## Troubleshooting

### Connection Issues

**Problem**: "Connection failed" error
**Solutions**:
1. **Check Connection String Format**: Ensure your connection string matches the provider format exactly
2. **Verify Credentials**: Double-check username, password, host, and database name
3. **Test Provider Access**: Try connecting from the provider's web interface first
4. **Check SSL Requirements**: Most cloud providers require SSL connections
5. **Firewall/Network**: Ensure your network allows outbound connections to the database host

**Problem**: Supabase Connection Issues
**Common Solutions**:
1. **Use the correct format**: `postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres`
2. **Check project settings**: Go to Supabase → Settings → Database for connection details
3. **Verify password**: Reset database password if needed in Supabase dashboard
4. **Enable SSL**: Supabase requires SSL connections - this is handled automatically
5. **Check IP restrictions**: Ensure your IP is allowed (Supabase free tier allows all IPs by default)

**Problem**: "Database not found" error
**Solutions**:
1. For Supabase: Use `postgres` as database name (default)
2. For Neon: Use the database name from your Neon dashboard
3. For PlanetScale: Use the database name from your PlanetScale dashboard
4. Check the exact database name in your provider's console

**Problem**: "Authentication failed" error
**Solutions**:
1. **Reset Password**: Use your provider's dashboard to reset the database password
2. **Check Username**: 
   - Supabase: Usually `postgres`
   - Neon: Your chosen username
   - PlanetScale: Your created username
3. **Special Characters**: If password contains special characters, ensure they're URL-encoded
4. **Copy-Paste**: Copy connection string directly from provider to avoid typos

**Problem**: "Connection timeout" error
**Solutions**:
1. **Network Issues**: Check your internet connection
2. **Provider Status**: Check if your database provider is experiencing outages
3. **Database Sleep**: Some free-tier databases sleep after inactivity - wake them up first
4. **Retry**: Sometimes temporary network issues resolve themselves

**Step-by-Step Supabase Troubleshooting**:
1. Go to your Supabase project dashboard
2. Navigate to Settings → Database
3. Copy the connection string under "Connection string"
4. Replace `[YOUR-PASSWORD]` with your actual database password
5. If you don't know the password, reset it: Settings → Database → Reset database password
6. Test the connection string in DataVibe

**Example Working Connection Strings**:

**Supabase**:
```
postgresql://postgres:your_actual_password@db.abcdefghijklmnop.supabase.co:5432/postgres
```

**Neon**:
```
postgresql://username:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb
```

**PlanetScale**:
```
mysql://username:pscale_pw_XXXXXX@aws.connect.psdb.cloud/database-name?sslaccept=strict
```

### Query Issues

**Problem**: "No SQL generated" or low confidence
**Solutions**:
1. Be more specific in your query description
2. Include table names in your question
3. Try using query templates as starting points
4. Check that your database schema is accessible

**Problem**: Query returns no results
**Solutions**:
1. Verify data exists in the tables
2. Check filter conditions in the generated SQL
3. Try a simpler query first
4. Review table structure and data types

### Schema Management Issues

**Problem**: Schema proposal rejected
**Solutions**:
1. Review the rejection reason provided
2. Modify your proposal based on feedback
3. Test the change in development environment first
4. Consult with your database administrator

### Authentication Issues

**Problem**: Can't sign in
**Solutions**:
1. Check email and password
2. Use password reset if needed
3. Clear browser cache and cookies
4. Try a different browser

**Problem**: Email verification not received
**Solutions**:
1. Check spam/junk folder
2. Wait a few minutes and try again
3. Ensure email address is correct
4. Contact support if issues persist

---

## 📞 Support & Resources

### Getting Help
- Check this guide first for common issues
- Review error messages carefully
- Try with a simpler query or connection
- Document steps to reproduce issues

### Best Practices Summary
1. ✅ Always test connections before important queries
2. ✅ Review generated SQL before execution
3. ✅ Use development environment for schema changes
4. ✅ Keep audit logs for compliance
5. ✅ Use descriptive names and clear documentation

---

## 🎉 You're Ready to Use DataVibe!

You now have all the knowledge needed to effectively use DataVibe for:
- ✅ Natural language database querying
- ✅ Safe schema management
- ✅ System administration and monitoring
- ✅ Audit logging and compliance

Start with simple queries and gradually explore more advanced features as you become comfortable with the interface.

Happy querying! 🚀