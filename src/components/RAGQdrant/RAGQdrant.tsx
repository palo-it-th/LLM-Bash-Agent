'use client'
import React, { use, useCallback, useEffect } from 'react'
import { useState } from 'react'
import { Document } from '@langchain/core/documents'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import './chat.css'
import {
  JsonView,
  allExpanded,
  collapseAllNested,
  darkStyles,
  defaultStyles,
} from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'
import { Textarea } from '@/components/ui/textarea'
import OpenAI from 'openai'
import { set } from 'zod'
import {
  EmbeddingQdrant,
  OperationInfo,
} from '@/app/api/qdrant/insertEmbeddings/route'
import { SearchResult } from '@/app/api/qdrant/searchEmbeddings/route'

const RAGQdrant = () => {
  const [query, setQuery] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pdfContent, setPdfContent] = useState<Document<Record<string, any>>[]>(
    []
  )
  const [collectionName, setCollectionName] = useState<string>('')
  const [collections, setCollections] = useState<string[]>([])

  const [embeddingsSourceDocuments, setEmbeddingsSourceDocuments] = useState<
    OpenAI.Embeddings.Embedding[]
  >([])
  const [embeddingsQuery, setEmbeddingsQuery] = useState<
    OpenAI.Embeddings.Embedding[]
  >([])
  const [searchResult, setSearchResult] = useState<SearchResult>()

  useEffect(() => {
    getCollectionList()
  }, [])

  const insertEmbeddingsSourceDocumentsToVectorDatabase = async () => {
    try {
      setIsLoading(true)
      if (!embeddingsSourceDocuments || !embeddingsSourceDocuments.length)
        return
      const listOfEmbeddingQdrant: EmbeddingQdrant[] =
        embeddingsSourceDocuments.map((embedding, index) => ({
          embedding: embedding.embedding,
          pageContent: pdfContent[index].pageContent,
          metadata: pdfContent[index].metadata,
        }))
      const response = await fetch('/api/qdrant/insertEmbeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionName,
          embeddings: listOfEmbeddingQdrant,
        }),
      })

      const { data }: { data: OperationInfo } = await response.json()

      console.log({ insertEmbeddings: data })
    } catch (e) {
      console.error('Error insertEmbeddingsSourceDocumentsToVectorDatabase:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const searchEmbeddings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/qdrant/searchEmbeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionName,
          vector: embeddingsQuery[0].embedding,
        }),
      })

      const { data }: { data: SearchResult } = await response.json()

      setSearchResult(data)
    } catch (e) {
      console.error('Error searchEmbeddings:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const getCollectionList = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/qdrant/getCollection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const {
        data,
      }: {
        data: {
          collections: {
            name: string
          }[]
        }
      } = await response.json()

      setCollections(data.collections?.map((collection) => collection.name))
    } catch (e) {
      console.error('Error getCollectionList:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const createCollection = async (
    collectionName: string,
    dimension: number
  ) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/qdrant/createCollection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionName, dimension }),
      })
      getCollectionList()
    } catch (e) {
      console.error('Error createCollection:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCollection = async (collectionName: string) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/qdrant/deleteCollection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionName }),
      })
      getCollectionList()
    } catch (e) {
      console.error('Error deleteCollection:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const getSourceDocumentEmbedding = useCallback(async () => {
    setIsLoading(true)
    try {
      if (pdfContent.length === 0) return
      const response = await fetch('/api/runEmbedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: pdfContent.map((doc) => doc.pageContent),
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
  }, [pdfContent])

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading(true)
    e.preventDefault()
    try {
      if (!selectedFile) return

      const formData = new FormData()
      formData.append('pdf', selectedFile)

      const response = await fetch('/api/uploadPDF', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      setPdfContent(data.content)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="flex flex-col">
      <div className="p-4 flex flex-row content-center items-center"></div>
      <div className="h-[95vh] p-4 flex flex-row overflow-x-auto whitespace-nowrap space-x-4">
        <Card className="p-4 w-full overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Query</h3>
            <Textarea
              placeholder="Enter your query here"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
              }}
              className="mb-4"
              disabled={isLoading}
            />
            <h3 className="text-xl font-bold mb-4">Source Document</h3>
            <form onSubmit={handleSubmit}>
              <Input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
              />
              <Button
                type="submit"
                key="run-search"
                className="w-full bg-blue-800 mt-4"
                disabled={isLoading}
              >
                Upload PDF
              </Button>
            </form>

            {pdfContent && (
              <div className="mt-6">
                <h2>Documents Chunk Size {pdfContent.length}</h2>
                {pdfContent.map((doc, index) => (
                  <div>
                    <h3>{doc.id}</h3>
                    <pre className="p-4 bg-gray-100 rounded whitespace-pre-wrap max-h-[20vh] overflow-auto">
                      {doc.pageContent}
                    </pre>
                    {/* <JsonView
                      data={doc.metadata}
                      shouldExpandNode={collapseAllNested}
                      style={darkStyles}
                    /> */}
                    <hr className="border-t-2 border-blue-900 my-4" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
        <Card className="p-4 w-full overflow-y-auto flex flex-col">
          {query && query.length > 0 ? (
            <Button
              key="run-search"
              onClick={async () => {
                getQueryEmbedding()
              }}
              className="w-full bg-blue-800 mb-6"
              disabled={isLoading}
            >
              Get Query Embedding
            </Button>
          ) : (
            <></>
          )}
          {pdfContent ? (
            <Button
              key="run-embedding"
              onClick={async () => {
                getSourceDocumentEmbedding()
              }}
              className="w-full bg-blue-800 mb-6"
              disabled={isLoading}
            >
              Get Source Document Embedding
            </Button>
          ) : (
            <></>
          )}
          <h3 className="text-xl font-bold mb-4 mt-8">
            Query Embedding{' '}
            {embeddingsQuery?.length > 0
              ? `Dimension: ${embeddingsQuery[0].embedding.length}`
              : ''}
          </h3>
          <span className="text-sm text-gray-500 whitespace-pre-wrap w-full mb-6">
            {embeddingsQuery?.map((embedding) =>
              embedding.embedding.slice(0, 10).join(', ')
            )}
            ...
          </span>
          <h3 className="text-xl font-bold mb-4 mt-4 whitespace-pre-wrap">
            Source Document Embedding{' '}
            {embeddingsSourceDocuments?.length > 0
              ? `Dimension: ${embeddingsSourceDocuments[0].embedding.length}`
              : ''}
            Chunk Size:{' '}
            {embeddingsSourceDocuments?.length > 0
              ? embeddingsSourceDocuments?.length
              : ''}
          </h3>
          {embeddingsSourceDocuments?.map((embedding, index) => (
            <div key={index}>
              <span key={index} className="text-blue-500 whitespace-pre-wrap">
                {embedding.embedding.slice(0, 10).join(', ')}...
              </span>
              <hr />
            </div>
          ))}
          ...
        </Card>
        <Card className="p-4 w-full overflow-y-auto flex flex-col">
          <h3 className="text-xl font-bold mb-4">Collection Management</h3>
          {embeddingsSourceDocuments?.length > 0 ||
          embeddingsQuery?.length > 0 ? (
            <>
              <Input
                placeholder="Enter collection name"
                className="mb-4"
                value={collectionName}
                onChange={(e) => {
                  setCollectionName(e.target.value)
                }}
              />
              <div className="w-full flex">
                <Button
                  key="run-create"
                  onClick={async () => {
                    const source = embeddingsSourceDocuments
                    const query = embeddingsQuery
                    const isSourceEmpty = source.length === 0
                    const isQueryEmpty = query.length === 0
                    // If both source and query are empty, return
                    if (isSourceEmpty && isQueryEmpty) return
                    // If source is not empty, use source dimension, else use query dimension
                    const dimension = !isSourceEmpty
                      ? source[0].embedding.length
                      : query[0].embedding.length

                    createCollection(collectionName, dimension)
                  }}
                  className="w-full bg-blue-800 mb-6 mr-4"
                  disabled={isLoading}
                >
                  Create Collection
                </Button>
                <Button
                  key="run-create"
                  onClick={async () => {
                    deleteCollection(collectionName)
                  }}
                  className="w-full bg-red-800 mb-6"
                  disabled={isLoading}
                >
                  Delete Collection
                </Button>
              </div>
            </>
          ) : (
            <></>
          )}

          <h3 className="text-xl font-bold mb-4">List</h3>
          <Button
            key="run-get"
            onClick={async () => {
              getCollectionList()
            }}
            className="w-full bg-blue-800 mb-6"
            disabled={isLoading}
          >
            Get Collection List
          </Button>
          {collections?.map((collection, index) => (
            <div key={index}>
              <span className="text-sm text-gray-500 whitespace-pre-wrap w-full mb-6">
                {collection}
              </span>
              <hr />
            </div>
          ))}

          <Button
            key="run-insert"
            onClick={async () => {
              insertEmbeddingsSourceDocumentsToVectorDatabase()
            }}
            className="w-full bg-blue-800 text-[9px] mt-8 mb-8"
            disabled={isLoading}
          >
            Insert Source Embedding to Vector Database
          </Button>
        </Card>
        <Card className="p-4 w-full overflow-y-auto">
          <Button
            key="run-search"
            onClick={async () => {
              searchEmbeddings()
            }}
            className="w-full bg-blue-800 mb-6 mt-4"
            disabled={
              isLoading || !collectionName || collectionName?.length === 0
            }
          >
            Search Embeddings
          </Button>
          {searchResult?.points.map((point, index) => (
            <div key={index} className="mb-4 mt-4">
              <JsonView
                data={point}
                shouldExpandNode={collapseAllNested}
                style={darkStyles}
              />
              <hr />
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

export default RAGQdrant
