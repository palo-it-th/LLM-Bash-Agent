import React from 'react'
import { parseInstructionText } from './utils'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { ExecutionSchema } from '@/app/api/runOpenAI/route'
const InstructionText: React.FC<{ steps: ChatCompletionMessageParam[] }> = ({
  steps,
}) => {
  return (
    <div className="instruction-text p-2 rounded-lg mb-8">
      {steps.map((step, index) => {
        let Thought, Action, ActionType, ChildProcess, Status
        if (step.role === 'assistant' && typeof step.content === 'string') {
          ;({ Thought, Action, ActionType, ChildProcess, Status } = JSON.parse(
            step.content
          ))
        }
        return (
          <div
            key={index}
            className={`step ${step.role.toLowerCase()} whitespace-pre-wrap bg-gray-100 my-2 p-2 rounded-xs`}
          >
            <strong className="text-blue-600">
              {step.role}-{index}:
            </strong>
            {step.role === 'assistant' ? (
              <>
                <p>
                  <strong>Thought:</strong> {Thought}
                </p>
                <p>
                  <strong>ActionType:</strong> {ActionType}
                </p>
                <p>
                  <strong>ChildProcess: </strong>
                  {ChildProcess}
                </p>
                <p>
                  <strong>Status:</strong> {Status}
                </p>
                <pre className="whitespace-pre-wrap mt-2 p-2 bg-gray-800 text-white rounded">
                  Action: {Action}
                </pre>
              </>
            ) : step.role === 'system' ? (
              <p>[SEE IN RAW FORMAT]</p>
            ) : (
              <p>{step.content?.toString()}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default InstructionText
