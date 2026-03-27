<template>
  <!-- 页面最外层容器，负责限制内容宽度并承载整体布局 -->
  <div class="page-shell">

    <!-- 顶部介绍区：展示项目标题和核心卖点 -->
    <header class="hero-panel panel">
      <div class="hero-copy">
        <h1>AI 智能文本助手</h1>
        <p class="hero-description">
          润色、翻译、摘要和创意文案文本工作台
        </p>
      </div>
    </header>

    <!-- 主体区域分为左右两栏：左边是工作区和结果区，右边是模型设置 -->
    <main class="dashboard">
      <section class="main-column">
        <!-- 工作区负责收集输入，点击生成后把事件交给当前页面处理 -->
        <WorkbenchPanel @generate="handleGenerate" />
        <!-- 结果区只负责展示当前生成结果，并允许重新生成 -->
        <ResultPanel @regenerate="handleGenerate" />
      </section>

      <aside class="side-column">
       <!-- 模型配置侧边栏 -->
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
import { formatRequestError, generateTextStream } from '@/services/ai'

// 这里拿到的是整个应用共享的 Pinia store。
const store = useAssistantStore()

// 页面加载时先把浏览器里上次保存的内容恢复回来。
store.hydrate()

// 任何和 store 有关的变化都会自动持久化到 localStorage。
store.$subscribe(
  (_mutation, state) => {
    store.persistState(state)
  },
  { detached: true }
)


async function handleGenerate() {
  if (!store.inputText.trim()) {
    ElMessage.warning('请先输入文本内容或需求')
    return
  }
  // 加载图标
  store.startLoading()

  try {
    //从pinia拿用户数据，调用请求
    await generateTextStream({
      task: store.activeTask,
      inputText: store.inputText,
      forms: store.forms,
      settings: store.settings,

      onMessage: (chunk) => {
        //内容追加
        store.appendResult(chunk)
      },

      onError: (errMsg) => {
        store.setError(errMsg)
        ElMessage.error(errMsg)
      }
    })

    if (!store.errorMessage && store.resultText) {
      ElMessage.success('生成完成，结果已更新')
    }

  } catch (error) {
    const message = formatRequestError(error)
    store.setError(message)
    ElMessage.error(message)
  } finally {
    //停止加载状态
    store.stopLoading()
  }
}
</script>

<style></style>