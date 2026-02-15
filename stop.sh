#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PID_DIR="$SCRIPT_DIR/.pids"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { printf "${GREEN}[INFO]${NC} %s\n" "$*"; }
warn()  { printf "${YELLOW}[WARN]${NC} %s\n" "$*"; }

# ── Detect docker compose command ────────────────────────────────────
if docker compose version &>/dev/null; then
  DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &>/dev/null; then
  DOCKER_COMPOSE="docker-compose"
else
  DOCKER_COMPOSE="docker compose"
fi

# ── Kill processes by PID file ───────────────────────────────────────
stopped=0

for name in backend frontend; do
  pidfile="$PID_DIR/$name.pid"
  if [ -f "$pidfile" ]; then
    pid=$(cat "$pidfile")
    if kill "$pid" 2>/dev/null; then
      info "Stopped $name (PID $pid)"
      stopped=$((stopped + 1))
    else
      warn "$name (PID $pid) was not running."
    fi
    rm -f "$pidfile"
  fi
done

# ── Fallback: kill by port ───────────────────────────────────────────
for port_name in "8000:backend" "5173:frontend"; do
  port="${port_name%%:*}"
  name="${port_name##*:}"
  pid=$(lsof -ti :"$port" 2>/dev/null || true)
  if [ -n "$pid" ]; then
    kill "$pid" 2>/dev/null || true
    info "Killed leftover $name process on port $port (PID $pid)"
    stopped=$((stopped + 1))
  fi
done

# ── Stop Docker containers ───────────────────────────────────────────
info "Stopping Docker containers..."
$DOCKER_COMPOSE down

# ── Done ─────────────────────────────────────────────────────────────
echo ""
info "Everything stopped."
