/**
 * AI 服务层模块
 * 负责封装 AI API 请求、构建 Prompt、处理流式响应
 * 支持 OpenAI、DeepSeek 等多模型提供商
 */

/**
 * 根据任务类型构建 Prompt（提示词）
 * @param {Object} params - 参数对象
 * @param {string} params.task - 任务类型（polish/translate/summary/copywriting）
 * @param {string} params.inputText - 用户输入文本
 * @param {Object} params.forms - 各任务的表单配置
 * @returns {Object} - 包含 system 和 user 的 prompt 对象
 */
function buildTaskPrompts({ task, inputText, forms }) {
  const promptMap = {

    polish() {
      const action = forms.polish.action === 'correct' ? '纠错改错' : '润色优化'
      return {
        system: '你是一名专业中文写作助手，擅长在保留原意的前提下优化表达质量。',
        user: [
          `任务：${action}`,
          `语气要求：${forms.polish.tone}`,
          forms.polish.extra ? `额外要求：${forms.polish.extra}` : '',
          '请直接输出优化后的文本，不要附加解释。',
          '',
          '原文如下：',
          inputText
        ].filter(Boolean).join('\n')
      }
    },

    translate() {
      return {
        system: '你是一名多语言翻译助手，请保证翻译准确、自然，并尽量保留原文语境。',
        user: [
          `源语言：${forms.translate.sourceLanguage}`,
          `目标语言：${forms.translate.targetLanguage}`,
          `风格要求：${forms.translate.style}`,
          '请直接输出翻译结果，不要附加解释。',
          '',
          '原文如下：',
          inputText
        ].join('\n')
      }
    },

    summary() {
      return {
        system: '你是一名擅长信息提炼的摘要助手，请压缩冗余信息并保留关键结论。',
        user: [
          `摘要长度：${forms.summary.length}`,
          `输出格式：${forms.summary.format}`,
          `聚焦重点：${forms.summary.focus}`,
          '请直接输出摘要内容，不要附加前言或说明。',
          '',
          '原文如下：',
          inputText
        ].join('\n')
      }
    },

    copywriting() {
      return {
        system: '你是一名资深内容策划与文案写作助手，擅长输出高可读性、高完成度的实用文本。',
        user: [
          `文案类型：${forms.copywriting.type}`,
          `目标受众：${forms.copywriting.audience}`,
          `风格要求：${forms.copywriting.tone}`,
          forms.copywriting.extra ? `额外要求：${forms.copywriting.extra}` : '',
          '请直接输出最终文案，不要解释写作过程。',
          '',
          '背景素材如下：',
          inputText
        ].filter(Boolean).join('\n')
      }
    }
  }
  // 先找任务类型，如果任务类型不存在，则默认使用 polish 任务
  return promptMap[task]?.() ?? promptMap.polish()
}

/**
 * 构建兼容的 API 端点地址
 * @param {string} baseUrl - 用户配置的基础 URL
 * @returns {string} - 完整的 API 端点地址
 */
function buildCompatibleEndpoint(baseUrl) {
  // 去除首尾空格和末尾斜杠
  const trimmed = (baseUrl || '').trim().replace(/\/+$/, '')
  // 如果未配置，返回 OpenAI 默认地址
  if (!trimmed) {
    return 'https://api.openai.com/v1/chat/completions'
  }
  // 确保地址以 /chat/completions 结尾
  return trimmed.endsWith('/chat/completions') ? trimmed : `${trimmed}/chat/completions`
}

/**
 * 构建兼容的 API 请求体
 * @param {Object} params - 参数对象
 * @param {Object} params.settings - 模型配置
 * @param {string} params.systemPrompt - 系统提示词
 * @param {string} params.userPrompt - 用户提示词
 * @returns {Object} - 格式化后的请求体
 */
function buildCompatiblePayload({ settings, systemPrompt, userPrompt }) {
  // 构建基础请求体，强制开启流式输出
  const payload = {
    model: settings.model,           // 模型名称
    stream: true,                    // 强制开启流式输出
    messages: [                      // 消息列表
      { role: 'system', content: systemPrompt }, // 系统角色消息
      { role: 'user', content: userPrompt }     // 用户角色消息
    ]
  }
  // DeepSeek 模型不支持 temperature 参数，需要特殊处理
  if (settings.model !== 'deepseek-reasoner') {
    payload.temperature = settings.temperature
  }
  return payload
}



/**
 * 处理 SSE（Server-Sent Events）流式响应
 * 解析流式数据、解码、缓冲并逐块输出
 * @param {Response} response - fetch 返回的响应对象
 * @param {Function} onMessage - 收到消息时的回调函数
 * @param {Function} onFinish - 流结束时的回调函数
 * @param {Function} parser - 数据解析函数
 */
async function processSSEStream(response, onMessage, onFinish, parser) {
  // 创建读取器，用于逐块读取响应体
  const reader = response.body.getReader()
  // 创建 UTF-8 解码器
  const decoder = new TextDecoder('utf-8')
  // 缓冲区，用于存储不完整的数据块
  let buffer = ''

  try {
    // 循环读取数据直到流结束
    while (true) {
      const { done, value } = await reader.read()
      // 如果流已结束，退出循环
      if (done) break

      // 将新数据追加到缓冲区（解决数据截断问题）
      buffer += decoder.decode(value, { stream: true })
      // 按换行符分割数据
      const lines = buffer.split('\n')
      // 保留最后一行（可能不完整）到缓冲区
      buffer = lines.pop()

      // 处理每一行数据
      for (const line of lines) {
        const trimmedLine = line.trim()
        // 跳过空行和不以 'data: ' 开头的行
        if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue
        // 提取数据部分（去除 'data: ' 前缀）
        const dataStr = trimmedLine.replace(/^data:\s*/, '')

        // OpenAI 标准结束符，跳过
        if (dataStr === '[DONE]') {
          continue
        }

        try {
          // 解析 JSON 数据
          const data = JSON.parse(dataStr)
          // 使用 parser 函数提取内容
          const content = parser(data)
          // 如果提取到内容，调用回调函数
          if (content) {
            onMessage(content)
          }
        } catch (e) {
          // 忽略解析错误（可能是中间截断的数据包）
        }
      }
    }
  } finally {
    // 释放读取器锁
    reader.releaseLock()
    // 调用结束回调
    if (onFinish) {
      onFinish()
    }
  }
}


/**
 * 发送流式请求到 AI 提供商
 * @param {Object} params - 参数对象
 * @param {string} params.providerLabel - 提供商名称（用于错误提示）
 * @param {Object} params.settings - 模型配置
 * @param {string} params.systemPrompt - 系统提示词
 * @param {string} params.userPrompt - 用户提示词
 * @param {Object} params.callbacks - 回调函数对象
 */
async function requestCompatibleProviderStream({
  providerLabel,
  settings,
  systemPrompt,
  userPrompt,
  callbacks
}) {
  // 构建 API 端点地址
  const endpoint = buildCompatibleEndpoint(settings.baseUrl)
  // 构建请求体
  const payload = buildCompatiblePayload({ settings, systemPrompt, userPrompt })

  // 发送 POST 请求到 AI API
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${settings.apiKey}`, // API 密钥认证
      'Content-Type': 'application/json'           // JSON 格式
    },
    body: JSON.stringify(payload)
  })

  // 请求失败处理
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error?.message || `${providerLabel} 请求失败: HTTP ${response.status}`)
  }

  // 定义数据解析函数：提取 AI 返回的文本内容
  const parser = (data) => {
    const delta = data.choices?.[0]?.delta || {}
    // 兼容不同模型的返回格式
    return delta.content || delta.reasoning_content || ''
  }

  // 处理流式响应
  await processSSEStream(response, callbacks.onMessage, callbacks.onFinish, parser)
}

/**
 * 生成文本的主入口函数
 * 根据任务类型构建 Prompt 并发送请求到 AI 提供商
 * @param {Object} params - 参数对象
 * @param {string} params.task - 任务类型
 * @param {string} params.inputText - 用户输入文本
 * @param {Object} params.forms - 表单配置
 * @param {Object} params.settings - 模型配置
 * @param {Function} params.onMessage - 收到消息时的回调
 * @param {Function} params.onFinish - 请求结束时的回调
 * @param {Function} params.onError - 发生错误时的回调
 */
export async function generateTextStream({
  task,
  inputText,
  forms,
  settings,
  onMessage,
  onFinish,
  onError
}) {
  try {
    // 根据任务类型构建 Prompt
    const { system, user } = buildTaskPrompts({ task, inputText, forms })
    // 封装回调函数
    const callbacks = { onMessage, onFinish }

    // 根据用户选择的提供商发送请求
    if (settings.provider === 'openai') {
      // 验证 API Key
      if (!settings.openai.apiKey.trim()) throw new Error('请先填写 OpenAI API Key。')
      // 调用 OpenAI API
      await requestCompatibleProviderStream({
        providerLabel: 'OpenAI',
        settings: settings.openai,
        systemPrompt: system,
        userPrompt: user,
        callbacks
      })
    } else {
      // 验证 API Key
      if (!settings.deepseek.apiKey.trim()) throw new Error('请先填写 DeepSeek API Key。')
      // 调用 DeepSeek API
      await requestCompatibleProviderStream({
        providerLabel: 'DeepSeek',
        settings: settings.deepseek,
        systemPrompt: system,
        userPrompt: user,
        callbacks
      })
    }
  } catch (error) {
    console.error('API 请求出错:', error)
    // 调用错误回调
    if (onError) onError(error.message || '请求失败，请稍后重试。')
  }
}

/**
 * 格式化请求错误信息
 * 统一处理不同 API 返回的错误格式
 * @param {Error|Object} error - 错误对象
 * @returns {string} - 格式化后的错误信息
 */
export function formatRequestError(error) {
  // 尝试从类似 Axios 的错误结构中提取错误信息
  const axiosMessage =
    error.response?.data?.error?.message ||
    error.response?.data?.error?.type ||
    error.response?.data?.msg ||
    error.response?.data?.message

  // 如果提取不到 Axios 格式的错误，使用原生 Error 的 message
  return axiosMessage || error.message || '请求失败，请稍后重试。'
}

