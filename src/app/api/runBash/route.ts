import { NextResponse } from 'next/server'
import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'
import { generateShortUUID, getHomeDirectory } from '@/lib/utils'
import { ExecutionSchemaType } from '../runOpenAI/route'

// execute a shell command and return a promise
// promisify is a utility function that converts a callback-based function to a promise-based function
const execAsync = promisify(exec)

export async function POST(request: Request) {
  const { script, mode, workingDirectory } = await request.json()

  try {
    // const fullWorkingDirectory = `${getHomeDirectory()}/${workingDirectory}`
    const fullWorkingDirectory = path.resolve(
      getHomeDirectory(),
      workingDirectory
    )
    if (!fs.existsSync(fullWorkingDirectory)) {
      console.log('Creating directory:', fullWorkingDirectory)
      fs.mkdirSync(fullWorkingDirectory)
    }
    console.log({ fullWorkingDirectory })
    console.log(`Start runBash Command: ${script}`)
    console.log(`Start runBash Mode: ${mode}`)
    console.log(`Start runBash Directory: ${fullWorkingDirectory}`)
    const output = await executeCommand(script, mode, fullWorkingDirectory)
    return NextResponse.json({ output })
  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}

async function executeCommand(
  command: string,
  mode: string,
  workingDirectory: string
): Promise<string | undefined> {
  // Create a directory to store logs getHome directory and replace with logs
  // replace work directory with "_default????"
  const dataDir = path.resolve(process.cwd(), 'logs')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir)
  }

  if (!workingDirectory) {
    throw new Error('Working directory is required')
  }
  // Handle background processes
  if (mode === 'spawn') {
    console.log('Handling background process')
    try {
      const childProcess = spawn(command.trim(), [], {
        cwd: workingDirectory,
        shell: true,
        detached: true,
        stdio: ['ignore'],
      })
      childProcess.unref()
      console.log(
        `Started background process: ${command} in ${workingDirectory}\n`
      )
      return ''
    } catch (error: any) {
      console.error(
        `Error spawning command in ${workingDirectory}: ${error.message}`
      )
      console.log(JSON.stringify(error))
      return `Error spawning command in ${workingDirectory}: ${error.message}\n`
    }
  } else {
    try {
      console.log(`Starting......Executed ${command} in ${workingDirectory}\n`)
      const { stdout, stderr } = await execAsync(command, {
        cwd: workingDirectory,
      })

      console.log(`Executed in ${workingDirectory}:\n${stdout}${stderr}\n`)
      return stdout + stderr
    } catch (error: any) {
      console.error(
        `Error executing command in ${workingDirectory}: ${error.message}`
      )
      return `Error executing command in ${workingDirectory}: ${error.message}\n`
    }
  }
}
