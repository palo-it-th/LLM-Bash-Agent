"use client";
import React, { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

const BashScriptGenerator = () => {
  const [query, setQuery] = useState("");
  const [bashScript, setBashScript] = useState("");
  const [output, setOutput] = useState("");
  const [dependencies, setDependencies] = useState<
    { name: string; installed: boolean }[]
  >([]);
  const [openAILog, setOpenAILog] = useState("");
  const [tempPrompt, setTempPrompt] = useState("");
  const [nextPrompt, setNextPrompt] = useState("");

  const extractBashScript = (answer: string) => {
    //If ```bash is found, extract the INSIDE bash script
    if (answer?.includes("```bash")) {
      const bashScript = answer.split("```bash")[1].split("```")[0];
      //delete new line at the beginning and end
      return bashScript.trim();
    } else {
      return answer;
    }
  };

  useEffect(() => {
    let prompt = tempPrompt;
    if (tempPrompt.length > 0) {
      prompt = tempPrompt;
    } else {
      prompt = `Instruction: ${query}\n`;
    }
    setNextPrompt(prompt);
  }, [query, tempPrompt]);

  const generateBashScript = () => {
    // Placeholder for your implementation
    // const generatedScript = `#!/bin/bash\n# Generated from query: ${query}\n\n# Your implementation here\necho "Hello, world!"`;
    // setBashScript(generatedScript);
    runOpenAI();
    // Placeholder for dependency detection
    // setDependencies([
    //   { name: "curl", installed: false },
    //   { name: "jq", installed: false },
    //   { name: "git", installed: true },
    // ]);
  };

  const runOpenAI = async () => {
    let openaiQuery = query;
    if (query.length === 0) {
      setOutput("Please enter a query");
      return;
    }
    if (tempPrompt.includes("Task is done")) {
      setOutput("Task is done");
      return;
    }
    openaiQuery = nextPrompt;
    console.log({ openaiQuery });
    try {
      const response = await fetch("/api/runOpenAI", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: openaiQuery }),
      });
      const data = await response.json();
      // setOutput(data.output);
      setTempPrompt(`${openaiQuery}${data.output}`);
      setOpenAILog(data.output);
      const bashScript = extractBashScript(data.output);
      setBashScript(bashScript);
    } catch (error: any) {
      setOutput("Error openai: " + error.message);
    }
  };

  const runBashScript = async () => {
    try {
      const response = await fetch("/api/runBash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: bashScript }),
      });
      const data = await response.json();
      console.log({ data });
      setOutput(data.output);
      let observation = data.output.length > 0 ? data.output : "done";
      setTempPrompt((prev) => `${prev}Observation: ${observation}\n`);
    } catch (error: any) {
      setOutput("Error executing script: " + error.message);
      setTempPrompt(
        (prev) =>
          `${prev}Observation: Error executing script: ${error.message}\n`
      );
    }
  };
  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <Card className="p-4">
        <h2 className="text-2xl font-bold mb-4">Bash Script Generator</h2>
        <Textarea
          placeholder="Enter your query here"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-2"
        />
        <Button onClick={generateBashScript} className="w-full">
          Generate Bash Script(First Step)
        </Button>
      </Card>
      <Card className="p-4">
        <h3 className="text-xl font-semibold mb-2">Next Prompt Log</h3>
        <Textarea
          value={nextPrompt}
          onChange={(e) => setNextPrompt(e.target.value)}
          rows={10}
          className="font-mono text-sm mb-2"
        />
        {/* <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap text-sm">
          {nextPrompt}
        </pre> */}
        <Button onClick={generateBashScript} className="w-full">
          Run Next Prompt
        </Button>
      </Card>
      <Card className="p-4">
        <h3 className="text-xl font-semibold mb-2">Generated Bash Script</h3>
        <Textarea
          value={bashScript}
          onChange={(e) => setBashScript(e.target.value)}
          rows={10}
          className="font-mono text-sm mb-2"
        />
        <Button onClick={runBashScript} className="w-full">
          Run Bash Script
        </Button>
      </Card>

      {/* <Card className="p-4">
        <h3 className="text-xl font-semibold mb-2">Dependencies</h3>
        <div className="space-y-2 mb-2">
          {dependencies.map((dep) => (
            <div key={dep.name} className="flex items-center justify-between">
              <span>{dep.name}</span>
              {dep.installed ? (
                <Check className="text-green-500" />
              ) : (
                <Button size="sm" onClick={() => installDependency(dep.name)}>
                  Install
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button onClick={installAllDependencies} className="w-full">
          Install All
        </Button>
      </Card> */}

      <Card className="p-4">
        <h3 className="text-xl font-semibold mb-2">OpenAI Log</h3>
        <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap text-sm">
          {openAILog}
        </pre>
      </Card>
      <Card className="p-4">
        <h3 className="text-xl font-semibold mb-2">ReAct Log</h3>
        <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap text-sm">
          {tempPrompt}
        </pre>
      </Card>

      <Card className="p-4">
        <h3 className="text-xl font-semibold mb-2">Script Output</h3>
        <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">
          {output}
        </pre>
      </Card>
    </div>
  );
};

export default BashScriptGenerator;
