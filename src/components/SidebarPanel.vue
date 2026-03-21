<template>
  <section class="panel side-panel">
    <div class="panel-head">
      <div>
        <p class="section-kicker">控制台</p>
        <h2>模型、模板与历史</h2>
      </div>
    </div>

    <el-tabs v-model="activePane" class="side-tabs">
      <el-tab-pane label="模型设置" name="settings">
        <div class="tip-card">
          这是前端直连 API 的演示方案，密钥会保存在当前浏览器中，适合学习和原型验证。
        </div>

        <div class="form-stack">
          <div class="control-item">
            <span>AI 提供商</span>
            <el-select v-model="store.settings.provider">
              <el-option
                v-for="provider in PROVIDER_OPTIONS"
                :key="provider.value"
                :label="provider.label"
                :value="provider.value"
              />
            </el-select>
          </div>

          <template v-if="store.settings.provider === 'openai'">
            <div class="control-item">
              <span>API Key</span>
              <el-input
                v-model="store.settings.openai.apiKey"
                show-password
                type="password"
              />
            </div>

            <div class="control-item">
              <span>Base URL</span>
              <el-input v-model="store.settings.openai.baseUrl" />
            </div>

            <div class="control-item">
              <span>模型名称</span>
              <el-input v-model="store.settings.openai.model" />
            </div>

            <div class="control-item">
              <span>温度值 {{ store.settings.openai.temperature }}</span>
              <el-slider
                v-model="store.settings.openai.temperature"
                :max="1"
                :min="0"
                :step="0.1"
              />
            </div>
          </template>

          <template v-else-if="store.settings.provider === 'deepseek'">
            <div class="control-item">
              <span>API Key</span>
              <el-input
                v-model="store.settings.deepseek.apiKey"
                show-password
                type="password"
              />
            </div>

            <div class="control-item">
              <span>Base URL</span>
              <el-input v-model="store.settings.deepseek.baseUrl" />
            </div>

            <div class="control-item">
              <span>模型名称</span>
              <el-select
                v-model="store.settings.deepseek.model"
                allow-create
                default-first-option
                filterable
              >
                <el-option
                  v-for="model in DEEPSEEK_MODEL_OPTIONS"
                  :key="model.value"
                  :label="model.label"
                  :value="model.value"
                />
              </el-select>
            </div>

            <div class="control-item">
              <span>温度值 {{ store.settings.deepseek.temperature }}</span>
              <el-slider
                v-model="store.settings.deepseek.temperature"
                :max="1"
                :min="0"
                :step="0.1"
              />
            </div>
          </template>

          <template v-else>
            <div class="control-item">
              <span>API Key</span>
              <el-input v-model="store.settings.baidu.apiKey" />
            </div>

            <div class="control-item">
              <span>Secret Key</span>
              <el-input
                v-model="store.settings.baidu.secretKey"
                show-password
                type="password"
              />
            </div>

            <div class="control-item">
              <span>Token 地址</span>
              <el-input v-model="store.settings.baidu.tokenUrl" />
            </div>

            <div class="control-item">
              <span>聊天地址</span>
              <el-input v-model="store.settings.baidu.chatUrl" />
            </div>

            <div class="control-item">
              <span>模型名称</span>
              <el-input v-model="store.settings.baidu.model" />
            </div>

            <div class="control-item">
              <span>温度值 {{ store.settings.baidu.temperature }}</span>
              <el-slider
                v-model="store.settings.baidu.temperature"
                :max="1"
                :min="0"
                :step="0.1"
              />
            </div>
          </template>
        </div>
      </el-tab-pane>

      <el-tab-pane :label="`模板 (${store.templateCount})`" name="templates">
        <div class="side-actions">
          <el-button plain @click="store.resetTemplates">恢复默认模板</el-button>
        </div>

        <div class="item-stack">
          <article
            v-for="template in store.templates"
            :key="template.id"
            class="item-card"
          >
            <div class="item-card__top">
              <div>
                <strong>{{ template.title }}</strong>
                <p>{{ getTaskLabel(template.task) }}</p>
              </div>
            </div>

            <p class="item-preview">{{ template.content }}</p>

            <div class="item-actions">
              <el-button size="small" type="primary" @click="applyTemplate(template)">
                使用
              </el-button>
              <el-button size="small" text @click="copyItem(template.content)">
                复制
              </el-button>
              <el-button size="small" text @click="store.removeTemplate(template.id)">
                删除
              </el-button>
            </div>
          </article>

          <el-empty
            v-if="store.templates.length === 0"
            description="还没有模板，先从左侧保存一个吧。"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane :label="`历史 (${store.historyCount})`" name="history">
        <div class="side-actions">
          <el-button
            :disabled="store.historyCount === 0"
            plain
            @click="store.clearHistory"
          >
            清空历史
          </el-button>
        </div>

        <div class="item-stack">
          <article
            v-for="record in store.history"
            :key="record.id"
            class="item-card history-card"
          >
            <div class="item-card__top">
              <div>
                <strong>{{ getTaskLabel(record.task) }}</strong>
                <p>{{ formatTime(record.createdAt) }}</p>
              </div>

              <el-tag effect="plain" round>
                {{ getProviderLabel(record.provider) }}
              </el-tag>
            </div>

            <p class="item-preview">{{ record.inputText }}</p>

            <div class="item-actions">
              <el-button size="small" type="primary" @click="applyHistory(record)">
                载入
              </el-button>
              <el-button size="small" text @click="copyItem(record.resultText)">
                复制结果
              </el-button>
            </div>
          </article>

          <el-empty
            v-if="store.history.length === 0"
            description="生成过的内容会自动记录在这里。"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  DEEPSEEK_MODEL_OPTIONS,
  PROVIDER_OPTIONS,
  getProviderLabel,
  getTaskLabel
} from '@/config/assistant'
import { useAssistantStore } from '@/stores/assistant'
import { copyText } from '@/utils/clipboard'

const activePane = ref('settings')
const store = useAssistantStore()

function formatTime(value) {
  return new Date(value).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function applyTemplate(template) {
  store.applyTemplate(template)
  activePane.value = 'settings'
  ElMessage.success('模板内容已载入工作区。')
}

function applyHistory(record) {
  store.applyHistory(record)
  ElMessage.success('已恢复这条历史记录。')
}

async function copyItem(text) {
  const copied = await copyText(text)

  if (copied) {
    ElMessage.success('已复制到剪贴板。')
    return
  }

  ElMessage.error('复制失败，请稍后重试。')
}
</script>

<style scoped>
.panel-head {
  margin-bottom: 16px;
}

.panel-head h2 {
  font-size: 1.25rem;
  margin: 4px 0 0;
}

.tip-card {
  background: rgba(255, 247, 237, 0.85);
  border: 1px solid rgba(240, 125, 90, 0.18);
  border-radius: 18px;
  color: var(--muted);
  line-height: 1.7;
  margin-bottom: 18px;
  padding: 14px 16px;
}

.form-stack,
.item-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-item span {
  color: var(--ink);
  font-size: 0.92rem;
  font-weight: 600;
}

.side-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 14px;
}

.item-card {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(27, 38, 59, 0.08);
  border-radius: 18px;
  padding: 16px;
}

.item-card__top {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.item-card__top strong {
  color: var(--ink);
  display: block;
  margin-bottom: 4px;
}

.item-card__top p {
  color: var(--muted);
  margin: 0;
}

.item-preview {
  color: var(--muted-strong);
  line-height: 1.7;
  margin: 14px 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.item-actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.history-card {
  background: rgba(249, 250, 251, 0.88);
}
</style>
