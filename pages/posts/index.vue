<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

import type { Post, PostsResponse } from '~/types/post'

const { data: postsData, pending } = await useFetchAuth<PostsResponse>('/api/posts')
const posts = computed(() => postsData.value?.posts || [])

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div v-if="!pending" class="min-h-full">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Posts</h1>
      <NuxtLink
        to="/posts/create"
        class="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
      >
        Create Post
      </NuxtLink>
    </div>
    
    <div v-if="posts.length > 0" class="space-y-4">
      <article
        v-for="post in posts"
        :key="post.id"
        class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-all duration-300"
      >
        <NuxtLink :to="'/posts/' + post.slug" class="flex h-[250px]">
          <!-- Cover Image -->
          <div class="w-[200px] bg-gray-100 flex-shrink-0 relative overflow-hidden">
            <img
              v-if="post.coverImage"
              :src="'/uploads/' + post.coverImage"
              :alt="post.title"
              class="absolute inset-0 w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          
          <!-- Content -->
          <div class="flex-1 p-5 flex flex-col justify-between border-l border-gray-200">
            <div>
              <h2 class="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                {{ post.title }}
              </h2>
              <div class="prose prose-sm text-gray-600">
                <div v-html="post.content" class="line-clamp-3 prose-headings:my-0 prose-p:my-0"></div>
              </div>
            </div>
            
            <div class="flex items-center justify-between text-sm pt-3 border-t border-gray-200">
              <!-- Sol taraf: Beğeni ve Yorum -->
              <div class="flex items-center space-x-4">
                <div class="flex items-center text-gray-600 hover:text-gray-900">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{{ post.likes?.length || 0 }}</span>
                </div>
                <div class="flex items-center text-gray-600 hover:text-gray-900">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <span>{{ post.comments?.length || 0 }}</span>
                </div>
              </div>

              <!-- Sağ taraf: Tarih ve Yazar -->
              <div class="flex flex-col items-end space-y-1">
                <span class="text-gray-700 text-xs">{{ formatDate(post.createdAt) }}</span>
                <span class="text-gray-600 text-xs">{{ post.author?.name }}</span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </article>
    </div>
    <div v-else class="flex flex-col items-center justify-center py-12 text-gray-600 bg-white rounded-lg border border-gray-200">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900">No posts yet</h3>
      <p class="text-gray-600 mt-1">Get started by creating your first post.</p>
    </div>
  </div>
  <div v-else class="flex items-center justify-center min-h-[50vh]">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      <div class="mt-4 text-gray-600">Loading posts...</div>
    </div>
  </div>
</template>

<style>
.prose {
  @apply text-gray-600;
}

.prose p {
  @apply my-0;
}
</style> 