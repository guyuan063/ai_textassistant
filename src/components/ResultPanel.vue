<template>
  <!-- 结果区负责展示 4 种状态：默认、加载中、成功结果、错误信息 -->
  <section class="panel result-panel">
    <div class="panel-head">
      <h2>AI 输出内容</h2>
      <div class="panel-actions">
        <!-- 重新生成本质上还是复用父组件的 handleGenerate -->
        <el-button :disabled="store.loading"  @click="$emit('regenerate')">
          重新生成
        </el-button>
      </div>
    </div>

    <!-- 如果接口失败，就优先展示错误 -->
    <el-alert v-if="store.errorMessage" :closable="false" :title="store.errorMessage" class="result-alert"
      type="error" />

    <!-- 正常结果展示 (流式输出时 loading=true 且 resultText 有值，也要显示) -->
    <div v-if="store.resultText" class="result-content">
      <pre>{{ store.resultText }}<span v-if="store.loading" class="cursor">|</span></pre>
    </div>

    <!-- 加载中状态 (只在还没有任何输出时显示) -->
    <div v-else-if="store.loading" class="result-state loading-state">
      <el-icon class="is-loading" size="26">
        <Loading />
      </el-icon>
      <p>AI 正在整理文本，请稍候...</p>
    </div>

    <!-- 默认空状态 -->
    <div v-else class="result-state empty-state">
      <el-icon size="28">
        <Document />
      </el-icon>
      <p>生成结果会显示在这里</p>
    </div>
  </section>
</template>

<script setup>
import { useAssistantStore } from '@/stores/assistant'

// 结果区不处理请求逻辑，只负责发出“重新生成”事件。
defineEmits(['regenerate'])

const store = useAssistantStore()
</script>

<style scoped>
.panel-head {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 18px;
}

.panel-head h2 {
  font-size: 1.3rem;
  margin: 4px 0 0;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.result-alert {
  margin-bottom: 18px;
}

/* 成功结果区的白底内容容器 */
.result-content {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(27, 38, 59, 0.08);
  border-radius: 20px;
  min-height: 240px;
  padding: 20px;
}

.result-content pre {
  color: var(--ink);
  font-family: inherit;
  font-size: 0.98rem;
  line-height: 1.85;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.cursor {
  animation: blink 1s infinite;
  color: var(--ink);
  font-weight: bold;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 空状态和加载状态共用基础布局 */
.result-state {
  align-items: center;
  border: 1px dashed rgba(27, 38, 59, 0.12);
  border-radius: 20px;
  color: var(--muted);
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
  min-height: 240px;
  text-align: center;
}

.loading-state {
  background: rgba(255, 247, 237, 0.55);
}

.empty-state {
  background: rgba(255, 255, 255, 0.5);
}

@media (max-width: 900px) {
  .panel-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }
}
</style>
