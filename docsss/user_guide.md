# 📖 User Guide — questionnaire-answering-tool

A quick-start guide to get you from zero to exported answers in under 5 minutes.

---

## 1. Sign Up & Log In

1. Visit [questionnaire-answering-tool.vercel.app](https://questionnaire-answering-tool.vercel.app)
2. Click **Sign Up** → enter your email and a password (min 6 characters) → submit
3. You'll be redirected to the **Dashboard** automatically
4. Next time, use **Log In** with the same credentials

---

## 2. Create a Project

1. On the Dashboard, click **"+ New Project"**
2. Enter a project name (e.g., "SOC 2 Vendor Assessment Q1")
3. Click **Create** — your project card appears in the grid
4. Click the card to open the **Project Workspace**

---

## 3. Upload Files

You need **two types** of files:

| Upload Zone | What to Upload | Formats |
|---|---|---|
| **Questionnaire** | The questionnaire you need answered | PDF, XLSX, TXT |
| **Reference Documents** | Your source docs (policies, SOC reports, etc.) | PDF, TXT (multiple files) |

**Steps:**
1. Drag or click the **Questionnaire** upload zone → select your questionnaire file
2. Questions will be parsed and listed (Q1, Q2, Q3...)
3. Drag or click the **Reference Documents** zone → select one or more docs
4. Wait for the "Embedded" confirmation (a few seconds per doc)

---

## 4. Generate Answers

1. Click **"Generate All Answers"**
2. A multi-step loader will show progress — wait ~15–30 seconds
3. Each question now has an AI-generated answer with:
   - **Confidence score** — 🟢 High (70%+) / 🟡 Medium (40–70%) / 🔴 Low (<40%)
   - **Evidence sources** — click "Sources" to see exact document passages used

---

## 5. Edit & Refine

- **Edit an answer** → Click the ✏️ edit icon on any answer → modify text → click **Save**
- **Regenerate specific questions** → Check the boxes next to low-confidence questions → click **"Regenerate Selected"**
- **Save a version** → Click **"Save Version"** in the top bar to create a named snapshot

---

## 6. View History & Compare

1. Click the **"History"** button in the top navigation
2. See all saved versions listed by date
3. Select any version to review its answers
4. Select two versions and click **Compare** to see a side-by-side diff

---

## 7. Export as DOCX

1. Click **"Export"** in the top bar
2. Choose to export **Live Data** or a **Saved Version**
3. A `.docx` file downloads with all questions, answers, confidence scores, and citations

---

## 8. Sample Data

The project includes ready-to-use sample files in the `sample-data/` folder:

### Questionnaire (upload as Questionnaire)
| File | Description |
|---|---|
| `questionnaire.pdf` | Sample security questionnaire |
| `questionnaire.txt` | Same questionnaire in text format |

### Reference Documents (upload as Reference Docs)
| File | Description |
|---|---|
| `security-policy.pdf / .txt` | Company security policy |
| `data-handling-policy.pdf / .txt` | Data handling procedures |
| `incident-response-plan.pdf / .txt` | Incident response plan |
| `infrastructure-overview.pdf / .txt` | Infrastructure documentation |
| `compliance-certs.pdf / .txt` | Compliance certifications |

**Quick test:** Upload `questionnaire.pdf` as the questionnaire, then upload all 5 reference doc PDFs, and hit Generate.

---

## Tips

- 📄 Upload **more reference docs** = better, more grounded answers
- 🔄 Use **Regenerate Selected** for any answers you're not happy with
- 💾 **Save versions** before making bulk edits so you can always compare/rollback
- 📊 Check the **coverage stats** at the top of the project page for an at-a-glance quality overview
