<template>
  <div class="page-shell">
    <div class="glow glow-left"></div>
    <div class="glow glow-right"></div>

    <header class="hero-panel panel">
      <div class="hero-copy">
        <h1>AI 智能文本助手</h1>
        <p class="hero-description">
          润色、翻译、摘要和创意文案文本工作台
        </p>
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
