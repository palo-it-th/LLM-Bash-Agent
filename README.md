# PALO-LLM-PLAYGROUND

## Description

This project is used for training developer to understand the numbers of core concepts of LLM at software development level.

## List of Examples

- [Shell Agent](./docs/ShellAgent.md)
  

https://github.com/user-attachments/assets/1ecab839-f7cd-4ca2-9f12-cf92c7bd96c9


- Chat

https://github.com/user-attachments/assets/ab4950d1-9ad7-4f61-a79f-2fbcf72bac08


- Chat with Tools
- RAG Chunking Raw Text

https://github.com/user-attachments/assets/18f7a74e-968f-44dd-a29c-c91b5ee3098c


- RAG Qdrant

https://github.com/user-attachments/assets/b9be1ad1-f23b-4f83-ae9d-16af1f6661bd




## Getting Started

Set up Key Globally:

- In your `~/.bash_profile` or other type of shell profile
- OpenAI: Add `export OPENAI_API_KEY='YOUR_KEY'`
- Groq: Add `export GROQ_API_KEY='YOUR_KEY'`

Setup the `.env` file:

- Create a `.env` file in the root directory
- Add the following:

```bash
OPENAI_API_KEY=YOUR_KEY
GROQ_API_KEY=YOUR_KEY
```

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

## Setup Vector Database

[Qdrant](https://qdrant.tech/documentation/quickstart/)

```bash
docker pull qdrant/qdrant
docker run -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage:z \
    qdrant/qdrant
```
