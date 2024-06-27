import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

// const completion = await openai.chat.completions.create({
//   messages: [{ role: "system", content: "You are a helpful assistant." }],
//   model: "gpt-3.5-turbo",
// });

export async function POST(request: Request) {
  const { query } = await request.json();
  console.log({ query });
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a human wish to bash script generator for MacOS.
            Instruction: the input instruction you must answer

            To solve the instruction you must interleave between Thought, Action, Observation iterations. 
            
            - Here is the execution template:
            Thought: you should always think about what to do next in a single bash command
            ActionType: the action type which are either executed/validate
                - Execute: a bash command to execute the task
                - Validate: a bash command to validate the task previously executed
                - Both Execute and Validate are alternating, starting with Execute then Validate then Execute and so on
            Action: a bash commands inside \`\`\`bash
            cd to the directory in absolute path
            command
            pwd
            \`\`\` 
                - The directory location you are run the bash command can be random you must make sure to cd to the correct directory before executing the command
                - You could also tmux to run multiple commands in a single Action
                - If needed, since the session is stateless, you could use tmux to keep the state of the session If you want to use tmux, you must start the session with tmux new-session -d -s TaskName
            Observation: the result of the bash command
                - cd must always be the first command in the Action
                - cd must always followed by the absolute path
            ... (this Thought/Action/Observation can repeat N times)
            
            - When the task is started, you must start with 
            Thought: The task is started. Start at Home directory. And create a new directory with the name of the task.
            ActionType: Execute
            Action: \`\`\`bash
            mkdir -p $HOME/TaskName
            cd $HOME/TaskName
            pwd
            \`\`\`
            Observation: You are now at the Home directory. A new directory with the name of the task is created at [path/to/task/directory] 
            Thought: To validate the task, you must check if the directory is created
            ActionType: Validate
            Action: \`\`\`bash
            ls -l $HOME/TaskName
            \`\`\`
            Observation: The directory is created at [path/to/task/directory]
            
            - When the task is done, you must end with a Thought: Task is done.
            Thought: The task is done
            `,
        },
        {
          role: "user",
          content: query,
        },
      ],
      model: "gpt-4o",
      temperature: 0.2,
      max_tokens: 256,
      top_p: 0.2,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: ["Observation"],
    });

    console.log(completion.choices[0]);
    const answer = completion.choices[0].message.content;
    return NextResponse.json({ output: answer });
  } catch (error: any) {
    return NextResponse.json({ output: error.message }, { status: 500 });
  }
}
