import { defineStore } from 'pinia'
import { createDefaultForms, createDefaultSettings } from '@/config/assistant'
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
    forms: createDefaultForms()
  }
}

export const useAssistantStore = defineStore('assistant', {
  state: () => createInitialState(),
  getters: {
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
    }
  }
})
