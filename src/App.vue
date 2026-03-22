<template>
  <!-- 页面最外层容器，负责限制内容宽度并承载整体布局 -->
  <div class="page-shell">
    <!-- 左右两侧的光晕只是装饰，不参与功能逻辑 -->
    <div class="glow glow-left"></div>
    <div class="glow glow-right"></div>

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
        <!-- 侧边栏只保留模型配置，方便面试时讲清主线功能 -->
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

// 这里拿到的是整个应用共享的 Pinia store。
// 页面、工作区、结果区、侧边栏都会读写这份状态。
const store = useAssistantStore()

// 页面加载时先把浏览器里上次保存的内容恢复回来。
// 这样用户刷新页面后，输入内容和模型设置不会直接丢失。
store.hydrate()

// 任何和 store 有关的变化都会自动持久化到 localStorage。
// detached: true 表示这个订阅器独立于组件生命周期，避免组件更新时被意外清理。
store.$subscribe(
  (_mutation, state) => {
    store.persistState(state)
  },
  { detached: true }
)

// 这是整个页面最核心的业务函数：
// 1. 先校验输入
// 2. 设置加载状态
// 3. 调用 AI 接口
// 4. 成功则写入结果，失败则写入错误信息
async function handleGenerate() {
  // trim() 用来去掉首尾空格，避免用户只输入空白字符也触发请求。
  if (!store.inputText.trim()) {
    ElMessage.warning('请先输入文本内容或需求')
    return
  }

  // 请求开始前先把 loading 设为 true，界面会进入“生成中”状态。
  store.startLoading()

  try {
    // generateText 会根据当前选择的模型提供商，自动走 OpenAI、DeepSeek 或百度分支。
    const result = await generateText({
      task: store.activeTask,
      inputText: store.inputText,
      forms: store.forms,
      settings: store.settings
    })

    // 请求成功后，把 AI 返回的文本写回 store，结果区会自动重新渲染。
    store.setResult(result)
    ElMessage.success('生成完成，结果已更新')
  } catch (error) {
    // 接口返回的错误结构可能不一致，所以单独封装了格式化函数。
    // 这里统一把错误转换成可直接展示给用户的字符串。
    const message = formatRequestError(error)
    store.setError(message)
    ElMessage.error(message)
  } finally {
    // 无论成功还是失败，都要结束 loading。
    // finally 能保证这一步一定执行。
    store.stopLoading()
  }
}
</script>
