declare module '@editorjs/editorjs' {
  interface EditorConfig {
    holder: string | HTMLElement
    tools?: Record<string, any>
    data?: any
    onChange?: () => void
    placeholder?: string
    autofocus?: boolean
  }

  export default class EditorJS {
    constructor(config: EditorConfig)
    destroy(): void
    save(): Promise<any>
    render(data: any): void
  }
}

declare module '@editorjs/header' {
  const Header: any
  export default Header
}

declare module '@editorjs/list' {
  const List: any
  export default List
}

declare module '@editorjs/checklist' {
  const Checklist: any
  export default Checklist
}

declare module '@editorjs/quote' {
  const Quote: any
  export default Quote
}

declare module '@editorjs/code' {
  const Code: any
  export default Code
}

declare module '@editorjs/link' {
  const LinkTool: any
  export default LinkTool
}

declare module '@editorjs/image' {
  const ImageTool: any
  export default ImageTool
}

declare module '@editorjs/embed' {
  const Embed: any
  export default Embed
}

declare module '@editorjs/delimiter' {
  const Delimiter: any
  export default Delimiter
}

declare module '@editorjs/marker' {
  const Marker: any
  export default Marker
}

declare module '@editorjs/table' {
  const Table: any
  export default Table
} 