'use client';

import { Agent } from '@/types/agent';
import { cn } from '@/lib/utils';
import { Activity, AlertTriangle, CheckCircle2, Clock, Cpu, PauseCircle, Shield, XCircle, Zap } from 'lucide-react';
import { useState } from 'react';

interface AgentStatusProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: (agent: Agent) => void;
  circuitBreakerActive: boolean;
}

const statusConfig = {
  idle: {
    label: 'Idle',
    icon: Clock,
    badgeClass: 'bg-gray-100 text-gray-700 border border-gray-200',
    dotClass: 'bg-gray-400',
  },
  running: {
    label: 'Running',
    icon: Activity,
    badgeClass: 'bg-securityBlue/10 text-securityBlue border border-securityBlue/30',
    dotClass: 'bg-securityBlue animate-pulse',
  },
  error: {
    label: 'Error',
    icon: XCircle,
    badgeClass: 'bg-securityRed/10 text-securityRed border border-securityRed/30',
    dotClass: 'bg-securityRed',
  },
  paused: {
    label: 'Paused',
    icon: PauseCircle,
    badgeClass: 'bg-securityYellow/10 text-securityYellow border border-securityYellow/30',
    dotClass: 'bg-securityYellow',
  },
};

const highRiskTools = ['code_execution', 'email_send'];

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AgentStatus({ agent, isSelected, onSelect, circuitBreakerActive }: AgentStatusProps) {
  const [showPermissions, setShowPermissions] = useState(false);
  const config = statusConfig[agent.status];
  const StatusIcon = config.icon;
  const allowedCount = agent.permissions.filter((p) => p.allowed).length;

  return (
    <div
      className={cn(
        'relative rounded-xl border bg-white p-4 cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:border-securityBlue/40',
        isSelected
          ? 'border-securityBlue shadow-md ring-2 ring-securityBlue/20'
          : 'border-gray-200 shadow-sm',
      )}
      onClick={() => onSelect(agent)}
      onMouseEnter={() => setShowPermissions(true)}
      onMouseLeave={() => setShowPermissions(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', config.dotClass)} />
          <h3 className="font-semibold text-gray-900 truncate text-sm">{agent.name}</h3>
        </div>
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1', config.badgeClass)}>
          <StatusIcon className="w-3 h-3" />
          {config.label}
        </span>
      </div>

      {/* Current Tool */}
      {agent.currentTool && (
        <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-600">
          <Cpu className="w-3.5 h-3.5 text-securityBlue flex-shrink-0" />
          <span className="truncate">
            <span className="text-gray-400">Using: </span>
            <span className="font-mono font-medium text-gray-700">{agent.currentTool}</span>
          </span>
        </div>
      )}

      {/* Permission count */}
      <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-600">
        <Shield className="w-3.5 h-3.5 text-securityGreen flex-shrink-0" />
        <span>
          <span className="font-medium text-securityGreen">{allowedCount}</span>
          <span className="text-gray-400">/{agent.permissions.length} tools allowed</span>
        </span>
      </div>

      {/* Last activity */}
      {agent.lastAction && (
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate text-gray-400">
            Last: {formatRelativeTime(agent.lastAction.timestamp)}
          </span>
        </div>
      )}

      {/* Circuit breaker indicator */}
      {circuitBreakerActive && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-securityRed font-medium">
          <Zap className="w-3.5 h-3.5" />
          Circuit Breaker Active
        </div>
      )}

      {/* High risk warning */}
      {agent.permissions.some((p) => p.allowed && highRiskTools.includes(p.tool)) && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-securityYellow font-medium">
          <AlertTriangle className="w-3.5 h-3.5" />
          High-risk tools enabled
        </div>
      )}

      {/* Hover: Permission list */}
      {showPermissions && (
        <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white rounded-xl border border-gray-200 shadow-xl p-3 space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Permissions</p>
          {agent.permissions.map((perm) => (
            <div key={perm.tool} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                {perm.allowed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-securityGreen" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-securityRed" />
                )}
                <span className={cn('font-mono', perm.allowed ? 'text-gray-700' : 'text-gray-400 line-through')}>
                  {perm.tool}
                </span>
              </div>
              {perm.scope && (
                <span className="text-gray-400 text-xs">{perm.scope}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
