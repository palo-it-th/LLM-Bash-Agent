import { QdrantClient } from '@qdrant/js-client-rest'
import { NextResponse } from 'next/server'

/*
====FE Code====
const response = await fetch('/api/qdrant/createCollection', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ collectionName, dimension }),
})

*/
//Next JS API Route POST
export async function POST(request: Request) {
  const {
    collectionName,
    dimension,
  }: { collectionName: string; dimension: number } = await request.json()
  console.log(collectionName, dimension)
  try {
    const response = await createCollection(collectionName, dimension)
    return NextResponse.json({ response })
  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}

const createCollection = async (collectionName: string, size: number) => {
  const client = new QdrantClient({ host: 'localhost', port: 6333 })
  await client.createCollection(collectionName, {
    vectors: {
      distance: 'Cosine',
      size,
    },
  })
}
