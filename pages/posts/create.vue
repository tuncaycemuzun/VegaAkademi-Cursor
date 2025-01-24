<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

import QuillEditor from '~/components/QuillEditor.vue'
import type { Post } from '~/types/post'

const router = useRouter()

const newPost = ref({
  title: '',
  content: '',
  coverImage: ''
})
const error = ref('')
const selectedFile = ref<File | null>(null)
const imagePreview = ref('')

// Debug için content değişikliklerini izle
watch(() => newPost.value.content, (newContent) => {
  console.log('Content changed:', newContent)
})

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

const handleSubmit = async () => {
  try {
    error.value = ''
    
    console.log('Form submitted:', {
      title: newPost.value.title,
      content: newPost.value.content,
      hasImage: !!imagePreview.value
    })
    
    // Form verilerini kontrol et
    if (!newPost.value.title.trim()) {
      error.value = 'Title is required'
      return
    }

    // Boş içerik kontrolü
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = newPost.value.content
    const textContent = tempDiv.textContent || tempDiv.innerText
    
    if (!textContent.trim()) {
      error.value = 'Content is required'
      return
    }

    const { data, error: fetchError } = await useFetchAuth<Post>('/api/posts', {
      method: 'POST',
      body: {
        title: newPost.value.title.trim(),
        content: newPost.value.content,
        coverImage: imagePreview.value
      }
    })

    if (fetchError.value) {
      throw fetchError.value
    }
    
    if (data.value) {
      router.push('/posts')
    }
  } catch (e: any) {
    console.error('Form submission error:', e)
    error.value = e?.data?.message || 'Failed to create post. Please try again.'
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold text-gray-900">Create New Post</h1>
      <NuxtLink
        to="/posts"
        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        Cancel
      </NuxtLink>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div v-if="error" class="bg-red-50 text-red-500 p-3 rounded text-center text-sm">
        {{ error }}
      </div>

      <div>
        <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
        <input
          id="title"
          v-model="newPost.title"
          type="text"
          required
          placeholder="Enter post title"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500"
        />
      </div>

      <div>
        <label for="coverImage" class="block text-sm font-medium text-gray-700">Cover Image</label>
        <input
          id="coverImage"
          type="file"
          accept="image/*"
          @change="handleImageSelect"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500"
        />
        <p class="mt-1 text-sm text-gray-500">Select an image file for the cover</p>
        
        <!-- Preview -->
        <img
          v-if="imagePreview"
          :src="imagePreview"
          alt="Cover preview"
          class="mt-2 max-h-48 rounded-lg object-cover"
        />
      </div>

      <div class="flex-1">
        <label for="content" class="block text-sm font-medium text-gray-700 mb-1">Content</label>
        <div class="h-[500px] bg-white">
          <ClientOnly>
            <QuillEditor
              v-model="newPost.content"
              placeholder="Write your post content here..."
            />
          </ClientOnly>
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-8">
        <NuxtLink
          to="/posts"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancel
        </NuxtLink>
        <button
          type="submit"
          class="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Create Post
        </button>
      </div>
    </form>
  </div>
</template> 