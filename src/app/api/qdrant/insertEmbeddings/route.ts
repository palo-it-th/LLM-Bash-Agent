import { generateShortUUID } from '@/lib/utils'
import { QdrantClient } from '@qdrant/js-client-rest'
import { NextResponse } from 'next/server'
export interface EmbeddingQdrant {
  embedding: number[]
  pageContent: string
  metadata: Record<string, any>
}
export interface OperationInfo {
  operation_id?: number | null | undefined
  status: 'acknowledged' | 'completed'
}
/*
====FE Code====
fetch('/api/qdrant/insertEmbeddings', {
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
    embeddings,
  }: {
    collectionName: string
    embeddings: EmbeddingQdrant[]
  } = await request.json()
  try {
    const response = await insertEmbeddings(collectionName, embeddings)
    return NextResponse.json({ data: response })
  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 })
  }
}

const insertEmbeddings = async (
  collectionName: string,
  embeddings: EmbeddingQdrant[]
): Promise<OperationInfo> => {
  try {
    const client = new QdrantClient({ host: 'localhost', port: 6333 })
    const points = embeddings.map((embedding, index) => ({
      id: index,
      vector: embedding.embedding,
      payload: {
        pageContent: embedding.pageContent,
        ...embedding.metadata,
      },
    }))

    const operationInfo = await client.upsert(collectionName, {
      points,
      wait: true,
    })
    return operationInfo
  } catch (error) {
    console.error('Error insertEmbeddings:', error)
    throw new Error(`Error insertEmbeddings: ${error}`)
  }
}
