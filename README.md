# DataVibe - AI Database Assistant

**Transform your data questions into insights with AI-powered natural language database queries**

DataVibe is a cloud-only web application that enables users to interact with remote databases using natural language prompts, powered by large language models (LLMs). Built for GitHub Codespaces and cloud-native deployment.

## ✨ Features

- 🗣️ **Natural Language Querying** - Ask questions in plain English, get SQL and results
- ☁️ **Cloud-Only Architecture** - No local database, all remote cloud connections
- 🔒 **Production-Safe Operations** - Read-only enforcement with comprehensive safety checks
- 🛠️ **Schema Management** - AI-powered schema change proposals with approval workflows
- 🔍 **Transparent SQL Generation** - Review and edit generated SQL before execution
- 📊 **Rich Result Display** - Multiple view modes, export to CSV/JSON, pagination
- 👥 **Role-Based Access Control** - User, admin roles with appropriate permissions
- 📋 **Comprehensive Audit Logging** - Track all queries and schema changes
- 🎨 **Modern UI/UX** - Beautiful responsive interface with dark/light themes

## 🏗️ Architecture

**Cloud-Only Design:**
- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, Framer Motion
- **Backend**: FastAPI with Python, SQLAlchemy for database connections
- **Authentication**: Supabase Auth with JWT token validation
- **LLM Integration**: OpenAI GPT-4o-mini, Anthropic Claude Haiku
- **Supported Databases**: PostgreSQL, MySQL via cloud providers only
- **Deployment**: GitHub Codespaces, Vercel, cloud platforms

**Supported Cloud Database Providers:**
- 🔹 **Neon** (PostgreSQL) - Free tier available
- 🔹 **Supabase** (PostgreSQL) - Free tier available  
- 🔹 **PlanetScale** (MySQL) - Free tier available
- 🔹 **AWS RDS** (PostgreSQL/MySQL)
- 🔹 **Google Cloud SQL** (PostgreSQL/MySQL)
- 🔹 **Azure Database** (PostgreSQL/MySQL)

## 🚀 Quick Start

### Prerequisites
- GitHub Codespaces (recommended) or local Node.js 18+ and Python 3.11+
- A cloud database (Neon, Supabase, PlanetScale, etc.)
- Database connection string
- LLM API keys (OpenAI or Anthropic - optional, has fallback)

### Option 1: GitHub Codespaces (Recommended)
1. **Open in Codespaces**: Click "Code" → "Codespaces" → "Create codespace"
2. **Install dependencies**:
   ```bash
   npm run install:frontend
   npm run install:backend
   ```
3. **Set up environment** (optional for LLM features):
   ```bash
   # Backend environment variables (optional)
   cd backend
   echo "OPENAI_API_KEY=your_openai_key" > .env
   echo "ANTHROPIC_API_KEY=your_anthropic_key" >> .env
   ```
4. **Start the application**:
   ```bash
   npm run dev
   ```
5. **Access the app**: Open the forwarded port (3000) in your browser

### Option 2: Local Development
1. **Clone the repository**:
   ```bash
   git clone https://github.com/dani-data-ai/DataVibe.git
   cd DataVibe
   ```
2. **Install dependencies**:
   ```bash
   npm run install:frontend
   npm run install:backend
   ```
3. **Start development servers**:
   ```bash
   npm run dev
   ```
4. **Access the application**: http://localhost:3000

## 📖 Usage

1. **Sign Up/Sign In**: Create an account or sign in to access the application
2. **Connect Database**: Enter your cloud database connection string
3. **Ask Questions**: Use natural language to query your data
4. **Review SQL**: Check and edit the generated SQL before execution
5. **View Results**: Explore results with multiple view modes and export options
6. **Manage Schema**: Create schema change proposals (admin approval for production)

**For detailed step-by-step tutorials, see [HOW-TO-USE.md](HOW-TO-USE.md)**

## 🔧 Configuration

### Environment Variables

**Backend (`backend/.env`)** - Optional for enhanced features:
```env
# LLM API Keys (optional - has mock fallback)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Supabase (configured automatically)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Security (auto-generated if not provided)
SECRET_KEY=your_secret_key
```

**Frontend**: Environment variables are automatically configured for Codespaces/Vercel deployment.

### LLM Integration
- **With API Keys**: Full natural language processing with OpenAI or Anthropic
- **Without API Keys**: Uses intelligent mock service with template-based responses
- **Fallback**: Automatically falls back to mock if API calls fail

## 📁 Project Structure

```
DataVibe/
├── frontend/                 # Next.js React application
│   ├── src/app/             # App router pages
│   │   ├── admin/           # Admin dashboard
│   │   ├── schema/          # Schema management
│   │   └── page.tsx         # Main query interface
│   ├── src/components/      # React components
│   │   ├── auth/            # Authentication components
│   │   ├── database/        # Database connection
│   │   ├── query/           # Query interface
│   │   ├── results/         # Result display
│   │   ├── schema/          # Schema management
│   │   └── ui/              # UI components
│   └── src/lib/             # Utilities and API client
├── backend/                 # FastAPI Python backend
│   ├── app/api/             # API route handlers
│   ├── app/core/            # Core configuration
│   ├── app/middleware/      # Authentication middleware
│   ├── app/services/        # Business logic services
│   └── main.py              # FastAPI application
├── HOW-TO-USE.md            # Comprehensive user guide
├── MVP-Spec.md              # Product specification
└── package.json             # Project configuration
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev                  # Start both frontend and backend in development mode
npm run dev:frontend         # Start only frontend development server
npm run dev:backend          # Start only backend development server

# Building
npm run build               # Build frontend for production
npm run build:frontend      # Build frontend application

# Installation
npm run install:frontend    # Install frontend dependencies
npm run install:backend     # Install backend dependencies

# Testing
npm run test               # Run backend tests
npm run test:backend       # Run Python tests with pytest

# Production
npm run start:backend      # Start backend in production mode
```

## 🔐 Security Features

- **Read-Only Database Access**: All query operations are strictly read-only
- **SQL Injection Prevention**: Parameterized queries and validation
- **Authentication Required**: Supabase Auth integration with JWT
- **Role-Based Access**: User and admin roles with appropriate permissions
- **Audit Logging**: Complete audit trail of all operations
- **Cloud-Only Connections**: No local database connections allowed
- **Session Management**: Encrypted session storage with automatic cleanup

## 🚀 Deployment

### Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Deploy automatically on every push to main
3. Environment variables are configured automatically

### Railway/Render (Backend)
1. Connect your GitHub repository
2. Set Python buildpack and requirements.txt
3. Configure environment variables for LLM APIs

### GitHub Codespaces
- Fully configured for immediate development
- No additional setup required
- Automatic port forwarding and environment configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the existing code style
4. Add tests if applicable
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Submit a pull request

## 📋 Roadmap

- [ ] Advanced data visualization and charting
- [ ] Query history and favorites
- [ ] Collaborative query sharing
- [ ] Advanced schema migration tools
- [ ] Multi-database session management
- [ ] Real-time query collaboration

## 🆘 Support

- **User Guide**: See [HOW-TO-USE.md](HOW-TO-USE.md) for detailed tutorials
- **Issues**: Report bugs and request features via GitHub Issues
- **Architecture**: See [MVP-Spec.md](MVP-Spec.md) for technical specifications

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for developers, data analysts, and database administrators who want to interact with their data using natural language.**