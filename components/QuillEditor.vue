<script setup lang="ts">
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = ref()
const quill = ref()

onMounted(() => {
  // Quill instance'ını al
  quill.value = editor.value.getQuill()
  
  // Text change event'ini dinle
  quill.value.on('text-change', () => {
    const content = editor.value.getHTML()
    emit('update:modelValue', content)
  })
})

const editorOptions = {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image']
    ]
  }
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (quill.value && quill.value.root.innerHTML !== newValue) {
    quill.value.root.innerHTML = newValue
  }
})
</script>

<template>
  <div class="quill-editor bg-white rounded-md border border-gray-300">
    <QuillEditor
      ref="editor"
      :modelValue="modelValue"
      @update:modelValue="(val) => emit('update:modelValue', val)"
      :options="editorOptions"
      contentType="html"
    />
  </div>
</template>

<style>
.quill-editor {
  height: 100%;
}

.quill-editor .ql-container {
  height: calc(100% - 42px); /* 42px is the toolbar height */
}

.ql-snow.ql-toolbar {
  border-top: none;
  border-left: none;
  border-right: none;
  @apply border-gray-300;
}

.ql-container.ql-snow {
  border: none;
}

/* Toolbar button hover states */
.ql-snow .ql-toolbar button:hover,
.ql-snow .ql-toolbar button.ql-active {
  @apply text-gray-900;
}

/* Dropdown hover states */
.ql-snow .ql-picker-label:hover,
.ql-snow .ql-picker-label.ql-active {
  @apply text-gray-900;
}

/* Dropdown item hover states */
.ql-snow .ql-picker-item:hover,
.ql-snow .ql-picker-item.ql-selected {
  @apply text-gray-900;
}
</style> 