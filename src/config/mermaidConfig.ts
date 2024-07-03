export const coreFunctionMermaid = `
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

    classDef yellow fill:#FFFAA0,stroke:#FDDA0D,stroke-width:1px;
    classDef green fill:#C5EBAA,stroke:#2E8B57,stroke-width:1px;
`

export const internalFunctionMermaid = `
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
`
