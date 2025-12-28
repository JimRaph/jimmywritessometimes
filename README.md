# JimmyWritesSometimes

**JimmyWritesSometimes** is a technical personal blog focused on AI, machine learning, software engineering, and practical experimentation. It blends long-form technical writing with modern AI-powered features such as semantic search and automated article summaries, all built on a performant static-first architecture.

The site is built with **Docusaurus** and enhanced with **serverless and edge AI capabilities** deployed on **Vercel**.



---

## Key Features

- **Semantic Search**  
  Embedding-based search over all articles, allowing readers to discover content by meaning rather than keywords.

- **AI-Generated Article Summaries**  
  Articles can be summarized on demand using a large language model.

- **Edge & Serverless AI Architecture**  
  Combines:
  - Serverless functions (Vercel)
  - Edge execution (browser + WebAssembly models)

- **Caching with Redis (Upstash)**  
  AI outputs are cached to reduce model load, latency, and cost.

- **Static-First Performance**  
  Content and embeddings are generated at build time for fast page loads.

- **Math Rendering**  
  LaTeX-style math support via KaTeX for technical writing.

---

## Architecture Overview

The project intentionally separates concerns between **content**, **AI inference**, and **delivery**.

### Build Time
- Articles written in **Markdown**
- Content is parsed and indexed
- Embeddings and metadata are generated
- Search index is produced as static data

### Runtime
- **Frontend (Browser / Edge)**
  - Semantic search execution
  - Lightweight inference using `@xenova/transformers`
- **Serverless Functions (Vercel)**
  - AI summaries via Groq
  - Redis-backed caching with Upstash

This hybrid approach ensures low latency, minimal cold starts, and predictable costs.

---

## AI & ML Stack

| Purpose | Tool |
|------|----|
| Static site generation | Docusaurus |
| Hosting & serverless | Vercel |
| LLM inference | Groq |
| LLM model | `llama-3.3-70b-versatile` |
| Embeddings / edge inference | `@xenova/transformers` |
| Caching | Upstash (Redis) |
| Math rendering | KaTeX |

---

## Content Structure

- Articles are authored as **Markdown files**
- Metadata (front matter) drives routing and indexing
- URLs are derived from content structure and slugs
- Search embeddings and metadata are generated **at build time**

---

## Local Development

### Prerequisites

- Node.js (modern LTS recommended)
- npm
- Vercel CLI (for serverless features)

vercel dev --debug


```bash
git clone https://github.com/JimRaph/jimmywritessometimes.git
cd jimmywritessometimes
npm install
npm run start
```
- or to enable AI summaries and Redis caching locally:
```bash
vercel dev
vercel dev --debug
```

### Prerequisites

- UPSTASH_REDIS_REST_URL=your_upstash_url
- UPSTASH_REDIS_REST_TOKEN=your_upstash_token
- GROQ_API_KEY=your_groq_api_key
- TS_NODE_PROJECT=api/tsconfig.json

## Model Handling

- The Xenova embedding model is downloaded once and stored locally
- Subsequent runs reuse the cached model
- This avoids repeated downloads and improves startup time

.