import { ModelName } from '@/lib/utils'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { RunnableToolFunctionWithParse } from 'openai/lib/RunnableFunction'
import { JSONSchema } from 'openai/lib/jsonschema'
import { ZodSchema, z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

/**
 * A generic utility function that returns a RunnableFunction
 * you can pass to `.runTools()`,
 * with a fully validated, typesafe parameters schema.
 *
 * You are encouraged to copy/paste this into your codebase!
 */
function zodFunction<T extends object>({
  function: fn,
  schema,
  description = '',
  name,
}: {
  function: (args: T) => Promise<object>
  schema: ZodSchema<T>
  description?: string
  name?: string
}): RunnableToolFunctionWithParse<T> {
  return {
    type: 'function',
    function: {
      function: fn,
      name: name ?? fn.name,
      description: description,
      parameters: zodToJsonSchema(schema) as JSONSchema,
      parse(input: string): T {
        const obj = JSON.parse(input)
        return schema.parse(obj)
      },
    },
  }
}
const db = [
  {
    id: 'a1',
    name: 'NIRAS PASSO - LAW OF Human nature',
    genre: 'mystery',
    description: `In NIRAS PASSO - LAW OF Human Nature, a mysterious web of intrigue and human psychology unfolds. Set against a backdrop of secrets, betrayals, and hidden motives, the story follows Niras Passo, a brilliant yet enigmatic detective, as he navigates the complexities of human nature to solve a case that defies logic. Each step brings him closer to uncovering a dark truth, but the more he learns, the more he realizes that the true enemy may lie within. This gripping mystery takes readers on a psychological journey where every character's nature is questioned, and nothing is as it seems.`,
  },
  {
    id: 'a2',
    name: 'All the Light We Cannot See',
    genre: 'historical',
    description: `In a mining town in Germany, Werner Pfennig, an orphan, grows up with his younger sister, enchanted by a crude radio they find that brings them news and stories from places they have never seen or imagined. Werner becomes an expert at building and fixing these crucial new instruments and is enlisted to use his talent to track down the resistance. Deftly interweaving the lives of Marie-Laure and Werner, Doerr illuminates the ways, against all odds, people try to be good to one another.`,
  },
  {
    id: 'a3',
    name: 'Where the Crawdads Sing',
    genre: 'historical',
    description: `For years, rumors of the “Marsh Girl” haunted Barkley Cove, a quiet fishing village. Kya Clark is barefoot and wild; unfit for polite society. So in late 1969, when the popular Chase Andrews is found dead, locals immediately suspect her.
But Kya is not what they say. A born naturalist with just one day of school, she takes life's lessons from the land, learning the real ways of the world from the dishonest signals of fireflies. But while she has the skills to live in solitude forever, the time comes when she yearns to be touched and loved. Drawn to two young men from town, who are each intrigued by her wild beauty, Kya opens herself to a new and startling world—until the unthinkable happens.`,
  },
  {
    id: 'a4',
    name: 'OSWALD - The Echo of Vanishing Shadows',
    genre: 'mystery',
    description: `When a renowned anthropologist, Dr. Elias Oswald Wolfe, mysteriously disappears during a research trip to a forgotten island, the world assumes it's just another tragic accident. But when his estranged daughter, Mia Wolfe, receives a cryptic letter postmarked after his disappearance, she is thrust into a dangerous investigation that pulls her deeper into her father’s secretive world.
Teaming up with a jaded former detective, Mia uncovers a series of strange symbols, ancient myths, and whispers of a hidden society. The deeper they dig, the more they realize they are being watched—and hunted. As Mia unravels the truth, she must confront not only the shadowy forces behind her father’s fate but also the dark secrets of her own past.
In OSWALD - The Echo of Vanishing Shadows, nothing is what it seems, and the truth lies in a place where reality bends, and the shadows whisper untold stories.`,
  },
]
// Define your functions, alongside zod schemas.

const ListParams = z.object({
  genre: z.enum(['mystery', 'nonfiction', 'memoir', 'romance', 'historical']),
})
type ListParams = z.infer<typeof ListParams>
async function listBooks({ genre }: ListParams) {
  return db
    .filter((item) => item.genre === genre)
    .map((item) => ({ name: item.name, id: item.id }))
}

const SearchParams = z.object({
  name: z.string(),
})
type SearchParams = z.infer<typeof SearchParams>
async function searchBooks({ name }: SearchParams) {
  return db
    .filter((item) => item.name.includes(name))
    .map((item) => ({ name: item.name, id: item.id }))
}

const GetParams = z.object({
  id: z.string(),
})
type GetParams = z.infer<typeof GetParams>
async function getBook({ id }: GetParams) {
  return db.find((item) => item.id === id)!
}

export async function POST(request: Request) {
  const { messages }: { messages: ChatCompletionMessageParam[] } =
    await request.json()
  console.log(messages)
  try {
    const openai = new OpenAI()
    const runner = openai.beta.chat.completions
      .runTools({
        model: ModelName.GPT4O,
        stream: true,
        tools: [
          zodFunction({
            function: listBooks,
            schema: ListParams,
            description:
              'List queries books by genre, and returns a list of names of books',
          }),
          zodFunction({
            function: searchBooks,
            schema: SearchParams,
            description:
              'Search queries books by their name and returns a list of book names and their ids',
          }),
          zodFunction({
            function: getBook,
            schema: GetParams,
            description:
              "Get returns a book's detailed information based on the id of the book. Note that this does not accept names, and only IDs, which you can get by using search.",
          }),
        ],
        messages,
      })
      .on('message', (msg) => console.log('msg', msg))
      .on('functionCall', (functionCall) =>
        console.log('functionCall', functionCall)
      )
      .on('functionCallResult', (functionCallResult) =>
        console.log('functionCallResult', functionCallResult)
      )
      .on('content', (diff) => process.stdout.write(diff))

    const result = await runner.finalChatCompletion()
    console.log()
    console.log('messages')
    console.log(runner.messages)

    console.log()
    console.log('final chat completion')
    console.dir(result, { depth: null })
    return NextResponse.json({ message: runner.messages })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}
