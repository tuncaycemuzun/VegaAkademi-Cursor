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

const renderedContent = computed(() => {
    if (!post.value?.content) return ''
    return renderEditorJSContent(post.value.content)
})

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
    <div v-if="!postError">
        <div v-if="post" class="max-w-4xl mx-auto px-4 py-8">
            <!-- Cover Image -->
            <img
                v-if="post.coverImage"
                :src="`/uploads/${post.coverImage}`"
                :alt="post.title"
                class="w-full h-64 object-cover rounded-lg mb-8"
            />

            <!-- Title -->
            <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ post.title }}</h1>

            <!-- Metadata -->
            <div class="flex items-center text-sm text-gray-500 mb-8">
                <span>{{ formatDate(post.createdAt) }}</span>
                <span class="mx-2">•</span>
                <span>{{ post.author.name }}</span>
            </div>

            <!-- Content -->
            <div class="prose prose-lg max-w-none">
                <EditorJSRenderer :content="post.content" />
            </div>

            <!-- Actions -->
            <div class="mt-8 flex justify-end space-x-4">
                <NuxtLink
                    to="/posts"
                    class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                    Back to Posts
                </NuxtLink>
            </div>
        </div>

        <div v-else class="text-center py-12">
            <p class="text-gray-500">Loading post...</p>
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
                        @focus="(e: FocusEvent) => (e.target as HTMLInputElement).select()"
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