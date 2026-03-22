// localStorage 使用的固定 key。
// 后续如果要做版本升级或拆分存储，可以从这里统一调整。
const STORAGE_KEY = 'ai-textassistant-state'

// 从浏览器读取上次保存的状态。
// try/catch 是为了防止 JSON 格式损坏时页面直接报错。
export function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.warn('读取本地缓存失败', error)
    return null
  }
}

// 把状态序列化后写入 localStorage。
export function savePersistedState(payload) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch (error) {
    console.warn('保存本地缓存失败', error)
  }
}

// 这里只挑选“值得持久化”的字段。
// 像 loading 这种临时运行态，不应该写进 localStorage。
export function buildPersistedPayload(state) {
  return {
    activeTask: state.activeTask,
    inputText: state.inputText,
    settings: state.settings,
    forms: state.forms
  }
}
