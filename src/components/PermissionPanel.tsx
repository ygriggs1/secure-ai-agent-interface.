'use client';

import { Agent, Permission } from '@/types/agent';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle2, RefreshCw, Save, Shield, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PermissionPanelProps {
  agent: Agent | null;
  onUpdate: (agentId: string, permissions: Permission[]) => void;
}

const toolDescriptions: Record<string, string> = {
  database_query: 'Read and write data from connected databases',
  file_system: 'Access local and remote file system paths',
  api_call: 'Make HTTP requests to external and internal APIs',
  code_execution: 'Execute arbitrary code in a sandboxed environment',
  email_send: 'Compose and send emails to configured recipients',
};

const scopeOptions: Record<string, string[]> = {
  database_query: ['read-only', 'read-write'],
  file_system: ['read-only', 'read-write'],
  api_call: ['restricted', 'internal', 'all'],
  code_execution: ['sandboxed'],
  email_send: ['internal', 'all'],
};

const highRiskTools = ['code_execution', 'email_send'];

export default function PermissionPanel({ agent, onUpdate }: PermissionPanelProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (agent) {
      setPermissions(agent.permissions.map((p) => ({ ...p })));
      setIsDirty(false);
      setSaved(false);
    }
  }, [agent]);

  const handleToggle = (tool: string) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.tool === tool ? { ...p, allowed: !p.allowed } : p,
      ),
    );
    setIsDirty(true);
    setSaved(false);
  };

  const handleScope = (tool: string, scope: string) => {
    setPermissions((prev) =>
      prev.map((p) => (p.tool === tool ? { ...p, scope } : p)),
    );
    setIsDirty(true);
    setSaved(false);
  };

  const handleApply = () => {
    if (!agent) return;
    onUpdate(agent.id, permissions);
    setIsDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (!agent) return;
    setPermissions(agent.permissions.map((p) => ({ ...p })));
    setIsDirty(false);
    setSaved(false);
  };

  const getScopeColor = (perm: Permission) => {
    if (!perm.allowed) return 'text-securityRed';
    if (perm.scope === 'read-only' || perm.scope === 'restricted' || perm.scope === 'sandboxed')
      return 'text-securityYellow';
    return 'text-securityGreen';
  };

  if (!agent) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col items-center justify-center h-full min-h-48">
        <Shield className="w-10 h-10 text-gray-300 mb-3" />
        <p className="text-sm text-gray-400 font-medium">No agent selected</p>
        <p className="text-xs text-gray-300 mt-1">Click an agent to manage permissions</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">Permissions</h2>
            <p className="text-xs text-gray-400 mt-0.5">{agent.name}</p>
          </div>
          {saved && (
            <span className="flex items-center gap-1 text-xs text-securityGreen font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Saved
            </span>
          )}
        </div>
      </div>

      {/* Permissions list */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {permissions.map((perm) => {
          const isHighRisk = highRiskTools.includes(perm.tool);
          const scopes = scopeOptions[perm.tool] || [];

          return (
            <div
              key={perm.tool}
              className={cn(
                'rounded-lg border p-3 transition-colors',
                perm.allowed ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-white',
              )}
            >
              {/* Tool row */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn('font-mono text-xs font-semibold truncate', getScopeColor(perm))}>
                    {perm.tool}
                  </span>
                  {isHighRisk && (
                    <AlertTriangle className="w-3.5 h-3.5 text-securityYellow flex-shrink-0" aria-label="High-risk tool" />
                  )}
                </div>

                {/* Toggle */}
                <button
                  onClick={() => handleToggle(perm.tool)}
                  className={cn(
                    'relative w-9 h-5 rounded-full transition-colors flex-shrink-0',
                    perm.allowed ? 'bg-securityGreen' : 'bg-gray-300',
                  )}
                  aria-label={`Toggle ${perm.tool}`}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                      perm.allowed ? 'translate-x-4' : 'translate-x-0',
                    )}
                  />
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-400 mb-2">{toolDescriptions[perm.tool] || ''}</p>

              {/* Status + Scope */}
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1 text-xs">
                  {perm.allowed ? (
                    <CheckCircle2 className="w-3 h-3 text-securityGreen" />
                  ) : (
                    <XCircle className="w-3 h-3 text-securityRed" />
                  )}
                  <span className={cn('font-medium', perm.allowed ? 'text-securityGreen' : 'text-securityRed')}>
                    {perm.allowed ? 'Allowed' : 'Denied'}
                  </span>
                </span>

                {perm.allowed && scopes.length > 0 && (
                  <select
                    value={perm.scope || scopes[0]}
                    onChange={(e) => handleScope(perm.tool, e.target.value)}
                    className="text-xs border border-gray-200 rounded px-1.5 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-securityBlue"
                  >
                    {scopes.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 flex gap-2">
        <button
          onClick={handleApply}
          disabled={!isDirty}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg transition-colors',
            isDirty
              ? 'bg-securityBlue text-white hover:bg-securityBlue/90'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed',
          )}
        >
          <Save className="w-3.5 h-3.5" />
          Apply Changes
        </button>
        <button
          onClick={handleReset}
          disabled={!isDirty}
          className={cn(
            'flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg border transition-colors',
            isDirty
              ? 'border-gray-200 text-gray-700 hover:bg-gray-50'
              : 'border-gray-100 text-gray-300 cursor-not-allowed',
          )}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>
    </div>
  );
}
