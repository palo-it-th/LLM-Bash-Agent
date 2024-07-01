import { exec } from 'child_process'
import { NextResponse } from 'next/server'
import { promisify } from 'util'

// execute a shell command and return a promise
// promisify is a utility function that converts a callback-based function to a promise-based function
const execAsync = promisify(exec)

export async function POST(request: Request) {
  const { prompt } = await request.json()
  const savedLocation = '$HOME/prompt-examples/prompt.txt'

  try {
    // Write the prompt to a file in examples folder.
    // Create the folder if it doesn't exist.
    await execAsync(
      `mkdir -p $HOME/prompt-examples && echo "${prompt}" > ${savedLocation}`
    )
    return NextResponse.json({
      output: `Prompt saved successfully to ${savedLocation}`,
    })
  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}
