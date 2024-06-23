"use client";
import React, { useState } from "react";
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
  const [installLog, setInstallLog] = useState("");

  const generateBashScript = () => {
    // Placeholder for your implementation
    const generatedScript = `#!/bin/bash\n# Generated from query: ${query}\n\n# Your implementation here\necho "Hello, world!"`;
    setBashScript(generatedScript);

    // Placeholder for dependency detection
    setDependencies([
      { name: "curl", installed: false },
      { name: "jq", installed: false },
      { name: "git", installed: true },
    ]);
  };

  const runBashScript = async () => {
    try {
      const response = await fetch("/api/runBash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: bashScript }),
      });
      const data = await response.json();
      setOutput(data.output);
    } catch (error: any) {
      setOutput("Error executing script: " + error.message);
    }
  };

  const installDependency = async (depName: string) => {
    setInstallLog((prev) => `${prev}Installing ${depName}...\n`);
    // Simulate installation process
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setInstallLog((prev) => `${prev}${depName} installed successfully.\n`);
    setDependencies((deps) =>
      deps.map((dep) =>
        dep.name === depName ? { ...dep, installed: true } : dep
      )
    );
  };

  const installAllDependencies = async () => {
    for (const dep of dependencies) {
      if (!dep.installed) {
        await installDependency(dep.name);
      }
    }
    setInstallLog((prev) => `${prev}All dependencies installed.\n`);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Card className="p-4">
        <h2 className="text-2xl font-bold mb-4">Bash Script Generator</h2>
        <Input
          placeholder="Enter your query here"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-2"
        />
        <Button onClick={generateBashScript} className="w-full">
          Generate Bash Script
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

      <Card className="p-4">
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
      </Card>

      <Card className="p-4">
        <h3 className="text-xl font-semibold mb-2">Installation Log</h3>
        <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap text-sm">
          {installLog}
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
