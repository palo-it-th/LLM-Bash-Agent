import { NextResponse } from 'next/server'
import OpenAI from 'openai'

import { systemPromptJSON } from './systemPromptJSON'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'
import { ChatCompletionMessageParam } from 'openai/resources/index.js'
import { ModelName } from '@/lib/utils'

// const groq = new Groq()
export const ExecutionSchema = z.object({
  Thought: z.string(),
  ActionType: z.enum(['Execute', 'Validate']),
  Action: z.string(),
  Status: z.enum(['Success', 'Stopped', 'Failed', 'In Progress']),
  ChildProcess: z.enum(['spawn', 'exec']),
})

export type ExecutionSchemaType = z.infer<typeof ExecutionSchema>

export const ExecutionWithObsSchema = z.object({
  Thought: z.string(),
  ActionType: z.string(),
  Action: z.string(),
  Observation: z.string(),
})

//create_react_chatbot_1721146210338.txt
async function readFileFromDataFolder(fileName: string) {
  const data = await fetch(`data/${fileName}`)
  return data.text()
}

export async function POST(request: Request) {
  const { messages }: { messages: ChatCompletionMessageParam[] } =
    await request.json()
  console.log(messages)
  const openai = new OpenAI()
  let llm = openai
  try {
    const completion = await llm.beta.chat.completions.parse({
      messages,
      // model: ModelName.Llama3,
      model: ModelName.GPT4O,
      temperature: 0.2,
      max_tokens: 3000,
      top_p: 0.2,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: zodResponseFormat(ExecutionSchema, 'execution'),
    })
    // console.dir(completion, { depth: 5 })

    const message = completion.choices[0]?.message

    return NextResponse.json({
      output: message?.parsed || undefined,
      messages,
      completion,
    })
  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}
