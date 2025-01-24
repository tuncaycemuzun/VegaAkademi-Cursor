import { defineEventHandler, getRouterParam } from 'h3'
import sanitizeHtml from 'sanitize-html'
import Post from '~/server/models/Post'
import { getAuthUser } from '~/server/utils/auth'
import { sanitizeOptions } from '~/server/utils/sanitize'

export default defineEventHandler(async (event) => {
    try {
        const slug = getRouterParam(event, 'slug')
        const post = await Post.findOne({ slug })
            .populate('author', 'id name')
            .populate('comments.author', 'name')

        if (!post) {
            throw createError({
                statusCode: 404,
                message: 'Post not found'
            })
        }

        // Try to get authenticated user
        let user = null
        try {
            user = await getAuthUser(event)
        } catch (error) {
            // Ignore auth errors
        }

        // Post aktif değilse kontrol yap
        if (!post.isActive) {
            // Eğer kullanıcı giriş yapmamışsa veya post sahibi değilse erişimi engelle
            if (!user || user.id !== post.author.id) {
                throw createError({
                    statusCode: 404,
                    message: 'Post not found'
                })
            }
        }

        // If user is authenticated, add user-specific data
        if (user) {
            const postObject = post.toObject()
            return {
                ...postObject,
                content: sanitizeHtml(postObject.content, sanitizeOptions),
                isLiked: post.likes.some((like: any) => like.toString() === user.id),
                likesCount: post.likes.length,
                commentsCount: post.comments.length
            }
        }

        // For non-authenticated users, return limited data
        const publicPost = {
            id: post.id,
            title: post.title,
            content: sanitizeHtml(post.content, sanitizeOptions),
            slug: post.slug,
            author: post.author,
            tags: post.tags,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            likesCount: post.likes.length,
            commentsCount: post.comments.length
        }

        return publicPost
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message
        })
    }
}) 