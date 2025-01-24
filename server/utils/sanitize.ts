import sanitizeHtml from 'sanitize-html'

interface EditorJSBlock {
    id: string
    type: string
    data: Record<string, any>
}

interface EditorJSContent {
    time: number
    blocks: EditorJSBlock[]
}

export const sanitizeOptions = {
    allowedTags: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
        'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
        'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img',
        'figure', 'figcaption', 'input'
    ],
    allowedAttributes: {
        a: ['href', 'name', 'target'],
        img: ['src', 'alt', 'title', 'width', 'height'],
        input: ['type', 'checked', 'disabled'],
        '*': ['class', 'id', 'style']
    },
    allowedStyles: {
        '*': {
            'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
            'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
            'font-size': [/^\d+(?:px|em|%)$/]
        }
    }
}

export function sanitizeEditorJSContent(content: string | EditorJSContent): string | EditorJSContent {
    let parsedContent: EditorJSContent

    if (typeof content === 'string') {
        try {
            parsedContent = JSON.parse(content)
        } catch {
            return sanitizeHtml(content, sanitizeOptions)
        }
    } else {
        parsedContent = content
    }

    if (!parsedContent || !Array.isArray(parsedContent.blocks)) {
        return content
    }

    // Sanitize each block's content
    parsedContent.blocks = parsedContent.blocks.map((block: EditorJSBlock) => {
        switch (block.type) {
            case 'paragraph':
            case 'header':
            case 'quote':
                if (block.data.text) {
                    block.data.text = sanitizeHtml(block.data.text, sanitizeOptions)
                }
                if (block.data.caption) {
                    block.data.caption = sanitizeHtml(block.data.caption, sanitizeOptions)
                }
                break
            
            case 'list':
                if (Array.isArray(block.data.items)) {
                    block.data.items = block.data.items.map((item: string) => 
                        sanitizeHtml(item, sanitizeOptions)
                    )
                }
                break
            
            case 'checklist':
                if (Array.isArray(block.data.items)) {
                    block.data.items = block.data.items.map((item: { text: string; checked: boolean }) => ({
                        ...item,
                        text: sanitizeHtml(item.text, sanitizeOptions)
                    }))
                }
                break
            
            case 'code':
                if (block.data.code) {
                    block.data.code = sanitizeHtml(block.data.code, {
                        allowedTags: [],
                        allowedAttributes: {}
                    })
                }
                break
            
            case 'image':
                if (block.data.caption) {
                    block.data.caption = sanitizeHtml(block.data.caption, sanitizeOptions)
                }
                break
            
            case 'table':
                if (Array.isArray(block.data.content)) {
                    block.data.content = block.data.content.map((row: string[]) =>
                        row.map((cell: string) => sanitizeHtml(cell, sanitizeOptions))
                    )
                }
                break
        }
        return block
    })

    return parsedContent
} 