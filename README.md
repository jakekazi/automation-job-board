# AITB Automation Job Board

A community-focused job board where sponsors post automation help requests and AITB apprentices apply to fulfill them. Think "Upwork for AI automation" but focused on the AITB community.

## Tech Stack

- **Backend:** FastAPI (Python 3.11+)
- **Database:** PostgreSQL 15
- **Frontend:** React + TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Auth:** JWT
- **LLM:** OpenRouter API (Claude 3 Haiku)

## Quick Start

### 1. Start the Database

```bash
docker-compose up -d db
```

This starts PostgreSQL on port 5432. pgAdmin is available at http://localhost:5050 (admin@local.dev / admin).

### 2. Set Up the Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -e ".[dev]"

# Copy environment file and add your OpenRouter API key
cp .env.example .env
# Edit .env and set OPENROUTER_API_KEY

# Run database migrations
alembic upgrade head

# Start the API server
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000. Swagger docs at http://localhost:8000/docs.

### 3. Set Up the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend will be available at http://localhost:5173.

## Project Structure

```
automation-job-board/
├── docker-compose.yml       # Postgres + pgAdmin
├── .env.example             # Environment template
│
├── backend/
│   ├── pyproject.toml       # Python dependencies
│   ├── alembic.ini          # DB migrations config
│   ├── alembic/             # Migration scripts
│   └── app/
│       ├── main.py          # FastAPI entry point
│       ├── config.py        # Settings
│       ├── database.py      # DB connection
│       ├── models/          # SQLAlchemy models
│       ├── schemas/         # Pydantic validation
│       ├── api/             # Route handlers
│       └── services/        # Business logic + AI
│
└── frontend/
    ├── package.json
    ├── tailwind.config.ts   # Midnight Blue + Electric Teal theme
    └── src/
        ├── App.tsx
        ├── lib/             # API client, auth context
        ├── components/      # UI components
        ├── pages/           # Route pages
        └── hooks/           # React hooks
```

## Environment Variables

Copy `.env.example` to `.env` in both the root and backend directories:

```bash
# Database
DATABASE_URL=postgresql://aitb:aitb_dev_password@localhost:5432/aitb_jobboard

# Auth
JWT_SECRET_KEY=change-this-to-a-secure-random-string

# OpenRouter (for AI features)
OPENROUTER_API_KEY=your-key-here

# Frontend
VITE_API_URL=http://localhost:8000/api
```

## Features

### Core Flow
- User registration (sponsor or apprentice roles)
- Sponsors post automation jobs
- Apprentices browse and apply to jobs
- Sponsors review and accept/reject applications

### AI Features (powered by OpenRouter)
- **Generate Job Descriptions:** Sponsors can describe their need briefly and get a full job posting
- **Generate Cover Letters:** Apprentices can get AI-assisted cover letter suggestions
- **Job Matching:** (Coming soon) AI-powered job recommendations

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login and get JWT token |
| `/api/auth/me` | GET | Get current user |
| `/api/jobs` | GET | List open jobs |
| `/api/jobs` | POST | Create job (sponsors) |
| `/api/jobs/{id}` | GET | Job details |
| `/api/applications` | POST | Submit application |
| `/api/applications` | GET | My applications (apprentices) |
| `/api/ai/generate-description` | POST | Generate job description |
| `/api/ai/generate-cover-letter` | POST | Generate cover letter |

## Team Roles (Hackathon)

1. **Backend Lead:** API endpoints, database, auth
2. **Frontend Lead:** UI components, pages, styling
3. **Full-stack:** Integration, dashboards, end-to-end flows
4. **AI/LLM + Demo:** OpenRouter integration, demo prep

## Theme

The app uses a **Midnight Blue (#1e3a5f)** and **Electric Teal (#00d9c0)** color scheme. See `frontend/tailwind.config.ts` for the full palette.

## License

MIT
