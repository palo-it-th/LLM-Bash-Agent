#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if Node.js is installed
if ! command_exists node; then
  echo "Node.js is not installed. Please install Node.js and npm before running this script."
  exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
  echo "npm is not installed. Please install npm before running this script."
  exit 1
fi

# Project name
PROJECT_NAME="bash-script-generator"

# Create Next.js TypeScript project
echo "Creating Next.js TypeScript project..."
npx create-next-app@latest $PROJECT_NAME --typescript --eslint --tailwind --app --src-dir --import-alias "@/*"

# Navigate to project directory
cd $PROJECT_NAME

# Install additional dependencies
echo "Installing additional dependencies..."
npm install lucide-react

# Install shadcn-ui CLI tool
npm install -D @shadcn/ui

# Initialize shadcn-ui
npx shadcn-ui init

# Add necessary shadcn-ui components
npx shadcn-ui add button
npx shadcn-ui add textarea
npx shadcn-ui add input
npx shadcn-ui add card

# Create necessary directories
mkdir -p src/components/BashScriptGenerator
mkdir -p src/app/api/runBash

# Create BashScriptGenerator component
cat >src/components/BashScriptGenerator/BashScriptGenerator.tsx <<EOL
"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

const BashScriptGenerator = () => {
  const [query, setQuery] = useState('');
  const [bashScript, setBashScript] = useState('');
  const [output, setOutput] = useState('');
  const [dependencies, setDependencies] = useState([]);
  const [installLog, setInstallLog] = useState('');

  const generateBashScript = () => {
    // Placeholder for your implementation
    const generatedScript = \`#!/bin/bash\n# Generated from query: \${query}\n\n# Your implementation here\necho "Hello, world!"\`;
    setBashScript(generatedScript);
    
    // Placeholder for dependency detection
    setDependencies([
      { name: 'curl', installed: false },
      { name: 'jq', installed: false },
      { name: 'git', installed: true },
    ]);
  };

  const runBashScript = async () => {
    try {
      const response = await fetch('/api/runBash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: bashScript }),
      });
      const data = await response.json();
      setOutput(data.output);
    } catch (error) {
      setOutput('Error executing script: ' + error.message);
    }
  };

  const installDependency = async (depName) => {
    setInstallLog(prev => \`\${prev}Installing \${depName}...\n\`);
    // Simulate installation process
    await new Promise(resolve => setTimeout(resolve, 1500));
    setInstallLog(prev => \`\${prev}\${depName} installed successfully.\n\`);
    setDependencies(deps => 
      deps.map(dep => dep.name === depName ? {...dep, installed: true} : dep)
    );
  };

  const installAllDependencies = async () => {
    for (const dep of dependencies) {
      if (!dep.installed) {
        await installDependency(dep.name);
      }
    }
    setInstallLog(prev => \`\${prev}All dependencies installed.\n\`);
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
        <Button onClick={generateBashScript} className="w-full">Generate Bash Script</Button>
      </Card>

      <Card className="p-4">
        <h3 className="text-xl font-semibold mb-2">Generated Bash Script</h3>
        <Textarea
          value={bashScript}
          onChange={(e) => setBashScript(e.target.value)}
          rows={10}
          className="font-mono text-sm mb-2"
        />
        <Button onClick={runBashScript} className="w-full">Run Bash Script</Button>
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
        <Button onClick={installAllDependencies} className="w-full">Install All</Button>
      </Card>

      <Card className="p-4">
        <h3 className="text-xl font-semibold mb-2">Installation Log</h3>
        <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap text-sm">{installLog}</pre>
      </Card>

      <Card className="p-4">
        <h3 className="text-xl font-semibold mb-2">Script Output</h3>
        <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">{output}</pre>
      </Card>
    </div>
  );
};

export default BashScriptGenerator;
EOL

# Create API route for running bash commands
cat >src/app/api/runBash/route.ts <<EOL
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  const { script } = await request.json();

  // IMPORTANT: This is a basic safeguard. In a real-world scenario,
  // you'd want much more robust security measures.
  const allowedCommands = ['echo', 'ls', 'pwd'];
  const firstCommand = script.trim().split(' ')[0];
  if (!allowedCommands.includes(firstCommand)) {
    return NextResponse.json({ error: 'Command not allowed' }, { status: 403 });
  }

  try {
    const { stdout, stderr } = await execAsync(script);
    return NextResponse.json({ output: stdout + stderr });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
EOL

# Update page.tsx to use the BashScriptGenerator component
cat >src/app/page.tsx <<EOL
import BashScriptGenerator from '@/components/BashScriptGenerator/BashScriptGenerator';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <BashScriptGenerator />
    </main>
  )
}
EOL

echo "Next.js TypeScript project setup complete!"
echo "To run the project:"
echo "1. cd $PROJECT_NAME"
echo "2. npm run dev"
echo "Then open http://localhost:3000 in your browser."
