## Getting Started

Set up Key:

- In your `~/.bash_profile` or other type of shell profile
- OpenAI: Add `export OPENAI_API_KEY='YOUR_KEY'`
- Groq: Add `export GROQ_API_KEY='YOUR_KEY'`

Install:

```bash
npm install
#or
yarn
```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3201](http://localhost:3201) with your browser to see the result.

## Diagrams

```mermaid
graph TD
    A[Start] --> B[Set Query]
    B --> C{New Wish?}
    C -->|Yes| D[Set Temp Prompt]
    C -->|No| E{Auto Run?}
    D --> E
    E -->|Yes| F[Run OpenAI]
    E -->|No| G{Run AI Manually?}
    G -->|Yes| F
    G -->|No| H{Run Bash Script?}
    F --> I[Generate Bash Script]
    I --> J{Auto Run?}
    J -->|Yes| K[Run Bash Script]
    J -->|No| H
    H -->|Yes| K
    H -->|No| L[End]
    K --> M[Process Output]
    M --> N{Task Done?}
    N -->|Yes| L
    N -->|No| O{Auto Run?}
    O -->|Yes| F
    O -->|No| L
```

    - [ ] AI Internal Functionality:

```mermaid
graph TD
    A[Start] --> B[Set Query/Instruction]
    B --> C[Run OpenAI]
    C --> D[Generate Initial Thought]
    D --> E[Create Task Directory]
    E --> F[Validate Directory Creation]
    F --> G[Enter Thought-Action-Observation Loop]
    G --> H{Task Done?}
    H -->|No| I[Generate Thought]
    I --> J{Action Type?}
    J -->|Execute| K[Generate Execute Action]
    J -->|Validate| L[Generate Validate Action]
    K --> M[Run Bash Script - Execute]
    L --> N[Run Bash Script - Validate]
    M --> O[Process Observation]
    N --> O
    O --> G
    H -->|Yes| P[End Task]

    subgraph "Thought-Action-Observation Loop"
    G
    H
    I
    J
    K
    L
    M
    N
    O
    end

    style G fill:#f9f,stroke:#333,stroke-width:2px
    style H fill:#bbf,stroke:#333,stroke-width:2px
```

## Example prompts

For example prompts, please refer to the [Readme-examples.md](Readme-examples.md) file.
