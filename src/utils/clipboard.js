// 统一的复制工具函数。
// 优先使用现代浏览器的 Clipboard API，失败时再回退到旧方案。
export async function copyText(text) {
  if (!text?.trim()) {
    return false
  }

  // 新浏览器推荐的复制方式，代码更简单，也更稳定。
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return true
  }

  // 兼容旧浏览器：临时创建一个 textarea，选中后执行 copy 命令。
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', 'readonly')
  textarea.style.position = 'absolute'
  textarea.style.left = '-9999px'

  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)

  return copied
}
