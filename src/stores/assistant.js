// 导入 Pinia 的 defineStore 方法，用于创建状态管理 store
import { defineStore } from 'pinia'
// 导入默认配置生成函数
import { createDefaultForms, createDefaultSettings } from '@/config/assistant'
// 导入 localStorage 持久化相关工具函数
import {
  buildPersistedPayload,
  loadPersistedState,
  savePersistedState
} from '@/utils/persistence'

/**
 * 创建初始状态的工厂函数
 * 将状态初始化集中在这里，便于后续维护和重置
 * 
 * 状态字段说明：
 * - activeTask: 当前选中的任务类型（polish/translate/summary/copywriting）
 * - inputText: 用户输入的文本内容
 * - resultText: AI 生成的结果文本
 * - loading: 请求加载状态
 * - errorMessage: 错误提示信息
 * - settings: 模型配置（API密钥、模型选择等）
 * - forms: 各任务类型的表单参数配置
 */
function createInitialState() {
  return {
    activeTask: 'polish',           // 默认任务：润色
    inputText: '',                  // 用户输入文本
    resultText: '',                 // AI 生成结果
    loading: false,                 // 加载状态
    errorMessage: '',               // 错误信息
    settings: createDefaultSettings(), // 模型配置
    forms: createDefaultForms()     // 表单配置
  }
}

/**
 * 创建 Pinia store，命名为 'assistant'
 * 用于管理 AI 文本助手的全局状态
 */
export const useAssistantStore = defineStore('assistant', {
  // state 函数：返回初始状态
  state: () => {
    return createInitialState()
  },

  // getters：计算属性，基于状态派生新值
  getters: {
    // 计算结果文本的字数（去除首尾空格后）
    // 用于结果区顶部展示字数统计
    resultLength: (state) => state.resultText.trim().length
  },

  // actions：用于修改状态的方法
  actions: {
    // 开始加载：设置加载状态，清空之前的结果和错误
    startLoading() {
      this.loading = true       // 开启加载状态
      this.errorMessage = ''    // 清空错误信息
      this.resultText = ''      // 清空旧结果
    },

    // 停止加载：关闭加载状态
    stopLoading() {
      this.loading = false
    },

    // 追加结果：用于流式输出，逐块拼接结果
    appendResult(chunk) {
      this.resultText += chunk
    },

    /**
     * 从 localStorage 恢复状态（水合）
     * 页面加载时调用，恢复上次保存的用户配置
     */
    hydrate() {
      // 读取本地缓存的状态
      const persisted = loadPersistedState()


      // 如果没有缓存数据，直接返回
      if (!persisted) {
        return
      }

      // 恢复任务类型和输入文本
      this.activeTask = persisted.activeTask || this.activeTask
      this.inputText = persisted.inputText || ''

      // 深度合并模型配置（保留默认值，覆盖缓存值）
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
        }
      }

      // 深度合并表单配置
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

    /**
     * 将状态持久化到 localStorage
     * @param {Object} state - 可选参数，默认为当前 store 状态
     */
    persistState(state = this.$state) {
      // 构建需要持久化的 payload，然后保存到 localStorage
      savePersistedState(buildPersistedPayload(state))
    },

    /**
     * 设置生成结果
     * @param {string} value - AI 生成的结果文本
     */
    setResult(value) {
      this.resultText = value      // 设置结果文本
      this.errorMessage = ''       // 清空错误信息
    },

    /**
     * 设置错误信息
     * @param {string} value - 错误提示文本
     */
    setError(value) {
      this.errorMessage = value
    },

    /**
     * 清空工作区（保留模型配置）
     * 只清空本次任务相关的内容
     */
    clearWorkspace() {
      this.inputText = ''          // 清空输入
      this.resultText = ''         // 清空结果
      this.errorMessage = ''       // 清空错误
    }
  }
})
