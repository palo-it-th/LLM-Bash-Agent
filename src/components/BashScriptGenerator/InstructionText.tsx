import React from "react";
import { parseInstructionText } from "./utils";
const InstructionText: React.FC<{ text: string }> = ({ text }) => {
  const steps = parseInstructionText(text);

  return (
    <div className="instruction-text p-4 bg-gray-100 rounded-lg mb-8">
      {steps.map((step, index) => (
        <div key={index} className={`step ${step.type.toLowerCase()}`}>
          <strong className="text-blue-600">
            {step.type} {step.index}:
          </strong>
          {step.type === "Action" ? (
            <pre className="mt-2 p-2 bg-gray-800 text-white rounded">
              {step.content}
            </pre>
          ) : (
            <p>{step.content}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default InstructionText;
