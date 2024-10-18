# PALO-LLM-PLAYGROUND

## Description

This project is used for training developer to understand the numbers of core concepts of LLM at software development level.

## List of Examples

- [Shell Agent](./docs/ShellAgent.md)
- Chat

https://github.com/user-attachments/assets/ab4950d1-9ad7-4f61-a79f-2fbcf72bac08


- Chat with Tools
- RAG Chunking Raw Text

https://github.com/user-attachments/assets/eafb6cab-757b-4ba8-980f-3cde1ae7d269


- RAG Qdrant

https://github.com/user-attachments/assets/33da3ebe-21ed-4f98-b818-caef37109680


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
