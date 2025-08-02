# DataVibe Deployment Guide

## Cloud-Only Architecture

DataVibe is designed to run entirely in cloud environments with no local dependencies.

## GitHub Codespaces Deployment (Recommended)

### Prerequisites
1. GitHub account with Codespaces access
2. Cloud database from free-tier provider (Neon, Supabase, PlanetScale)

### Setup Steps

1. **Open in Codespaces**
   ```bash
   # Codespaces will automatically provision the environment
   ```

2. **Install Dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend && npm install

   # Install backend dependencies  
   cd ../backend && pip install -r requirements.txt
   ```

3. **Start Development Servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   ```

4. **Access the Application**
   - Frontend: https://localhost-3000.preview.app.github.dev/
   - Backend API: https://localhost-8000.preview.app.github.dev/docs

### Environment Variables (Optional)

For enhanced features, set these in Codespaces secrets:

```bash
# For real LLM integration (optional)
OPENAI_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here

# For authentication (optional)  
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Alternative Cloud Deployments

### Frontend (Vercel/Netlify)
```bash
# Build command
npm run build:frontend

# Output directory  
frontend/.next
```

### Backend (Railway/Render/Fly.io)
```bash
# Start command
python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

## Database Setup

### Supported Free-Tier Providers

1. **Neon** (PostgreSQL)
   - Visit: https://neon.tech
   - Create free database
   - Get connection string: `postgresql://user:pass@host.neon.tech/db`

2. **Supabase** (PostgreSQL)  
   - Visit: https://supabase.com
   - Create project
   - Get connection string: `postgresql://postgres:pass@host.supabase.co:5432/postgres`

3. **PlanetScale** (MySQL)
   - Visit: https://planetscale.com  
   - Create database
   - Get connection string: `mysql://user:pass@host.psdb.cloud/db`

## Security Notes

- ✅ All database connections are cloud-only
- ✅ No local file persistence
- ✅ Credentials provided at runtime only
- ✅ Read-only database operations enforced
- ✅ HTTPS-only API communication

## Testing

```bash
# Run automated tests
cd backend && python -m pytest
```

## Troubleshooting

### Common Issues

1. **Port conflicts in Codespaces**
   - Frontend runs on port 3000
   - Backend runs on port 8000
   - Use Codespaces port forwarding

2. **Database connection fails**
   - Verify cloud provider connection string
   - Check firewall/IP restrictions
   - Ensure database is running

3. **API not accessible**
   - Check CORS settings in backend
   - Verify port forwarding in Codespaces
   - Check network connectivity

### Support

For issues, check:
1. GitHub Codespaces logs
2. Browser developer console  
3. Backend API docs at `/docs`
4. Database provider status pages