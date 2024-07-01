import { NextResponse } from 'next/server'
import { exec, spawn } from 'child_process'
import { promisify } from 'util'

// execute a shell command and return a promise
// promisify is a utility function that converts a callback-based function to a promise-based function
const execAsync = promisify(exec)

export async function POST(request: Request) {
  const { script } = await request.json()

  // IMPORTANT: This is a basic safeguard. In a real-world scenario,
  // you'd want much more robust security measures.
  // const allowedCommands = ["echo", "ls", "pwd"];
  // const firstCommand = script.trim().split(" ")[0];
  // if (!allowedCommands.includes(firstCommand)) {
  //   return NextResponse.json({ error: "Command not allowed" }, { status: 403 });
  // }

  try {
    const { stdout, stderr } = await execAsync(script)
    return NextResponse.json({ output: stdout + stderr })
  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}
