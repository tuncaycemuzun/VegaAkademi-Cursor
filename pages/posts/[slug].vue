<script setup lang="ts">
definePageMeta({
    middleware: ['auth']
})

import type { Post } from '~/types/post'

interface User {
    id: string
    name: string
    email: string
}

const route = useRoute()
const router = useRouter()

// Önce user bilgisini al
const { data: currentUser } = await useFetchAuth<User>('/api/auth/me')

// Post verisini çek
const { data: post, error: postError, refresh } = await useFetchAuth<Post>(`/api/posts/${route.params.slug}`)

// Debug için loglar
console.log('Current user:', currentUser.value)
console.log('Post data:', post.value)

// Sadece post bulunamadığında yönlendir
if (postError.value?.statusCode === 404) {
    console.error('Post not found:', postError.value)
    router.push('/posts')
}

// User ve post verilerini izle
const isOwner = computed(() => {
    if (!currentUser.value || !post.value?.author) return false
    return currentUser.value.id === post.value.author.id
})

const isLiked = computed(() => post.value?.isLiked || false)
const likeCount = computed(() => post.value?.likes?.length || 0)
const commentCount = computed(() => post.value?.comments?.length || 0)

const toggleStatus = async () => {
    try {
        const { error } = await useFetchAuth(`/api/posts/${post.value?.id}/status`, {
            method: 'PATCH'
        })

        if (error.value) throw error.value

        refresh()
    } catch (e) {
        console.error('Failed to toggle status:', e)
    }
}

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// Like işlemi
const handleLike = async () => {
    if (!post.value) return

    try {
        const { data } = await useFetchAuth(`/api/posts/${post.value.id}/like`, {
            method: 'POST'
        })

        if (data.value) {
            await refresh()
        }
    } catch (error) {
        console.error('Failed to like post:', error)
    }
}

const showShareModal = ref(false)
const shareUrl = computed(() => window.location.href)
const copySuccess = ref(false)

const handleShare = async () => {
    showShareModal.value = true
}

const copyToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(shareUrl.value)
        copySuccess.value = true
        setTimeout(() => {
            copySuccess.value = false
        }, 2000)
    } catch (error) {
        console.error('Failed to copy link:', error)
    }
}

// Yeni yorum için state
const newComment = ref('')
const isSubmitting = ref(false)

// Yorum gönderme işlemi
const submitComment = async () => {
    if (!newComment.value.trim()) return
    
    isSubmitting.value = true
    try {
        const { error } = await useFetchAuth(`/api/posts/${post.value?.id}/comment`, {
            method: 'POST',
            body: {
                content: newComment.value.trim()
            }
        })

        if (error.value) throw error.value

        newComment.value = ''
        await refresh()
    } catch (e) {
        console.error('Failed to submit comment:', e)
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div v-if="!postError">
        <div v-if="post" class="max-w-4xl mx-auto">
            <div class="mb-6 flex justify-between items-center">
                <h1 class="text-4xl font-bold text-gray-900">{{ post.title }}</h1>
                <div v-if="isOwner" class="flex items-center space-x-2">
                    <span class="text-sm text-gray-600">{{ post.isActive ? 'Active' : 'Inactive' }}</span>
                    <button 
                        @click="toggleStatus" 
                        type="button" 
                        :class="[
                            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-custom-500 focus:ring-offset-2',
                            post.isActive ? 'bg-green-500' : 'bg-gray-200'
                        ]"
                        role="switch"
                        :aria-checked="post.isActive"
                    >
                        <span 
                            :class="[
                                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                                post.isActive ? 'translate-x-5' : 'translate-x-0'
                            ]"
                        />
                    </button>
                </div>
            </div>

            <!-- Post meta bilgileri -->
            <div class="flex justify-between items-center mb-8 text-sm text-gray-500">
                <div class="flex items-center space-x-4">
                    <span class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {{ post.author.name }}
                    </span>
                    <span class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {{ formatDate(post.createdAt) }}
                    </span>
                </div>
                <div class="flex items-center space-x-4">
                    <button 
                        @click="handleLike" 
                        class="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                        :class="{ 'text-red-500': isLiked }"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" 
                            class="h-5 w-5" 
                            :class="{ 'fill-current': isLiked }"
                            :fill="isLiked ? 'currentColor' : 'none'"
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{{ likeCount }}</span>
                    </button>
                    <button class="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <span>{{ commentCount }}</span>
                    </button>
                    <button @click="handleShare" class="flex items-center text-gray-500 hover:text-gray-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share
                    </button>
                </div>
            </div>

            <!-- Cover Image -->
            <div v-if="post.coverImage" class="mb-8">
                <img :src="'/uploads/' + post.coverImage" :alt="post.title"
                    class="w-full rounded-lg object-cover max-h-96" />
            </div>

            <!-- Content -->
            <div class="prose max-w-none" v-html="post.content"></div>

            <!-- Comments Section -->
            <div class="mt-12 bg-white rounded-xl shadow-sm p-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-8">Comments</h2>
                
                <!-- New Comment Form -->
                <div class="mb-8">
                    <div class="flex items-start space-x-4">
                        <img 
                            :src="`https://ui-avatars.com/api/?name=${currentUser?.name || 'Guest'}&background=random`"
                            :alt="currentUser?.name || 'Guest'"
                            class="w-10 h-10 rounded-full"
                        />
                        <div class="flex-1">
                            <textarea
                                v-model="newComment"
                                rows="3"
                                placeholder="Write a comment..."
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-custom-500 focus:border-transparent resize-none"
                                :disabled="isSubmitting"
                            ></textarea>
                            <div class="mt-2 flex justify-end">
                                <button
                                    @click="submitComment"
                                    :disabled="isSubmitting || !newComment.trim()"
                                    class="px-4 py-2 bg-gray-custom-900 text-white rounded-md hover:bg-gray-custom-800 focus:outline-none focus:ring-2 focus:ring-gray-custom-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    {{ isSubmitting ? 'Posting...' : 'Post Comment' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Comments List -->
                <div v-if="post.comments?.length" class="space-y-6">
                    <div 
                        v-for="comment in post.comments" 
                        :key="comment.id" 
                        class="flex space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                        <img 
                            :src="`https://ui-avatars.com/api/?name=${comment.author.name}&background=random`"
                            :alt="comment.author.name" 
                            class="w-10 h-10 rounded-full"
                        />
                        <div class="flex-1">
                            <div class="flex items-center justify-between mb-1">
                                <span class="font-medium text-gray-900">{{ comment.author.name }}</span>
                                <span class="text-sm text-gray-500">{{ formatDate(comment.createdAt) }}</span>
                            </div>
                            <p class="text-gray-700 whitespace-pre-wrap">{{ comment.content }}</p>
                        </div>
                    </div>
                </div>
                <div v-else class="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p class="font-medium">No comments yet</p>
                    <p class="text-sm mt-1">Be the first to share your thoughts!</p>
                </div>
            </div>
        </div>

        <div v-else class="flex items-center justify-center min-h-screen">
            <div class="text-center">
                <div class="text-4xl font-bold text-gray-900 mb-4">Loading...</div>
            </div>
        </div>
    </div>

    <!-- Share Modal -->
    <div v-if="showShareModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Share Post</h3>
                <button @click="showShareModal = false" class="text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div class="space-y-4">
                <div class="flex items-center space-x-2">
                    <input
                        type="text"
                        :value="shareUrl"
                        readonly
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-custom-50 text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-custom-500"
                        @focus="(e) => (e.target as HTMLInputElement).select()"
                    />
                    <button
                        @click="copyToClipboard"
                        class="px-4 py-2 bg-gray-custom-900 text-white rounded-md hover:bg-gray-custom-800 focus:outline-none focus:ring-2 focus:ring-gray-custom-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                        <span v-if="!copySuccess">Copy</span>
                        <span v-else class="flex items-center space-x-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Copied!</span>
                        </span>
                    </button>
                </div>
                <p class="text-sm text-gray-500">
                    Click the input field to select the link or use the copy button
                </p>
            </div>
        </div>
    </div>
</template>

<style>
.prose {
    @apply text-gray-700;
}

.prose p {
    @apply mb-4;
}

.prose img {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
}
</style>