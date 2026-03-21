<template>
  <section class="panel result-panel">
    <div class="panel-head">
      <div>
        <p class="section-kicker">结果区</p>
        <h2>AI 输出内容</h2>
      </div>

      <div class="panel-actions">
        <el-button :disabled="!store.resultText" text @click="copyResult">
          一键复制
        </el-button>
        <el-button :disabled="store.loading" text @click="$emit('regenerate')">
          重新生成
        </el-button>
      </div>
    </div>

    <el-alert
      v-if="store.errorMessage"
      :closable="false"
      :title="store.errorMessage"
      class="result-alert"
      type="error"
    />

    <div v-if="store.loading" class="result-state loading-state">
      <el-icon class="is-loading" size="26">
        <Loading />
      </el-icon>
      <p>AI 正在整理文本，请稍候...</p>
    </div>

    <div v-else-if="store.resultText" class="result-content">
      <pre>{{ store.resultText }}</pre>
    </div>

    <div v-else class="result-state empty-state">
      <el-icon size="28">
        <Document />
      </el-icon>
      <p>生成结果会显示在这里，支持一键复制。</p>
    </div>
  </section>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { useAssistantStore } from '@/stores/assistant'
import { copyText } from '@/utils/clipboard'

defineEmits(['regenerate'])

const store = useAssistantStore()

async function copyResult() {
  const copied = await copyText(store.resultText)

  if (copied) {
    ElMessage.success('结果已复制到剪贴板。')
    return
  }

  ElMessage.error('复制失败，请稍后重试。')
}
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
