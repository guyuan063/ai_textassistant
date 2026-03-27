<template>
  <!-- 主体区域：包含工作区和结果区 -->
  <main class="dashboard">
    <section class="main-column">
      <!-- 工作区负责收集输入，点击生成后把事件交给当前页面处理 -->
      <WorkbenchPanel @generate="handleGenerate" />
      <!-- 结果区只负责展示当前生成结果，并允许重新生成 -->
      <ResultPanel @regenerate="handleGenerate" />
    </section>
  </main>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import WorkbenchPanel from '@/components/WorkbenchPanel.vue'
import ResultPanel from '@/components/ResultPanel.vue'
import { useAssistantStore } from '@/stores/assistant'
import { formatRequestError, generateTextStream } from '@/services/ai'

// 这里拿到的是整个应用共享的 Pinia store。
const store = useAssistantStore()

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