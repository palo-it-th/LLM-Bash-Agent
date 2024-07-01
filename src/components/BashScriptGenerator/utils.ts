import React from 'react'
interface InstructionStep {
  type: 'Instruction' | 'Thought' | 'ActionType' | 'Action' | 'Observation'
  content: string
  index: number
}
export const parseInstructionText = (text: string): InstructionStep[] => {
  const lines = text.split('\n')
  const steps: InstructionStep[] = []
  let currentStep: Omit<InstructionStep, 'index'> | null = null
  const typeCounters: Record<InstructionStep['type'], number> = {
    Instruction: 0,
    Thought: 0,
    ActionType: 0,
    Action: 0,
    Observation: 0,
  }

  for (const line of lines) {
    const match = line.match(
      /^(Instruction|Thought|ActionType|Action|Observation):\s(.*)$/
    )
    if (match) {
      if (currentStep) {
        steps.push({ ...currentStep, index: typeCounters[currentStep.type] })
      }
      const type = match[1] as InstructionStep['type']
      typeCounters[type]++
      currentStep = {
        type,
        content: match[2],
      }
    } else if (currentStep) {
      currentStep.content += '\n' + line
    }
  }

  if (currentStep) {
    steps.push({ ...currentStep, index: typeCounters[currentStep.type] })
  }

  return steps
}

export const extractBashScript = (answer: string) => {
  //If ```bash is found, extract the INSIDE bash script
  if (answer?.includes('```bash')) {
    const bashScript = answer.split('```bash')[1].split('```')[0]
    //delete new line at the beginning and end
    return bashScript.trim()
  } else {
    return answer
  }
}
