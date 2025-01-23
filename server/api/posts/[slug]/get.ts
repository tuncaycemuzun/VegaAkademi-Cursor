import { defineEventHandler, getRouterParam, createError } from 'h3'
import type { ApiError } from '~/server/types/api'
import Post from '~/server/models/Post'
import type { PostDocument, PostObject } from '~/server/models/Post'
import { getAuthUser } from '~/server/utils/auth'
import { Types } from 'mongoose'

export default defineEventHandler(async (event) => {
    try {
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

        // Try to get authenticated user (optional)
        let user = null
        try {
            user = await getAuthUser(event)
        } catch (error) {
            // Ignore auth errors
        }

        const response = post.toObject() as PostObject
        
        // Add like status if user is authenticated
        if (user) {
            const checkLike = (like: Types.ObjectId) => like.toString() === user.id
            response.isLiked = post.likes.some(checkLike)
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