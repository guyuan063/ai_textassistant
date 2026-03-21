const STORAGE_KEY = 'ai-textassistant-state'

export function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.warn('读取本地缓存失败', error)
    return null
  }
}

export function savePersistedState(payload) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch (error) {
    console.warn('保存本地缓存失败', error)
  }
}

export function buildPersistedPayload(state) {
  return {
    activeTask: state.activeTask,
    inputText: state.inputText,
    settings: state.settings,
    forms: state.forms,
    templates: state.templates,
    history: state.history
  }
}
