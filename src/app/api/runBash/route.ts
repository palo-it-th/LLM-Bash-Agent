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
  const { script, mode } = await request.json()

  try {
    const workingDirectory = `${getHomeDirectory()}/workspace_react`
    console.log(`Start runBash Command: ${script}`)
    console.log(`Start runBash Mode: ${mode}`)
    console.log(`Start runBash Directory: ${workingDirectory}`)
    const output = await executeCommand(script, mode, workingDirectory)
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
  const logFileName = `${generateShortUUID()}-executeCommand.log`
  const dataDir = path.resolve(process.cwd(), 'logs')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir)
  }
  // console.log(
  //   `Child Process Stream Logging output to ${path.resolve(
  //     dataDir,
  //     logFileName
  //   )}`
  // )

  if (!workingDirectory) {
    throw new Error('Working directory is required')
  }
  // Handle background processes
  if (mode === 'spawn') {
    // const logStreamDir = path.resolve(dataDir, logFileName)
    // const logStream = fs.createWriteStream(logStreamDir, {
    //   flags: 'a',
    // })
    // if (mode) {
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
