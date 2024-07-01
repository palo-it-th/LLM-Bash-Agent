"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useRef, useState } from "react";
import InstructionText from "./InstructionText";
import { extractBashScript } from "./utils";

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
        setBashLog((prev) => `${prev}${chosenBashScript}\n\n`);
        setOutput((prev) => `${prev}${data.output}\n`);
        let observation =
          data.output.length > 0
            ? `Observation: ${data.output?.trim()}`
            : "Observation: No output";

        //TODO: Uncomment to auto run next prompt
        setOutput("AutoRun: " + autoRun);
        if (autoRun) {
          setOutput("AutoRun: Run AI");
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
      // if (countAction > 25) {
      //   setOutput("Over limit 20");
      //   breakAllRef.current = true;
      //   setCountAction(0);
      //   return;
      // }
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
    <div className="p-4 h-[95vh] flex flex-row overflow-x-auto whitespace-nowrap space-x-4">
      <Card className="p-4 w-full overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Bash Script Magician</h2>
        <Textarea
          placeholder="Enter your query here"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-2"
        />
        <div className="flex flex-col items-start space-y-2">
          <Button
            onClick={() => {
              if (query.length === 0) {
                setOutput("Please enter a query");
                return;
              } else {
                setOutput("Ready to Run AI");
                setTempPrompt(`Instruction: ${query}\n`);
              }
            }}
            className="w-full bg-blue-500"
          >
            Set New Wish
          </Button>
          {tempPrompt ? (
            <Button
              onClick={() => runOpenAI()}
              className={`w-full ${autoRun ? `bg-green-500` : `bg-blue-500`}`}
            >
              Run AI {autoRun ? "Auto" : ""}
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
            onClick={() => {
              breakAllRef.current = !breakAllRef.current;
              setBreakAll((prev) => !prev);
              setOutput("Break All: " + breakAllRef.current);
            }}
            className={`mt-4 w-full ${
              breakAllRef.current ? `bg-green-500` : `bg-red-500`
            }`}
          >
            {breakAll ? "Resume" : "Break All"}
          </Button>
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

          <label className="inline-flex items-center me-5 cursor-pointer">
            <input
              type="checkbox"
              value=""
              className="sr-only peer"
              onClick={() => setAutoRun((prev) => !prev)}
            />
            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              {autoRun ? "Auto mode is on" : "Auto mode is off"}
            </span>
          </label>

          <div
            id="toast-undo"
            className="flex items-center w-full p-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800"
            role="alert"
          >
            <div className="text-sm font-normal text-wrap">
              Auto mode automatically runs the AI script after each query. When
              auto mode is on, the AI script will be executed without the need
              for manual intervention. When auto mode is off, you need to
              manually click the Run AI button to execute the AI script.
            </div>
          </div>
        </div>
      </Card>
      <Card className="p-4 w-full overflow-y-auto whitespace-nowrap">
        <h3 className="text-xl font-semibold mb-2">Format Prompt Log</h3>
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
        <h3 className="text-xl font-semibold mb-2">Prompt Log</h3>
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
