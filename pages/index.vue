<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Hero Section -->
        <div class="relative overflow-hidden">
            <div class="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
                <div class="text-center">
                    <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                        Welcome to Our Blog
                    </h1>
                    <p class="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
                        Discover stories, thinking, and expertise from writers on any topic.
                    </p>
                </div>
            </div>
        </div>

        <!-- Featured Posts -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- Create Post Card -->
                <div class="group">
                    <NuxtLink to="/posts/create" class="block h-full">
                        <div class="relative h-full bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-all duration-300 group-hover:ring-1 group-hover:ring-gray-200 group-hover:-translate-y-1">
                            <div class="h-full flex flex-col items-center justify-center p-6">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span class="text-lg font-medium text-gray-900">Share Your Story</span>
                                <p class="text-sm mt-2 text-gray-500">Click to create a new blog post</p>
                            </div>
                        </div>
                    </NuxtLink>
                </div>

                <div v-for="post in posts" :key="post.id" class="group">
                    <NuxtLink :to="`/posts/${post.slug}`" class="block h-full">
                        <article class="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-all duration-300 h-full flex flex-col group-hover:ring-1 group-hover:ring-gray-200 group-hover:-translate-y-1">
                            <!-- Cover Image -->
                            <div class="relative aspect-[16/9] overflow-hidden bg-gray-100">
                                <img
                                    v-if="post.coverImage"
                                    :src="`/uploads/${post.coverImage}`"
                                    :alt="post.title"
                                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div v-else class="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>

                            <!-- Content -->
                            <div class="p-6 flex-1 flex flex-col h-[180px]">
                                <!-- Title with fixed height -->
                                <div class="h-[60px]">
                                    <h2 class="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors">
                                        {{ post.title }}
                                    </h2>
                                </div>

                                <!-- Spacer for flex positioning -->
                                <div class="flex-1"></div>

                                <!-- Fixed bottom section -->
                                <div class="mt-auto">
                                    <!-- Author and Date -->
                                    <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                                        <span class="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            {{ post.author.name }}
                                        </span>
                                        <span class="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {{ formatDate(post.createdAt) }}
                                        </span>
                                    </div>

                                    <!-- Interactions -->
                                    <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div class="flex items-center space-x-4">
                                            <div class="flex items-center space-x-1 text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                                </svg>
                                                <span>{{ post.likes?.length || 0 }}</span>
                                            </div>
                                            <div class="flex items-center space-x-1 text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                                                </svg>
                                                <span>{{ post.comments?.length || 0 }}</span>
                                            </div>
                                        </div>
                                        <div class="text-sm text-gray-500 font-medium group-hover:text-gray-700 flex items-center">
                                            Read more
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </NuxtLink>
                </div>
            </div>

            <!-- Empty State -->
            <div v-if="!posts.length" class="text-center py-12">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                <p class="text-gray-500">Get started by creating your first blog post.</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Post } from '~/types/post'

const { data: postsData } = await useFetchAuth<{ posts: Post[] }>('/api/posts')
const posts = computed(() => postsData.value?.posts || [])

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}
</script>

<style>
.bg-grid-white {
    background-image: url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0.5 0.5H7.5M0.5 7.5H7.5M0.5 0.5V7.5M7.5 0.5V7.5' stroke='white' stroke-opacity='0.1'/%3E%3C/svg%3E");
}
.bg-grid-8 {
    background-size: 2rem 2rem;
}
</style>
