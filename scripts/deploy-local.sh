#!/usr/bin/env bash
#
# deploy-local.sh - Comprehensive local deployment script for Chat with Google Maps
#
# This script handles the complete local development environment setup including:
# - Prerequisites validation (Node.js, Docker, npm)
# - Environment configuration
# - PostgreSQL database startup and health checks
# - Database migrations
# - Development servers (API + Frontend)
#
# Usage:
#   ./scripts/deploy-local.sh [OPTIONS]
#
# Options:
#   --skip-deps       Skip npm install
#   --skip-db         Skip database startup (assumes already running)
#   --reset-db        Reset database (delete all data and start fresh)
#   --prod            Run in production mode
#   --help            Show this help message
#

set -e  # Exit on error

# ============================================================================
# Configuration
# ============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Default options
SKIP_DEPS=false
SKIP_DB=false
RESET_DB=false
PROD_MODE=false

# Service ports
POSTGRES_PORT=${POSTGRES_PORT:-5438}
API_PORT=${API_PORT:-3011}
VITE_PORT=3003

# ============================================================================
# Helper Functions
# ============================================================================

print_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║           Chat with Google Maps - Local Deployment               ║"
    echo "║                     WSL2 Ubuntu Edition                          ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "\n${BOLD}${CYAN}▶ $1${NC}"
}

show_help() {
    echo "Usage: ./scripts/deploy-local.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --skip-deps       Skip npm install"
    echo "  --skip-db         Skip database startup (assumes already running)"
    echo "  --reset-db        Reset database (delete all data and start fresh)"
    echo "  --prod            Run in production mode"
    echo "  --help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/deploy-local.sh                  # Full startup"
    echo "  ./scripts/deploy-local.sh --skip-deps      # Skip npm install"
    echo "  ./scripts/deploy-local.sh --reset-db       # Fresh database"
    exit 0
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 is not installed or not in PATH"
        return 1
    fi
    return 0
}

kill_port() {
    local port=$1
    local pids=$(lsof -ti ":$port" 2>/dev/null)
    if [ -n "$pids" ]; then
        log_warn "Killing existing process(es) on port $port (PIDs: $pids)"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

wait_for_port() {
    local port=$1
    local name=$2
    local max_attempts=${3:-30}
    local attempt=1

    log_info "Waiting for $name on port $port..."

    while ! nc -z localhost "$port" 2>/dev/null; do
        if [ $attempt -ge $max_attempts ]; then
            log_error "$name did not become available on port $port after $max_attempts attempts"
            return 1
        fi
        echo -n "."
        sleep 1
        ((attempt++))
    done
    echo ""
    log_success "$name is ready on port $port"
    return 0
}

wait_for_postgres() {
    local max_attempts=${1:-30}
    local attempt=1

    log_info "Waiting for PostgreSQL to be healthy..."

    while [ $attempt -le $max_attempts ]; do
        if docker exec chat_maps_db pg_isready -U chatmaps &>/dev/null; then
            log_success "PostgreSQL is healthy and ready"
            return 0
        fi
        echo -n "."
        sleep 1
        ((attempt++))
    done

    echo ""
    log_error "PostgreSQL did not become healthy after $max_attempts seconds"
    return 1
}

cleanup() {
    log_warn "Caught interrupt signal, cleaning up..."

    # Kill any background processes we started
    if [ -n "$API_PID" ]; then
        log_info "Stopping API server (PID: $API_PID)..."
        kill $API_PID 2>/dev/null || true
    fi

    if [ -n "$VITE_PID" ]; then
        log_info "Stopping Vite server (PID: $VITE_PID)..."
        kill $VITE_PID 2>/dev/null || true
    fi

    # Note: We don't stop the database by default to preserve data
    log_info "Database left running. Run 'npm run db:stop' to stop it."

    exit 0
}

# ============================================================================
# Parse Arguments
# ============================================================================

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-deps)
            SKIP_DEPS=true
            shift
            ;;
        --skip-db)
            SKIP_DB=true
            shift
            ;;
        --reset-db)
            RESET_DB=true
            shift
            ;;
        --prod)
            PROD_MODE=true
            shift
            ;;
        --help|-h)
            show_help
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            ;;
    esac
done

# ============================================================================
# Main Script
# ============================================================================

print_banner

# Set trap for cleanup on interrupt
trap cleanup SIGINT SIGTERM

# Change to project root
cd "$PROJECT_ROOT"
log_info "Working directory: $PROJECT_ROOT"

# ============================================================================
# Step 1: Check Prerequisites
# ============================================================================
log_step "Step 1: Checking prerequisites..."

PREREQ_FAILED=false

# Check Node.js
if check_command node; then
    NODE_VERSION=$(node --version)
    log_success "Node.js found: $NODE_VERSION"

    # Check if Node.js version is 18+
    NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_MAJOR" -lt 18 ]; then
        log_error "Node.js version 18+ required, found $NODE_VERSION"
        PREREQ_FAILED=true
    fi
else
    PREREQ_FAILED=true
fi

# Check npm
if check_command npm; then
    NPM_VERSION=$(npm --version)
    log_success "npm found: v$NPM_VERSION"
else
    PREREQ_FAILED=true
fi

# Check Docker
if check_command docker; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | tr -d ',')
    log_success "Docker found: v$DOCKER_VERSION"

    # Check if Docker daemon is running
    if ! docker info &>/dev/null; then
        log_error "Docker daemon is not running. Please start Docker Desktop or the Docker service."
        PREREQ_FAILED=true
    fi
else
    PREREQ_FAILED=true
fi

# Check docker-compose (v1) or docker compose (v2)
if command -v docker-compose &>/dev/null; then
    log_success "Docker Compose (v1) available"
elif docker compose version &>/dev/null; then
    log_success "Docker Compose (v2) available"
else
    log_error "Docker Compose not found"
    PREREQ_FAILED=true
fi

# Check for netcat (for port checking)
if ! check_command nc; then
    log_warn "netcat (nc) not found. Installing..."
    if command -v apt-get &>/dev/null; then
        sudo apt-get update && sudo apt-get install -y netcat-openbsd
    else
        log_warn "Could not install netcat. Port checks may not work."
    fi
fi

if [ "$PREREQ_FAILED" = true ]; then
    log_error "Prerequisites check failed. Please install missing dependencies."
    exit 1
fi

log_success "All prerequisites satisfied"

# ============================================================================
# Step 2: Environment Setup
# ============================================================================
log_step "Step 2: Setting up environment..."

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        log_info "Creating .env from .env.example..."
        cp .env.example .env
        log_warn "Please review .env and update any required values"
        log_warn "Especially: GEMINI_API_KEY, GOOGLE_MAPS_API_KEY, BETTER_AUTH_SECRET"
    else
        log_error ".env file not found and no .env.example to copy from"
        exit 1
    fi
else
    log_success ".env file exists"
fi

# Source environment variables for use in this script
set -a
source .env 2>/dev/null || true
set +a

# Validate critical environment variables
MISSING_VARS=()

if [ -z "$DATABASE_URL" ]; then
    MISSING_VARS+=("DATABASE_URL")
fi

if [ -z "$BETTER_AUTH_SECRET" ]; then
    MISSING_VARS+=("BETTER_AUTH_SECRET")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    log_warn "Missing recommended environment variables: ${MISSING_VARS[*]}"
    log_info "The app may not function correctly without these."
fi

# Fix BETTER_AUTH_URL if it still points to default Vite port
if [ "$BETTER_AUTH_URL" = "http://localhost:5173" ]; then
    log_warn "BETTER_AUTH_URL is set to default port 5173, but Vite runs on $VITE_PORT"
    log_info "Consider updating BETTER_AUTH_URL to http://localhost:$VITE_PORT"
fi

log_success "Environment configured"

# ============================================================================
# Step 3: Install Dependencies
# ============================================================================
log_step "Step 3: Installing dependencies..."

if [ "$SKIP_DEPS" = true ]; then
    log_info "Skipping npm install (--skip-deps flag)"
else
    if [ ! -d "node_modules" ]; then
        log_info "node_modules not found. Running npm install..."
        # Use --legacy-peer-deps to handle better-auth/drizzle-orm peer dep mismatch
        npm install --legacy-peer-deps
    else
        log_info "Checking for dependency updates..."
        # Use --legacy-peer-deps to handle better-auth/drizzle-orm peer dep mismatch
        npm install --legacy-peer-deps
    fi
    log_success "Dependencies installed"

    # Fix security vulnerabilities
    log_info "Checking for security vulnerabilities..."
    AUDIT_OUTPUT=$(npm audit 2>&1) || true
    if echo "$AUDIT_OUTPUT" | grep -q "vulnerabilities"; then
        log_warn "Security vulnerabilities detected. Running npm audit fix..."
        npm audit fix --legacy-peer-deps 2>&1 || true
        log_success "Security audit complete"
    else
        log_success "No vulnerabilities found"
    fi
fi

# ============================================================================
# Step 4: Database Setup
# ============================================================================
log_step "Step 4: Setting up PostgreSQL database..."

if [ "$SKIP_DB" = true ]; then
    log_info "Skipping database startup (--skip-db flag)"
else
    # Check if database container is already running
    if docker ps --format '{{.Names}}' | grep -q '^chat_maps_db$'; then
        if [ "$RESET_DB" = true ]; then
            log_info "Resetting database (--reset-db flag)..."
            npm run db:reset
        else
            log_info "Database container already running"
        fi
    else
        if [ "$RESET_DB" = true ]; then
            log_info "Starting fresh database (--reset-db flag)..."
            npm run db:reset
        else
            log_info "Starting PostgreSQL container..."
            npm run db:start
        fi
    fi

    # Wait for PostgreSQL to be healthy
    wait_for_postgres 30

    # Run migrations
    log_info "Running database migrations..."
    npm run db:migrate

    log_success "Database ready"
fi

# ============================================================================
# Step 5: Start Development Servers
# ============================================================================
log_step "Step 5: Starting development servers..."

# Clean up any existing processes on our ports
log_info "Checking for processes using required ports..."
kill_port $API_PORT
kill_port $VITE_PORT

if [ "$PROD_MODE" = true ]; then
    log_info "Building for production..."
    npm run build

    log_info "Starting production servers..."

    # Start API server in background
    npm run api:start &
    API_PID=$!

    # Start preview server
    npm run preview &
    VITE_PID=$!

    log_info "Production servers starting..."
else
    log_info "Starting development servers (API + Vite)..."

    # We use npm run dev:all which handles both servers
    # But for better control, we start them separately

    # Start API server in background
    log_info "Starting API server on port $API_PORT..."
    npm run api:dev &
    API_PID=$!

    # Give API a moment to start
    sleep 2

    # Start Vite dev server in background
    log_info "Starting Vite dev server on port $VITE_PORT..."
    npm run dev &
    VITE_PID=$!
fi

# Wait for services to be ready
echo ""
log_info "Waiting for services to start..."
sleep 3

# Check if processes are still running
if ! kill -0 $API_PID 2>/dev/null; then
    log_error "API server failed to start. Check logs above for errors."
    exit 1
fi

if ! kill -0 $VITE_PID 2>/dev/null; then
    log_error "Vite server failed to start. Check logs above for errors."
    exit 1
fi

# ============================================================================
# Step 6: Display Status
# ============================================================================
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    Local Deployment Complete!                    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}Services Running:${NC}"
echo -e "  ${CYAN}PostgreSQL:${NC}    localhost:${POSTGRES_PORT}"
echo -e "  ${CYAN}API Server:${NC}    http://localhost:${API_PORT}"
echo -e "  ${CYAN}Frontend:${NC}      http://localhost:${VITE_PORT}"
echo ""
echo -e "${BOLD}Quick Links:${NC}"
echo -e "  ${BLUE}Application:${NC}   http://localhost:${VITE_PORT}"
echo -e "  ${BLUE}API Health:${NC}    http://localhost:${API_PORT}/api/health"
echo -e "  ${BLUE}Drizzle Studio:${NC} npm run db:studio"
echo ""
echo -e "${BOLD}Useful Commands:${NC}"
echo -e "  ${YELLOW}npm run db:studio${NC}    - Open database UI"
echo -e "  ${YELLOW}npm run db:logs${NC}      - View database logs"
echo -e "  ${YELLOW}npm run db:shell${NC}     - Open PostgreSQL shell"
echo -e "  ${YELLOW}npm run quality${NC}      - Run all quality checks"
echo ""
echo -e "${BOLD}To stop:${NC} Press ${RED}Ctrl+C${NC}"
echo ""

# Wait for user interrupt
wait $API_PID $VITE_PID 2>/dev/null
