#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PID_DIR="$SCRIPT_DIR/.pids"
mkdir -p "$PID_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { printf "${GREEN}[INFO]${NC} %s\n" "$*"; }
warn()  { printf "${YELLOW}[WARN]${NC} %s\n" "$*"; }
error() { printf "${RED}[ERROR]${NC} %s\n" "$*"; }

# ── Detect docker compose command ────────────────────────────────────
if docker compose version &>/dev/null; then
  DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &>/dev/null; then
  DOCKER_COMPOSE="docker-compose"
else
  error "Neither 'docker compose' nor 'docker-compose' found."
  exit 1
fi

cleanup() {
  echo ""
  info "Shutting down..."
  if [ -f "$PID_DIR/backend.pid" ]; then
    kill "$(cat "$PID_DIR/backend.pid")" 2>/dev/null || true
    rm -f "$PID_DIR/backend.pid"
  fi
  if [ -f "$PID_DIR/frontend.pid" ]; then
    kill "$(cat "$PID_DIR/frontend.pid")" 2>/dev/null || true
    rm -f "$PID_DIR/frontend.pid"
  fi
  info "All processes stopped."
  exit 0
}

trap cleanup SIGINT SIGTERM

# ── Start Docker containers ──────────────────────────────────────────
info "Starting Docker containers..."
$DOCKER_COMPOSE up -d

# ── Wait for Postgres ────────────────────────────────────────────────
info "Waiting for Postgres to be healthy..."
retries=30
until docker inspect --format='{{.State.Health.Status}}' aitb_postgres 2>/dev/null | grep -q "healthy"; do
  retries=$((retries - 1))
  if [ "$retries" -le 0 ]; then
    error "Postgres did not become healthy in time."
    exit 1
  fi
  sleep 2
done
info "Postgres is healthy."

# ── Run pending migrations ───────────────────────────────────────────
info "Running pending migrations..."
source backend/.venv/bin/activate
(cd backend && alembic upgrade head)

# ── Start backend ────────────────────────────────────────────────────
info "Starting backend (uvicorn)..."
(cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000) &
echo $! > "$PID_DIR/backend.pid"

deactivate

# ── Start frontend ───────────────────────────────────────────────────
info "Starting frontend (vite)..."
(cd frontend && npm run dev) &
echo $! > "$PID_DIR/frontend.pid"

# ── Print info ───────────────────────────────────────────────────────
echo ""
info "Dev servers running:"
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:5173"
echo "  pgAdmin:  http://localhost:5050"
echo ""
echo "  Backend PID:  $(cat "$PID_DIR/backend.pid")"
echo "  Frontend PID: $(cat "$PID_DIR/frontend.pid")"
echo ""
info "Press Ctrl+C to stop all processes."

# Wait for background processes
wait
