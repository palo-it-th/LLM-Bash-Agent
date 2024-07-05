import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'
import { systemPrompt } from './systemPrompt'

// const anthropic = new Anthropic()
// const openai = new OpenAI()

const groq = new Groq()
// const message = await anthropic.messages.create({
//   max_tokens: 1024,
//   messages: [{ role: 'user', content: 'Hello, Claude' }],
//   model: 'claude-3-opus-20240229',
// });

// console.log(message.content);

// const chatCompletion = await groq.chat.completions.create({
//   messages: [{ role: 'user', content: 'Explain the importance of low latency LLMs' }],
//   model: 'llama3-8b-8192',//llama3-70b-8192
// });

// console.log(chatCompletion.choices[0].message.content);

export async function POST(request: Request) {
  const { query } = await request.json()
  console.log({ query })
  try {
    //openai|groq|antrhopic
    const completion = await groq.chat.completions.create({
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
      // model: "gpt-4o",
      model: 'llama3-70b-8192',
      temperature: 0.2,
      max_tokens: 8192,
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
