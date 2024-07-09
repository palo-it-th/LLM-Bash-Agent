import { NextResponse } from 'next/server'
import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import * as path from 'path'
import * as os from 'os'

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
    const output = await executeCommand(script)
    return NextResponse.json({ output })
  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}

function expandPath(inputPath: string): string {
  if (inputPath.startsWith('~')) {
    return path.join(os.homedir(), inputPath.slice(1))
  }
  return inputPath.replace(
    /\$([A-Za-z_][A-Za-z0-9_]*)/g,
    (_, envVar) => process.env[envVar] || ''
  )
}

async function executeCommand(command: string): Promise<string> {
  const parts = command.split('[&&/]').map((part) => part.trim())
  console.log({ parts })
  let currentDir = process.cwd()
  let output = ''

  for (const part of parts) {
    if (part.startsWith('cd ')) {
      // Handle directory change with environment variable expansion
      const newDir = expandPath(part.slice(3).trim())
      currentDir = path.resolve(currentDir, newDir)
      output += `Changed directory to: ${currentDir}\n`
    } else if (part.endsWith(' &')) {
      // Handle background processes
      const cmd = part.slice(0, -2).trim()
      const childProcess = spawn(cmd, [], {
        cwd: currentDir,
        shell: true,
        detached: true,
        stdio: 'ignore',
      })
      childProcess.unref()
      output += `Started background process: ${cmd} in ${currentDir}\n`
    } else {
      // Execute other commands
      try {
        const { stdout, stderr } = await execAsync(part, { cwd: currentDir })
        output += `Executed in ${currentDir}:\n${stdout}${stderr}\n`
      } catch (error: any) {
        output += `Error executing command in ${currentDir}: ${error.message}\n`
      }
    }
  }

  return output
}
