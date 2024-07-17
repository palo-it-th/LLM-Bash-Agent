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
  FaRegClipboard,
  FaMagic,
} from 'react-icons/fa'

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
  const [output, setOutput] = useState('')
  const [bashLog, setBashLog] = useState('')
  const [openAILog, setOpenAILog] = useState('')
  const [tempPrompt, setTempPrompt] = useState('')
  const [isStopped, setIsStopped] = useState(false) // Stop actions flag for stopping all AI and bash script actions
  const [countAction, setCountAction] = useState(0)
  const [isAutoMode, setIsAutoMode] = useState(false)
  const [showLog, setShowLog] = useState(true)
  const [showFormattedPrompt, setShowFormattedPrompt] = useState(true)
  const [shouldExecuteBashScript, setShouldExecuteBashScript] =
    useState(!isAutoMode)
  const [isLoading, setIsLoading] = useState(false)
  const [shouldShowRunAiButton, setShouldShowRunAiButton] = useState(false)

  const runAIRef = useRef((directQuery?: string, forceContinue?: boolean) => {})

  // Diagram
  const [diagramState, setDiagramState] = useState('')
  // Sticky action button
  const [showStickyActionButton, setShowStickyActionButton] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  runAIRef.current = async (directQuery?: string, forceContinue?: boolean) => {
    let chooseQuery = directQuery ? directQuery : tempPrompt
    console.log({ isStopped, countAction })

    if (isStopped && forceContinue === undefined) {
      return
    }

    if (query.length === 0) {
      setOutput('Please enter a query')
      return
    }
    if (tempPrompt.includes(TaskStatus.Done)) {
      setOutput(TaskStatus.Done)
      return
    }

    console.log({ chooseQuery })
    setCountAction((prev) => prev + 1)
    setDiagramState(DiagramState.aiRunning)
    setIsLoading(true)

    try {
      const response = await fetch('/api/runOpenAI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: chooseQuery }),
      })
      const data = await response.json()
      if (
        data.output
          .toLowerCase()
          .includes(`thought: ${TaskStatus.Done.toLowerCase()}`) ||
        data.output.toLowerCase().includes(TaskStatus.Done.toLowerCase()) ||
        data.output === ''
      ) {
        console.log(TaskStatus.Done)
        setOutput(TaskStatus.Done)
        setTempPrompt(`${chooseQuery}\n${data.output}`)
        setShouldShowRunAiButton(true)
        //delay 1s
        await new Promise((resolve) => setTimeout(resolve, 100))
        savePromptToFile()
        return
      }
      setTempPrompt(`${chooseQuery}${data.output}`)
      setOpenAILog(data.output)
      const bashScript = extractBashScript(data.output)
      if (bashScript.length === 0) {
        setOutput('No bash script found')
        return
      } else {
        setOutput('Bash script generated')
        setBashScript(bashScript)
        // Wait after setting bash script run bash script

        setShouldExecuteBashScript(true)

        // Auto-run bash script
        if (isAutoMode) {
          setOutput('Run bash script')
          runBashScript(bashScript, `${chooseQuery}${data.output}`)
        }
      }
    } catch (error: any) {
      setOutput('Error openai: ' + error.message)
    } finally {
      setDiagramState(DiagramState.aiProcessed)
      setIsLoading(false)
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
    async (
      directBashScript?: string,
      message?: string,
      forceContinue?: boolean
    ) => {
      if (isStopped && forceContinue === undefined) {
        return
      }

      console.log({ directBashScript, bashScript })
      let chosenBashScript = directBashScript ? directBashScript : bashScript

      setDiagramState(DiagramState.bashScriptRunning)
      setIsLoading(true)

      try {
        const response = await fetch('/api/runBash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            script: chosenBashScript,
          }),
        })
        const data = await response.json()

        console.log({ data })

        setBashLog((prev) => `${prev}${chosenBashScript}\n\n`)
        setOutput((prev) => `${prev}${data.output}\n`)

        let observation =
          data.output.length > 0
            ? `\nObservation: ${data.output?.trim()}`
            : '\nObservation: No output'

        // Auto run next prompt
        setOutput('AutoRun: ' + isAutoMode)
        if (isAutoMode) {
          setOutput('AutoRun: Run AI')
          runAIRef.current(`${message}${observation}\n`)
          console.log(`openai got: ${message}${observation}\n`)
        }

        setTempPrompt((prev) => `${prev}${observation}\n`)
        setShouldExecuteBashScript(false)
      } catch (error: any) {
        setOutput('Error executing script: ' + error.message)
        setTempPrompt(
          (prev) =>
            `${prev}\nObservation: Error executing script: ${error.message}\n`
        )
      } finally {
        setDiagramState(DiagramState.bashScriptProcessed)
        setIsLoading(false)
      }
    },
    [isStopped, bashScript, isAutoMode]
  )

  const runAIOrBashScript = () => {
    switch (diagramState) {
      case DiagramState.bashScriptProcessed:
        runAIRef.current(undefined, true)
        break
      case DiagramState.aiProcessed:
        runBashScript(extractBashScript(openAILog), tempPrompt, true)
        break
      default:
        break
    }
  }

  const savePromptToFile = async () => {
    try {
      const response = await fetch('/api/savePrompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: tempPrompt }),
      })
      const data = await response.json()
      setOutput(data.output)
    } catch (error: any) {
      setOutput('Error saving prompt: ' + error.message)
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
    setIsAutoMode((prev) => {
      // Show the "Run AI" button when the user toggles the auto mode button in the middle of manual execution.
      if (!prev) {
        if (
          diagramState === DiagramState.bashScriptProcessed ||
          diagramState === DiagramState.aiProcessed
        ) {
          setShouldShowRunAiButton(true)
        }
      }
      return !prev
    })
  }

  const renderActionButton = () => {
    const buttons = [
      <Button
        id="run-ai-button"
        key="run-ai-button"
        onClick={() => runAIRef.current()}
        className={`w-full ${isAutoMode ? `bg-green-500` : `bg-blue-500`}`}
        disabled={isLoading}
      >
        Run AI {isAutoMode ? '(Auto)' : ''}
        {isLoading && <Spinner className="flex ml-1" />}
      </Button>,
    ]
    // Show the "Run AI" button when the user toggles the auto mode button in the middle of manual execution.
    if (shouldShowRunAiButton) {
      return (
        <Button
          onClick={() => {
            runAIOrBashScript()
            setShouldShowRunAiButton(false)
          }}
          className={`w-full bg-green-500`}
        >
          Run AI (Auto)
        </Button>
      )
    }

    // Resume/Stop button
    if (isAutoMode && diagramState !== '') {
      buttons.push(
        <Button
          onClick={() =>
            setIsStopped((prev) => {
              // If the user clicks the button to resume the AI or bash script, run the AI or bash script.
              if (prev) {
                setOutput('Resuming...')
                runAIOrBashScript()
              } else {
                setOutput('Stopped')
              }
              return !prev
            })
          }
          className={`w-full ${isStopped ? `bg-green-500` : `bg-red-500`}`}
        >
          {isStopped ? (
            'Resume'
          ) : (
            <>
              Stop
              <Spinner className="flex ml-1" />
            </>
          )}
        </Button>
      )
    }

    // Run bash script button
    //shouldExecuteBashScript
    //isAutoMode
    if (!isAutoMode) {
      buttons.push(
        <Button
          onClick={() =>
            runBashScript(extractBashScript(openAILog), tempPrompt)
          }
          className="w-full bg-blue-800"
          disabled={isLoading}
        >
          Run Bash Script
          {isLoading && <Spinner className="flex ml-1" />}
        </Button>
      )
    }

    return (
      // <Button
      //   onClick={() => runAIRef.current()}
      //   className={`w-full ${isAutoMode ? `bg-green-500` : `bg-blue-500`}`}
      //   disabled={isLoading}
      // >
      //   Run AI {isAutoMode ? '(Auto)' : ''}
      //   {isLoading && <Spinner className="flex ml-1" />}
      // </Button>
      <>{buttons}</>
    )
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
              setTempPrompt(`Instruction: ${e.target.value}\n`)
            }}
            className="mb-4"
            disabled={isLoading}
          />
          <div className="flex flex-col items-start space-y-2">
            {renderActionButton()}

            <div className="pt-2" />

            {output?.trim().length > 0 ? (
              <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">
                Status: {output}
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
          </div>
        </Card>
        <Card className="p-4 w-full overflow-y-auto whitespace-nowrap">
          <div className="flex mb-4">
            <h3 className="text-xl font-semibold mr-2 ">
              {showFormattedPrompt ? `Formatted` : 'Raw'} Prompt Log
            </h3>

            {tempPrompt && (
              <>
                <button onClick={() => copyToClipboard(tempPrompt)}>
                  <FaRegClipboard />
                </button>
                <button onClick={savePromptToFile} className="pl-1">
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
            <InstructionText text={tempPrompt} />
          ) : (
            <Textarea
              placeholder="Temp prompt"
              value={tempPrompt}
              onChange={(e) => {
                setTempPrompt(e.target.value)
              }}
              className="mb-2 h-full"
              disabled={isLoading}
            />
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
                {bashScript}
              </pre>

              <h3 className="text-xl font-semibold mb-2">Output</h3>
              <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">
                {output?.trim()}
              </pre>
              <h3 className="text-xl font-semibold mb-2">OpenAI Log</h3>
              <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap text-sm">
                {openAILog}
              </pre>
              <h3 className="text-xl font-semibold mb-2">Prompt Log</h3>
              <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap text-sm">
                {tempPrompt}
              </pre>
              <h3 className="text-xl font-semibold mb-2">Bash Log</h3>
              <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">
                {bashLog}
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
        <div className="my-8 float-right px-5 mx-4">{renderActionButton()}</div>
      </div>
    </>
  )
}

export default BashScriptGenerator
