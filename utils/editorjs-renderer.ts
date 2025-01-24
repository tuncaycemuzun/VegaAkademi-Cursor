import sanitizeHtml from 'sanitize-html'

interface EditorJSBlock {
  id: string
  type: string
  data: Record<string, any>
}

export interface EditorJSContent {
  time: number
  blocks: EditorJSBlock[]
}

export function renderEditorJSContent(content: string | EditorJSContent): string {
  let parsedContent: EditorJSContent

  if (typeof content === 'string') {
    try {
      parsedContent = JSON.parse(content)
    } catch {
      return content // Return as is if not valid JSON
    }
  } else {
    parsedContent = content
  }

  if (!parsedContent || !Array.isArray(parsedContent.blocks)) {
    return ''
  }

  return parsedContent.blocks.map((block: EditorJSBlock) => {
    switch (block.type) {
      case 'header':
        return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`
      
      case 'paragraph':
        return `<p>${block.data.text}</p>`
      
      case 'list':
        const listItems = block.data.items.map((item: string) => `<li>${item}</li>`).join('')
        return block.data.style === 'ordered' 
          ? `<ol>${listItems}</ol>` 
          : `<ul>${listItems}</ul>`
      
      case 'checklist':
        return `<div class="checklist">
          ${block.data.items.map((item: { text: string; checked: boolean }) => `
            <div class="checklist-item">
              <input type="checkbox" ${item.checked ? 'checked' : ''} disabled>
              <span>${item.text}</span>
            </div>
          `).join('')}
        </div>`
      
      case 'quote':
        return `<blockquote>
          <p>${block.data.text}</p>
          ${block.data.caption ? `<footer>${block.data.caption}</footer>` : ''}
        </blockquote>`
      
      case 'code':
        return `<pre><code>${block.data.code}</code></pre>`
      
      case 'image':
        return `<figure>
          <img src="${block.data.file.url}" alt="${block.data.caption || ''}" />
          ${block.data.caption ? `<figcaption>${block.data.caption}</figcaption>` : ''}
        </figure>`
      
      case 'delimiter':
        return '<hr />'
      
      case 'table':
        const rows = block.data.content.map((row: string[]) => 
          `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
        ).join('')
        return `<table><tbody>${rows}</tbody></table>`
      
      default:
        return ''
    }
  }).join('\n')
} 