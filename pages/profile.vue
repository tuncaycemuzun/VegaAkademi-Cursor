<script setup lang="ts">
definePageMeta({
    middleware: ['auth']
})

import type { Post } from '~/types/post'
import type { User } from '~/types/user'

// Kullanıcı bilgilerini al
const { data: currentUser } = await useFetchAuth<User>('/api/auth/me')

// Kullanıcının postlarını çek
const { data: postsData, refresh } = await useFetchAuth<{ posts: Post[] }>('/api/posts/user')
const posts = computed(() => postsData.value?.posts || [])

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

// Post durumunu değiştir
const togglePostStatus = async (postId: string) => {
    try {
        const token = useCookie('token')
        await $fetch(`/api/posts/${postId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token.value}`
            }
        })
        
        // Postları yenile
        await refresh()
    } catch (e) {
        console.error('Failed to toggle post status:', e)
        throw e
    }
}
</script>

<template>
    <div class="min-h-screen bg-gray-50/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <!-- Profile Header -->
            <div class="bg-white rounded-2xl border border-gray-100 p-8 mb-8 shadow-sm">
                <div class="flex items-center space-x-4">
                    <div class="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">{{ currentUser?.name }}</h1>
                        <p class="text-gray-500">{{ currentUser?.email }}</p>
                    </div>
                </div>
            </div>

            <!-- Posts List -->
            <div class="space-y-4">
                <div v-for="post in posts" :key="post.id" class="bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-gray-200 transition-all">
                    <div class="p-6">
                        <div class="flex items-center justify-between">
                            <div class="flex-1">
                                <div class="flex items-center space-x-4">
                                    <!-- Cover Image Preview -->
                                    <div v-if="post.coverImage" class="h-16 w-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        <img :src="`/uploads/${post.coverImage}`" :alt="post.title" class="w-full h-full object-cover" />
                                    </div>
                                    <div v-else class="h-16 w-24 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    
                                    <!-- Post Info -->
                                    <div class="flex-1 min-w-0">
                                        <NuxtLink :to="`/posts/${post.slug}`" class="block">
                                            <h2 class="text-lg font-semibold text-gray-900 truncate hover:text-gray-600 transition-colors">
                                                {{ post.title }}
                                            </h2>
                                        </NuxtLink>
                                        <div class="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                            <span class="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {{ formatDate(post.createdAt) }}
                                            </span>
                                            <span class="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                                {{ post.likes?.length || 0 }}
                                            </span>
                                            <span class="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                </svg>
                                                {{ post.comments?.length || 0 }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Status Toggle -->
                            <div class="ml-6 flex items-center">
                                <button 
                                    @click="togglePostStatus(post.id)"
                                    class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                                    :class="post.isActive ? 'bg-green-500' : 'bg-gray-200'"
                                    role="switch"
                                    :aria-checked="post.isActive"
                                >
                                    <span 
                                        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                                        :class="post.isActive ? 'translate-x-5' : 'translate-x-0'"
                                    />
                                </button>
                                <span class="ml-2 text-sm" :class="post.isActive ? 'text-green-600' : 'text-gray-500'">
                                    {{ post.isActive ? 'Active' : 'Passive' }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-if="!posts.length" class="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <div class="mx-auto h-12 w-12 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 class="mt-2 text-sm font-semibold text-gray-900">No posts yet</h3>
                    <p class="mt-1 text-sm text-gray-500">Get started by creating your first blog post.</p>
                    <div class="mt-6">
                        <NuxtLink to="/posts/create" class="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900">
                            <svg xmlns="http://www.w3.org/2000/svg" class="-ml-0.5 mr-1.5 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            New Post
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>