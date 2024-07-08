import { NextResponse } from 'next/server'

import fs from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
  const { prompt } = await request.json()
  // replace first "Instruction:" string and trim then take first 12 characters and replace all special string and space with underscore
  const fileName = prompt
    .replace('Instruction:', '')
    .trim()
    .slice(0, 12)
    .replace(/[^a-zA-Z0-9]/g, '_')
  const savedLocation = `./data/${fileName}_${new Date().toUTCString()}.txt`

  try {
    await saveToFile(savedLocation, prompt, 'text')
    return NextResponse.json({
      output: `Prompt saved successfully to ${savedLocation}`,
    })
  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}
type FileMode = 'jsonl' | 'text'
const saveToFile = async (
  filePath: string = './data/output.txt',
  data: string,
  mode: FileMode = 'jsonl'
): Promise<void> => {
  try {
    // Ensure the directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true })

    let contentToSave: string

    if (mode === 'jsonl') {
      // For JSONL mode, parse and stringify to ensure valid JSON, then append
      contentToSave = JSON.stringify(JSON.parse(data)) + '\n'
      await fs.appendFile(filePath, contentToSave, 'utf8')
    } else {
      // For text mode, save the string as-is to a new file
      contentToSave = data
      await fs.writeFile(filePath, contentToSave, 'utf8')
    }

    console.log(
      `Data ${mode === 'jsonl' ? 'appended' : 'saved'} successfully to ${mode.toUpperCase()} file`
    )
  } catch (error) {
    console.error(
      `Error ${mode === 'jsonl' ? 'appending to' : 'saving'} ${mode.toUpperCase()} file:`,
      error
    )
    throw error
  }
}
