import { NextResponse } from 'next/server'

import fs from 'fs/promises'
import path from 'path'
import { generateShortUUID } from '@/lib/utils'

export async function POST(request: Request) {
  const { messages } = await request.json()
  // replace first "Instruction:" string and trim then take first 12 characters and replace all special string and space with underscore
  const fileName = messages[1]
    ? messages[1].content
        .replace('Instruction:', '')
        .trim()
        .slice(0, messages[1].length > 20 ? 20 : messages[1].length)
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase()
    : generateShortUUID()
  const savedLocation = `./data/${fileName}_${Date.now()}.json`

  try {
    await saveToFile(savedLocation, JSON.stringify(messages), 'json')
    return NextResponse.json({
      output: `Prompt saved successfully to ${savedLocation}`,
    })
  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}
type FileMode = 'jsonl' | 'text' | 'json'
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
