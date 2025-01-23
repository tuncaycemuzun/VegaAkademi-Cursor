export const sanitizeOptions = {
    allowedTags: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
        'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
        'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img' 
    ],
    allowedAttributes: {
        a: ['href', 'name', 'target'],
        img: ['src', 'alt', 'title', 'width', 'height'],
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