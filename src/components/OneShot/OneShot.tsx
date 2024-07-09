'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

import { Button } from '../ui/button'
import { Spinner } from '../ui/spinner'
import './chat.css'

type Message = {
  user: 'human' | 'ai'
  text: string
}

const OneShot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { user: 'ai', text: 'Hello, human!' },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') {
      return
    }

    setMessages([...messages, { user: 'human', text: inputMessage }])
    setInputMessage('')
    setIsLoading(true)
    try {
      const response = await fetch('/api/runOneShot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputMessage }),
      })
      const data = await response.json()

      setMessages((prev) => [...prev, { user: 'ai', text: data.output }])
    } catch (error: any) {
      console.error('Error:', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="p-4">
        {/* Chat history */}
        <div className="flex flex-col space-y-2 p-4 border-2 border-gray-300 rounded-lg overflow-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message-bubble ${message.user === 'human' ? 'human-message bg-blue-200' : 'ai-message bg-green-200'} ${message.user === 'human' ? 'ml-auto' : 'mr-auto'}`}
            >
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          ))}
        </div>
        {/* Input and Send Button */}
        <div className="mt-4 w-full flex items-center justify-center  ">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="p-2 border-2 border-gray-300 rounded-lg flex-1"
            placeholder="Message AI"
          />
          <Button
            onClick={handleSendMessage}
            className="bg-blue-500 flex items-center justify-center ml-2"
            disabled={isLoading}
          >
            Send
            {isLoading && <Spinner className="flex ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default OneShot
