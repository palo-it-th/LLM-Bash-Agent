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
import {
  JsonView,
  allExpanded,
  darkStyles,
  defaultStyles,
} from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'
const ChatWithTools = () => {
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([
    {
      role: 'system',
      content:
        'You must use our book database, which you can access using functions to answer the following questions.',
    },
  ])
  const [input, setInput] = useState<string>(
    'I really enjoyed reading NIRAS PASSO - LAW OF Human nature, could you recommend me a book that is similar and tell me why?'
  )
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
      const response = await fetch('/api/runChatWithTools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, newMessage] }),
      })
      const { message } = await response.json()
      console.log({ message })
      setMessages(message)
      // setMessages((prev) => [...prev, message])
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
          <h1 className="text-2xl font-bold">Chat with Tools</h1>
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
        <div className="flex flex-col p-4 m-4 max-h-[54vh] h-[54vh] overflow-auto mb-40 space-y-2 p-4 border-2 border-gray-300 rounded-lg">
          {showFormattedPrompt ? (
            messages?.map((message, index) => {
              let messageMode:
                | 'text'
                | 'tool'
                | 'object'
                | 'assistant-tool'
                | undefined = undefined

              if (
                message.role === 'assistant' &&
                message.tool_calls &&
                message.tool_calls.length > 0
              ) {
                messageMode = 'assistant-tool'
              } else if (message.role === 'tool' && message?.content) {
                messageMode = 'tool'
              } else if (typeof message.content === 'string') {
                messageMode = 'text'
              } else if (message?.content) {
                messageMode = 'object'
              }
              return (
                <div
                  key={index}
                  className={`message-bubble ${message.role === 'user' ? 'human-message bg-blue-200' : 'ai-message bg-green-200'} ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
                >
                  <h3 className="text-sm font-bold">{message.role}</h3>
                  {messageMode === 'text' &&
                  typeof message?.content === 'string' ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  ) : (
                    <></>
                  )}
                  {messageMode === 'object' ? (
                    <JsonView
                      data={message.content || {}}
                      shouldExpandNode={allExpanded}
                      style={darkStyles}
                    />
                  ) : (
                    <></>
                  )}
                  {messageMode === 'assistant-tool' &&
                  message.role === 'assistant' &&
                  message.tool_calls &&
                  message.tool_calls.length > 0 ? (
                    // <span>
                    //   {message.role}:{JSON.stringify(message.tool_calls)}
                    // </span>
                    <JsonView
                      data={message.tool_calls}
                      shouldExpandNode={allExpanded}
                      style={darkStyles}
                    />
                  ) : (
                    <> </>
                  )}
                  {messageMode === 'tool' && message?.content ? (
                    <JsonView
                      data={JSON.parse(message.content.toString())}
                      shouldExpandNode={allExpanded}
                      style={darkStyles}
                    />
                  ) : (
                    <></>
                  )}
                  {/* <span>{messageMode} </span>
                  <JsonView
                    data={message}
                    shouldExpandNode={allExpanded}
                    style={darkStyles}
                  /> */}
                </div>
              )
            })
          ) : (
            <JsonView
              data={messages}
              shouldExpandNode={allExpanded}
              style={darkStyles}
            />
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

export default ChatWithTools
