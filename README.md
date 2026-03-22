# AI 智能文本助手

一个基于 Vue 3 + Element Plus + Pinia + Axios 的入门级 AI 文本助手示例项目，支持文本润色、纠错、翻译、摘要和创意文案生成。

## 功能

- 文本润色与纠错
- 多语言翻译
- 长文本摘要
- 创意文案生成
- 一键复制 AI 结果
- 前端直接配置 OpenAI / DeepSeek / 百度千帆（文心）参数

## 启动

```bash
npm install
npm run dev
```

## 使用说明

1. 打开页面后，在右侧配置模型提供商与 API Key。
2. 选择对应标签页，输入原文或需求。
3. 点击“立即生成”，等待结果返回。
4. 结果支持一键复制，当前会自动保留最近一次输入和模型设置。

## 接口说明

- `OpenAI` 默认按兼容 `chat/completions` 的方式调用。
- `DeepSeek` 默认使用 OpenAI 兼容接口，默认 `Base URL` 为 `https://api.deepseek.com`。
- `DeepSeek` 内置可选模型为 `deepseek-chat` 和 `deepseek-reasoner`，也支持手动输入其他模型名。
- `百度千帆 / 文心` 默认先用 `API Key + Secret Key` 换取 `access_token`，再请求聊天接口。
- 不同账号的百度模型名和接口地址可能存在差异，可在右侧设置面板中自行调整。

## 注意事项

- 这是一个前端直连 API 的教学示例，`API Key` 会暴露在浏览器环境中，不适合生产环境。
- 若用于正式项目，建议增加后端代理层来保护密钥，并统一做限流与日志。
