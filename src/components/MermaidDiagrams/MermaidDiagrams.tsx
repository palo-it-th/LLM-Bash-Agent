import { Card } from '@/components/ui/card'
import Mermaid from '@/components/ui/mermaid'
import {
  coreFunctionMermaid,
  internalFunctionMermaid,
} from '@/config/mermaidConfig'

type MermaidDiagramsProps = {
  coreFunctionDiagram?: string
}

export default function MermaidDiagrams(props: MermaidDiagramsProps) {
  return (
    <div className="px-4 flex flex-row space-x-4">
      <Card className="p-4 w-full overflow-y-auto">
        <h3 className="text-2xl font-bold mb-4">Core Functionality</h3>
        <Mermaid
          id="coreFunctionMermaid"
          source={
            props.coreFunctionDiagram
              ? props.coreFunctionDiagram
              : coreFunctionMermaid
          }
        />
      </Card>
      <Card className="p-4 w-full overflow-y-auto">
        <h3 className="text-2xl font-bold mb-4">AI Internal Functionality</h3>
        <Mermaid
          id="internalFunctionMermaid"
          source={internalFunctionMermaid}
        />
      </Card>
    </div>
  )
}
