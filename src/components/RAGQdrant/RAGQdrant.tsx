'use client'
import React, { use, useCallback, useEffect } from 'react'
import { useState } from 'react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import './chat.css'
const RAGQdrant = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pdfContent, setPdfContent] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) return

    const formData = new FormData()
    formData.append('pdf', selectedFile)

    const response = await fetch('/api/runUpload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    setPdfContent(data.content)
  }
  return (
    <div className="flex flex-col">
      <div className="p-4 flex flex-row content-center items-center"></div>
      <div className="h-[95vh] p-4 flex flex-row overflow-x-auto whitespace-nowrap space-x-4">
        <Card className="p-4 w-full overflow-y-auto">
          <div className="space-y-4">
            <form onSubmit={handleSubmit}>
              <Input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
              />
              <Button type="submit" className="mt-4">
                Upload PDF
              </Button>
            </form>

            {pdfContent && (
              <div className="mt-6">
                <h2>Extracted PDF Content:</h2>
                <pre className="p-4 bg-gray-100 rounded">{pdfContent}</pre>
              </div>
            )}
          </div>
        </Card>
        <Card className="p-4 w-full overflow-y-auto"></Card>
        <Card className="p-4 w-full overflow-y-auto"></Card>
      </div>
    </div>
  )
}

export default RAGQdrant
