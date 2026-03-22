<template>
  <!-- 工作区负责两件事：配置当前任务参数、填写待处理文本 -->
  <section class="panel">
    <div class="panel-head">
      <div>
        <p class="section-kicker">工作区</p>
        <h2>选择任务并输入内容</h2>
      </div>

      <div class="panel-actions">
        <!-- 这里只清空当前任务内容，不动模型设置 -->
        <el-button text @click="store.clearWorkspace">清空</el-button>
      </div>
    </div>

    <!-- activeTask 绑定当前标签页，切换标签其实就是切换当前任务类型 -->
    <el-tabs v-model="store.activeTask" class="task-tabs">
      <el-tab-pane
        v-for="item in TASK_TABS"
        :key="item.key"
        :label="item.label"
        :name="item.key"
      >
        <!-- 润色模块的附加参数 -->
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

        <!-- 翻译模块的附加参数 -->
        <template v-else-if="item.key === 'translate'">
          <div class="control-grid">
            <div class="control-item">
              <span>源语言</span>
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

        <!-- 摘要模块的附加参数 -->
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

        <!-- 文案模块的附加参数 -->
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

    <!-- 统一输入区：不同任务共用同一块文本输入框 -->
    <div class="input-section">
      <div class="input-title">
        <span>{{ currentInputLabel }}</span>
        <!-- 实时显示当前输入字数，帮助用户判断文本长度 -->
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

    <!-- 点击后不直接自己请求，而是把 generate 事件抛给父组件 -->
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

// 这个组件只负责发出 generate 事件，不直接知道请求细节。
defineEmits(['generate'])

const store = useAssistantStore()

// 根据当前任务类型动态切换输入框标题，例如“原始文本”“待翻译文本”。
const currentInputLabel = computed(() => getTaskInputLabel(store.activeTask))

// 根据当前任务类型动态切换 placeholder 文案。
const currentPlaceholder = computed(() => getTaskPlaceholder(store.activeTask))

// “自动识别”只适合作为源语言，不适合作为目标语言，所以这里过滤掉。
const targetLanguageOptions = computed(() =>
  LANGUAGE_OPTIONS.filter((lang) => lang !== '自动识别')
)
</script>

<style scoped>
/* 标签页标题与正文之间的间距 */
.task-tabs :deep(.el-tabs__header) {
  margin-bottom: 18px;
}

/* 双列表单布局，适合放两个并列参数 */
.control-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: 14px;
}

/* 每个表单项内部使用纵向排列：标题在上，输入控件在下 */
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

/* 让某些表单项横跨整行 */
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

/* 底部生成按钮区域 */
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

/* 小屏幕下从双列改成单列，避免表单挤压 */
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
