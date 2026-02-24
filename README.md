 # Secure AI Agent Interface

Production-ready interface for monitoring and controlling AI agents with least‑privilege access, real-time audit visibility, and circuit‑breaker safety.

---

## Overview
Secure AI Agent Interface is a Next.js 14 dashboard that visualizes agent activity, permissions, and audit trails. It simulates real-time operations with mock data and API routes, providing a clean foundation for building secure multi-agent systems with strong identity and access controls.

---

## Key Features
- **Agent Monitoring**: Status cards with tool usage, last activity, and circuit breaker state  
- **Fine-Grained Permissions**: Toggle tool access per agent with scoped controls  
- **Audit Log Viewer**: Filterable, searchable, paginated activity logs  
- **Real‑Time Simulation**: Live indicators and mock WebSocket updates  
- **Emergency Controls**: “Pause All Agents” circuit breaker action  

---

## Security Patterns Implemented
- **Least‑Privilege Tool Access**
- **Context Isolation Between Sessions**
- **Non‑Human Identity (NHI) Management**
- **Real‑Time Audit Trail Visualization**
- **Input Validation & Rate Limiting (mocked)**

---

## Tech Stack
- **Frontend**: TypeScript, React, Next.js 14 (App Router)  
- **UI**: Tailwind CSS, shadcn/ui, Lucide Icons  
- **Backend (Mock)**: Express‑style API routes in Next.js  
- **Real‑Time**: SSE/WebSocket simulation (setInterval in mock server)

---

## Project Structure
