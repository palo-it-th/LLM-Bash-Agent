import { QdrantClient } from '@qdrant/js-client-rest'
import { NextResponse } from 'next/server'
/*
====FE Code getCollection====
const response = await fetch('/api/qdrant/getCollection', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ collectionName, dimension }),
    })
*/
//Next JS API Route POST
export async function POST(request: Request) {
  try {
    const response = await getCollection()
    return NextResponse.json({ data: response })
  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}

const getCollection = async (): Promise<{
  collections: {
    name: string
  }[]
}> => {
  const client = new QdrantClient({ host: 'localhost', port: 6333 })
  const collections = await client.getCollections()
  return collections
}
