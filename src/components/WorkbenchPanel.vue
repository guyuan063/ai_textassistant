<template>
  <section class="panel">
    <div class="panel-head">
      <div>
        <p class="section-kicker">工作区</p>
        <h2>选择任务并输入内容</h2>
      </div>

      <div class="panel-actions">
        <el-button text @click="saveAsTemplate">保存为模板</el-button>
        <el-button text @click="store.clearWorkspace">清空</el-button>
      </div>
    </div>

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
      <div class="prompt-tip">
        小提示：创意文案模块可以直接输入“主题 + 受众 + 卖点”，不需要先写完整草稿。
      </div>

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
import { ElMessage, ElMessageBox } from 'element-plus'
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

async function saveAsTemplate() {
  if (!store.inputText.trim()) {
    ElMessage.warning('当前没有可保存的输入内容。')
    return
  }

  try {
    const { value } = await ElMessageBox.prompt(
      '给这个模板起个名字，后续可以一键复用。',
      '保存模板',
      {
        confirmButtonText: '保存',
        cancelButtonText: '取消',
        inputPlaceholder: '例如：客户邮件润色 / 小红书爆款标题'
      }
    )

    store.saveTemplate({
      title: value,
      content: store.inputText,
      task: store.activeTask
    })
    ElMessage.success('模板已保存到本地。')
  } catch {
    // 用户取消时不需要额外处理
  }
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
  font-size: 1.4rem;
  margin: 4px 0 0;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

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

.prompt-tip {
  color: var(--muted);
  line-height: 1.6;
  max-width: 70%;
}

.generate-btn {
  min-width: 144px;
}

@media (max-width: 900px) {
  .panel-head,
  .submit-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .control-grid {
    grid-template-columns: 1fr;
  }

  .prompt-tip {
    max-width: none;
  }
}
</style>
