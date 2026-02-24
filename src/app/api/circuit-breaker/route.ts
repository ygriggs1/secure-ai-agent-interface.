import { NextRequest, NextResponse } from 'next/server';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  await sleep(100 + Math.random() * 200);
  try {
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: 'action is required' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      action,
      timestamp: new Date().toISOString(),
      message:
        action === 'pause_all'
          ? 'Emergency stop activated. All agents have been paused.'
          : `Circuit breaker action '${action}' executed.`,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
