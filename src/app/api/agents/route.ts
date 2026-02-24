import { NextResponse } from 'next/server';
import { mockAgents } from '@/lib/mockData';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET() {
  await sleep(100 + Math.random() * 200);
  return NextResponse.json({ agents: mockAgents });
}
