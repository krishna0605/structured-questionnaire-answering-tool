# 🛡️ ShieldSync — AI-Powered Questionnaire Answering Tool

> **GTM Engineering Internship — Take-Home Assignment**

An AI-powered tool that automates answering structured questionnaires using internal reference documents, featuring citations, inline editing, DOCX export, and all 5 nice-to-have features.

![ShieldSync](https://img.shields.io/badge/Built%20With-Next.js%2014-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)

---

## 🚀 Live Demo

**[Live URL]** → *(Deploy to Vercel and paste URL here)*

### Demo Credentials
```
Email: demo@shieldsync.io
Password: demo123456
```

---

## ✨ Features

### Core Features (Must-Have)
| Feature | Status |
|---|---|
| 🔐 User Authentication (Sign Up / Login) | ✅ |
| 📤 Questionnaire Upload (PDF / XLSX / TXT) | ✅ |
| 📚 Reference Document Upload (PDF / TXT) | ✅ |
| 🔍 Question Parsing (auto-extraction) | ✅ |
| 🧠 RAG-based Answer Generation with Citations | ✅ |
| ✏️ Inline Answer Editing | ✅ |
| 📥 DOCX Export with Structure & Citations | ✅ |

### Nice-to-Have Features (All 5 Implemented)
| Feature | Status | Description |
|---|---|---|
| 📊 Confidence Scores | ✅ | Color-coded badges (green/orange/red) per answer |
| 📎 Evidence Snippets | ✅ | Expandable panel showing exact source quotes |
| 🔄 Partial Regeneration | ✅ | Checkbox-select questions to re-generate individually |
| 📜 Version History | ✅ | Save snapshots, view & compare side-by-side |
| 📈 Coverage Summary | ✅ | Dashboard showing total/answered/not-found/avg confidence |

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router) + TypeScript |
| **Styling** | Tailwind CSS v4 + Custom Design System |
| **Auth** | Supabase Auth (email/password) |
| **Database** | Supabase PostgreSQL + pgvector |
| **Storage** | Supabase Storage (file buckets) |
| **AI / LLM** | OpenAI GPT-4o-mini |
| **Embeddings** | OpenAI text-embedding-3-small (1536-dim) |
| **PDF Parsing** | pdf-parse |
| **XLSX Parsing** | xlsx (SheetJS) |
| **DOCX Export** | docx (npm) |
| **Deployment** | Vercel + Supabase Cloud |

### RAG Pipeline

```
Upload Reference Doc → Parse Text → Chunk (~500 tokens, overlap 50)
→ Generate Embeddings (text-embedding-3-small)
→ Store in pgvector (document_chunks table)

Question → Embed Question → Vector Similarity Search (cosine, top-5)
→ Compile Context → Prompt GPT-4o-mini
→ Structured Output (answer, citations, confidence, evidence snippets)
```

### Database Schema

8 tables: `projects`, `questionnaires`, `reference_documents`, `document_chunks`, `questions`, `answers`, `citations`, `answer_versions` — all protected with Row Level Security (RLS) policies.

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- npm
- Supabase account (free tier works)
- OpenAI API key

### 1. Clone & Install

```bash
git clone <repo-url>
cd structured-questionnaire-answering-tool
npm install
```

### 2. Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
```

### 3. Supabase Setup

The database schema is already configured via Supabase migrations. If setting up fresh:

1. Create a Supabase project
2. Enable the `pgvector` extension
3. Run the migration SQL files to create all tables
4. Configure RLS policies
5. Create storage buckets: `questionnaires` and `references`

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing redirect
│   ├── login/page.tsx          # Login page
│   ├── signup/page.tsx         # Sign up page
│   ├── dashboard/page.tsx      # Project list
│   ├── project/[id]/
│   │   ├── page.tsx            # Project detail & answers
│   │   └── history/page.tsx    # Version history
│   └── api/
│       ├── auth/callback/      # Supabase auth callback
│       ├── parse/              # Parse questionnaire
│       ├── embed/              # Embed reference docs
│       ├── generate/           # Generate all answers (RAG)
│       ├── regenerate/         # Partial regeneration
│       ├── export/             # DOCX export
│       └── versions/           # Version history CRUD
├── lib/
│   ├── supabase/               # Supabase client configs
│   ├── openai.ts               # OpenAI client & helpers
│   ├── parser.ts               # PDF/XLSX parsing
│   ├── chunker.ts              # Text chunking
│   ├── rag.ts                  # RAG pipeline
│   └── export.ts               # DOCX generation
├── types/index.ts              # TypeScript definitions
└── middleware.ts               # Auth middleware
sample-data/                    # Fictional company demo data
```

---

## 🎭 Fictional Company

| Field | Value |
|---|---|
| **Company** | ShieldSync Inc. |
| **Industry** | SaaS / Cloud Security (CSPM) |
| **Description** | Cloud-native security posture management platform |
| **Questionnaire** | 12-question vendor security assessment |
| **Reference Docs** | Security Policy, Data Handling Policy, Incident Response Plan, Infrastructure Overview, Compliance Certifications |

---

## 🔑 Key Design Decisions

| Decision | Rationale |
|---|---|
| **Next.js API Routes** | Single Vercel deployment, no separate backend |
| **Supabase pgvector** | Free, integrated vector search in PostgreSQL |
| **GPT-4o-mini** | 90% cheaper than GPT-4o, sufficient for grounded Q&A |
| **Client-side auth** | Simplified flow with proper RLS |
| **DOCX export** | Editable format, preserves structure |

---

## 💰 Cost

| Service | Cost |
|---|---|
| Vercel (Hobby) | $0 |
| Supabase (Free) | $0 |
| OpenAI API | ~$0.50–2.00 for demo |
| **Total** | **< $5** |

---

## 🚀 Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Supabase

Production database is already configured on Supabase Cloud.

---

## 📝 Improvement Ideas

1. **Streaming answers** — Use SSE to stream answers as they generate
2. **PDF questionnaire support** — Enhanced PDF parsing with layout analysis
3. **Team collaboration** — Share projects with team members
4. **Custom AI models** — Support for Anthropic Claude, Google Gemini
5. **Bulk export** — Export multiple projects at once
6. **Webhook notifications** — Notify when generation completes
7. **Answer templates** — Save and reuse common answers
8. **Multi-language** — Support questionnaires in multiple languages

---

Built with ❤️ for the GTM Engineering Internship
