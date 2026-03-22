<template>
  <section class="panel">
    <el-tabs v-model="store.activeTask" class="task-tabs">
      <el-tab-pane
        v-for="item in TASK_TABS"
        :key="item.key"
        :label="item.label"
        :name="item.key"
      >
        <template v-if="item.key === 'polish'">
          <div class="control-grid">
            <div class="control-item">
              <span>处理方式</span>
              <el-radio-group v-model="store.forms.polish.action">
                <el-radio-button label="polish">润色优化</el-radio-button>
                <el-radio-button label="correct">纠错改错</el-radio-button>
              </el-radio-group>
            </div>

            <div class="control-item">
              <span>表达风格</span>
              <el-input v-model="store.forms.polish.tone" />
            </div>
          </div>

          <el-input
            v-model="store.forms.polish.extra"
            placeholder="可补充要求，例如：更适合发给客户、保持简洁。"
          />
        </template>

        <template v-else-if="item.key === 'translate'">
          <div class="control-grid">
            <div class="control-item">
              <span>原语言</span>
              <el-select v-model="store.forms.translate.sourceLanguage">
                <el-option
                  v-for="language in LANGUAGE_OPTIONS"
                  :key="language"
                  :label="language"
                  :value="language"
                />
              </el-select>
            </div>

            <div class="control-item">
              <span>目标语言</span>
              <el-select v-model="store.forms.translate.targetLanguage">
                <el-option
                  v-for="language in targetLanguageOptions"
                  :key="language"
                  :label="language"
                  :value="language"
                />
              </el-select>
            </div>
          </div>

          <el-input
            v-model="store.forms.translate.style"
            placeholder="例如：商务正式、口语自然、适合邮件。"
          />
        </template>

        <template v-else-if="item.key === 'summary'">
          <div class="control-grid">
            <div class="control-item">
              <span>摘要长度</span>
              <el-select v-model="store.forms.summary.length">
                <el-option
                  v-for="option in SUMMARY_LENGTH_OPTIONS"
                  :key="option"
                  :label="option"
                  :value="option"
                />
              </el-select>
            </div>

            <div class="control-item">
              <span>输出格式</span>
              <el-select v-model="store.forms.summary.format">
                <el-option
                  v-for="option in SUMMARY_FORMAT_OPTIONS"
                  :key="option"
                  :label="option"
                  :value="option"
                />
              </el-select>
            </div>
          </div>

          <el-input
            v-model="store.forms.summary.focus"
            placeholder="例如：提炼结论、保留行动项、适合汇报。"
          />
        </template>

        <template v-else>
          <div class="control-grid">
            <div class="control-item">
              <span>文案类型</span>
              <el-select v-model="store.forms.copywriting.type">
                <el-option
                  v-for="option in COPYWRITING_TYPES"
                  :key="option"
                  :label="option"
                  :value="option"
                />
              </el-select>
            </div>

            <div class="control-item">
              <span>目标受众</span>
              <el-input v-model="store.forms.copywriting.audience" />
            </div>
          </div>

          <div class="control-grid">
            <div class="control-item full-width">
              <span>风格要求</span>
              <el-input v-model="store.forms.copywriting.tone" />
            </div>
          </div>

          <el-input
            v-model="store.forms.copywriting.extra"
            placeholder="例如：控制在 80 字以内、适合短视频口播、不要太夸张。"
          />
        </template>
      </el-tab-pane>
    </el-tabs>

    <div class="input-section">
      <div class="input-title">
        <span>{{ currentInputLabel }}</span>
        <small>{{ store.inputText.length }} 字</small>
      </div>

      <el-input
        v-model="store.inputText"
        :autosize="{ minRows: 9, maxRows: 15 }"
        :placeholder="currentPlaceholder"
        resize="none"
        type="textarea"
      />
    </div>

    <div class="submit-row">
      <el-button
        :loading="store.loading"
        class="generate-btn"
        size="large"
        type="primary"
        @click="$emit('generate')"
      >
        立即生成
      </el-button>
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




.task-tabs :deep(.el-tabs__header) {
  margin-bottom: 18px;
}

.control-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: 14px;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-item span,
.input-title span {
  color: var(--ink);
  font-size: 0.94rem;
  font-weight: 600;
}

.full-width {
  grid-column: 1 / -1;
}

.input-section {
  margin-top: 20px;
}

.input-title {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.input-title small {
  color: var(--muted);
}

.submit-row {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-top: 18px;
}



.generate-btn {
  min-width: 144px;
}

@media (max-width: 900px) {
  
  .submit-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .control-grid {
    grid-template-columns: 1fr;
  }


}
</style>
