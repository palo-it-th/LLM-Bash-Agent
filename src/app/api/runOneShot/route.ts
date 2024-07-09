import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'

const groq = new Groq()

export async function POST(request: Request) {
  const { prompt } = await request.json()
  console.log({ prompt })
  try {
    //openai|groq|antrhopic
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
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
