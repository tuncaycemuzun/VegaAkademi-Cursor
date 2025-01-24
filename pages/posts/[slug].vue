<script setup lang="ts">
import { HeartIcon, ChatBubbleLeftIcon, ShareIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'

const route = useRoute()
const router = useRouter()
const { token, user } = useAuth()

interface Post {
  _id: string
  title: string
  content: string
  author: {
    _id: string
    name: string
  }
  likes: string[]
  comments: Array<{
    _id: string
    content: string
    author: {
      _id: string
      name: string
    }
    createdAt: string
  }>
  createdAt: string
  isLiked?: boolean
}

const { data: post, error: postError } = await useFetch<Post>(`/api/posts/${route.params.slug}`, {
  headers: {
    Authorization: `Bearer ${token.value}`
  }
})

// Eğer post bulunamazsa ana sayfaya yönlendir
if (postError.value) {
  console.error('Failed to load post:', postError.value)
  router.push('/posts')
}

const isLiked = computed(() => post.value?.isLiked || false)
const likeCount = computed(() => post.value?.likes?.length || 0)
const commentCount = computed(() => post.value?.comments?.length || 0)

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleLike = async () => {
  if (!post.value) return

  try {
    const { data } = await useFetch(`/api/posts/${post.value._id}/like`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })
    
    if (data.value) {
      // Refresh post data
      const { data: refreshedPost } = await useFetch<Post>(`/api/posts/slug/${route.params.slug}`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      if (refreshedPost.value) {
        post.value = refreshedPost.value
      }
    }
  } catch (error) {
    console.error('Failed to like post:', error)
  }
}

const handleShare = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    alert('Link copied to clipboard!')
  } catch (error) {
    console.error('Failed to copy link:', error)
  }
}
</script>

<template>
  <div v-if="!postError">
    <div v-if="post" class="max-w-4xl mx-auto px-4 py-8">
      <!-- Post Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-custom-900 mb-4">
          {{ post.title }}
        </h1>
        <div class="flex items-center justify-between text-gray-custom-500">
          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <img
                :src="`https://ui-avatars.com/api/?name=${post.author?.name}&background=random`"
                :alt="post.author?.name"
                class="w-10 h-10 rounded-full"
              />
              <span class="ml-2 font-medium text-gray-custom-900">{{ post.author?.name }}</span>
            </div>
            <span>{{ formatDate(post.createdAt) }}</span>
          </div>
          <div class="flex items-center space-x-4">
            <button
              @click="handleLike"
              class="flex items-center space-x-1 text-gray-custom-500 hover:text-red-500 transition-colors"
            >
              <component
                :is="isLiked ? HeartSolidIcon : HeartIcon"
                class="w-6 h-6"
                :class="{ 'text-red-500': isLiked }"
              />
              <span>{{ likeCount }}</span>
            </button>
            <button class="flex items-center space-x-1 text-gray-custom-500 hover:text-gray-custom-700 transition-colors">
              <ChatBubbleLeftIcon class="w-6 h-6" />
              <span>{{ commentCount }}</span>
            </button>
            <button
              @click="handleShare"
              class="flex items-center space-x-1 text-gray-custom-500 hover:text-gray-custom-700 transition-colors"
            >
              <ShareIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <!-- Post Content -->
      <div class="prose prose-lg max-w-none">
        <div class="whitespace-pre-wrap" v-html="post.content"></div>
      </div>

      <!-- Comments Section -->
      <div class="mt-12">
        <h2 class="text-2xl font-bold text-gray-custom-900 mb-6">Comments</h2>
        <div v-if="post.comments?.length" class="space-y-6">
          <div
            v-for="comment in post.comments"
            :key="comment._id"
            class="bg-white p-4 rounded-lg shadow"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center">
                <img
                  :src="`https://ui-avatars.com/api/?name=${comment.author?.name}&background=random`"
                  :alt="comment.author?.name"
                  class="w-8 h-8 rounded-full"
                />
                <span class="ml-2 font-medium text-gray-custom-900">{{ comment.author?.name }}</span>
              </div>
              <span class="text-sm text-gray-custom-500">{{ formatDate(comment.createdAt) }}</span>
            </div>
            <p class="text-gray-custom-700">{{ comment.content }}</p>
          </div>
        </div>
        <div v-else class="text-center text-gray-custom-500">
          No comments yet. Be the first to comment!
        </div>
      </div>
    </div>
    <div v-else class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="text-4xl font-bold text-gray-custom-900 mb-4">Loading...</div>
      </div>
    </div>
  </div>
</template>

<style>
.prose {
  @apply text-gray-custom-700;
}

.prose p {
  @apply mb-4;
}
</style> 