<script setup lang="ts">
import type { EditorJSContent } from '~/utils/editorjs-renderer'

const props = defineProps<{
  content: EditorJSContent
}>()

const renderBlock = (block: any) => {
  switch (block.type) {
    case 'header':
      const Tag = `h${block.data.level}` as keyof HTMLElementTagNameMap
      return h(Tag, { class: 'ce-header' }, block.data.text)
    
    case 'paragraph':
      return h('p', { class: 'ce-paragraph' }, block.data.text)
    
    case 'list':
      const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul'
      return h(ListTag, { class: 'ce-block--list' }, 
        block.data.items.map((item: string) => h('li', {}, item))
      )
    
    case 'checklist':
      return h('div', { class: 'cdx-checklist' },
        block.data.items.map((item: any) => h('div', { class: 'cdx-checklist__item' }, [
          h('input', {
            type: 'checkbox',
            class: 'cdx-checklist__item-checkbox',
            checked: item.checked,
            disabled: true
          }),
          h('div', { class: `cdx-checklist__item-text ${item.checked ? 'cdx-checklist__item--checked' : ''}` }, item.text)
        ]))
      )
    
    case 'quote':
      return h('blockquote', { class: 'cdx-quote' }, [
        h('p', { class: 'cdx-quote__text' }, block.data.text),
        block.data.caption && h('footer', { class: 'cdx-quote__caption' }, block.data.caption)
      ])
    
    case 'code':
      return h('pre', { class: 'ce-code' }, [
        h('code', {}, block.data.code)
      ])
    
    case 'image':
      return h('figure', { class: 'ce-image' }, [
        h('img', {
          src: block.data.file?.url || block.data.url,
          alt: block.data.caption,
          class: 'ce-image__picture'
        }),
        block.data.caption && h('figcaption', { class: 'ce-image__caption' }, block.data.caption)
      ])
    
    case 'delimiter':
      return h('div', { class: 'ce-delimiter' })
    
    case 'table':
      return h('div', { class: 'tc-wrap' }, [
        h('table', { class: 'tc-table' }, [
          h('tbody', {},
            block.data.content.map((row: string[]) =>
              h('tr', { class: 'tc-row' },
                row.map((cell: string) =>
                  h('td', { class: 'tc-cell' }, cell)
                )
              )
            )
          )
        ])
      ])

    default:
      return h('div', {}, `Unsupported block type: ${block.type}`)
  }
}
</script>

<template>
  <div class="editorjs-renderer">
    <template v-for="block in content.blocks" :key="block.id">
      <component :is="renderBlock(block)" />
    </template>
  </div>
</template>

<style>
.editorjs-renderer {
  @apply space-y-6;
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
  @apply pl-6 space-y-2 text-gray-700;
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
  @apply w-5 h-5 rounded border-2 border-gray-300;
}

.cdx-checklist__item-text {
  @apply text-gray-700;
}

.cdx-checklist__item--checked {
  @apply text-gray-400 line-through;
}

/* Code */
.ce-code {
  @apply bg-gray-50 p-6 rounded-lg font-mono text-sm leading-6 text-gray-800 overflow-x-auto;
}

/* Image */
.ce-image {
  @apply my-6;
}

.ce-image__picture {
  @apply w-full rounded-lg;
}

.ce-image__caption {
  @apply mt-2 text-sm text-gray-500 text-center;
}

/* Table */
.tc-wrap {
  @apply overflow-x-auto;
}

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
</style> 