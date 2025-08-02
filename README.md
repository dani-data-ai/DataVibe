# DataVibe - AI Database Assistant

Lovable AI for Databases is a web application that enables users to manage and query relational databases using natural language prompts, powered by large language models (LLMs).

## Features

- 🗣️ Natural language database querying
- 🔒 Production-safe read-only operations
- 🛠️ Schema change proposals with approval workflow
- 🔍 Transparent SQL generation and explanation
- 📊 Query result visualization and export
- 🔐 Role-based access control (Admin, Developer, Viewer)

## Architecture

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: FastAPI with Python
- **Database**: PostgreSQL/MySQL support
- **LLM Integration**: OpenAI GPT/Anthropic Claude
- **Deployment**: Docker containers

## Quick Start

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with your database and API credentials
4. Start with Docker Compose:
   ```bash
   npm run docker:up
   ```
5. Access the application at http://localhost:3000

## Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker and Docker Compose

### Local Development
```bash
# Install dependencies
npm run install:all

# Start development servers
npm run dev
```

### Project Structure
```
DataVibe/
├── frontend/          # Next.js React application
├── backend/           # FastAPI Python backend
├── docker-compose.yml # Container orchestration
└── README.md         # This file
```

## Environment Variables

See `.env.example` for required environment variables including:
- Database connection details
- LLM API keys (OpenAI/Anthropic)
- Security settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details