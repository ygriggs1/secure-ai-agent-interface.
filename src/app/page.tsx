'use client';

import { useEffect, useState } from 'react';
import { Agent, AuditLogEntry, Permission } from '@/types/agent';
import { mockAgents, mockAuditLogs } from '@/lib/mockData';
import AgentStatus from '@/components/AgentStatus';
import AuditLogViewer from '@/components/AuditLogViewer';
import PermissionPanel from '@/components/PermissionPanel';
import { AlertTriangle, CheckCircle2, Key, PauseCircle, Shield, Timer, Wifi } from 'lucide-react';

const INITIAL_JWT_TTL = 3600;

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatJwt(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [logs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [circuitBreakerActive, setCircuitBreakerActive] = useState(false);
  const [allPaused, setAllPaused] = useState(false);
  const [clock, setClock] = useState<Date | null>(null);
  const [jwtTtl, setJwtTtl] = useState(INITIAL_JWT_TTL);
  const [sessionId] = useState(() => `sess-${Math.random().toString(36).slice(2, 10)}`);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setClock(new Date());
    const interval = setInterval(() => {
      setClock(new Date());
      setJwtTtl((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const hasCb = logs.some((l) => l.action === 'circuit_breaker_activated');
    setCircuitBreakerActive(hasCb);
  }, [logs]);

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  const handlePermissionUpdate = (agentId: string, permissions: Permission[]) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, permissions } : a)),
    );
    if (selectedAgent?.id === agentId) {
      setSelectedAgent((prev) => prev ? { ...prev, permissions } : prev);
    }
  };

  const handlePauseAll = async () => {
    try {
      await fetch('/api/circuit-breaker', { method: 'POST', body: JSON.stringify({ action: 'pause_all' }) });
    } catch {
      // offline-safe: update locally
    }
    setAllPaused(true);
    setAgents((prev) => prev.map((a) => ({ ...a, status: 'paused' as const })));
  };

  const agentNames = Object.fromEntries(agents.map((a) => [a.id, a.name]));
  const jwtColor = jwtTtl > 600 ? 'text-securityGreen' : jwtTtl > 120 ? 'text-securityYellow' : 'text-securityRed';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 mr-auto">
            <Shield className="w-5 h-5 text-securityBlue flex-shrink-0" />
            <h1 className="font-bold text-gray-900 text-base leading-tight">
              Secure Agent Control Center
            </h1>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
            <Timer className="w-3.5 h-3.5 text-gray-400" />
            {mounted && clock ? formatTime(clock) : '--:--:--'}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium text-securityGreen">
            <Wifi className="w-3.5 h-3.5" />
            Connected
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50">
            <div className="flex items-center gap-1">
              <Key className="w-3 h-3 text-gray-400" />
              <span className="font-mono">{mounted ? sessionId : '---'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400">JWT:</span>
              <span className={`font-mono font-semibold ${jwtColor}`}>{mounted ? formatJwt(jwtTtl) : '--:--'}</span>
            </div>
          </div>

          <button
            onClick={handlePauseAll}
            disabled={allPaused}
            className={
              allPaused
                ? 'flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-securityRed text-white hover:bg-securityRed/90 transition-colors'
            }
          >
            <PauseCircle className="w-3.5 h-3.5" />
            {allPaused ? 'All Paused' : 'Pause All Agents'}
          </button>
        </div>

        {circuitBreakerActive && (
          <div className="bg-securityRed/10 border-t border-securityRed/20 px-4 py-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-securityRed flex-shrink-0" />
            <span className="text-xs text-securityRed font-medium">
              Circuit breaker activated — one or more agents have been paused due to repeated failures.
            </span>
          </div>
        )}

        {allPaused && !circuitBreakerActive && (
          <div className="bg-securityYellow/10 border-t border-securityYellow/20 px-4 py-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-securityYellow flex-shrink-0" />
            <span className="text-xs text-securityYellow font-medium">
              Emergency stop triggered — all agents have been paused.
            </span>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-4 h-full">
          <aside className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
              Agents ({agents.length})
            </h2>
            {agents.map((agent) => (
              <AgentStatus
                key={agent.id}
                agent={agent}
                isSelected={selectedAgent?.id === agent.id}
                onSelect={handleSelectAgent}
                circuitBreakerActive={circuitBreakerActive && agent.status === 'error'}
              />
            ))}
          </aside>

          <section className="min-h-[600px]">
            <AuditLogViewer logs={logs} agentNames={agentNames} />
          </section>

          <aside>
            <PermissionPanel
              agent={selectedAgent}
              onUpdate={handlePermissionUpdate}
            />
          </aside>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between text-xs text-gray-400">
          <span>Secure AI Agent Interface · v1.0.0</span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Least-privilege · RBAC · Audit Trail
          </span>
        </div>
      </footer>
    </div>
  );
}
