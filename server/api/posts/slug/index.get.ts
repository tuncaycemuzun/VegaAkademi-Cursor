import { defineEventHandler, getQuery, createError } from 'h3'
import type { ApiError } from '~/server/types/api'
import { Post } from '~/server/models/Post'
import type { PostDocument, PostObject } from '~/server/models/Post'
import { getAuthUser } from '~/server/utils/auth'
import { Types } from 'mongoose'

export default defineEventHandler(async (event) => {
    try {
        let user = null
        try {
            user = await getAuthUser(event)
        } catch (error) {
            // Ignore auth errors
        }

        const query = getQuery(event)
        const page = Number(query.page) || 1
        const limit = Number(query.limit) || 10
        const slug = query.slug as string

        if (!slug) {
            throw createError<ApiError>({
                statusCode: 400,
                message: 'Slug parameter is required'
            })
        }

        const skip = (page - 1) * limit

        const posts = await Post.find({
            slug: { $regex: slug, $options: 'i' },
            isActive: true
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'name')
            .populate('comments.author', 'name') as PostDocument[]

        const total = await Post.countDocuments({
            slug: { $regex: slug, $options: 'i' },
            isActive: true
        })

        const response = posts.map(post => {
            const postObj = post.toObject() as PostObject
            const checkLike = (like: Types.ObjectId) => like.toString() === user?.id
            postObj.isLiked = user ? post.likes.some(checkLike) : false
            return postObj
        })

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