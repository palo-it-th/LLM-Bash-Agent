'use client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useCallback, useEffect, useRef, useState } from 'react'
import InstructionText from './InstructionText'
import { extractBashScript } from './utils'

import MermaidDiagrams from '@/components/MermaidDiagrams/MermaidDiagrams'
import { Spinner } from '@/components/ui/spinner'
import { coreFunctionMermaid } from '@/config/mermaidConfig'
import {
  FaEye,
  FaEyeSlash,
  FaFileDownload,
  FaInfoCircle,
  FaMagic,
  FaRegClipboard,
} from 'react-icons/fa'
import { ExecutionSchema, ExecutionSchemaType } from '@/app/api/runOpenAI/route'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { systemPromptJSON } from '@/app/api/runOpenAI/systemPromptJSON'
import React from 'react'

const DiagramState = {
  aiRunning: `${coreFunctionMermaid}\nclass F yellow`,
  aiProcessed: `${coreFunctionMermaid}\nclass F green`,
  bashScriptRunning: `${coreFunctionMermaid}\nclass K yellow`,
  bashScriptProcessed: `${coreFunctionMermaid}\nclass K green`,
}

enum TaskStatus {
  Done = 'Task is done',
}

const BashScriptGenerator = () => {
  const [query, setQuery] = useState('')
  const [bashScript, setBashScript] = useState('')
  const [ChildProcessMode, setChildProcessMode] = useState('')
  const [output, setOutput] = useState<string[]>([])
  const [bashLog, setBashLog] = useState<string[]>([])
  const [openAILog, setOpenAILog] = useState<ExecutionSchemaType[]>([])
  const [exampleInstructions, setExampleInstructions] = useState<string[]>([
    'Set up a local backend REST API for /products and return a list of 5 products.',
    'Say Hello with Current Time',
    'Create React frontend app which is a maze game where the user can move a character around the maze using the arrow keys, include 5 mazes of varying difficulty',
    'Extract content from a webpage and filter out all the HTML, make it into nice looking markdown file',
  ])
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([
    {
      role: 'system',
      content: systemPromptJSON,
    },
  ])
  const [isStopped, setIsStopped] = useState<boolean>(false) // Stop actions flag for stopping all AI and bash script actions

  const isStoppedRef = useRef<boolean>(false)
  const [countAction, setCountAction] = useState(0)
  const [isAutoMode, setIsAutoMode] = useState(false)
  const [showLog, setShowLog] = useState(true)
  const [showFormattedPrompt, setShowFormattedPrompt] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const runAIRef = useRef((observation?: string) => {})

  // Diagram
  const [diagramState, setDiagramState] = useState('')
  // Sticky action button
  const [showStickyActionButton, setShowStickyActionButton] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  runAIRef.current = async (observation?: string) => {
    if (isStopped || isStoppedRef.current) {
      setIsLoading(false)
      return
    }
    let newMessages = [...messages]
    let contentInput = ''
    if (messages.length === 1) {
      contentInput = `Instruction: ${query}`
    } else if (messages.length > 1 && observation) {
      contentInput = `Observation: ${observation}`
    }
    if (contentInput !== '') {
      newMessages = [
        ...messages,
        {
          role: 'user',
          content: contentInput,
        },
      ]
      setMessages(newMessages)
    }
    setCountAction((prev) => prev + 1)
    setDiagramState(DiagramState.aiRunning)
    setIsLoading(true)

    try {
      const response = await fetch('/api/runOpenAI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
        }),
      })
      // ExecutionSchemaType
      const {
        output,
        messages: historyMessages,
        completion,
      } = await response.json()
      const { Thought, Action, ActionType, ChildProcess, Status } =
        ExecutionSchema.parse(output)
      console.log({ Thought, Action, ActionType, Status })
      const assistantMessage: ChatCompletionMessageParam = {
        role: 'assistant',
        content: JSON.stringify(ExecutionSchema.parse(output)),
      }
      setMessages((prev) => [...prev, assistantMessage])
      if (Status !== 'In Progress') {
        console.log(Status)
        setOutput((prev) => [...prev, Status])

        savePromptToFile(assistantMessage)
        setIsLoading(false)
        return
      }
      setOpenAILog((prev) => [...prev, ExecutionSchema.parse(output)])
      const bashScript = Action
      if (bashScript.length === 0) {
        setOutput((prev) => [...prev, 'No bash script found'])
        return
      } else {
        setOutput((prev) => [...prev, 'Bash script generated'])
        setBashScript(bashScript)
        setChildProcessMode(ChildProcess)
        // Auto-run bash script
        if (isAutoMode) {
          setOutput((prev) => [...prev, 'Run bash script'])
          runBashScript(bashScript, ChildProcess)
        }
      }
    } catch (error: any) {
      setOutput((prev) => [...prev, 'Error openai: ' + error.message])
    } finally {
      setDiagramState(DiagramState.aiProcessed)
      if (!isAutoMode) {
        setIsLoading(false)
      }
    }
  }

  // Sticky action button on scroll event listener to show/hide the button
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      // Check if the user is at the top of the page. If so, hide the button. If not, show the button.
      if (currentScrollY < 200) {
        setShowStickyActionButton(false)
      } else {
        setShowStickyActionButton(true)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY])

  const runBashScript = useCallback(
    async (directBashScript?: string, mode?: string) => {
      if (isStopped || isStoppedRef.current) {
        setIsLoading(false)
        return
      }

      console.log({ directBashScript, bashScript })
      let chosenBashScript = directBashScript ? directBashScript : bashScript
      let chosenChildProcessMode = mode ? mode : ChildProcessMode
      setOutput((prev) => [...prev, `Chosen bash script: ${chosenBashScript}`])
      setOutput((prev) => [
        ...prev,
        `Chosen ChildProcessMode: ${chosenChildProcessMode}`,
      ])
      setDiagramState(DiagramState.bashScriptRunning)
      setIsLoading(true)

      try {
        const response = await fetch('/api/runBash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            script: chosenBashScript,
            mode: chosenChildProcessMode,
          }),
        })
        const data = await response.json()

        console.log({ data })

        setBashLog((prev) => [...prev, chosenBashScript])

        let observation =
          data.output.length > 0 ? data.output?.trim() : 'No output'
        setOutput((prev) => [...prev, observation])
        // Auto run next prompt
        // setOutput('AutoRun: ' + isAutoMode)
        if (isAutoMode) {
          setOutput((prev) => [...prev, 'AutoRun: Run AI'])
          runAIRef.current(observation)
          console.log(`openai got: ${observation}\n`)
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: 'user',
              content: `Observation: ${observation}`,
            },
          ])
        }
        //TODO: else if not isAutoMode, then set the observation to the messages
      } catch (error: any) {
        setOutput((prev) => [
          ...prev,
          'Error executing script: ' + error.message,
        ])
        setMessages((prev) => [
          ...prev,
          {
            role: 'user',
            content: `Observation: Error executing script: ${error.message}`,
          },
        ])
      } finally {
        setDiagramState(DiagramState.bashScriptProcessed)
        if (!isAutoMode) {
          setIsLoading(false)
        }
      }
    },
    [isStopped, bashScript, ChildProcessMode, isAutoMode]
  )

  const savePromptToFile = async (lastMessage?: ChatCompletionMessageParam) => {
    try {
      const response = await fetch('/api/savePrompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: lastMessage ? [...messages, lastMessage] : messages,
        }),
      })
      const data = await response.json()
      setOutput((prev) => [...prev, data.output])
    } catch (error: any) {
      setOutput((prev) => [...prev, 'Error saving prompt: ' + error.message])
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const onToggleAutoMode = () => {
    setIsAutoMode(!isAutoMode)
  }

  const renderActionButton = () => {
    const buttons = [
      messages[messages.length - 1].role !== 'assistant' ? (
        <Button
          id="run-ai-button"
          key="run-ai-button"
          onClick={() => {
            setIsStopped(false)
            isStoppedRef.current = false
            runAIRef.current()
          }}
          className={`w-full ${isAutoMode ? `bg-green-500` : `bg-blue-500`}`}
          disabled={
            isLoading || messages[messages.length - 1].role === 'assistant'
          }
        >
          Run AI {isAutoMode ? '(Auto)' : ''}
          {isLoading && <Spinner className="flex ml-1" />}
        </Button>
      ) : (
        <></>
      ),
    ]

    // Resume/Stop button
    if (isAutoMode && diagramState !== '') {
      buttons.push(
        <Button
          key={`stop-button`}
          onClick={() => {
            setIsStopped(!isStopped)
            isStoppedRef.current = !isStoppedRef.current
          }}
          className={`w-full bg-red-500`}
        >
          {isStopped ? 'Resume' : 'Stop'}
        </Button>
      )
    }

    // Run bash script button
    if (!isAutoMode) {
      buttons.push(
        messages[messages.length - 1].role !== 'user' ? (
          <Button
            key="run-bash-script-button"
            onClick={async () => {
              if (openAILog && openAILog.length > 0) {
                await runBashScript(openAILog[openAILog.length - 1]?.Action)
              }
            }}
            className="w-full bg-blue-800"
            disabled={
              isLoading || messages[messages.length - 1].role === 'user'
            }
          >
            Run Bash Script
            {isLoading && <Spinner className="flex ml-1" />}
          </Button>
        ) : (
          <></>
        )
      )
    }

    return <>{buttons}</>
  }

  return (
    // scrollable container
    <>
      <div className="h-[95vh] p-4 flex flex-row overflow-x-auto whitespace-nowrap space-x-4">
        <Card className="p-4 w-full overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Bash Script Magician</h2>
          <Textarea
            placeholder="Enter your query here"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
            }}
            className="mb-4"
            disabled={isLoading}
          />
          <div className="flex flex-col items-start space-y-2">
            {renderActionButton()}

            <div className="pt-2" />

            {output.length > 0 ? (
              <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">
                Status: {output[output.length - 1]}
              </pre>
            ) : (
              <></>
            )}
            <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap text-sm">
              Run AI Number: {countAction}
            </pre>

            {/* "Auto mode" toggle button */}
            <div className="flex">
              <label className="inline-flex items-center mr-2 cursor-pointer">
                <input
                  type="checkbox"
                  value=""
                  className="sr-only peer"
                  onClick={onToggleAutoMode}
                  defaultChecked={isAutoMode}
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translat</div>e-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  {isAutoMode ? 'Auto mode is on' : 'Auto mode is off'}
                </span>
              </label>

              <button
                title="Auto mode automatically runs the AI script after each query. When
              auto mode is on, the AI script will be executed without the need
              for manual intervention. When auto mode is off, you need to
              manually click the Run AI button to execute the AI script."
              >
                <FaInfoCircle />
              </button>
            </div>
            <div className="pt-2">
              <h3 className="text-xl font-semibold mb-5">
                Example Instructions
              </h3>
              <ul className="flex flex-col w-full">
                {exampleInstructions.map((instruction, index) => (
                  <li
                    className="mb-2 w-full cursor-pointer"
                    key={index}
                    onClick={() => setQuery(instruction)}
                  >
                    <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap text-sm">
                      {instruction}
                    </pre>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
        <Card className="p-4 w-full overflow-y-auto whitespace-nowrap">
          <div className="flex mb-4">
            <h3 className="text-xl font-semibold mr-2 ">
              {showFormattedPrompt ? `Formatted` : 'Raw'} Prompt Log
            </h3>

            {messages && (
              <>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(messages))}
                >
                  <FaRegClipboard />
                </button>
                <button onClick={() => savePromptToFile()} className="pl-1">
                  <FaFileDownload />
                </button>
              </>
            )}
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
          {showFormattedPrompt ? (
            <InstructionText steps={messages} />
          ) : (
            <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap text-sm">
              {JSON.stringify(messages, null, 2)}
            </pre>
          )}
        </Card>

        <Card
          className={`p-4 ${showLog ? 'w-full' : 'w-1/5'} overflow-y-auto whitespace-nowrap space-y-4`}
        >
          <div className="flex">
            <h2 className="text-xl font-semibold mr-2">Log</h2>
            {showLog ? (
              <button onClick={() => setShowLog(false)}>
                <FaEyeSlash />
              </button>
            ) : (
              <button onClick={() => setShowLog(true)}>
                <FaEye />
              </button>
            )}
          </div>
          {showLog && (
            <>
              <h3 className="text-xl font-semibold mb-2">
                Generated Bash Script
              </h3>
              <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap text-sm">
                Script: {bashScript}
                Mode: {ChildProcessMode}
              </pre>

              <h3 className="text-xl font-semibold mb-2">Output</h3>
              <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">
                {output?.map((line, index) => {
                  return (
                    <div key={index} className="pb-2 mb-2">
                      {line}
                      <hr className="border-t-2 border-blue-900 my-4" />
                    </div>
                  )
                })}
              </pre>
              <h3 className="text-xl font-semibold mb-2">OpenAI Log</h3>
              <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap text-sm">
                {openAILog?.map((line, index) => {
                  return (
                    <div key={index} className="pb-2 mb-2">
                      {JSON.stringify(line)}
                      <hr className="border-t-2 border-blue-900 my-4" />
                    </div>
                  )
                })}
              </pre>
              <h3 className="text-xl font-semibold mb-2">Prompt Log</h3>
              <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap text-sm">
                {messages.slice(1).map((line, index) => {
                  return (
                    <div key={index} className="pb-2 mb-2">
                      {line.role}:{JSON.stringify(line.content)}
                      <hr className="border-t-2 border-blue-900 my-4" />
                    </div>
                  )
                })}
              </pre>
              <h3 className="text-xl font-semibold mb-2">Bash Log</h3>
              <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">
                {bashLog.map((line, index) => {
                  return (
                    <div key={index} className="pb-2 mb-2">
                      {line}
                      <hr className="border-t-2 border-blue-900 my-4" />
                    </div>
                  )
                })}
              </pre>
            </>
          )}
        </Card>
      </div>
      <MermaidDiagrams coreFunctionDiagram={diagramState} />

      {/* Sticky action button at the bottom right */}
      <div
        className={`fixed bottom-0 w-full ${showStickyActionButton ? '' : 'hidden'}`}
      >
        <div className="my-8 float-right px-5 mx-4 space-y-2">
          {renderActionButton()}
        </div>
      </div>
    </>
  )
}

export default BashScriptGenerator
