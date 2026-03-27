<template>
  <section class="panel">
    <!-- 💡 体验优化：生成过程中禁用标签页切换 -->
    <el-tabs v-model="store.activeTask" class="task-tabs" :before-leave="() => !store.loading">
      <el-tab-pane v-for="item in TASK_TABS" :key="item.key" :label="item.label" :name="item.key"
        :disabled="store.loading">
        <!-- 润色模块 -->
        <template v-if="item.key === 'polish'">
          <div class="control-grid">
            <div class="control-item">
              <span>处理方式</span>
              <el-radio-group v-model="store.forms.polish.action" :disabled="store.loading">
                <el-radio-button :value="'polish'">润色优化</el-radio-button>
                <el-radio-button :value="'correct'">纠错改错</el-radio-button>
              </el-radio-group>
            </div>
            <div class="control-item">
              <span>表达风格</span>
              <el-input v-model="store.forms.polish.tone" :disabled="store.loading" />
            </div>
          </div>
          <el-input v-model="store.forms.polish.extra" placeholder="可补充要求，例如：更适合发给客户、保持简洁" :disabled="store.loading" />
        </template>

        <!-- 翻译模块 -->
        <template v-else-if="item.key === 'translate'">
          <div class="control-grid">
            <div class="control-item">
              <span>源语言</span>
              <el-select v-model="store.forms.translate.sourceLanguage" :disabled="store.loading">
                <el-option v-for="language in LANGUAGE_OPTIONS" :key="language" :label="language" :value="language" />
              </el-select>
            </div>
            <div class="control-item">
              <span>目标语言</span>
              <el-select v-model="store.forms.translate.targetLanguage" :disabled="store.loading">
                <el-option v-for="language in targetLanguageOptions" :key="language" :label="language"
                  :value="language" />
              </el-select>
            </div>
          </div>
          <el-input v-model="store.forms.translate.style" placeholder="例如：商务正式、口语自然、适合邮件" :disabled="store.loading" />
        </template>

        <!-- 摘要模块 -->
        <template v-else-if="item.key === 'summary'">
          <div class="control-grid">
            <div class="control-item">
              <span>摘要长度</span>
              <el-select v-model="store.forms.summary.length" :disabled="store.loading">
                <el-option v-for="option in SUMMARY_LENGTH_OPTIONS" :key="option" :label="option" :value="option" />
              </el-select>
            </div>
            <div class="control-item">
              <span>输出格式</span>
              <el-select v-model="store.forms.summary.format" :disabled="store.loading">
                <el-option v-for="option in SUMMARY_FORMAT_OPTIONS" :key="option" :label="option" :value="option" />
              </el-select>
            </div>
          </div>
          <el-input v-model="store.forms.summary.focus" placeholder="例如：提炼结论、保留行动项、适合汇报" :disabled="store.loading" />
        </template>

        <!-- 文案模块 -->
        <template v-else>
          <div class="control-grid">
            <div class="control-item">
              <span>文案类型</span>
              <el-select v-model="store.forms.copywriting.type" :disabled="store.loading">
                <el-option v-for="option in COPYWRITING_TYPES" :key="option" :label="option" :value="option" />
              </el-select>
            </div>
            <div class="control-item">
              <span>目标受众</span>
              <el-input v-model="store.forms.copywriting.audience" :disabled="store.loading" />
            </div>
          </div>
          <div class="control-grid">
            <div class="control-item full-width">
              <span>风格要求</span>
              <el-input v-model="store.forms.copywriting.tone" :disabled="store.loading" />
            </div>
          </div>
          <el-input v-model="store.forms.copywriting.extra" placeholder="例如：控制在 80 字以内、适合短视频口播、不要太夸张"
            :disabled="store.loading" />
        </template>
      </el-tab-pane>
    </el-tabs>

    <div class="input-section">
      <div class="input-title">
        <span>{{ currentInputLabel }}</span>
        <small>{{ store.inputText.length }} 字</small>
      </div>
      <!-- 💡 体验优化：生成时文本框只读 -->
      <el-input v-model="store.inputText" :autosize="{ minRows: 9, maxRows: 15 }" :placeholder="currentPlaceholder"
        resize="none" type="textarea" :readonly="store.loading" />
    </div>

    <div class="submit-row">
      <el-button class="generate-btn" size="large" type="primary" :disabled="store.loading" @click="$emit('generate')">
        立即生成
      </el-button>

      <!-- 生成时不能清空 -->
      <el-button :disabled="store.loading" @click="store.clearWorkspace">清空</el-button>
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

</style>