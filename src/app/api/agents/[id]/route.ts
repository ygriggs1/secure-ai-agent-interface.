import { NextRequest, NextResponse } from 'next/server';
import { mockAgents } from '@/lib/mockData';
import { Permission } from '@/types/agent';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const agentStore = new Map(mockAgents.map((a) => [a.id, { ...a }]));

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await sleep(100 + Math.random() * 200);
  const { id } = await params;
  const agent = agentStore.get(id);
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }
  return NextResponse.json({ agent });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await sleep(100 + Math.random() * 200);
  const { id } = await params;
  const agent = agentStore.get(id);
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }
  try {
    const body = await request.json();
    const permissions: Permission[] = body.permissions;
    if (!Array.isArray(permissions)) {
      return NextResponse.json({ error: 'permissions must be an array' }, { status: 400 });
    }
    agentStore.set(id, { ...agent, permissions });
    return NextResponse.json({ agent: agentStore.get(id) });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
