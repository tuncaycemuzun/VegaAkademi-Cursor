<script setup lang="ts">
definePageMeta({
    middleware: ['auth']
})

import type { Post } from '~/types/post'
import { renderEditorJSContent } from '~/utils/editorjs-renderer'

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

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
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
    <div v-if="!postError" class="min-h-screen bg-gray-50">
        <div v-if="post" class="max-w-4xl mx-auto px-4 py-12">
            <!-- Cover Image -->
            <div class="relative h-[480px] mb-12 rounded-2xl overflow-hidden shadow-xl">
                <img
                    v-if="post.coverImage"
                    :src="`/uploads/${post.coverImage}`"
                    :alt="post.title"
                    class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div class="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <h1 class="text-5xl font-bold mb-4 leading-tight">{{ post.title }}</h1>
                    <div class="flex items-center space-x-4 text-sm">
                        <span>{{ formatDate(post.createdAt) }}</span>
                        <span>•</span>
                        <span>{{ post.author.name }}</span>
                    </div>
                </div>
            </div>

            <!-- Content -->
            <div class="bg-white rounded-2xl shadow-sm p-8 mb-8">
                <div class="prose prose-lg max-w-none">
                    <EditorJSRenderer :content="post.content" />
                </div>
            </div>

            <!-- Interaction Bar -->
            <div class="bg-white rounded-2xl shadow-sm p-6 mb-8">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-8">
                        <!-- Like Button -->
                        <button 
                            v-if="!isOwner"
                            @click="handleLike" 
                            class="flex items-center space-x-2 group"
                            :class="isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'"
                        >
                            <svg v-if="isLiked" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                            <span class="font-medium">{{ likeCount }} likes</span>
                        </button>
                        <div v-else class="flex items-center space-x-2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                            <span class="font-medium">{{ likeCount }} likes</span>
                        </div>
                        <!-- Comment Count -->
                        <div class="flex items-center space-x-2 text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                            </svg>
                            <span class="font-medium">{{ commentCount }} comments</span>
                        </div>
                    </div>
                    <button @click="handleShare" class="text-gray-600 hover:text-gray-900">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Comments Section -->
            <div class="bg-white rounded-2xl shadow-sm p-8">
                <h2 class="text-2xl font-bold mb-8">Comments ({{ commentCount }})</h2>
                
                <!-- New Comment Form -->
                <div class="mb-8">
                    <textarea
                        v-model="newComment"
                        placeholder="Share your thoughts..."
                        class="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        rows="3"
                    ></textarea>
                    <div class="mt-4 flex justify-end">
                        <button
                            @click="submitComment"
                            :disabled="isSubmitting || !newComment.trim()"
                            class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                        >
                            {{ isSubmitting ? 'Posting...' : 'Post Comment' }}
                        </button>
                    </div>
                </div>

                <!-- Comments List -->
                <div class="space-y-6">
                    <div v-for="comment in post.comments" :key="comment.id" class="border-b border-gray-100 pb-6">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <span class="font-semibold text-gray-900">{{ comment.author.name }}</span>
                                <span class="text-sm text-gray-500 ml-2">
                                    {{ formatDate(comment.createdAt) }}
                                </span>
                            </div>
                        </div>
                        <p class="text-gray-700">{{ comment.content }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="flex items-center justify-center min-h-screen">
            <div class="animate-pulse flex flex-col items-center">
                <div class="h-8 w-8 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-gray-400 animate-spin">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                </div>
                <p class="text-gray-500">Loading post...</p>
            </div>
        </div>
    </div>

    <!-- Share Modal -->
    <div v-if="showShareModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-semibold text-gray-900">Share Post</h3>
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
                        class="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        @focus="(e: FocusEvent) => (e.target as HTMLInputElement).select()"
                    />
                    <button
                        @click="copyToClipboard"
                        class="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        <span v-if="copySuccess" class="text-green-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </span>
                        <span v-else>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                            </svg>
                        </span>
                    </button>
                </div>
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

/* Editor.js specific styles */
.checklist {
    @apply space-y-2;
}

.checklist-item {
    @apply flex items-center space-x-2;
}

.checklist-item input[type="checkbox"] {
    @apply h-4 w-4 text-gray-600 rounded border-gray-300;
}

.checklist-item span {
    @apply text-gray-700;
}

blockquote {
    @apply border-l-4 border-gray-300 pl-4 italic my-4;
}

blockquote footer {
    @apply text-gray-600 text-sm mt-2 not-italic;
}

pre {
    @apply bg-gray-100 p-4 rounded-md overflow-x-auto my-4;
}

code {
    @apply font-mono text-sm;
}

table {
    @apply min-w-full border border-gray-200 my-4;
}

td {
    @apply border border-gray-200 p-2;
}

hr {
    @apply my-8 border-t-2 border-gray-200;
}

figure {
    @apply my-4;
}

figcaption {
    @apply text-center text-sm text-gray-600 mt-2;
}
</style>