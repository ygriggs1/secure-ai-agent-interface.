export interface Permission {
  tool: string;
  allowed: boolean;
  scope?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  agentId: string;
  action: string;
  tool: string;
  input: string;
  output: string;
  success: boolean;
  duration: number;
}

export interface Agent {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'error' | 'paused';
  permissions: Permission[];
  currentTool?: string;
  lastAction?: AuditLogEntry;
}

export interface SecurityContext {
  sessionId: string;
  userId: string;
  jwt: string;
  permissions: Permission[];
}
