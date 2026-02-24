# Secure AI Agent Interface

> Production-ready agent interface with identity security patterns, RBAC, audit logging, and least-privilege access controls.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  Next.js 14 App Router                  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ AgentStatus  │  │ AuditLog     │  │ Permission    │  │
│  │ Cards        │  │ Viewer       │  │ Panel         │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
│                     API Routes                          │
│  /api/agents   /api/audit-logs   /api/circuit-breaker   │
└─────────────────────────────────────────────────────────┘
```

## Features

- **Multi-tool orchestration** — Real-time agent monitoring with tool-level tracking
- **RBAC** — Role-based access control with per-tool permission toggles and scope management
- **Audit visualization** — Paginated, searchable, filterable audit log with expandable rows
- **Streaming UI** — Live clock, JWT countdown, real-time status indicators
- **Circuit breakers** — Automatic agent suspension on repeated failures
- **JWT isolation** — Session-scoped authentication with expiry countdown

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript |
| UI | React 18 |
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Components | shadcn/ui patterns |

## Security Patterns

- **Least-privilege access** — Each agent has minimal required permissions
- **Context isolation** — Agents operate in isolated permission scopes
- **NHI management** — Non-human identity controls with JWT-based session tracking
- **Audit trails** — Complete action logging with input/output capture
- **Input validation** — All API routes validate request bodies before processing

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── agents/
│   │   │   ├── route.ts          # GET all agents
│   │   │   └── [id]/route.ts     # GET/POST single agent
│   │   ├── audit-logs/route.ts   # GET paginated logs
│   │   └── circuit-breaker/
│   │       └── route.ts          # POST emergency stop
│   ├── layout.tsx
│   └── page.tsx                  # Main dashboard
├── components/
│   ├── AgentStatus.tsx           # Agent card with status
│   ├── AuditLogViewer.tsx        # Log table with filters
│   └── PermissionPanel.tsx       # Permission management
├── lib/
│   ├── mockData.ts               # Mock agents and audit logs
│   └── utils.ts                  # Utility functions
└── types/
    └── agent.ts                  # TypeScript interfaces
```
