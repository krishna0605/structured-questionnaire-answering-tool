# 🛡️ questionnaire-answering-tool

> An AI-powered tool that automates answering structured security/compliance questionnaires using your reference documents — powered by RAG (Retrieval-Augmented Generation), OpenAI, and pgvector.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-questionnaire--answering--tool.vercel.app-7c3aed?style=for-the-badge)](https://questionnaire-answering-tool.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-krishna0605-181717?style=for-the-badge&logo=github)](https://github.com/krishna0605)
[![Portfolio](https://img.shields.io/badge/Portfolio-creative--engineer.dev-6366f1?style=for-the-badge)](https://creative-engineer.dev)

---

## 📖 Table of Contents

- [What I Built](#-what-i-built)
- [Features](#-features)
- [Architecture](#-architecture)
- [Data Flow — RAG Pipeline](#-data-flow--rag-pipeline)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Assumptions](#-assumptions)
- [Trade-offs](#-trade-offs)
- [Difficulties & Solutions](#-difficulties--solutions)
- [What I'd Improve with More Time](#-what-id-improve-with-more-time)
- [Links](#-links)

---

## 🎯 What I Built

**questionnaire-answering-tool** solves a real pain point in compliance and security workflows: answering long, repetitive questionnaires manually. Instead of spending hours searching through policy documents to answer each question, users:

1. **Upload** a questionnaire (PDF, XLSX, or TXT)
2. **Upload** reference documents (security policies, compliance docs, SOC reports, etc.)
3. **Click Generate** — the AI reads all your documents, finds relevant passages, and auto-answers every question with confidence scores and source citations
4. **Review, Edit, Export** — fine-tune answers inline, save versioned snapshots, and export as DOCX

The tool uses **Retrieval-Augmented Generation (RAG)** to ensure answers are grounded in your actual documents — not hallucinated. Every answer comes with a confidence score and clickable evidence snippets showing exactly which document passages were used.

---

## ✨ Features

### Core AI Features
| Feature | Description |
|---|---|
| **RAG-Powered Answers** | Answers are generated from your uploaded reference documents using vector similarity search + GPT-4o-mini |
| **Confidence Scores** | Each answer gets a 0–100% confidence score, color-coded (🟢 high / 🟡 medium / 🔴 low) |
| **Evidence Snippets** | Expandable "Sources" panel showing exact document passages that support each answer |
| **Partial Regeneration** | Select specific questions to regenerate without reprocessing the entire questionnaire |
| **Not Found Detection** | Automatically flags questions where no relevant information exists in the reference docs |

### Document Management
| Feature | Description |
|---|---|
| **Multi-Format Upload** | Questionnaires: PDF, XLSX, XLS, TXT. Reference docs: PDF, TXT (multiple files) |
| **Smart Parsing** | Extracts questions from structured documents, handles numbered lists, tables, and free-form text |
| **Document Chunking** | Reference docs are split into 500-token chunks with 50-token overlap for optimal retrieval |
| **Vector Embeddings** | Chunks are embedded using OpenAI `text-embedding-3-small` and stored in pgvector for similarity search |

### Answer Management
| Feature | Description |
|---|---|
| **Inline Editing** | Click "Edit" on any answer to modify it directly in-place |
| **Version History** | Save named snapshots of all Q&A data; browse and compare versions side-by-side |
| **Version Comparison** | Diff two versions highlighting what changed between them |
| **Version-Selectable Export** | Export any saved version (or live data) as a formatted DOCX document |

### Project Management
| Feature | Description |
|---|---|
| **Multi-Project Dashboard** | Create, manage, and switch between multiple questionnaire projects |
| **Delete Projects** | Full cascade delete removing all associated data (answers, versions, Documents, etc.) |
| **Remove Uploads** | Remove reference docs or questionnaire before generating answers |
| **User Authentication** | Email/password auth via Supabase with protected routes |

### UX & Notifications
| Feature | Description |
|---|---|
| **Toast Notifications** | Bottom-right toasts for all actions (save, export, delete, errors) with dismiss button |
| **Multi-Step Loader** | Animated full-screen loader during answer generation showing progress steps |
| **Skeleton Loading** | Shimmer placeholders while data loads |
| **Dark Mode UI** | Premium dark theme with glassmorphism, gradients, and micro-animations |
| **Responsive Design** | Responsive grid layouts that adapt to screen size |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                      │
│                                                                             │
│   Next.js 16 (React 19)  +  Framer Motion  +  TypeScript                   │
│                                                                             │
│   ┌──────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│   │  Login   │  │  Dashboard   │  │ Project Page │  │  History Page    │   │
│   │  Signup  │  │  (CRUD)      │  │  (Main UI)   │  │  (Versions/Diff) │   │
│   └──────────┘  └──────────────┘  └──────────────┘  └──────────────────┘   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                           API ROUTES (Next.js)                              │
│                                                                             │
│   /api/parse          → Parse questionnaires (PDF/XLSX/TXT)                 │
│   /api/embed          → Embed reference documents (chunk → embed → store)   │
│   /api/generate       → Generate all answers via RAG pipeline               │
│   /api/regenerate     → Regenerate selected answers                         │
│   /api/answers/edit   → Save inline edits                                   │
│   /api/versions       → Save/load version snapshots                         │
│   /api/export         → Generate DOCX exports                               │
│   /api/projects/delete      → Cascade delete projects                       │
│   /api/documents/delete     → Remove reference documents                    │
│   /api/questionnaires/delete → Remove questionnaires                        │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                           BACKEND SERVICES                                  │
│                                                                             │
│   ┌──────────────────────┐  ┌────────────────────────────────────────────┐  │
│   │       OpenAI API     │  │              Supabase                      │  │
│   │                      │  │                                            │  │
│   │  • GPT-4o-mini       │  │  • PostgreSQL + pgvector                   │  │
│   │    (answer gen)      │  │  • Auth (email/password)                   │  │
│   │                      │  │  • Row Level Security                     │  │
│   │  • text-embedding-   │  │  • Vector similarity search               │  │
│   │    3-small           │  │    (match_documents RPC)                   │  │
│   │    (embeddings)      │  │                                            │  │
│   └──────────────────────┘  └────────────────────────────────────────────┘  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                           DEPLOYMENT                                        │
│                                                                             │
│   Vercel (Frontend + API Routes) ← Auto-deploy from GitHub main branch      │
│   Supabase Cloud (Database + Auth + Vector Store)                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow — RAG Pipeline

This is the core intelligence of the application — how questions get answered using your documents:

```
                    DOCUMENT INGESTION                          QUESTION ANSWERING
                    ─────────────────                          ──────────────────

┌──────────┐    ┌──────────────┐    ┌──────────────┐     ┌──────────────┐    ┌──────────────┐
│  Upload  │───▶│  Parse PDF/  │───▶│   Chunk text │────▶│  Generate    │───▶│   Store in   │
│  Ref Doc │    │  TXT file    │    │  (500 tokens │     │  Embeddings  │    │   pgvector   │
│          │    │              │    │   50 overlap)│     │  (OpenAI)    │    │              │
└──────────┘    └──────────────┘    └──────────────┘     └──────────────┘    └──────┬───────┘
                                                                                    │
                                                                                    ▼
┌──────────┐    ┌──────────────┐    ┌──────────────┐     ┌──────────────┐    ┌──────────────┐
│ Display  │◀───│  Store answer │◀───│ GPT-4o-mini  │◀────│  Compile     │◀───│  Vector      │
│ Q&A with │    │  + citations │    │  generates   │     │  context from│    │  similarity  │
│ scores   │    │  in DB       │    │  answer+score│     │  top-5 chunks│    │  search      │
└──────────┘    └──────────────┘    └──────────────┘     └──────────────┘    └──────────────┘
                                           │
                                           ▼
                                    Returns JSON:
                                    {
                                      answer_text: "...",
                                      confidence_score: 0.92,
                                      evidence_snippets: [...],
                                      is_not_found: false
                                    }
```

### Step-by-Step Flow:

1. **Upload** — User uploads reference documents (PDF/TXT)
2. **Parse** — `unpdf` extracts text from PDFs; plain read for TXT files
3. **Chunk** — Text is split into 500-token chunks with 50-token overlap using a custom chunker
4. **Embed** — Each chunk is embedded via OpenAI `text-embedding-3-small` (1536-dim vectors)
5. **Store** — Chunks + embeddings are stored in Supabase with pgvector extension
6. **Query** — When generating answers, each question is also embedded
7. **Search** — pgvector `match_documents` RPC finds the top-5 most similar chunks
8. **Generate** — Relevant chunks are compiled as context and sent to GPT-4o-mini
9. **Score** — The LLM returns an answer with a confidence score (0–1) and evidence snippets
10. **Display** — Frontend renders Q&A cards with color-coded scores and expandable citations

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 16** | React framework with App Router, API routes, and server-side rendering |
| **React 19** | UI component library |
| **TypeScript** | Type-safe development |
| **Framer Motion** | Animations, transitions, and micro-interactions |
| **Lucide React** | Icon library |
| **react-hot-toast** | Toast notification system |
| **CSS (inline styles)** | Premium dark UI with glassmorphism and gradients |

### Backend
| Technology | Purpose |
|---|---|
| **Next.js API Routes** | Serverless backend functions (11 endpoints) |
| **OpenAI GPT-4o-mini** | LLM for answer generation with structured JSON output |
| **OpenAI text-embedding-3-small** | Vector embeddings for semantic search |
| **Supabase** | PostgreSQL database, authentication, and storage |
| **pgvector** | Vector similarity search extension for PostgreSQL |

### Document Processing
| Technology | Purpose |
|---|---|
| **unpdf** | PDF text extraction (replaced pdf-parse due to Next.js compatibility) |
| **xlsx** | Excel/spreadsheet parsing for questionnaire upload |
| **docx** | Server-side DOCX generation for exports |
| **Custom Chunker** | Text splitting with configurable chunk size and overlap |

### DevOps & Testing
| Technology | Purpose |
|---|---|
| **Vercel** | Production deployment with auto-deploy from GitHub |
| **Jest** | Unit testing framework |
| **ESLint** | Code linting |
| **GitHub Actions** | CI/CD pipeline |

---

## 🗄 Database Schema

```
┌──────────────────┐       ┌──────────────────────┐       ┌──────────────────┐
│     projects     │       │    questionnaires     │       │    questions     │
├──────────────────┤       ├──────────────────────┤       ├──────────────────┤
│ id (PK)          │──┐    │ id (PK)              │──┐    │ id (PK)          │
│ user_id (FK)     │  │    │ project_id (FK)      │  │    │ questionnaire_id │
│ name             │  │    │ filename             │  │    │ question_number  │
│ description      │  └──▶ │ created_at           │  └──▶ │ question_text    │
│ created_at       │       └──────────────────────┘       │ original_context │
└──────────────────┘                                       └────────┬─────────┘
        │                                                           │
        │       ┌──────────────────────┐       ┌───────────────────┐│
        │       │ reference_documents  │       │      answers      ││
        │       ├──────────────────────┤       ├───────────────────┤│
        │       │ id (PK)              │       │ id (PK)           │◀┘
        └─────▶ │ project_id (FK)      │       │ question_id (FK)  │
                │ filename             │       │ answer_text       │
                │ status               │       │ confidence_score  │
                │ created_at           │       │ evidence_snippets │
                └──────────┬───────────┘       │ is_not_found      │
                           │                   │ is_edited          │
                           ▼                   │ version            │
                ┌──────────────────────┐       └─────────┬─────────┘
                │   document_chunks    │                 │
                ├──────────────────────┤                 ▼
                │ id (PK)              │       ┌───────────────────┐
                │ document_id (FK)     │       │    citations      │
                │ content              │       ├───────────────────┤
                │ chunk_index          │       │ id (PK)           │
                │ embedding (vector)   │       │ answer_id (FK)    │
                └──────────────────────┘       │ document_id (FK)  │
                                               │ chunk_id (FK)     │
┌──────────────────────┐                       │ source_filename   │
│   answer_versions    │                       │ snippet           │
├──────────────────────┤                       └───────────────────┘
│ id (PK)              │
│ project_id (FK)      │
│ label                │
│ snapshot (JSONB)     │
│ created_at           │
└──────────────────────┘
```

---

## 📁 Project Structure

```
structured-questionnaire-answering-tool/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (metadata, fonts, ToastProvider)
│   │   ├── globals.css               # Global styles (dark theme, overscroll)
│   │   ├── page.tsx                  # Landing / redirect
│   │   ├── login/page.tsx            # Login page
│   │   ├── signup/page.tsx           # Signup page
│   │   ├── dashboard/page.tsx        # Project dashboard
│   │   ├── project/[id]/
│   │   │   ├── page.tsx              # Main project workspace (Q&A, uploads, generate)
│   │   │   └── history/page.tsx      # Version history & comparison
│   │   └── api/                      # API Routes (11 endpoints)
│   │       ├── parse/route.ts        # Parse questionnaires
│   │       ├── embed/route.ts        # Embed reference documents
│   │       ├── generate/route.ts     # Generate all answers (RAG)
│   │       ├── regenerate/route.ts   # Regenerate selected answers
│   │       ├── answers/edit/route.ts # Save inline edits
│   │       ├── versions/route.ts     # Save/load version snapshots
│   │       ├── export/route.ts       # DOCX export
│   │       ├── projects/delete/      # Delete projects (cascade)
│   │       ├── documents/delete/     # Remove reference documents
│   │       ├── questionnaires/delete/# Remove questionnaires
│   │       └── auth/callback/        # Auth callback
│   ├── lib/                          # Core business logic
│   │   ├── rag.ts                    # RAG pipeline (embed, retrieve, generate)
│   │   ├── openai.ts                 # OpenAI client (embeddings + chat)
│   │   ├── parser.ts                 # PDF/XLSX/TXT parsing
│   │   ├── chunker.ts               # Text chunking with overlap
│   │   ├── export.ts                 # DOCX document generation
│   │   └── supabase/                 # Supabase client (browser + server)
│   ├── components/                   # Reusable UI components
│   │   ├── toast-provider.tsx        # Custom toast container (useToaster)
│   │   └── ui/                       # Aceternity UI components
│   └── types/                        # TypeScript type definitions
├── __tests__/                        # Jest unit tests
├── .github/workflows/                # CI/CD (GitHub Actions)
├── public/                           # Static assets
└── sample-data/                      # Sample questionnaires for testing
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **Supabase** project with pgvector extension enabled
- An **OpenAI** API key

### Installation

```bash
# Clone the repository
git clone https://github.com/krishna0605/structured-questionnaire-answering-tool.git
cd structured-questionnaire-answering-tool

# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.example .env.local

# Run the development server
npm run dev
```

### Supabase Setup

1. Create a new Supabase project
2. Enable the `pgvector` extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Run the schema migrations to create all required tables
4. Create the `match_documents` RPC function for vector similarity search:
   ```sql
   CREATE OR REPLACE FUNCTION match_documents(
     query_embedding vector(1536),
     match_count int,
     doc_ids uuid[]
   ) RETURNS TABLE(
     id uuid,
     document_id uuid,
     content text,
     chunk_index int,
     embedding vector(1536),
     similarity float
   ) AS $$
     SELECT
       dc.id, dc.document_id, dc.content, dc.chunk_index, dc.embedding,
       1 - (dc.embedding <=> query_embedding) AS similarity
     FROM document_chunks dc
     WHERE dc.document_id = ANY(doc_ids)
     ORDER BY dc.embedding <=> query_embedding
     LIMIT match_count;
   $$ LANGUAGE sql;
   ```

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

---

## 🌐 Deployment

The application is deployed on **Vercel** with automatic deployments from the `main` branch.

| Component | Platform | URL |
|---|---|---|
| **Frontend + API** | Vercel | [questionnaire-answering-tool.vercel.app](https://questionnaire-answering-tool.vercel.app) |
| **Database + Auth** | Supabase Cloud | Managed PostgreSQL with pgvector |
| **AI/LLM** | OpenAI API | GPT-4o-mini + text-embedding-3-small |

### Deploy Your Own

1. Fork this repository
2. Import into [Vercel](https://vercel.com)
3. Add the environment variables in Vercel project settings
4. Deploy — Vercel auto-builds from `main`

---

## 📌 Assumptions

1. **Questionnaire Structure** — Assumes questionnaires follow a recognizable pattern (numbered questions, table rows with "Question" columns, or line-by-line questions). The parser handles PDF, XLSX, and TXT formats.

2. **Reference Documents** — Assumes reference documents are primarily text-based PDFs or TXT files. Scanned/image-only PDFs won't work since we use text extraction, not OCR.

3. **Document Size** — Assumes individual documents are reasonably sized (< 50 pages). Very large documents will result in many chunks and slower embedding times.

4. **Single User per Session** — Each user manages their own projects independently. There's no shared/team workspace functionality.

5. **English Language** — The AI model and prompts are optimized for English-language questionnaires and reference documents.

6. **OpenAI Availability** — The system depends on OpenAI API being available. No fallback LLM is configured.

---

## ⚖️ Trade-offs

### 1. GPT-4o-mini vs GPT-4o
**Choice:** Used `gpt-4o-mini` for answer generation.
**Trade-off:** Slightly lower quality answers in edge cases, but **10x cheaper** and **3x faster**. For structured Q&A with provided context, mini performs nearly as well as the full model.

### 2. Client-Side Rendering vs SSR
**Choice:** Project page is fully client-rendered (`'use client'`).
**Trade-off:** Slightly slower initial load, but enables real-time interactivity (inline editing, drag-to-select, live state updates) without complex server/client hydration issues.

### 3. Inline Styles vs CSS Framework
**Choice:** Used inline styles with React's `style` prop instead of Tailwind utility classes.
**Trade-off:** More verbose code, but provides absolute design control and eliminates className conflicts. Every component is self-contained.

### 4. Batch Processing (3) vs Full Parallelism
**Choice:** Questions are processed in parallel batches of 3 during generation.
**Trade-off:** Slightly slower than full parallelism, but prevents OpenAI rate limiting and reduces the risk of timeout errors on serverless functions.

### 5. Top-5 Chunks vs Dynamic Retrieval
**Choice:** Always retrieve exactly 5 chunks per question.
**Trade-off:** May miss relevant context in very long documents or include irrelevant chunks for simple questions. A dynamic approach would be more accurate but adds complexity.

### 6. Single Vector Store vs Hybrid Search
**Choice:** Pure vector similarity search using pgvector.
**Trade-off:** Semantic search works well for most cases, but combining it with keyword search (hybrid) would improve retrieval for exact-match queries (e.g., specific regulation numbers).

---

## 🧗 Difficulties & Solutions

### 1. PDF Parser Compatibility with Next.js

**Problem:** The initial implementation used `pdf-parse`, which depends on Node.js native modules (`fs`, `path`). This broke in Next.js's serverless environment (Vercel) because serverless functions have limited Node.js API access.

**Error:** `Module not found: Can't resolve 'fs'` during build.

**Solution:** Switched to **`unpdf`**, a modern PDF parsing library that uses `pdfjs-dist` under the hood and works in both Node.js and edge environments. It's fully compatible with Next.js serverless functions.

```diff
- import pdf from 'pdf-parse';
+ import { extractText } from 'unpdf';
```

### 2. Server Component Function Prop Error

**Problem:** The `<Toaster>` component from `react-hot-toast` passes function children, which isn't allowed in React Server Components. Placing it directly in `layout.tsx` (a Server Component) caused a build error.

**Error:** `Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server".`

**Solution:** Created a dedicated `ToastProvider` client component (`'use client'`) that wraps the toast system, and imported it into the layout.

### 3. Duplicate Toast Notifications

**Problem:** Users were seeing two notifications — one at the top-right and one at the bottom-right — for every action (save, export, etc.).

**Root Cause:** There were actually **two separate notification systems** running simultaneously:
1. A `react-hot-toast` toast notification (bottom-right)
2. A hardcoded "Floating Status Bar" `<motion.div>` with `position: fixed; top: 16px; right: 24px` that displayed "Saving version..." / "Exporting DOCX..."

**Solution:** Removed the floating status bar entirely and also rewrote the toast provider using `useToaster()` hook for full rendering control.

### 4. Vector Search RPC Fallback

**Problem:** The `match_documents` RPC function might not exist in all Supabase setups, causing the vector search to fail.

**Solution:** Implemented a graceful fallback that manually queries `document_chunks` and returns the first N results if the RPC doesn't exist. Not ideal for production, but ensures the app doesn't crash during setup.

### 5. Cascade Delete Complexity

**Problem:** Deleting a project requires removing data from 7+ related tables in the correct order to respect foreign key constraints.

**Solution:** Implemented a carefully ordered cascade delete: `citations → answers → answer_versions → questions → questionnaires → document_chunks → reference_documents → project`.

---

## 🔮 What I'd Improve with More Time

### 1. OCR Support for Scanned PDFs
Currently, only text-based PDFs work. Adding Tesseract.js or a cloud OCR service would allow processing scanned documents and images.

### 2. Hybrid Search (Vector + Keyword)
Combining semantic vector search with BM25 keyword search would improve retrieval accuracy, especially for queries involving specific regulatory codes, dates, or terminology.

### 3. Streaming Answers
Instead of waiting for all questions to finish, stream individual answers to the UI as they complete using Server-Sent Events (SSE) or WebSockets.

### 4. Team Collaboration
Add shared workspaces where multiple users can collaborate on the same project, with role-based access control (owner, editor, viewer).

### 5. Custom AI Prompts
Allow users to customize the system prompt for answer generation — e.g., adjusting tone, verbosity, or adding domain-specific instructions.

### 6. Answer Templates
Pre-built answer templates for common compliance frameworks (SOC 2, ISO 27001, HIPAA) that the AI can reference alongside uploaded documents.

### 7. Batch Export
Export multiple projects at once, or generate a combined report across projects for comprehensive compliance reviews.

### 8. Analytics Dashboard
Track metrics like average confidence scores over time, common "not found" questions, and document coverage gaps.

### 9. Fine-tuned Model
Fine-tune a smaller model specifically for compliance Q&A to reduce costs and improve domain-specific accuracy.

### 10. Auto-Save & Real-Time Sync
Automatically save changes as the user edits answers, with real-time conflict resolution for multi-user scenarios.

---

## 🔗 Links

| Resource | URL |
|---|---|
| **🚀 Live Application** | [questionnaire-answering-tool.vercel.app](https://questionnaire-answering-tool.vercel.app) |
| **📦 GitHub Repository** | [github.com/krishna0605/structured-questionnaire-answering-tool](https://github.com/krishna0605/structured-questionnaire-answering-tool) |
| **👤 GitHub Profile** | [github.com/krishna0605](https://github.com/krishna0605) |
| **🌐 Portfolio** | [creative-engineer.dev](https://creative-engineer.dev) |

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/krishna0605">krishna0605</a>
</p>
