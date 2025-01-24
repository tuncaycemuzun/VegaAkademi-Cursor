import { defineEventHandler, getRouterParam, createError } from 'h3'
import type { ApiError } from '~/server/types/api'
import Post from '~/server/models/Post'
import type { PostDocument, PostObject } from '~/server/models/Post'
import { getAuthUser } from '~/server/utils/auth'
import { Types } from 'mongoose'

export default defineEventHandler(async (event) => {
    try {
        // Get post by slug
        const slug = getRouterParam(event, 'slug')
        const post = await Post.findOne({ slug, isActive: true })
            .populate('author', 'name')
            .populate('comments.author', 'name') as PostDocument | null

        if (!post) {
            throw createError<ApiError>({
                statusCode: 404,
                message: 'Post not found'
            })
        }

        // Convert post to object
        const response = post.toObject() as PostObject

        // Try to get authenticated user (optional)
        try {
            const user = await getAuthUser(event)
            if (user) {
                const checkLike = (like: Types.ObjectId) => like.toString() === user.id
                response.isLiked = post.likes.some(checkLike)
            }
        } catch {
            // User is not authenticated, isLiked will remain undefined
        }

        return response
    } catch (error) {
        if ((error as ApiError).statusCode) {
            throw error
        }
        throw createError<ApiError>({
            statusCode: 500,
            message: (error as Error).message || 'Internal server error'
        })
    }
}) 