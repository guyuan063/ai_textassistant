<template>
  <div class="page-shell">
    <div class="glow glow-left"></div>
    <div class="glow glow-right"></div>

    <header class="hero-panel panel">
      <div class="hero-copy">
        <p class="eyebrow">AI Text Studio</p>
        <h1>AI 智能文本助手</h1>
        <p class="hero-description">
          为润色、翻译、摘要和创意文案准备的一站式文本工作台。选好任务，填入内容，几秒钟内得到可直接复制的结果。
        </p>
      </div>

      <div class="hero-grid">
        <div class="metric-card">
          <span>任务模块</span>
          <strong>4 个</strong>
        </div>
        <div class="metric-card">
          <span>本地模板</span>
          <strong>{{ store.templateCount }}</strong>
        </div>
        <div class="metric-card">
          <span>历史记录</span>
          <strong>{{ store.historyCount }}</strong>
        </div>
        <div class="metric-card">
          <span>结果字数</span>
          <strong>{{ store.resultLength }}</strong>
        </div>
      </div>
    </header>

    <main class="dashboard">
      <section class="main-column">
        <WorkbenchPanel @generate="handleGenerate" />
        <ResultPanel @regenerate="handleGenerate" />
      </section>

      <aside class="side-column">
        <SidebarPanel />
      </aside>
    </main>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import WorkbenchPanel from '@/components/WorkbenchPanel.vue'
import ResultPanel from '@/components/ResultPanel.vue'
import SidebarPanel from '@/components/SidebarPanel.vue'
import { useAssistantStore } from '@/stores/assistant'
import { formatRequestError, generateText } from '@/services/ai'

const store = useAssistantStore()

store.hydrate()
store.$subscribe(
  (_mutation, state) => {
    store.persistState(state)
  },
  { detached: true }
)

async function handleGenerate() {
  if (!store.inputText.trim()) {
    ElMessage.warning('请先输入文本内容或需求说明。')
    return
  }

  store.startLoading()

  try {
    const result = await generateText({
      task: store.activeTask,
      inputText: store.inputText,
      forms: store.forms,
      settings: store.settings
    })

    store.setResult(result)
    store.pushHistory({
      task: store.activeTask,
      inputText: store.inputText,
      resultText: result,
      provider: store.settings.provider
    })
    ElMessage.success('生成完成，结果已更新。')
  } catch (error) {
    const message = formatRequestError(error)
    store.setError(message)
    ElMessage.error(message)
  } finally {
    store.stopLoading()
  }
}
</script>
