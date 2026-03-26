
// 保持原有的 Prompt 构建逻辑不变，写得非常好！
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
  return promptMap[task]?.() ?? promptMap.polish()
}

function buildCompatibleEndpoint(baseUrl) {
  const trimmed = (baseUrl || '').trim().replace(/\/+$/, '')
  if (!trimmed) {
    return 'https://api.openai.com/v1/chat/completions'
  }
  return trimmed.endsWith('/chat/completions') ? trimmed : `${trimmed}/chat/completions`
}

// 🌟 修改：强制开启 stream: true
function buildCompatiblePayload({ settings, systemPrompt, userPrompt }) {
  const payload = {
    model: settings.model,
    stream: true, // 开启流式输出
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]
  }

  if (settings.model !== 'deepseek-reasoner') {
    payload.temperature = settings.temperature
  }

  return payload
}

/**
 * 🌟 核心通用：解析 SSE 流式数据
 * 将 fetch 的网络流转为回调函数触发
 */
async function processSSEStream(response, onMessage, onFinish, parser) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() // 保留最后一行不完整的字符串

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue
        
        const dataStr = trimmedLine.replace(/^data:\s*/, '')
        
        // OpenAI 标准结束符
        if (dataStr === '[DONE]') {
          continue
        }

        try {
          const data = JSON.parse(dataStr)
          // parser 是外部传入的提取逻辑，因为百度和OpenAI的JSON结构不同
          const content = parser(data)
          if (content) {
            onMessage(content)
          }
        } catch (e) {
          // 忽略解析错误，可能是中间截断的包
          // console.warn('JSON Parse Error in Stream:', dataStr)
        }
      }
    }
  } finally {
    reader.releaseLock()
    if (onFinish) onFinish()
  }
}

async function requestCompatibleProviderStream({
  providerLabel,
  settings,
  systemPrompt,
  userPrompt,
  callbacks
}) {
  const endpoint = buildCompatibleEndpoint(settings.baseUrl)
  const payload = buildCompatiblePayload({ settings, systemPrompt, userPrompt })

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${settings.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error?.message || `${providerLabel} 请求失败: HTTP ${response.status}`)
  }

  const parser = (data) => {
    const delta = data.choices?.[0]?.delta || {}
    return delta.content || delta.reasoning_content || ''
  }

  await processSSEStream(response, callbacks.onMessage, callbacks.onFinish, parser)
}

async function requestBaiduStream({ settings, systemPrompt, userPrompt, callbacks }) {
  const tokenUrl = `${settings.tokenUrl}?grant_type=client_credentials&client_id=${settings.apiKey}&client_secret=${settings.secretKey}`
  const tokenRes = await fetch(tokenUrl, { method: 'POST' })
  const tokenData = await tokenRes.json()

  if (!tokenData.access_token) {
    throw new Error('未获取到百度 access_token，请检查 API Key / Secret Key。')
  }

  const chatUrl = `${settings.chatUrl}?access_token=${tokenData.access_token}`
  const response = await fetch(chatUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }],
      temperature: settings.temperature,
      stream: true
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error_msg || `百度接口请求失败: HTTP ${response.status}`)
  }

  const parser = (data) => {
    return data.result || data.body?.result || ''
  }

  await processSSEStream(response, callbacks.onMessage, callbacks.onFinish, parser)
}

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
    const { system, user } = buildTaskPrompts({ task, inputText, forms })
    const callbacks = { onMessage, onFinish }

    if (settings.provider === 'openai') {
      if (!settings.openai.apiKey.trim()) throw new Error('请先填写 OpenAI API Key。')
      await requestCompatibleProviderStream({
        providerLabel: 'OpenAI',
        settings: settings.openai,
        systemPrompt: system,
        userPrompt: user,
        callbacks
      })
    } else if (settings.provider === 'deepseek') {
      if (!settings.deepseek.apiKey.trim()) throw new Error('请先填写 DeepSeek API Key。')
      await requestCompatibleProviderStream({
        providerLabel: 'DeepSeek',
        settings: settings.deepseek,
        systemPrompt: system,
        userPrompt: user,
        callbacks
      })
    } else {
      if (!settings.baidu.apiKey.trim() || !settings.baidu.secretKey.trim()) {
        throw new Error('请先填写百度 API Key 与 Secret Key。')
      }
      await requestBaiduStream({
        settings: settings.baidu,
        systemPrompt: system,
        userPrompt: user,
        callbacks
      })
    }
  } catch (error) {
    console.error('API 请求出错:', error)
    if (onError) onError(error.message || '请求失败，请稍后重试。')
  }
}
// ================= 以下追加到 ai.js 文件的最底部 =================

// 不同接口的报错字段不统一，这里做一次归一化。
// 兼容之前的 axios 错误格式，也兼容现在 fetch 抛出的原生 Error。
export function formatRequestError(error) {
  // 如果是类似 Axios 的错误结构
  const axiosMessage =
    error.response?.data?.error?.message ||
    error.response?.data?.error?.type ||
    error.response?.data?.error_description ||
    error.response?.data?.msg ||
    error.response?.data?.message

  // 如果提取不到 Axios 格式的错误，就直接用原生 Error 的 message
  return axiosMessage || error.message || '请求失败，请稍后重试。'
}

