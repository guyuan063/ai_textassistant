<template>
  <section class="panel workbench-panel">
    <el-tabs v-model="store.activeTask" class="task-tabs" :before-leave="() => !store.loading">
      <el-tab-pane v-for="item in TASK_TABS" :key="item.key" :label="item.label" :name="item.key"
        :disabled="store.loading">

        <!-- 润色模块 -->
        <template v-if="item.key === 'polish'">
          <div class="control-grid">
            <div class="control-item control-item--row">
              <span class="control-label">处理方式</span>
              <el-radio-group v-model="store.forms.polish.action" :disabled="store.loading">
                <el-radio-button :value="'polish'">润色优化</el-radio-button>
                <el-radio-button :value="'correct'">纠错改错</el-radio-button>
              </el-radio-group>
            </div>
            <div class="control-item">
              <span class="control-label">表达风格</span>
              <el-input v-model="store.forms.polish.tone" placeholder="如：专业自然、轻松幽默" :disabled="store.loading" />
            </div>
          </div>
          <div class="control-item">
            <span class="control-label">其他要求</span>
            <el-input v-model="store.forms.polish.extra" placeholder="可补充要求，例如：更适合发给客户、保持简洁" :disabled="store.loading" />
          </div>
        </template>

        <!-- 翻译模块 -->
        <template v-else-if="item.key === 'translate'">
          <div class="control-grid">
            <div class="control-item">
              <span class="control-label">源语言</span>
              <el-select v-model="store.forms.translate.sourceLanguage" :disabled="store.loading">
                <el-option v-for="language in LANGUAGE_OPTIONS" :key="language" :label="language" :value="language" />
              </el-select>
            </div>
            <div class="control-item">
              <span class="control-label">目标语言</span>
              <el-select v-model="store.forms.translate.targetLanguage" :disabled="store.loading">
                <el-option v-for="language in targetLanguageOptions" :key="language" :label="language"
                  :value="language" />
              </el-select>
            </div>
          </div>
          <div class="control-item">
            <span class="control-label">翻译要求</span>
            <el-input v-model="store.forms.translate.style" placeholder="例如：商务正式、口语自然、适合邮件" :disabled="store.loading" />
          </div>
        </template>

        <!-- 摘要模块 -->
        <template v-else-if="item.key === 'summary'">
          <div class="control-grid">
            <div class="control-item">
              <span class="control-label">摘要长度</span>
              <el-select v-model="store.forms.summary.length" :disabled="store.loading">
                <el-option v-for="option in SUMMARY_LENGTH_OPTIONS" :key="option" :label="option" :value="option" />
              </el-select>
            </div>
            <div class="control-item">
              <span class="control-label">输出格式</span>
              <el-select v-model="store.forms.summary.format" :disabled="store.loading">
                <el-option v-for="option in SUMMARY_FORMAT_OPTIONS" :key="option" :label="option" :value="option" />
              </el-select>
            </div>
          </div>
          <div class="control-item">
            <span class="control-label">摘要要求</span>
            <el-input v-model="store.forms.summary.focus" placeholder="例如：提炼结论、保留行动项、适合汇报" :disabled="store.loading" />
          </div>
        </template>

        <!-- 文案模块 -->
        <template v-else>
          <div class="control-grid">
            <div class="control-item">
              <span class="control-label">文案类型</span>
              <el-select v-model="store.forms.copywriting.type" :disabled="store.loading">
                <el-option v-for="option in COPYWRITING_TYPES" :key="option" :label="option" :value="option" />
              </el-select>
            </div>
            <div class="control-item">
              <span class="control-label">目标受众</span>
              <el-input v-model="store.forms.copywriting.audience" placeholder="如：年轻用户、职场人士" :disabled="store.loading" />
            </div>
          </div>
          <div class="control-item">
            <span class="control-label">风格要求</span>
            <el-input v-model="store.forms.copywriting.tone" placeholder="如：真诚有吸引力、专业权威" :disabled="store.loading" />
          </div>
          <div class="control-item">
            <span class="control-label">其他要求</span>
            <el-input v-model="store.forms.copywriting.extra" placeholder="例如：控制在 80 字以内、适合短视频口播"
              :disabled="store.loading" />
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>

    <div class="input-section">
      <div class="input-header">
        <span class="input-title">{{ currentInputLabel }}</span>
        <span class="char-count">{{ store.inputText.length }} 字</span>
      </div>
      <el-input v-model="store.inputText" :autosize="{ minRows: 8, maxRows: 14 }" :placeholder="currentPlaceholder"
        resize="none" type="textarea" :readonly="store.loading" class="main-textarea" />
    </div>

    <div class="submit-row">
      <el-button class="generate-btn" size="large" type="primary" :disabled="store.loading" @click="$emit('generate')">
        立即生成
      </el-button>
      <el-button class="clear-btn" :disabled="store.loading" @click="store.clearWorkspace">清空</el-button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import {
  COPYWRITING_TYPES,
  LANGUAGE_OPTIONS,
  SUMMARY_FORMAT_OPTIONS,
  SUMMARY_LENGTH_OPTIONS,
  TASK_TABS,
  getTaskInputLabel,
  getTaskPlaceholder
} from '@/config/assistant'
import { useAssistantStore } from '@/stores/assistant'

defineEmits(['generate'])

const store = useAssistantStore()

const currentInputLabel = computed(() => getTaskInputLabel(store.activeTask))
const currentPlaceholder = computed(() => getTaskPlaceholder(store.activeTask))

const targetLanguageOptions = computed(() =>
  LANGUAGE_OPTIONS.filter((lang) => lang !== '自动识别')
)
</script>

<style scoped>
.workbench-panel {
  padding: 28px 32px 32px;
}

.control-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 16px;
}

.control-item:last-child {
  margin-bottom: 0;
}

.control-grid .control-item {
  margin-bottom: 0;
}

.control-item--row {
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.input-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.input-title {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--ink);
}

.char-count {
  font-size: 0.8rem;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.submit-row {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.generate-btn {
  position: relative;
  overflow: hidden;
  flex: 1;
  height: 44px;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  border-radius: 100px !important;
  background: var(--accent) !important;
  border-color: var(--accent) !important;
  box-shadow: var(--shadow-accent);
  transition: background-color var(--duration) var(--ease-out), border-color var(--duration) var(--ease-out), box-shadow var(--duration) var(--ease-out), transform var(--duration) var(--ease-out) !important;
}

.generate-btn:hover:not(:disabled) {
  background: var(--accent-hover) !important;
  border-color: var(--accent-hover) !important;
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(192, 118, 58, 0.28) !important;
}

.generate-btn:active:not(:disabled) {
  transform: translateY(0);
}

.clear-btn {
  border-radius: 100px !important;
  color: var(--muted) !important;
  border-color: var(--border) !important;
  transition: color var(--duration) var(--ease-out), border-color var(--duration) var(--ease-out), background var(--duration) var(--ease-out) !important;
}

.clear-btn:hover:not(:disabled) {
  color: var(--ink-secondary) !important;
  border-color: var(--border-hover) !important;
  background: var(--bg-elevated) !important;
}

/* Textarea custom styling */
.main-textarea :deep(.el-textarea__inner) {
  font-size: 0.95rem;
  line-height: 1.75;
  padding: 16px 18px;
  background: var(--bg);
  border-radius: var(--radius-md) !important;
}

@media (max-width: 720px) {
  .control-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .control-grid .control-item {
    margin-bottom: 16px;
  }

  .workbench-panel {
    padding: 20px;
  }
}
</style>
