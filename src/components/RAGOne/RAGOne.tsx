'use client'
import React, { use, useCallback, useEffect } from 'react'
import { useState } from 'react'

import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import './chat.css'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import OpenAI from 'openai'

import { chunk } from 'llm-chunk'
import { get } from 'http'
import { calculateCosineSimilarity } from '@/lib/utils'
import { set } from 'zod'
const RAGOne = () => {
  const [sourceDocument, setSourceDocument] = useState<string>('')
  const [query, setQuery] = useState<string>('')
  const [chunks, setChunks] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [embeddingsSourceDocuments, setEmbeddingsSourceDocuments] = useState<
    OpenAI.Embeddings.Embedding[]
  >([])
  const [embeddingsQuery, setEmbeddingsQuery] = useState<
    OpenAI.Embeddings.Embedding[]
  >([])
  const [chunksOptions, setChunksOptions] = useState({
    minLength: 0,
    maxLength: 500,
    splitter: 'paragraph' as 'paragraph',
    overlap: 0,
    delimiters: '\n',
  })
  const [sortedSimilarities, setSortedSimilarities] = useState<
    { similarity: number; index: number }[]
  >([])
  const [topK, setTopK] = useState<number>(1)
  const getCosineSimilarity = useCallback(async () => {
    if (!embeddingsSourceDocuments || !embeddingsQuery) return
    const similarities = embeddingsSourceDocuments?.map((embedding, index) => {
      return {
        similarity: calculateCosineSimilarity(
          embedding.embedding,
          embeddingsQuery[0].embedding
        ),
        index,
      }
    })
    //sort from highest to lowest
    const sortedSimilarities = similarities
      .slice()
      .sort((a, b) => b.similarity - a.similarity)

    setSortedSimilarities(sortedSimilarities)
  }, [embeddingsSourceDocuments, embeddingsQuery])

  const getQueryEmbedding = useCallback(async () => {
    setIsLoading(true)
    try {
      if (!query || query.length === 0) return
      const response = await fetch('/api/runEmbedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: [query],
        }),
      })
      const { embeddings }: { embeddings: OpenAI.Embeddings.Embedding[] } =
        await response.json()

      setEmbeddingsQuery(embeddings)
    } catch (error: any) {
      console.error('Error:', error.message)
    } finally {
      setIsLoading(false)
    }
  }, [query])
  const getSourceDocumentEmbedding = useCallback(async () => {
    setIsLoading(true)
    try {
      if (chunks.length === 0) return
      const response = await fetch('/api/runEmbedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: chunks,
        }),
      })
      const { embeddings }: { embeddings: OpenAI.Embeddings.Embedding[] } =
        await response.json()

      setEmbeddingsSourceDocuments(embeddings)
    } catch (error: any) {
      console.error('Error getSourceDocumentEmbedding:', error.message)
    } finally {
      setIsLoading(false)
    }
  }, [chunks])
  useEffect(() => {
    if (!sourceDocument && sourceDocument.length === 0) {
      setEmbeddingsSourceDocuments([])
      return
    }
    setChunks(chunk(sourceDocument, chunksOptions))
  }, [sourceDocument, chunksOptions])

  useEffect(() => {
    if (chunks.length === 0) return
    getSourceDocumentEmbedding()
  }, [chunks, getSourceDocumentEmbedding])

  useEffect(() => {
    getQueryEmbedding()
  }, [query, getQueryEmbedding])

  useEffect(() => {
    if (embeddingsQuery.length === 0 || embeddingsSourceDocuments?.length === 0)
      return
    getCosineSimilarity()
  }, [embeddingsQuery, embeddingsSourceDocuments, getCosineSimilarity])

  return (
    <div className="flex flex-col">
      <div className="p-4 flex flex-row">
        <h3 className="text-sm font-bold mb-2 mr-2">TopK</h3>
        <Textarea
          placeholder="Enter your top K"
          value={topK}
          onChange={(e) => {
            setTopK(Number(e.target.value.trim()))
          }}
          className="mb-2 mr-2"
          disabled={isLoading}
        />
        <h3 className="text-sm font-bold mb-2 mr-2">Delimiter</h3>
        <Textarea
          placeholder="Enter your delimiter"
          value={chunksOptions.delimiters}
          onChange={(e) => {
            setChunksOptions({
              ...chunksOptions,
              delimiters: e.target.value,
            })
          }}
          className="mb-2 mr-2"
          disabled={isLoading}
        />
      </div>
      <div className="h-[95vh] p-4 flex flex-row overflow-x-auto whitespace-nowrap space-x-4">
        <Card className="p-4 w-full overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">Query</h3>
          <Textarea
            placeholder="Enter your query here"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value.trim())
            }}
            className="mb-4"
            disabled={isLoading}
          />

          <h3 className="text-xl font-bold mb-4">Source Document</h3>
          <Textarea
            value={sourceDocument}
            onChange={(e) => setSourceDocument(e.target.value)}
            placeholder="Paste your source document here"
            className="w-full h-full"
            disabled={isLoading}
          />
        </Card>
        <Card className="p-4 w-full overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">
            Source Document Chunk {chunks.length}
          </h3>
          {chunks.map((word, index) => (
            <div key={index}>
              <span key={index} className="text-blue-500 whitespace-pre-wrap">
                {word}
              </span>
              <hr />
            </div>
          ))}
        </Card>
        <Card className="p-4 w-full overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">Query Embedding</h3>
          <span className="text-sm text-gray-500 whitespace-pre-wrap w-full mb-6">
            {embeddingsQuery?.map((embedding) =>
              embedding.embedding.slice(0, 10).join(', ')
            )}
            ...
          </span>
          <h3 className="text-xl font-bold mb-4 mt-4">
            Source Document Embedding {embeddingsSourceDocuments?.length}
          </h3>
          {embeddingsSourceDocuments?.map((embedding, index) => (
            <div key={index}>
              <span key={index} className="text-blue-500 whitespace-pre-wrap">
                {embedding.embedding.slice(0, 10).join(', ')}...
              </span>
              <hr />
            </div>
          ))}
        </Card>
        <Card className="p-4 w-full overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">
            Most Similar Chunk To Query is
          </h3>
          {sortedSimilarities.slice(0, topK).map((similarity, index) => (
            <div key={index}>
              <span key={index} className="text-blue-500 whitespace-pre-wrap">
                {chunks[similarity.index]?.trim()}
              </span>
              <hr />
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

export default RAGOne
