import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  const { script } = await request.json();

  // IMPORTANT: This is a basic safeguard. In a real-world scenario,
  // you'd want much more robust security measures.
  const allowedCommands = ['echo', 'ls', 'pwd'];
  const firstCommand = script.trim().split(' ')[0];
  if (!allowedCommands.includes(firstCommand)) {
    return NextResponse.json({ error: 'Command not allowed' }, { status: 403 });
  }

  try {
    const { stdout, stderr } = await execAsync(script);
    return NextResponse.json({ output: stdout + stderr });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
