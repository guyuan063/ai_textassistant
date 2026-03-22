import { defineStore } from 'pinia'
import { createDefaultForms, createDefaultSettings } from '@/config/assistant'
import {
  buildPersistedPayload,
  loadPersistedState,
  savePersistedState
} from '@/utils/persistence'

// 这里集中定义 store 的初始状态。
// 这样以后如果要“重置到默认值”，只需要改这一处。
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
  state: () => {
    return createInitialState()
  },

  getters: {
    // 结果区顶部展示的“结果字数”来自这里。
    // trim() 的作用是避免只有空格时也被统计进去。
    resultLength: (state) => state.resultText.trim().length
  },

  actions: {
    // 从 localStorage 恢复上一次保存的状态。
    // 这里采用“默认值 + 持久化值”的合并策略，目的是：
    // 1. 新增字段时不至于因为旧缓存缺字段而报错
    // 2. 只覆盖用户真正保存过的部分
    hydrate() {
      const persisted = loadPersistedState()

      // 这是你现在保留的调试输出：
      // 用来观察浏览器里恢复出来的数据结构。
      console.log(persisted)

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

    // 把当前 store 中“需要长期保存”的部分提取出来，写入 localStorage。
    persistState(state = this.$state) {
      savePersistedState(buildPersistedPayload(state))
    },

    // 请求成功后写入结果，同时清空旧错误。
    setResult(value) {
      this.resultText = value
      this.errorMessage = ''
    },

    // 请求失败时，把错误文本交给结果区展示。
    setError(value) {
      this.errorMessage = value
    },

    // 清空工作区时，不动右侧模型配置，只清空本次任务相关内容。
    clearWorkspace() {
      this.inputText = ''
      this.resultText = ''
      this.errorMessage = ''
    },

    // 请求开始时进入加载状态，并顺手清除上一次错误。
    startLoading() {
      this.loading = true
      this.errorMessage = ''
    },

    // 请求结束时关闭加载状态。
    stopLoading() {
      this.loading = false
    }
  }
})
