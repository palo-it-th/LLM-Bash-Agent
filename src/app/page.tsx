import BashScriptGenerator from '@/components/BashScriptGenerator/BashScriptGenerator'
import MermaidDiagrams from '@/components/MermaidDiagrams/MermaidDiagrams'

export default function Home() {
  return (
    <main className="">
      <BashScriptGenerator />
      <MermaidDiagrams />
    </main>
  )
}
