"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import InstructionText from "./InstructionText";
import { extractBashScript } from "./utils";
import { run } from "node:test";

const BashScriptGenerator = () => {
  const [query, setQuery] = useState("");
  const [bashScript, setBashScript] = useState("");
  const [output, setOutput] = useState("");
  const [bashLog, setBashLog] = useState("");
  const [openAILog, setOpenAILog] = useState("");
  const [tempPrompt, setTempPrompt] = useState("");
  const [breakAll, setBreakAll] = useState(false);
  const breakAllRef = useRef(false);
  const [countAction, setCountAction] = useState(0);
  const [autoRun, setAutoRun] = useState(false);

  const runBashScript = useCallback(
    async (directBashScript?: string, message?: string) => {
      if (breakAllRef.current) return;
      console.log({ directBashScript, bashScript });
      let chosenBashScript = directBashScript ? directBashScript : bashScript;
      try {
        if (breakAllRef.current) return;
        const response = await fetch("/api/runBash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            script: chosenBashScript,
          }),
        });
        const data = await response.json();
        console.log({ data });
        setBashLog((prev) => `${prev}${chosenBashScript}\n`);
        setOutput((prev) => `${prev}${data.output}\n`);
        let observation =
          data.output.length > 0
            ? `Observation: ${data.output?.trim()}`
            : "Observation: done";

        //TODO: Uncomment to auto run next prompt
        setOutput("AutoRun: " + autoRun);
        if (autoRun) {
          setOutput("AutoRun: Run Open AI");
          runOpenAI(`${message}${observation}\n`);
          console.log(`openai got: ${message}${observation}`);
        }

        setTempPrompt((prev) => `${prev}${observation}\n`);
      } catch (error: any) {
        setOutput("Error executing script: " + error.message);
        setTempPrompt(
          (prev) =>
            `${prev}Observation: Error executing script: ${error.message}\n`
        );
      }
    },
    [bashScript, autoRun]
  );

  const runOpenAI = useCallback(
    async (directQuery?: string) => {
      let chooseQuery = directQuery ? directQuery : tempPrompt;
      console.log({ breakAllRef: breakAllRef.current, countAction });
      if (countAction > 25) {
        setOutput("Over limit 20");
        breakAllRef.current = true;
        setCountAction(0);
        return;
      }
      if (breakAllRef.current) return;
      if (query.length === 0) {
        setOutput("Please enter a query");
        return;
      }
      if (tempPrompt.includes("Task is done")) {
        setOutput("Task is done");
        return;
      }
      console.log({ chooseQuery });
      setCountAction((prev) => prev + 1);
      try {
        if (breakAllRef.current) return;
        const response = await fetch("/api/runOpenAI", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: chooseQuery }),
        });
        const data = await response.json();
        if (
          data.output.toLowerCase().includes("thought: task is done") ||
          data.output.toLowerCase().includes("task is done") ||
          data.output === ""
        ) {
          console.log("Task is done");
          setOutput("Task is done");
          setTempPrompt(`${chooseQuery}${data.output}`);
          return;
        }
        setTempPrompt(`${chooseQuery}${data.output}`);
        setOpenAILog(data.output);
        const bashScript = extractBashScript(data.output);
        if (bashScript.length === 0) {
          setOutput("No bash script found");
          return;
        } else {
          setOutput("Bash script generated");
          setBashScript(bashScript);
          //Wait after setting bash script run bash script

          //TODO: Uncomment to Auto run bash script
          if (autoRun) {
            setOutput("Run bash script");
            runBashScript(bashScript, `${chooseQuery}${data.output}`);
          }
        }
      } catch (error: any) {
        setOutput("Error openai: " + error.message);
      }
    },
    [autoRun, countAction, query, runBashScript, tempPrompt]
  );

  return (
    // scrollable container
    <div className="p-4 h-[80vh] w-[90vw] flex flex-row overflow-x-auto whitespace-nowrap space-x-4">
      <Card className="p-4 w-full">
        <h2 className="text-2xl font-bold mb-4">Bash Script Generator</h2>
        <Textarea
          placeholder="Enter your query here"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-2"
        />
        <Textarea
          value={tempPrompt}
          onChange={(e) => setTempPrompt(e.target.value)}
          rows={10}
          className="font-mono text-sm mb-2"
        />
        <div className="flex flex-col items-start space-y-2">
          <Button
            onClick={() => setTempPrompt(`Instruction: ${query}\n`)}
            className="w-full bg-blue-500"
          >
            Set New Wish
          </Button>
          {tempPrompt ? (
            <Button
              onClick={() => runOpenAI()}
              className={`w-full ${autoRun ? `bg-green-500` : `bg-blue-500`}`}
            >
              Run Open AI {autoRun ? "Auto" : ""}
            </Button>
          ) : (
            <></>
          )}

          {!autoRun && bashScript.length > 0 ? (
            <Button
              onClick={() => runBashScript()}
              className="w-full bg-blue-500"
            >
              Run Bash Script
            </Button>
          ) : (
            <></>
          )}
          <Button
            onClick={() => setAutoRun((prev) => !prev)}
            className={`w-full ${autoRun ? `bg-green-500` : `bg-red-500`}`}
          >
            {autoRun ? "Auto On" : "Auto Off"}
          </Button>
          <Button
            onClick={() => {
              breakAllRef.current = !breakAllRef.current;
              setBreakAll((prev) => !prev);
            }}
            className={`w-full ${
              breakAllRef.current ? `bg-green-500` : `bg-red-500`
            }`}
          >
            {breakAll ? "Resume" : "Break All"}
          </Button>
          <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap text-sm">
            Run Open AI Number: {countAction}
          </pre>
          {output?.trim().length > 0 ? (
            <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">
              {output}
            </pre>
          ) : (
            <></>
          )}
          <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap text-sm">
            Auto is {autoRun ? "On" : "Off"}
          </pre>
        </div>
      </Card>
      <Card className="p-4 w-full overflow-y-auto whitespace-nowrap">
        <h3 className="text-xl font-semibold mb-2">Next Prompt Log</h3>
        <InstructionText text={tempPrompt} />
      </Card>

      <Card className="p-4 w-full overflow-y-auto whitespace-nowrap space-y-4">
        <h2 className="text-xl font-semibold mb-2">Log</h2>
        <h3 className="text-xl font-semibold mb-2">Generated Bash Script</h3>
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
        <h3 className="text-xl font-semibold mb-2">ReAct Log</h3>
        <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap text-sm">
          {tempPrompt}
        </pre>
        <h3 className="text-xl font-semibold mb-2">Bash Log</h3>
        <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">
          {bashLog}
        </pre>
      </Card>
    </div>
  );
};

export default BashScriptGenerator;
