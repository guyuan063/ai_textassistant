# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Text Assistant (AI 智能文本助手) — a front-end-only Vue 3 app for AI-powered text processing: polish, translate, summarize, and copywriting. Connects directly to OpenAI/DeepSeek APIs via browser-side streaming SSE. This is a teaching/demo project; API keys are exposed client-side.

## Commands

```bash
npm run dev      # Start Vite dev server (port 5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build locally
```

No test, lint, or format scripts are configured.

## Architecture

**Tech stack:** Vue 3 (Composition API, `<script setup>`), Vite 5, Element Plus 2.8, Pinia 2, Vue Router 5 (hash mode), vanilla CSS with custom properties. JavaScript only — no TypeScript.

**Data flow:**
```
WorkbenchPanel --[emit 'generate']--> WorkbenchView.handleGenerate()
                                            |
                                    generateTextStream() in services/ai.js
                                            |
                              onMessage → store.appendResult(chunk)
                              onError  → store.setError(msg)
                                            |
                                    ResultPanel reads store reactively
```

**Key modules:**

- `src/stores/assistant.js` — Single Pinia store (`"assistant"`) holds all state: activeTask, inputText, resultText, loading, errorMessage, settings (provider config), forms (per-task params). Includes `hydrate()` and `persistState()` for localStorage.
- `src/services/ai.js` — AI service layer: prompt construction (`buildTaskPrompts`), endpoint normalization (`buildCompatibleEndpoint`), SSE stream processing (`processSSEStream`), and main entry `generateTextStream()`. Handles both OpenAI `delta.content` and DeepSeek `delta.reasoning_content` fields.
- `src/config/assistant.js` — All constants and factory functions: `TASK_TABS`, `PROVIDER_OPTIONS`, `LANGUAGE_OPTIONS`, `createDefaultSettings()`, `createDefaultForms()`.
- `src/utils/persistence.js` — localStorage read/write helpers under key `"ai-textassistant-state"`.
- `src/App.vue` — Root component: calls `store.hydrate()` on load, subscribes to store mutations via `store.$subscribe()` for auto-persistence.

**Routing:** Hash-based. `/workbench` (default) and `/model-config`, both lazy-loaded.

**Adding a new AI provider:** Define it in `PROVIDER_OPTIONS` in `config/assistant.js`, add model options, then add a branch in `generateTextStream()` in `services/ai.js`.

**Adding a new task type:** Add a tab entry in `TASK_TABS`, add default form fields in `createDefaultForms()`, add prompt templates in `buildTaskPrompts()`, and create the form UI in `WorkbenchPanel.vue`.
