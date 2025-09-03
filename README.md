# Ai Server Health Chat Bot - Socket Server

## Prerequisites

- Ensure you have [Node.js](https://nodejs.org/) installed on your system (version 18 or higher).
- Ensure you have [pnpm](https://pnpm.io/) installed on your system (version 8.0.0 or higher).

## Configuration

1. **Root Configuration:**
   - Create a `.env` file in the root directory of the project.
   - Populate it with the necessary environment variables as specified in the `.env.example` file.

## Installation Steps

1. **Install Dependencies:**

   ```bash
   pnpm install
   ```

2. **Prepare Husky:**

   ```bash
   pnpm prepare
   ```

3. **Generate Prisma Client:**
   ```bash
   pnpm prisma:generate
   ```

### Running Redis & PostgreSQL with Docker

Easiest way to run a Redis and PostgreSQL instance with persistent memory using Docker, use the following command:

## Redis

```bash
docker run -d --name redis-server -p 6379:6379 -v redis-data:/data -e REDIS_PASSWORD=default -e REDIS_USERNAME=default redis:latest redis-server --appendonly yes --requirepass default
```

## PostgreSQL

```bash
docker run -d --name postgres-server -p 5432:5432 -e POSTGRES_USER=ai-server -e POSTGRES_PASSWORD=default -e POSTGRES_DB=ai-server-chatbot postgres:latest
```

## Development

- **Start Development Server:**

  ```bash
  pnpm dev
  ```

- **Build for Production:**

  ```bash
  pnpm build
  ```

- **Start Production Server:**
  ```bash
  pnpm start:prod
  ```

## Linting and Formatting

- **Lint Code:**

  ```bash
  pnpm lint
  ```

- **Format Code:**
  ```bash
  pnpm format
  ```

## Prisma

- **Migrate Database (Development):**

  ```bash
  pnpm prisma:migrate:dev
  ```

- **Migrate Database (Production):**

  ```bash
  pnpm prisma:migrate:prod
  ```

- **Open Prisma Studio:**
  ```bash
  pnpm prisma:studio
  ```

## Additional Information

- This project uses [Prisma](https://www.prisma.io/) for database management.
- [BullMQ](https://docs.bullmq.io/) is used for job queue management.
- [Socket.IO](https://socket.io/) is used for real-time communication.
