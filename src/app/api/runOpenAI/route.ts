import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import Groq from 'groq-sdk'
import { systemPrompt } from './systemPrompt'

// const openai = new OpenAI()
const groq = new Groq()

enum ModelName {
  GPT4O = 'gpt-4o',
  Llama3 = 'llama3-70b-8192',
}

export async function POST(request: Request) {
  const { query } = await request.json()
  let llm = groq //openai groq
  console.log({ query })
  try {
    const completion = await llm.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: query,
        },
      ],
      model: ModelName.Llama3,
      // model: ModelName.GPT4O,
      temperature: 0.2,
      max_tokens: 3000,
      top_p: 0.2,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: ['Observation'],
    })

    console.log(completion.choices[0])
    const answer = completion.choices[0].message.content
    return NextResponse.json({ output: answer })
  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}
