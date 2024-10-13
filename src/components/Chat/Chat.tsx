'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

import { Button } from '../ui/button'
import { Spinner } from '../ui/spinner'
import './chat.css'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import React from 'react'
import {
  FaEye,
  FaEyeSlash,
  FaFileDownload,
  FaInfoCircle,
  FaMagic,
  FaRegClipboard,
} from 'react-icons/fa'
import ReactJson from 'react-json-view'

const Chat = () => {
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([])
  const [input, setInput] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [showFormattedPrompt, setShowFormattedPrompt] = useState(true)

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add the user's message to the chat
    const newMessage: ChatCompletionMessageParam = {
      role: 'user',
      content: input,
    }
    setMessages((prev) => [...prev, newMessage])

    // Clear the input field
    setInput('')

    setIsLoading(true)

    try {
      const response = await fetch('/api/runChat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, newMessage] }),
      })
      const { message } = await response.json()
      console.log({ message })
      setMessages((prev) => [...prev, message])
    } catch (error: any) {
      console.error('Error:', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault() // Prevents new line when pressing Enter
      handleSendMessage()
    }
  }

  return (
    <div className="">
      <div className="">
        {/* Chat history */}
        <div className="p-4 flex flex-row">
          <h1 className="text-2xl font-bold">Chat with OpenAI</h1>
          {showFormattedPrompt ? (
            <button onClick={() => setShowFormattedPrompt(false)}>
              <FaMagic className="m-1" />
            </button>
          ) : (
            <button onClick={() => setShowFormattedPrompt(true)}>
              <FaMagic className="m-1" />
            </button>
          )}
        </div>

        <div className="flex flex-col p-4 m-4 max-h-[64vh] h-[64vh] overflow-auto mb-40 space-y-2 p-4 border-2 border-gray-300 rounded-lg">
          {showFormattedPrompt ? (
            messages.map((message, index) => (
              <div
                key={index}
                className={`message-bubble ${message.role === 'user' ? 'human-message bg-blue-200' : 'ai-message bg-green-200'} ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
              >
                <ReactMarkdown>
                  {typeof message.content === 'string' ? message.content : ''}
                </ReactMarkdown>
              </div>
            ))
          ) : (
            <ReactJson src={messages} theme="ocean" />
          )}
        </div>

        {/* Input and Send Button */}
        <div className="p-4 mt-4 w-full flex justify-center items-end fixed bottom-0 left-0">
          <form onSubmit={handleSendMessage} className="w-full">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="w-full p-2 border-2 border-gray-300 rounded-lg flex-1"
              rows={3} // Adjust the number of rows for height
              onKeyDown={handleKeyDown} // Tie Enter key to submission
            />
            <Button
              type="submit"
              onClick={handleSendMessage}
              className="bg-blue-500 items-center justify-center ml-2"
              disabled={isLoading}
            >
              Send
              {isLoading && <Spinner className="flex ml-1" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Chat
