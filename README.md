# HistoryDiff 🌍✨

> **Visually unravelling the "differences in descriptions" of history across different countries and regions.**

Even for the same historical event, textbook descriptions and official narratives vary significantly depending on the country or region. **HistoryDiff** is an interactive educational web application that highlights these differences in perception through side-by-side text comparisons (Diffs), accompanied by structured verification notes and references.

---

### Read this in other languages:
🌐 **[English](README.md)** | 🇯🇵 **[日本語](README.ja.md)** | 🇨🇳 **[简体中文](README.zh.md)** | 🇰🇷 **[한국어](README.ko.md)**

---

## 🚀 Key Features

*   **Side-by-Side Diff Viewer:** Compares textbook excerpts or official historical narratives from different countries/regions in real-time, highlighting additions, deletions, and phrasing differences.
*   **Multilingual Localization:** Complete translation and localized experience in 4 languages: **English (`en`)**, **Japanese (`ja`)**, **Chinese (`zh`)**, and **Korean (`ko`)** using Next.js localized sub-routes (e.g., `/[lang]`).
*   **Community Notes & Fact Verification:** Interactive cards analyzing specific historical claims, complete with a neutrality "Verdict," background context, and academic or official citations.
*   **Faceted Event Directory:** Allows users to filter historical events by category (e.g., Sovereignty & Territory, War & Conflicts, Modern Controversies), historical era, country of perspective, or real-time text query.
*   **Automated Translation Scripts:** A custom translation pipeline (`translate.py`, `translate_ko.py`) that uses Google Translate with rate-limiting, exponential backoff, and robust list-based frontmatter parsing to automatically translate Japanese source content to the other languages.

---

## 🛠️ Technology Stack

*   **Frontend Framework:** Next.js 16.2 (React 19, TypeScript)
*   **Styling & Design:** Vanilla CSS with modern styling tokens, CSS Variables, glassmorphism, responsive grids, and clean visual layouts.
*   **Comparison Engine:** `react-diff-viewer-continued` for semantic and word-level diffing.
*   **Markdown Parsing:** `react-markdown` and `gray-matter` for parsing frontmatter metadata and rendering rich text descriptions.
*   **Icons:** `lucide-react` for modern, responsive micro-animations and intuitive interface visuals.

---

## 📁 Project Structure

```bash
historydiff/
├── content/
│   └── events/                   # Database of historical events and controversies
│       ├── takeshima/            # Example: Takeshima / Dokdo controversy
│       │   ├── japan-ja.md       # Japanese perspective in Japanese (Source)
│       │   ├── japan-en.md       # Japanese perspective in English (Auto-translated)
│       │   ├── korea-ko.md       # Korean perspective in Korean
│       │   ├── usa-en.md         # USA perspective in English
│       │   ├── notes.json        # Verification notes in Japanese (Source)
│       │   ├── notes-en.json     # Verification notes in English (Auto-translated)
│       │   └── ...
│       └── ...
├── src/
│   ├── app/
│   │   ├── [lang]/               # Next.js internationalized routing sub-routes
│   │   │   ├── events/[id]/      # Localized event detail pages
│   │   │   └── page.tsx          # Localized home search page
│   │   ├── components/           # Reusable UI components
│   │   │   ├── CommunityNotes.tsx# Renders claims, verdicts, and reference sources
│   │   │   ├── DiffView.tsx      # Renders side-by-side or inline diff comparison
│   │   │   ├── LanguageSelector.tsx # Dropdown language switcher
│   │   │   ├── Header.tsx / Footer.tsx
│   │   │   └── SearchEvents.tsx  # Interactive search, filtering, and catalog
│   │   ├── globals.css           # Core styling system, CSS variables, and themes
│   │   ├── layout.tsx            # Global layout layout
│   │   └── page.tsx              # Root home page (defaults to English)
│   └── lib/
│       ├── markdown.ts           # Markdown parsing utilities and file loaders
│       └── translations.ts       # Multilingual dictionaries for global UI strings
├── translate.py                  # Translates content from Japanese to English and Chinese
└── translate_ko.py               # Translates content from Japanese to Korean
```

---

## 📚 Content Schema

Each perspective is defined as a Markdown file with a YAML frontmatter header containing localized metadata attributes:

```markdown
---
id: "takeshima"
title: "Description of the Sovereignty of Takeshima (Dokdo)"
category: "Sovereignty & Territory"
year: "17th Century - Present"
location: "Sea of Japan (East Sea)"
country: "Japan"
language: "en"
source: "Ministry of Foreign Affairs of Japan / Textbook Excerpts"
---

The actual description of historical events goes here. 
You can use standard Markdown formatting.
```

### Verification Notes Schema (`notes.json`)

Notes are structured to provide factual balance and context:

```json
{
  "eventId": "takeshima",
  "notes": [
    {
      "id": "takeshima-claim-1",
      "claim": "Claim to be verified.",
      "context": "Contextual background explaining why this is controversial.",
      "verdict": "Neutral verification analysis and consensus.",
      "sources": [
        {
          "title": "Document Title",
          "url": "https://example.com/source",
          "publisher": "Academic Publisher or Government Department",
          "type": "academic"
        }
      ]
    }
  ]
}
```

---

## 🤖 Content Translation Pipeline

To streamline content updates, Japanese is used as the **source language** for content and notes. The included Python scripts translate the content into the remaining three languages seamlessly.

### Features of the Translation Scripts:
*   **Smart Frontmatter Translation:** Groups metadata attributes into structured numbered lists for batch translation to preserve formatting, with a fallback to individual fields in case of translation mismatches.
*   **Robust HTML & Markdown Protection:** Safely preserves Markdown markup and code structure during the translation processes.
*   **Reliability:** Includes a retry mechanism (up to 5 attempts) with exponential backoff to handle network limitations.

### How to Run:
Ensure you are in the project's root directory:

```bash
# Translate all Japanese content to English and Chinese
python3 translate.py

# Translate Japanese content to Korean for selected events
python3 translate_ko.py
```

---

## 💻 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or similar package manager (pnpm, yarn, bun)
- **Python 3** (Optional: only needed for translating content database)

### 2. Installation
Clone the repository and install dependencies:

```bash
npm install
```

### 3. Development Server
Run the local Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 4. Production Build
To generate a fully optimized production bundle:

```bash
npm run build
```

---

## 🤝 Contribution & Ethics Statement

HistoryDiff is an educational platform designed to encourage critical thinking, media literacy, and global perspective awareness. It does not take a stance on any geopolitical issues but aims to show how the same history can be viewed, taught, and recorded through different lenses. 

Contributions that add verified regional perspectives, fix translation nuances, or add credible academic sources are always welcome!

---

## 📄 License

This project is MIT License.
