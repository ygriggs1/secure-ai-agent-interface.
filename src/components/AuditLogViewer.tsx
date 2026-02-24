'use client';

import { Fragment } from 'react';
import { AuditLogEntry } from '@/types/agent';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Radio,
  Search,
  XCircle,
} from 'lucide-react';
import { useState, useMemo } from 'react';

interface AuditLogViewerProps {
  logs: AuditLogEntry[];
  agentNames: Record<string, string>;
}

const PAGE_SIZE = 10;

const toolColors: Record<string, string> = {
  database_query: 'bg-purple-100 text-purple-700',
  file_system: 'bg-blue-100 text-blue-700',
  api_call: 'bg-cyan-100 text-cyan-700',
  code_execution: 'bg-orange-100 text-orange-700',
  email_send: 'bg-pink-100 text-pink-700',
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function AuditLogViewer({ logs, agentNames }: AuditLogViewerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterTool, setFilterTool] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const tools = useMemo(() => Array.from(new Set(logs.map((l) => l.tool))), [logs]);
  const agentIds = useMemo(() => Array.from(new Set(logs.map((l) => l.agentId))), [logs]);

  const filtered = useMemo(() => {
    let result = [...logs];
    if (filterAgent !== 'all') result = result.filter((l) => l.agentId === filterAgent);
    if (filterTool !== 'all') result = result.filter((l) => l.tool === filterTool);
    if (filterStatus !== 'all') result = result.filter((l) => (filterStatus === 'success' ? l.success : !l.success));
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.action.toLowerCase().includes(q) ||
          l.input.toLowerCase().includes(q) ||
          l.output.toLowerCase().includes(q) ||
          (agentNames[l.agentId] || '').toLowerCase().includes(q),
      );
    }
    result.sort((a, b) => {
      const ta = new Date(a.timestamp).getTime();
      const tb = new Date(b.timestamp).getTime();
      return sortDir === 'desc' ? tb - ta : ta - tb;
    });
    return result;
  }, [logs, filterAgent, filterTool, filterStatus, search, sortDir, agentNames]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-900 text-sm">Audit Log</h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-securityGreen font-medium">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Live
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-securityBlue/30 focus:border-securityBlue"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={filterAgent}
            onChange={(e) => { setFilterAgent(e.target.value); setPage(1); }}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-securityBlue/30 bg-white"
          >
            <option value="all">All Agents</option>
            {agentIds.map((id) => (
              <option key={id} value={id}>{agentNames[id] || id}</option>
            ))}
          </select>
          <select
            value={filterTool}
            onChange={(e) => { setFilterTool(e.target.value); setPage(1); }}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-securityBlue/30 bg-white"
          >
            <option value="all">All Tools</option>
            {tools.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-securityBlue/30 bg-white"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
          <button
            onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 flex items-center gap-1 hover:bg-gray-50 bg-white"
          >
            <Clock className="w-3 h-3" />
            {sortDir === 'desc' ? 'Newest' : 'Oldest'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-gray-500">Time</th>
              <th className="text-left px-3 py-2 font-medium text-gray-500">Agent</th>
              <th className="text-left px-3 py-2 font-medium text-gray-500">Action</th>
              <th className="text-left px-3 py-2 font-medium text-gray-500">Tool</th>
              <th className="text-left px-3 py-2 font-medium text-gray-500">Status</th>
              <th className="text-left px-3 py-2 font-medium text-gray-500">Duration</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">No logs match your filters</td>
              </tr>
            )}
            {paginated.map((log) => (
              <Fragment key={log.id}>
                <tr
                  className={cn(
                    'border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors',
                    expandedId === log.id && 'bg-gray-50',
                  )}
                  onClick={() => toggleExpand(log.id)}
                >
                  <td suppressHydrationWarning className="px-3 py-2 text-gray-400 whitespace-nowrap">{formatRelativeTime(log.timestamp)}</td>
                  <td className="px-3 py-2 font-medium text-gray-700 whitespace-nowrap">{agentNames[log.agentId] || log.agentId}</td>
                  <td className="px-3 py-2 font-mono text-gray-600 max-w-24 truncate">{log.action}</td>
                  <td className="px-3 py-2">
                    <span className={cn('px-1.5 py-0.5 rounded text-xs font-mono', toolColors[log.tool] || 'bg-gray-100 text-gray-600')}>
                      {log.tool}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {log.success ? (
                      <span className="flex items-center gap-1 text-securityGreen font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        OK
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-securityRed font-medium">
                        <XCircle className="w-3.5 h-3.5" />
                        Fail
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{formatDuration(log.duration)}</td>
                  <td className="px-3 py-2 text-gray-400">
                    {expandedId === log.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </td>
                </tr>
                {expandedId === log.id && (
                  <tr key={`${log.id}-expanded`} className="bg-gray-50">
                    <td colSpan={7} className="px-3 py-3">
                      <div className="space-y-2">
                        {!log.success && (
                          <div className="flex items-center gap-1.5 text-securityRed text-xs font-medium mb-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {log.output.startsWith('PERMISSION DENIED') ? 'Permission Denied' :
                              log.output.startsWith('CIRCUIT BREAKER') ? 'Circuit Breaker Triggered' : 'Error'}
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-500">Input: </span>
                          <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs text-gray-700 break-all">{log.input}</code>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Output: </span>
                          <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs text-gray-700 break-all">{log.output}</code>
                        </div>
                        <div suppressHydrationWarning className="text-gray-400 text-xs">
                          {new Date(log.timestamp).toLocaleString()} · {log.id}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {filtered.length === 0 ? '0' : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)}`} of {filtered.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="text-xs px-2 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={cn(
                'text-xs w-6 h-6 rounded border',
                p === page ? 'bg-securityBlue text-white border-securityBlue' : 'border-gray-200 hover:bg-gray-50',
              )}
            >
              {p}
            </button>
          ))}
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="text-xs px-2 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
