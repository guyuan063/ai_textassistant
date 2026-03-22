// 顶部任务标签配置。
// key 是程序内部使用的标识，label / shortLabel 是界面上展示的文案。
export const TASK_TABS = [
  { key: 'polish', label: '润色', shortLabel: '润色' },
  { key: 'translate', label: '翻译', shortLabel: '翻译' },
  { key: 'summary', label: '摘要', shortLabel: '摘要' },
  { key: 'copywriting', label: '文案', shortLabel: '文案' }
]

// 右侧模型下拉框的候选项。
export const PROVIDER_OPTIONS = [
  { label: 'OpenAI', value: 'openai' },
  { label: 'DeepSeek', value: 'deepseek' },
  { label: '百度千帆 / 文心', value: 'baidu' }
]

// 翻译模块使用的语言选项。
export const LANGUAGE_OPTIONS = [
  '自动识别',
  '中文',
  '英文',
  '日文',
  '韩文',
  '法文',
  '德文',
  '西班牙文'
]

// 摘要模块的长度和格式选项。
export const SUMMARY_LENGTH_OPTIONS = ['精简版', '标准版', '详细版']
export const SUMMARY_FORMAT_OPTIONS = ['自然段', '要点列表']

// 文案模块的预设类型。
export const COPYWRITING_TYPES = [
  '朋友圈文案',
  '小红书标题',
  '短视频脚本',
  '邮件模板',
  '面试自我介绍'
]

// DeepSeek 内置的常用模型选项。
// 如果后续要扩展更多模型，只需要继续往这里加即可。
export const DEEPSEEK_MODEL_OPTIONS = [
  { label: 'deepseek-chat', value: 'deepseek-chat' },
  { label: 'deepseek-reasoner', value: 'deepseek-reasoner' }
]

// 创建模型配置的默认值。
// 单独写成函数而不是常量对象，是为了避免多个地方共享同一份引用。
export function createDefaultSettings() {
  return {
    provider: 'openai',
    openai: {
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-3.5-turbo',
      temperature: 0.7
    },
    deepseek: {
      apiKey: '',
      baseUrl: 'https://api.deepseek.com',
      model: 'deepseek-chat',
      temperature: 0.7
    },
    baidu: {
      apiKey: '',
      secretKey: '',
      tokenUrl: 'https://aip.baidubce.com/oauth/2.0/token',
      chatUrl: 'https://qianfan.baidubce.com/v2/chat/completions',
      model: 'ERNIE-Speed-128K',
      temperature: 0.7
    }
  }
}

// 创建各个任务表单的默认值。
// 这些值会直接驱动工作区表单的初始显示。
export function createDefaultForms() {
  return {
    polish: {
      action: 'polish',
      tone: '专业自然',
      extra: ''
    },
    translate: {
      sourceLanguage: '自动识别',
      targetLanguage: '英文',
      style: '自然地道'
    },
    summary: {
      length: '标准版',
      format: '要点列表',
      focus: '提炼重点与结论'
    },
    copywriting: {
      type: '朋友圈文案',
      tone: '真诚、有吸引力',
      audience: '普通用户',
      extra: ''
    }
  }
}

// 根据任务 key 反查界面上的任务名称。
export function getTaskLabel(task) {
  return TASK_TABS.find((item) => item.key === task)?.label ?? '文本处理'
}

// 根据任务类型返回输入框 placeholder。
export function getTaskPlaceholder(task) {
  const placeholderMap = {
    polish: '输入需要润色或纠错的原文，例如工作总结、邮件、自我介绍等。',
    translate: '输入需要翻译的内容，支持中英日等常见语言互译。',
    summary: '粘贴长文本、会议记录、文章段落，生成精简摘要。',
    copywriting: '输入主题、卖点、背景信息或草稿，让 AI 生成创意文案。'
  }

  return placeholderMap[task] ?? '请输入文本内容'
}

// 根据任务类型返回输入区标题。
export function getTaskInputLabel(task) {
  const labelMap = {
    polish: '原始文本',
    translate: '待翻译文本',
    summary: '待总结文本',
    copywriting: '主题 / 素材 / 要求'
  }

  return labelMap[task] ?? '输入文本'
}
