import { QdrantClient } from '@qdrant/js-client-rest'
import { NextResponse } from 'next/server'
export interface SearchResult {
  points: {
    id: string | number
    version: number
    score: number
    payload?:
      | Record<string, unknown>
      | {
          [key: string]: unknown
        }
      | null
      | undefined
    vector?:
      | Record<string, unknown>
      | number[]
      | number[][]
      | {
          [key: string]:
            | number[]
            | number[][]
            | {
                text: string
                model?: string | null | undefined
              }
            | {
                indices: number[]
                values: number[]
              }
            | undefined
        }
      | {
          text: string
          model?: string | null | undefined
        }
      | null
      | undefined
    shard_key?: string | number | Record<string, unknown> | null | undefined
    order_value?: number | Record<string, unknown> | null | undefined
  }[]
}
/*
====FE Code====
fetch('/api/qdrant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collectionName,
        embeddings: embeddingsSourceDocuments.map((embedding, index) => ({
          // id: embedding.id,
          embedding: embedding.embedding,
          pageContent: pdfContent[index].pageContent,
          metadata: pdfContent[index].metadata,
        })),
      }),
    })

*/
//Next JS API Route POST
export async function POST(request: Request) {
  const {
    collectionName,
    vector,
  }: {
    collectionName: string
    vector: number[]
  } = await request.json()
  // console.log(collectionName, vector)
  try {
    const response = await searchQuery(collectionName, vector)
    return NextResponse.json({ data: response })
  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}

const searchQuery = async (
  collectionName: string,
  vector: number[]
): Promise<SearchResult> => {
  try {
    const client = new QdrantClient({ host: 'localhost', port: 6333 })
    let searchResult = await client.query(collectionName, {
      query: vector,
      limit: 3,
      with_vector: true,
      with_payload: true,
    })

    return searchResult
  } catch (e) {
    console.error(`searchQuery Error: ${e}`)
    throw new Error(`searchQuery Error: ${e}`)
  }
}
