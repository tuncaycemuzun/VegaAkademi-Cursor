import { defineEventHandler, getQuery, createError } from 'h3'
import type { ApiError } from '~/server/types/api'
import { Post } from '~/server/models/Post'
import type { PostDocument, PostObject } from '~/server/models/Post'
import { getAuthUser } from '~/server/utils/auth'
import { Types } from 'mongoose'
import { sanitizeEditorJSContent } from '~/server/utils/sanitize'

export default defineEventHandler(async (event) => {
    try {
        // Get pagination parameters
        const query = getQuery(event)
        const page = Number(query.page) || 1
        const limit = Number(query.limit) || 10
        const skip = (page - 1) * limit

        // Get posts with pagination
        const posts = await Post.find({ isActive: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'name')
            .populate('comments.author', 'name') as PostDocument[]

        const total = await Post.countDocuments({ isActive: true })

        // Convert posts to objects and sanitize content
        const response = posts.map(post => {
            const postObj = post.toObject() as PostObject
            postObj.content = sanitizeEditorJSContent(postObj.content)
            return postObj
        })

        // Try to get authenticated user (optional)
        try {
            const user = await getAuthUser(event)
            if (user) {
                // Add like status for authenticated user
                response.forEach(postObj => {
                    const post = posts.find(p => p.id === postObj.id)
                    if (post) {
                        const checkLike = (like: Types.ObjectId) => like.toString() === user.id
                        postObj.isLiked = post.likes.some(checkLike)
                    }
                })
            }
        } catch {
            // User is not authenticated, isLiked will remain undefined
        }

        return {
            posts: response,
            pagination: {
                total,
                page,
                pageSize: limit,
                pageCount: Math.ceil(total / limit)
            }
        }
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