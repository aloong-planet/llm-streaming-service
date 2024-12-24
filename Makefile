# Project configuration
PROJECT_NAME = llm-streaming-service
PLATFORM = linux/amd64
TAG ?= latest

# Default target
all: build

# Clean containers and images
clean:
	@echo "Cleaning Docker containers and images..."
	@containers=$$(docker ps -a -q --filter ancestor=$(PROJECT_NAME):$(TAG)); \
	if [ -n "$$containers" ]; then \
		docker rm -f $$containers; \
	fi
	@docker rmi $(PROJECT_NAME):$(TAG) || true

# List Docker images
ls:
	@echo "Listing Docker images..."
	@docker images $(PROJECT_NAME)

# Build the service
build:
	@echo "Building Docker image on platform $(PLATFORM)"
	@docker build --platform $(PLATFORM) -t $(PROJECT_NAME):$(TAG) .

# Run Docker Compose
run:
	@echo "Running Docker Compose..."
	@docker-compose up

# Development mode
dev:
	@echo "Starting development environment..."
	@docker-compose up --build

# Stop all containers
stop:
	@echo "Stopping all containers..."
	@docker-compose down

# Push Docker image
push:
	@echo "Pushing Docker image..."
	@docker push $(PROJECT_NAME):$(TAG)

# Run tests
test:
	@echo "Running tests..."
	@npm test

# Run tests in watch mode for development
test-watch:
	@echo "Running tests in watch mode..."
	@npm test -- --watch

# Run tests with coverage report
test-coverage:
	@echo "Running tests with coverage..."
	@npm test -- --coverage

# Database commands
db-shell:
	@echo "Opening SQLite shell..."
	@sqlite3 data/chat.db

db-tables:
	@echo "Listing database tables..."
	@sqlite3 data/chat.db ".tables"

db-schema:
	@echo "Showing database schema..."
	@sqlite3 data/chat.db ".schema"

# Phony targets
.PHONY: all clean build run dev stop push ls test test-watch test-coverage db-shell db-tables db-schema
