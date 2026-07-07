<template>
  <section class="panel result-panel">
    <div class="panel-head">
      <h2>AI 输出内容</h2>
      <div class="panel-actions">
        <el-button class="copy-btn" :disabled="store.loading || !store.resultText" @click="handleCopy">
          {{ copied ? '已复制' : '复制结果' }}
        </el-button>
        <el-button class="regenerate-btn" :disabled="store.loading" @click="$emit('regenerate')">
          重新生成
        </el-button>
      </div>
    </div>

    <el-alert v-if="store.errorMessage" :closable="false" :title="store.errorMessage" class="result-alert"
      type="error" show-icon />

    <div v-if="store.resultText" class="result-content">
      <pre>{{ store.resultText }}<span v-if="store.loading" class="cursor">|</span></pre>
    </div>

    <div v-else-if="store.loading" class="result-state loading-state">
      <div class="loading-spinner">
        <span></span><span></span><span></span>
      </div>
      <p>AI 正在整理文本，请稍候…</p>
    </div>

    <div v-else class="result-state empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>
      <p>生成结果会显示在这里</p>
    </div>
  </section>
</template>

<script setup>
import { useAssistantStore } from '@/stores/assistant'
import { useClipboard } from '@/composables/useClipboard'

defineEmits(['regenerate'])

const store = useAssistantStore()
const { copied, copy } = useClipboard()

function handleCopy() {
  copy(store.resultText)
}
</script>

<style scoped>
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.copy-btn {
  border-radius: 100px !important;
  font-size: 0.88rem;
  color: var(--accent) !important;
  border-color: var(--accent) !important;
  background: var(--accent-light) !important;
  transition: color var(--duration) var(--ease-out), border-color var(--duration) var(--ease-out), background var(--duration) var(--ease-out) !important;
}

.copy-btn:hover:not(:disabled) {
  background: var(--accent) !important;
  color: white !important;
}

.regenerate-btn {
  border-radius: 100px !important;
  font-size: 0.88rem;
  color: var(--ink-secondary) !important;
  border-color: var(--border) !important;
  transition: color var(--duration) var(--ease-out), border-color var(--duration) var(--ease-out), background var(--duration) var(--ease-out) !important;
}

.regenerate-btn:hover:not(:disabled) {
  color: var(--accent) !important;
  border-color: var(--accent) !important;
  background: var(--accent-light) !important;
}

.result-alert {
  margin-bottom: 18px;
  border-radius: var(--radius-sm) !important;
}

/* 成功结果 */
.result-content {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  min-height: 220px;
  padding: 22px 24px;
  transition: border-color var(--duration) var(--ease-out);
}

.result-content:hover {
  border-color: var(--border-hover);
}

.result-content pre {
  color: var(--ink);
  font-family: 'DM Sans', 'PingFang SC', sans-serif;
  font-size: 0.94rem;
  line-height: 1.85;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.cursor {
  animation: blink 0.8s step-end infinite;
  color: var(--accent);
  font-weight: 700;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* 空状态 & 加载状态 */
.result-state {
  align-items: center;
  border: 1.5px dashed var(--border);
  border-radius: var(--radius-md);
  color: var(--muted);
  display: flex;
  flex-direction: column;
  gap: 14px;
  justify-content: center;
  min-height: 220px;
  text-align: center;
}

.result-state p {
  font-size: 0.92rem;
  letter-spacing: 0.01em;
}

.empty-state {
  background: var(--bg);
}

.empty-icon {
  color: var(--muted);
  opacity: 0.5;
}

/* Custom loading dots */
.loading-state {
  background: linear-gradient(135deg, rgba(192, 118, 58, 0.03), rgba(192, 118, 58, 0.06));
}

.loading-spinner {
  display: flex;
  gap: 6px;
}

.loading-spinner span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.4;
  animation: dotPulse 1.2s ease-in-out infinite;
}

.loading-spinner span:nth-child(2) {
  animation-delay: 0.15s;
}

.loading-spinner span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes dotPulse {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 900px) {
  .panel-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }
}
</style>
