import { NextResponse } from 'next/server'

import fs from 'fs/promises'
import path from 'path'
import { generateShortUUID } from '@/lib/utils'
import OpenAI from 'openai'

export async function POST(request: Request) {
  const { texts }: { texts: string[] } = await request.json()
  const openai = new OpenAI()
  const input = texts
    .map((text) => {
      //clean text replace all \n with '' and \t with '' and space with ''
      text = text.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, '')
      return text
    })
    .filter((text) => text.length > 0) //filter out empty strings

  try {
    const result = await openai.embeddings.create({
      input,
      model: 'text-embedding-3-large',
    })

    const embeddings = result.data
    return NextResponse.json({
      embeddings,
    })
  } catch (error: any) {
    console.log(error)
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}
