<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

import Modal from '~/components/Modal.vue'
const { token } = useAuth()

const { data: postsData } = await useFetch('/api/posts', {
  headers: {
    Authorization: `Bearer ${token.value}`
  }
})
const posts = computed(() => postsData.value?.posts || [])

const showModal = ref(false)
const newPost = ref({
  title: '',
  content: '',
  slug: ''
})
const error = ref('')

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleSubmit = async () => {
  try {
    error.value = ''
    const { data } = await useFetch('/api/posts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: {
        title: newPost.value.title,
        content: newPost.value.content,
        slug: newPost.value.title.toLowerCase().replace(/\s+/g, '-')
      }
    })
    
    if (data.value) {
      showModal.value = false
      // Refresh posts
      const { data: refreshedData } = await useFetch('/api/posts', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      if (refreshedData.value) {
        postsData.value = refreshedData.value
      }
      // Reset form
      newPost.value = {
        title: '',
        content: '',
        slug: ''
      }
    }
  } catch (e) {
    error.value = 'Failed to create post. Please try again.'
  }
}

// Debug için
watch(showModal, (newValue) => {
  console.log('Modal state changed:', newValue)
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold text-gray-custom-900">Latest Posts</h1>
      <button
        @click="showModal = true"
        class="px-4 py-2 bg-gray-custom-900 text-white rounded-md hover:bg-gray-custom-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-custom-500"
      >
        Create Post
      </button>
    </div>
    
    <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="post in posts"
        :key="post.id"
        class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      >
        <NuxtLink :to="'/posts/' + post.slug">
          <div class="p-6">
            <h2 class="text-xl font-semibold text-gray-custom-900 mb-2 line-clamp-2">
              {{ post.title }}
            </h2>
            <div class="text-gray-custom-600 mb-4 line-clamp-3 whitespace-pre-wrap">{{ post.content }}</div>
            <div class="flex items-center justify-between text-sm text-gray-custom-500">
              <span>By {{ post.author?.name }}</span>
              <span>{{ formatDate(post.createdAt) }}</span>
            </div>
            <div class="mt-4 flex items-center space-x-4">
              <div class="flex items-center text-gray-custom-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{{ post.likes?.length || 0 }}</span>
              </div>
              <div class="flex items-center text-gray-custom-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span>{{ post.comments?.length || 0 }}</span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </article>
    </div>

    <Modal
      :show="showModal"
      title="Create New Post"
      :fullscreen="true"
      @close="showModal = false"
    >
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div v-if="error" class="bg-red-50 text-red-500 p-3 rounded text-center text-sm">
          {{ error }}
        </div>

        <div>
          <label for="title" class="block text-sm font-medium text-gray-custom-700">Title</label>
          <input
            id="title"
            v-model="newPost.title"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-custom-300 rounded-md shadow-sm focus:ring-gray-custom-500 focus:border-gray-custom-500"
          />
        </div>

        <div class="flex-1">
          <label for="content" class="block text-sm font-medium text-gray-custom-700 mb-1">Content</label>
          <textarea
            id="content"
            v-model="newPost.content"
            rows="12"
            required
            placeholder="Write your post content here..."
            class="mt-1 block w-full px-3 py-2 border border-gray-custom-300 rounded-md shadow-sm focus:ring-gray-custom-500 focus:border-gray-custom-500 resize-y"
          ></textarea>
        </div>

        <div class="flex justify-end space-x-3 mt-4">
          <button
            type="button"
            class="px-4 py-2 border border-gray-custom-300 rounded-md text-gray-custom-700 hover:bg-gray-custom-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-custom-500"
            @click="showModal = false"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-gray-custom-900 text-white rounded-md hover:bg-gray-custom-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-custom-500"
          >
            Create
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<style>
/* Remove the CKEditor styles from here since they're now in the PostEditor component */
</style> 