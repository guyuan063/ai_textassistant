import { defineStore } from 'pinia'
import {
  HISTORY_LIMIT,
  cloneTemplates,
  createDefaultForms,
  createDefaultSettings
} from '@/config/assistant'
import {
  buildPersistedPayload,
  loadPersistedState,
  savePersistedState
} from '@/utils/persistence'

function createInitialState() {
  return {
    activeTask: 'polish',
    inputText: '',
    resultText: '',
    loading: false,
    errorMessage: '',
    settings: createDefaultSettings(),
    forms: createDefaultForms(),
    templates: cloneTemplates(),
    history: []
  }
}

function createId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}`
}

export const useAssistantStore = defineStore('assistant', {
  state: () => createInitialState(),
  getters: {
    historyCount: (state) => state.history.length,
    templateCount: (state) => state.templates.length,
    resultLength: (state) => state.resultText.trim().length
  },
  actions: {
    hydrate() {
      const persisted = loadPersistedState()

      if (!persisted) {
        return
      }

      this.activeTask = persisted.activeTask || this.activeTask
      this.inputText = persisted.inputText || ''
      this.settings = {
        ...this.settings,
        ...persisted.settings,
        openai: {
          ...this.settings.openai,
          ...(persisted.settings?.openai || {})
        },
        deepseek: {
          ...this.settings.deepseek,
          ...(persisted.settings?.deepseek || {})
        },
        baidu: {
          ...this.settings.baidu,
          ...(persisted.settings?.baidu || {})
        }
      }
      this.forms = {
        ...this.forms,
        ...persisted.forms,
        polish: {
          ...this.forms.polish,
          ...(persisted.forms?.polish || {})
        },
        translate: {
          ...this.forms.translate,
          ...(persisted.forms?.translate || {})
        },
        summary: {
          ...this.forms.summary,
          ...(persisted.forms?.summary || {})
        },
        copywriting: {
          ...this.forms.copywriting,
          ...(persisted.forms?.copywriting || {})
        }
      }
      this.templates =
        persisted.templates?.length > 0
          ? persisted.templates
          : cloneTemplates()
      this.history = Array.isArray(persisted.history) ? persisted.history : []
    },
    persistState(state = this.$state) {
      savePersistedState(buildPersistedPayload(state))
    },
    setResult(value) {
      this.resultText = value
      this.errorMessage = ''
    },
    setError(value) {
      this.errorMessage = value
    },
    clearWorkspace() {
      this.inputText = ''
      this.resultText = ''
      this.errorMessage = ''
    },
    startLoading() {
      this.loading = true
      this.errorMessage = ''
    },
    stopLoading() {
      this.loading = false
    },
    saveTemplate({ title, content, task }) {
      const template = {
        id: createId('tpl'),
        title,
        content,
        task,
        createdAt: new Date().toISOString()
      }

      this.templates = [template, ...this.templates]
    },
    removeTemplate(id) {
      this.templates = this.templates.filter((item) => item.id !== id)
    },
    applyTemplate(template) {
      this.activeTask = template.task
      this.inputText = template.content
      this.resultText = ''
      this.errorMessage = ''
    },
    resetTemplates() {
      this.templates = cloneTemplates()
    },
    pushHistory({ task, inputText, resultText, provider }) {
      const record = {
        id: createId('history'),
        task,
        inputText,
        resultText,
        provider,
        createdAt: new Date().toISOString()
      }

      this.history = [record, ...this.history].slice(0, HISTORY_LIMIT)
    },
    applyHistory(record) {
      this.activeTask = record.task
      this.inputText = record.inputText
      this.resultText = record.resultText
      this.errorMessage = ''
    },
    clearHistory() {
      this.history = []
    }
  }
})
