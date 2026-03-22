// 把接口返回的不同文本结构统一转成普通字符串。
// 有些模型直接返回 string，有些会返回数组结构，所以这里先做兼容。
function normalizeTextContent(content) {
  if (typeof content === 'string') {
    return content.trim()
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => item?.text ?? item?.content ?? '')
      .join('\n')
      .trim()
  }

  return ''
}

// OpenAI 兼容接口通常把最终内容放在 message.content 里。
// DeepSeek 的部分模型还可能返回 reasoning_content，所以这里一起兜底。
function extractCompatibleMessageText(message) {
  return (
    normalizeTextContent(message?.content) ||
    normalizeTextContent(message?.reasoning_content)
  )
}

// 根据当前任务类型，把“用户输入 + 表单配置”组合成最终 Prompt。
// 这样页面层只负责收集数据，具体怎么组织成 AI 指令交给服务层处理。
function buildTaskPrompts({ task, inputText, forms }) {
  const promptMap = {
    polish() {
      const action =
        forms.polish.action === 'correct' ? '纠错改错' : '润色优化'

      return {
        system:
          '你是一名专业中文写作助手，擅长在保留原意的前提下优化表达质量。',
        user: [
          `任务：${action}`,
          `语气要求：${forms.polish.tone}`,
          forms.polish.extra ? `额外要求：${forms.polish.extra}` : '',
          '请直接输出优化后的文本，不要附加解释。',
          '',
          '原文如下：',
          inputText
        ]
          .filter(Boolean)
          .join('\n')
      }
    },

    translate() {
      return {
        system:
          '你是一名多语言翻译助手，请保证翻译准确、自然，并尽量保留原文语境。',
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
        system:
          '你是一名擅长信息提炼的摘要助手，请压缩冗余信息并保留关键结论。',
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
        system:
          '你是一名资深内容策划与文案写作助手，擅长输出高可读性、高完成度的实用文本。',
        user: [
          `文案类型：${forms.copywriting.type}`,
          `目标受众：${forms.copywriting.audience}`,
          `风格要求：${forms.copywriting.tone}`,
          forms.copywriting.extra
            ? `额外要求：${forms.copywriting.extra}`
            : '',
          '请直接输出最终文案，不要解释写作过程。',
          '',
          '背景素材如下：',
          inputText
        ]
          .filter(Boolean)
          .join('\n')
      }
    }
  }

  // 如果 task 没匹配到，默认回退到润色逻辑，避免出现 undefined。
  return promptMap[task]?.() ?? promptMap.polish()
}

// 用户在设置面板里填的 Base URL 有时可能是：
// 1. https://api.xxx.com/v1
// 2. https://api.xxx.com/v1/chat/completions
// 这里统一补全成最终真正请求的地址。
function buildCompatibleEndpoint(baseUrl) {
  const trimmed = (baseUrl || '').trim().replace(/\/+$/, '')

  if (!trimmed) {
    return 'https://api.openai.com/v1/chat/completions'
  }

  return trimmed.endsWith('/chat/completions')
    ? trimmed
    : `${trimmed}/chat/completions`
}

// OpenAI / DeepSeek 这类兼容接口的请求体结构非常接近，
// 所以这里抽成一个通用 payload 构造器。
function buildCompatiblePayload({ settings, systemPrompt, userPrompt }) {
  const payload = {
    model: settings.model,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ]
  }

  // deepseek-reasoner 的推理策略由模型内部控制，
  // 通常不建议再额外传 temperature，所以这里显式跳过。
  if (settings.model !== 'deepseek-reasoner') {
    payload.temperature = settings.temperature
  }

  return payload
}

// 处理 OpenAI / DeepSeek 这类“兼容 chat/completions”的提供商。
async function requestCompatibleProvider({
  axios,
  providerLabel,
  settings,
  systemPrompt,
  userPrompt
}) {
  const endpoint = buildCompatibleEndpoint(settings.baseUrl)

  const response = await axios.post(
    endpoint,
    buildCompatiblePayload({
      settings,
      systemPrompt,
      userPrompt
    }),
    {
      headers: {
        Authorization: `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  )

  const text = extractCompatibleMessageText(
    response.data?.choices?.[0]?.message
  )

  if (!text) {
    throw new Error(`${providerLabel} 接口返回为空，请检查模型名或接口地址。`)
  }

  return text
}

// 百度千帆和 OpenAI 兼容接口不一样：
// 它需要先用 API Key / Secret Key 换 access_token，再发聊天请求。
async function requestBaidu({ axios, settings, systemPrompt, userPrompt }) {
  const tokenResponse = await axios.post(settings.tokenUrl, null, {
    params: {
      grant_type: 'client_credentials',
      client_id: settings.apiKey,
      client_secret: settings.secretKey
    }
  })

  const accessToken = tokenResponse.data?.access_token

  if (!accessToken) {
    throw new Error('未获取到百度 access_token，请检查 API Key / Secret Key。')
  }

  const response = await axios.post(
    settings.chatUrl,
    {
      model: settings.model,
      temperature: settings.temperature,
      messages: [
        {
          role: 'user',
          content: `${systemPrompt}\n\n${userPrompt}`
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  )

  const text =
    normalizeTextContent(response.data?.result) ||
    normalizeTextContent(response.data?.body?.result) ||
    extractCompatibleMessageText(response.data?.choices?.[0]?.message)

  if (!text) {
    throw new Error('百度接口返回为空，请确认模型名与聊天地址是否正确。')
  }

  return text
}

// 对外暴露的统一入口。
// 页面层只需要把 task / forms / settings 传进来，不用关心底层细节。
export async function generateText({ task, inputText, forms, settings, axios }) {
  const { default: defaultAxios } = await import('axios')
  const http = axios || defaultAxios
  const { system, user } = buildTaskPrompts({ task, inputText, forms })

  if (settings.provider === 'openai') {
    if (!settings.openai.apiKey.trim()) {
      throw new Error('请先填写 OpenAI API Key。')
    }

    return requestCompatibleProvider({
      axios: http,
      providerLabel: 'OpenAI',
      settings: settings.openai,
      systemPrompt: system,
      userPrompt: user
    })
  }

  if (settings.provider === 'deepseek') {
    if (!settings.deepseek.apiKey.trim()) {
      throw new Error('请先填写 DeepSeek API Key。')
    }

    return requestCompatibleProvider({
      axios: http,
      providerLabel: 'DeepSeek',
      settings: settings.deepseek,
      systemPrompt: system,
      userPrompt: user
    })
  }

  if (!settings.baidu.apiKey.trim() || !settings.baidu.secretKey.trim()) {
    throw new Error('请先填写百度 API Key 与 Secret Key。')
  }

  return requestBaidu({
    axios: http,
    settings: settings.baidu,
    systemPrompt: system,
    userPrompt: user
  })
}

// 不同接口的报错字段不统一，这里做一次归一化。
// 页面层只拿到最终字符串，不需要自己判断各种 error 结构。
export function formatRequestError(error) {
  const responseMessage =
    error.response?.data?.error?.message ||
    error.response?.data?.error?.type ||
    error.response?.data?.error_description ||
    error.response?.data?.msg ||
    error.response?.data?.message

  return responseMessage || error.message || '请求失败，请稍后重试。'
}
