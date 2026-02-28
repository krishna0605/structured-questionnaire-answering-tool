# Test Cases & GitHub Actions CI

Add automated testing with Jest + React Testing Library and a GitHub Actions CI pipeline.

## Proposed Changes

### Testing Framework Setup

#### [NEW] [jest.config.ts](file:///c:/Users/Admin/Desktop/structured-questionnaire-answering-tool/jest.config.ts)
Jest configuration with `ts-jest` and `@testing-library/jest-dom`. Path aliases mapped to match [tsconfig.json](file:///c:/Users/Admin/Desktop/structured-questionnaire-answering-tool/tsconfig.json).

#### [MODIFY] [package.json](file:///c:/Users/Admin/Desktop/structured-questionnaire-answering-tool/package.json)
- Add devDependencies: `jest`, `ts-jest`, `@types/jest`, `@testing-library/react`, `@testing-library/jest-dom`, `jest-environment-jsdom`
- Add `"test"` script

---

### Test Suites (Unit Tests)

#### [NEW] `__tests__/lib/chunker.test.ts`
Pure function tests for [chunkText()](file:///c:/Users/Admin/Desktop/structured-questionnaire-answering-tool/src/lib/chunker.ts#6-44):
- Empty/whitespace input → empty array
- Single chunk (short text) → 1 chunk with index 0
- Multi-chunk with correct overlap
- Custom `maxTokens` / `overlapTokens` parameters
- Very long text → multiple sequential chunks

#### [NEW] `__tests__/lib/parser.test.ts`
Tests for [extractQuestionsFromText()](file:///c:/Users/Admin/Desktop/structured-questionnaire-answering-tool/src/lib/parser.ts#52-114):
- Numbered questions (`1. / 1) / Q1:`) parsing
- Multi-line question continuation
- Fallback to paragraph splitting when no numbering
- Edge cases: empty input, single question, duplicate numbers

#### [NEW] `__tests__/lib/openai.test.ts`
Tests with **mocked OpenAI client**:
- [generateEmbedding()](file:///c:/Users/Admin/Desktop/structured-questionnaire-answering-tool/src/lib/openai.ts#7-14) returns correct embedding array
- [generateAnswer()](file:///c:/Users/Admin/Desktop/structured-questionnaire-answering-tool/src/lib/openai.ts#15-68) parses valid JSON response
- [generateAnswer()](file:///c:/Users/Admin/Desktop/structured-questionnaire-answering-tool/src/lib/openai.ts#15-68) handles malformed JSON gracefully (fallback)

#### [NEW] `__tests__/lib/export.test.ts`
Tests for [generateDocx()](file:///c:/Users/Admin/Desktop/structured-questionnaire-answering-tool/src/lib/export.ts#17-237) with mock data:
- Returns a valid Buffer
- Handles empty questions array
- Handles questions with/without citations

#### [NEW] `__tests__/types/types.test.ts`
TypeScript compile-time validation:
- Type guard checks for [Project](file:///c:/Users/Admin/Desktop/structured-questionnaire-answering-tool/src/types/index.ts#5-12), [Question](file:///c:/Users/Admin/Desktop/structured-questionnaire-answering-tool/src/types/index.ts#39-46), [Answer](file:///c:/Users/Admin/Desktop/structured-questionnaire-answering-tool/src/types/index.ts#47-58) shapes

---

### GitHub Actions CI

#### [NEW] `.github/workflows/ci.yml`
Triggers on `push` and `pull_request` to [main](file:///c:/Users/Admin/Desktop/structured-questionnaire-answering-tool/scripts/generate-pdfs.mjs#267-278). Steps:

| Step | Command |
|---|---|
| Checkout | `actions/checkout@v4` |
| Setup Node 20 | `actions/setup-node@v4` |
| Install deps | `npm ci` |
| Lint | `npm run lint` |
| Type check | `npx tsc --noEmit` |
| Test | `npm test -- --ci --coverage` |
| Build | `npm run build` |

Uses `npm ci` for deterministic installs. Caches `node_modules` for speed.

> [!IMPORTANT]
> The CI pipeline will **not** have access to env vars (`OPENAI_API_KEY`, Supabase keys) — all external service calls are mocked in tests.

## Verification Plan

### Automated Tests
- `npm test` — all test suites pass locally
- `npm run build` — build still succeeds with new devDependencies

### Manual Verification
- Push to GitHub and confirm the Actions workflow runs green
