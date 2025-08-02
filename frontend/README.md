# DataVibe Frontend

Next.js React application for the DataVibe AI database assistant.

## Features

- Modern React with TypeScript
- Tailwind CSS for styling
- Component-based architecture
- Authentication and user management
- Database connection management
- Natural language query interface
- Result visualization and export

## Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # Reusable React components
│   │   ├── auth/           # Authentication components
│   │   ├── database/       # Database connection components
│   │   ├── query/          # Query input and management
│   │   └── results/        # Result display components
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── styles/             # Global styles
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Lint code
npm run lint
```

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Components

### Authentication
- `LoginForm`: User login form
- `RegisterForm`: User registration form

### Database
- `ConnectionForm`: Database connection setup
- `ConnectionList`: List of user's database connections

### Query
- `QueryInput`: Natural language query input
- `QueryHistory`: Previous queries and results

### Results
- `QueryResults`: Tabular result display
- `ExportOptions`: Data export functionality

## API Integration

The frontend communicates with the FastAPI backend through HTTP requests. API calls are organized in service modules within the `utils` directory.