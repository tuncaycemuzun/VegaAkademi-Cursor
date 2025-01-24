<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

import type { EditorJSContent } from '~/utils/editorjs-renderer'
import type { Post } from '~/types/post'

const router = useRouter()

const newPost = ref({
  title: '',
  content: {
    time: new Date().getTime(),
    blocks: []
  } as EditorJSContent,
  coverImage: '',
  tags: [] as string[]
})
const error = ref('')
const selectedFile = ref<File | null>(null)
const imagePreview = ref('')
const tagInput = ref('')
const isSubmitting = ref(false)

// Debug için content değişikliklerini izle
watch(() => newPost.value.content, (newContent: EditorJSContent) => {
  console.log('Content changed:', newContent)
}, { deep: true })

const handleImageSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  selectedFile.value = file

  // Dosya boyutunu kontrol et (örn: 5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'Image size should be less than 5MB'
    return
  }

  // Dosya tipini kontrol et
  if (!file.type.startsWith('image/')) {
    error.value = 'Please select an image file'
    return
  }

  // Create preview and convert to base64
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result
    if (typeof result === 'string') {
      // Base64 formatındaki resmi newPost.coverImage'a kaydet
      newPost.value.coverImage = result
      // Önizleme için de aynı base64'ü kullan
      imagePreview.value = result
    }
  }
  reader.readAsDataURL(file)
}

const addTag = () => {
  const tag = tagInput.value.trim().toLowerCase()
  if (tag && !newPost.value.tags.includes(tag)) {
    newPost.value.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (tagToRemove: string) => {
  newPost.value.tags = newPost.value.tags.filter(tag => tag !== tagToRemove)
}

const handleSubmit = async () => {
  if (!newPost.value.title || !newPost.value.content) return

  isSubmitting.value = true
  try {
    error.value = ''
    
    console.log('Form submitted:', {
      title: newPost.value.title,
      content: newPost.value.content,
      hasImage: !!imagePreview.value,
      tags: newPost.value.tags
    })
    
    // Form verilerini kontrol et
    if (!newPost.value.title.trim()) {
      error.value = 'Title is required'
      return
    }

    // Boş içerik kontrolü
    if (!newPost.value.content.blocks.length) {
      error.value = 'Content is required'
      return
    }

    const { data, error: fetchError } = await useFetchAuth<Post>('/api/posts', {
      method: 'POST',
      body: {
        title: newPost.value.title.trim(),
        content: newPost.value.content,
        tags: newPost.value.tags,
        coverImage: newPost.value.coverImage
      }
    })

    if (fetchError.value) {
      throw fetchError.value
    }
    
    if (data.value) {
      router.push(`/posts/${data.value.slug}`)
    }
  } catch (e: any) {
    console.error('Form submission error:', e)
    error.value = e?.data?.message || 'Failed to create post. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen">
    <div>
      <!-- Form Container -->
      <div class="bg-white rounded-2xl border-2 border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Create New Post</h1>
          <p class="mt-2 text-gray-600">Share your thoughts with the world</p>
        </div>

        <!-- Cover Image Upload -->
        <div class="mb-8">
          <div class="relative">
            <input
              type="file"
              ref="fileInput"
              @change="handleImageSelect"
              accept="image/*"
              class="hidden"
            />
            <div 
              @click="$refs.fileInput.click()"
              class="relative aspect-[21/9] rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors cursor-pointer overflow-hidden group"
            >
              <img
                v-if="imagePreview"
                :src="imagePreview"
                alt="Cover preview"
                class="w-full h-full object-cover"
              />
              <div v-else class="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p class="text-sm font-medium">Click to upload cover image</p>
                <p class="text-xs mt-1">Recommended size: 1200x630px</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Title Input -->
        <div class="mb-8">
          <input
            v-model="newPost.title"
            type="text"
            placeholder="Post title"
            class="w-full px-4 py-3 text-xl font-medium border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
          />
        </div>

        <!-- Tags Input -->
        <div class="mb-8">
          <div class="relative">
            <input
              v-model="tagInput"
              @keydown.enter.prevent="addTag"
              type="text"
              placeholder="Add tags (press Enter to add)"
              class="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
            />
            <!-- Tags Display -->
            <div class="flex flex-wrap gap-2 mt-3">
              <span 
                v-for="tag in newPost.tags" 
                :key="tag"
                class="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 text-sm text-gray-700 group"
              >
                #{{ tag }}
                <button 
                  @click="removeTag(tag)"
                  class="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
          </div>
        </div>

        <!-- Editor -->
        <div class="mb-8">
          <EditorJS
            v-model="newPost.content"
            class="min-h-[400px] border-2 border-gray-100 rounded-xl p-4 focus-within:ring-2 focus-within:ring-gray-200 focus-within:border-gray-300 transition-all"
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-4">
          <NuxtLink
            to="/posts"
            class="px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </NuxtLink>
          <button
            @click="handleSubmit"
            :disabled="isSubmitting"
            class="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {{ isSubmitting ? 'Publishing...' : 'Publish Post' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 