// Add type declarations for Editor.js plugins
declare module '@editorjs/header' { const Header: any; export default Header }
declare module '@editorjs/list' { const List: any; export default List }
declare module '@editorjs/checklist' { const Checklist: any; export default Checklist }
declare module '@editorjs/quote' { const Quote: any; export default Quote }
declare module '@editorjs/code' { const Code: any; export default Code }
declare module '@editorjs/link' { const LinkTool: any; export default LinkTool }
declare module '@editorjs/image' { const ImageTool: any; export default ImageTool }
declare module '@editorjs/embed' { const Embed: any; export default Embed }
declare module '@editorjs/delimiter' { const Delimiter: any; export default Delimiter }
declare module '@editorjs/marker' { const Marker: any; export default Marker }
declare module '@editorjs/table' { const Table: any; export default Table }

<script setup lang="ts">
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Checklist from '@editorjs/checklist'
import Quote from '@editorjs/quote'
import Code from '@editorjs/code'
import LinkTool from '@editorjs/link'
import ImageTool from '@editorjs/image'
import Embed from '@editorjs/embed'
import Delimiter from '@editorjs/delimiter'
import Marker from '@editorjs/marker'
import Table from '@editorjs/table'
import type { EditorJSContent } from '~/utils/editorjs-renderer'

const props = defineProps<{
  modelValue: EditorJSContent
}>()

const emit = defineEmits<{
  'update:modelValue': [value: EditorJSContent]
}>()

const editorElement = ref<HTMLElement | null>(null)
let editor: EditorJS | null = null

onMounted(async () => {
  if (!editorElement.value) return

  editor = new EditorJS({
    holder: editorElement.value,
    tools: {
      header: {
        class: Header,
        config: {
          placeholder: 'Enter a header',
          levels: [1, 2, 3, 4],
          defaultLevel: 2
        }
      },
      list: {
        class: List,
        inlineToolbar: true
      },
      checklist: {
        class: Checklist,
        inlineToolbar: true
      },
      quote: {
        class: Quote,
        inlineToolbar: true,
        config: {
          quotePlaceholder: 'Enter a quote',
          captionPlaceholder: 'Quote\'s author'
        }
      },
      code: Code,
      linkTool: {
        class: LinkTool,
        config: {
          endpoint: '/api/fetchUrl' // You'll need to implement this endpoint
        }
      },
      image: {
        class: ImageTool,
        config: {
          endpoints: {
            byFile: '/api/uploadImage', // You'll need to implement this endpoint
          }
        }
      },
      embed: {
        class: Embed,
        config: {
          services: {
            youtube: true,
            codesandbox: true,
            codepen: true
          }
        }
      },
      delimiter: Delimiter,
      marker: Marker,
      table: {
        class: Table,
        inlineToolbar: true
      }
    } as const,
    data: props.modelValue,
    onChange: async () => {
      const content = await editor?.save()
      if (content) {
        emit('update:modelValue', content as EditorJSContent)
      }
    },
    placeholder: 'Let\'s write an awesome story!',
    autofocus: true
  })
})

onBeforeUnmount(() => {
  if (editor) {
    editor.destroy()
    editor = null
  }
})

// Watch for external changes
watch(() => props.modelValue, async (newValue: EditorJSContent) => {
  if (editor && JSON.stringify(newValue) !== JSON.stringify(await editor.save())) {
    editor.render(newValue)
  }
}, { deep: true })
</script>

<template>
  <div class="editor-wrapper">
    <div ref="editorElement" class="editor-container" />
  </div>
</template>

<style>
.editor-wrapper {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
  min-height: 500px;
}

.editor-container {
  @apply w-full max-w-3xl pl-20 pr-4 pt-4 pb-6;
}

/* Editor.js core styling */
.codex-editor__redactor {
  @apply space-y-4;
}

.codex-editor {
  @apply relative;
}

.ce-block__content,
.ce-toolbar__content {
  max-width: 100% !important;
  @apply px-0;
}

.ce-toolbar__content {
  max-width: 100% !important;
  @apply mx-auto;
}

/* Block spacing */
.ce-block {
  @apply my-6;
}

.ce-block:first-child {
  @apply mt-0;
}

/* Headers */
.ce-header {
  @apply font-bold mb-4 text-gray-900;
}

h1.ce-header {
  @apply text-4xl;
}

h2.ce-header {
  @apply text-3xl;
}

h3.ce-header {
  @apply text-2xl;
}

h4.ce-header {
  @apply text-xl;
}

/* Paragraph */
.ce-paragraph {
  @apply text-base leading-7 text-gray-700;
}

/* Lists */
.ce-block--list {
  @apply pl-6;
}

.ce-block--list .ce-block__content {
  @apply text-gray-700;
}

/* Quote */
.cdx-quote {
  @apply border-l-4 border-gray-300 pl-6 py-2 my-8;
}

.cdx-quote__text {
  @apply text-xl font-serif italic text-gray-700 mb-3;
}

.cdx-quote__caption {
  @apply text-sm text-gray-500 font-medium;
}

/* Checklist */
.cdx-checklist {
  @apply space-y-3;
}

.cdx-checklist__item {
  @apply flex items-center gap-3;
}

.cdx-checklist__item-checkbox {
  @apply w-5 h-5 rounded border-2 border-gray-300 checked:bg-blue-500 checked:border-blue-500 transition-colors;
}

.cdx-checklist__item-text {
  @apply text-gray-700;
}

.cdx-checklist__item--checked .cdx-checklist__item-text {
  @apply text-gray-400 line-through;
}

/* Code */
.ce-code {
  @apply bg-gray-50 p-6 rounded-lg font-mono text-sm leading-6 text-gray-800 overflow-x-auto;
}

/* Table */
.tc-table {
  @apply w-full border-collapse border border-gray-200 bg-white;
}

.tc-row {
  @apply border-b border-gray-200;
}

.tc-cell {
  @apply border border-gray-200 p-3 text-sm text-gray-700;
}

/* Delimiter */
.ce-delimiter {
  @apply my-12 text-center;
}

.ce-delimiter::before {
  content: "•••";
  @apply text-gray-400 text-2xl tracking-widest;
}

/* Toolbar */
.ce-toolbar {
  @apply z-20;
}

.ce-toolbar__plus {
  @apply rounded-full w-8 h-8 flex items-center justify-center bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors;
  left: -32px !important;
}

.ce-toolbar__settings-btn {
  @apply rounded-full w-8 h-8 flex items-center justify-center bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors;
}

/* Plus button */
.ce-toolbar__plus-shortcut {
  @apply hidden;
}

.ce-toolbar__plus svg {
  @apply w-4 h-4 text-gray-600;
}

/* Settings button */
.ce-toolbar__settings-btn svg {
  @apply w-4 h-4 text-gray-600;
}

/* Inline toolbar */
.ce-inline-toolbar {
  @apply border border-gray-200 shadow-lg rounded-lg bg-white;
  animation: toolbarShow 150ms ease;
}

.ce-inline-toolbar__buttons {
  @apply p-1;
}

.ce-inline-tool {
  @apply p-2 hover:bg-gray-50 rounded transition-colors;
}

.ce-inline-tool svg {
  @apply w-4 h-4 text-gray-600;
}

.ce-inline-tool--active {
  @apply bg-gray-100;
}

/* Conversion toolbar */
.ce-conversion-toolbar {
  @apply bg-white border border-gray-200 shadow-lg rounded-lg;
  animation: toolbarShow 150ms ease;
}

.ce-conversion-tool {
  @apply p-2 hover:bg-gray-50 transition-colors;
}

.ce-conversion-tool--focused {
  @apply bg-gray-100;
}

.ce-conversion-tool__icon {
  @apply w-4 h-4 text-gray-600;
}

/* Block tunes */
.ce-block__content--drop-target {
  @apply border-2 border-dashed border-blue-400 rounded-lg;
}

/* Placeholder */
.ce-header[contenteditable=true][data-placeholder]:empty::before,
.ce-paragraph[contenteditable=true][data-placeholder]:empty::before {
  @apply text-gray-400 opacity-60;
}

@keyframes toolbarShow {
  0% {
    opacity: 0;
    transform: translateY(-8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 