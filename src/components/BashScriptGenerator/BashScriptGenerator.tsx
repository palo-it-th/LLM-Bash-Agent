'use client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useCallback, useEffect, useRef, useState } from 'react'
import InstructionText from './InstructionText'
import { extractBashScript } from './utils'

import { coreFunctionMermaid } from '@/config/mermaidConfig'
import {
  FaEye,
  FaEyeSlash,
  FaFileDownload,
  FaInfoCircle,
  FaRegClipboard,
} from 'react-icons/fa'
import MermaidDiagrams from '../MermaidDiagrams/MermaidDiagrams'
import { Spinner } from '../ui/spinner'

const DiagramState = {
  runningAI: `${coreFunctionMermaid}\nclass F yellow`,
  runningBashScript: `${coreFunctionMermaid}\nclass K yellow`,
  finishedAI: `${coreFunctionMermaid}\nclass F green`,
  finishedBashScript: `${coreFunctionMermaid}\nclass K green`,
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
  const [breakAll, setBreakAll] = useState(false) // Break all actions flag for stopping all AI and bash script actions
  const [countAction, setCountAction] = useState(0)
  const [autoRun, setAutoRun] = useState(true)
  const [showLog, setShowLog] = useState(true)
  const [shouldExecuteBashScript, setShouldExecuteBashScript] =
    useState(!autoRun)
  const [isLoading, setIsLoading] = useState(false)

  const breakAllRef = useRef(false)
  const runAIRef = useRef((directQuery?: string) => {})

  // Diagram
  const [diagramState, setDiagramState] = useState('')

  runAIRef.current = async (directQuery?: string) => {
    let chooseQuery = directQuery ? directQuery : tempPrompt
    console.log({ breakAllRef: breakAllRef.current, countAction })
    // if (countAction > 25) {
    //   setOutput("Over limit 20");
    //   breakAllRef.current = true;
    //   setCountAction(0);
    //   return;
    // }
    if (breakAllRef.current) {
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
    setDiagramState(DiagramState.runningAI)

    try {
      const response = await fetch('/api/runOpenAI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: chooseQuery }),
      })
      const data = await response.json()
      if (
        data.output.toLowerCase().includes('thought: task is done') ||
        data.output.toLowerCase().includes(TaskStatus.Done) ||
        data.output === ''
      ) {
        console.log(TaskStatus.Done)
        setOutput(TaskStatus.Done)
        setTempPrompt(`${chooseQuery}${data.output}`)
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
        if (autoRun) {
          setOutput('Run bash script')
          runBashScript(bashScript, `${chooseQuery}${data.output}`)
        }
      }
    } catch (error: any) {
      setOutput('Error openai: ' + error.message)
    } finally {
      setDiagramState(DiagramState.finishedAI)
    }
  }

  // Set loading state
  useEffect(() => {
    if (
      diagramState === DiagramState.runningAI ||
      diagramState === DiagramState.runningBashScript
    ) {
      setIsLoading(true)
      return
    }
    setIsLoading(false)
  }, [diagramState])

  const runBashScript = useCallback(
    async (directBashScript?: string, message?: string) => {
      if (breakAllRef.current) {
        return
      }

      console.log({ directBashScript, bashScript })
      let chosenBashScript = directBashScript ? directBashScript : bashScript
      setDiagramState(DiagramState.runningBashScript)
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
            ? `Observation: ${data.output?.trim()}`
            : 'Observation: No output'

        // Auto run next prompt
        setOutput('AutoRun: ' + autoRun)
        if (autoRun) {
          setOutput('AutoRun: Run AI')
          runAIRef.current(`${message}${observation}\n`)
          console.log(`openai got: ${message}${observation}`)
        }

        setTempPrompt((prev) => `${prev}${observation}\n`)
        setShouldExecuteBashScript(false)
      } catch (error: any) {
        setOutput('Error executing script: ' + error.message)
        setTempPrompt(
          (prev) =>
            `${prev}Observation: Error executing script: ${error.message}\n`
        )
      } finally {
        setDiagramState(DiagramState.finishedBashScript)
      }
    },
    [bashScript, autoRun]
  )

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

  const mainActionButton = () => {
    if (openAILog && autoRun) {
      return (
        <Button
          onClick={() => {
            breakAllRef.current = !breakAllRef.current
            setBreakAll((prev) => !prev)
            setOutput('Break All: ' + breakAllRef.current)
            runBashScript(extractBashScript(openAILog), tempPrompt)
          }}
          className={`w-full ${
            breakAllRef.current ? `bg-green-500` : `bg-red-500`
          }`}
        >
          {breakAll ? 'Resume' : 'Break All'}
          {isLoading && <Spinner className="flex ml-1" />}
        </Button>
      )
    }

    if (shouldExecuteBashScript) {
      return (
        <Button
          onClick={() =>
            runBashScript(extractBashScript(openAILog), tempPrompt)
          }
          className="w-full bg-blue-500"
          disabled={isLoading}
        >
          Run Bash Script
          {isLoading && <Spinner className="flex ml-1" />}
        </Button>
      )
    }

    return (
      <Button
        onClick={() => runAIRef.current()}
        className={`w-full ${autoRun ? `bg-green-500` : `bg-blue-500`}`}
        disabled={isLoading}
      >
        Run AI {autoRun ? '(Auto)' : ''}
        {isLoading && <Spinner className="flex ml-1" />}
      </Button>
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
            {mainActionButton()}

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

            <div className="flex">
              <label className="inline-flex items-center mr-2 cursor-pointer">
                <input
                  type="checkbox"
                  value=""
                  className="sr-only peer"
                  onClick={() => setAutoRun((prev) => !prev)}
                  defaultChecked={autoRun}
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translat</div>e-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  {autoRun ? 'Auto mode is on' : 'Auto mode is off'}
                </span>
              </label>

              {/* "Auto mode" toggle button */}
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
          <div className="flex">
            <h3 className="text-xl font-semibold mr-2">Formatted Prompt Log</h3>

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
          </div>
          <InstructionText text={tempPrompt} />
        </Card>

        <Card className="p-4 w-full overflow-y-auto whitespace-nowrap space-y-4">
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
    </>
  )
}

export default BashScriptGenerator
