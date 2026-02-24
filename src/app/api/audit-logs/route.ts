import { NextRequest, NextResponse } from 'next/server';
import { mockAuditLogs } from '@/lib/mockData';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(request: NextRequest) {
  await sleep(100 + Math.random() * 200);

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10)));
  const agentId = searchParams.get('agentId');
  const tool = searchParams.get('tool');
  const success = searchParams.get('success');

  let filtered = [...mockAuditLogs];

  if (agentId) filtered = filtered.filter((l) => l.agentId === agentId);
  if (tool) filtered = filtered.filter((l) => l.tool === tool);
  if (success !== null && success !== '') {
    filtered = filtered.filter((l) => l.success === (success === 'true'));
  }

  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const data = filtered.slice((page - 1) * pageSize, page * pageSize);

  return NextResponse.json({
    logs: data,
    pagination: { page, pageSize, total, totalPages },
  });
}
