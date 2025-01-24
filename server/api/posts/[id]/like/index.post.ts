import { defineEventHandler, getRouterParam, createError } from 'h3'
import mongoose from 'mongoose'
import type { ApiError } from '~/server/types/api'
import { Post } from '~/server/models/Post'
import type { PostDocument } from '~/server/models/Post'
import { getAuthUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
    try {
        const user = await getAuthUser(event)
        const id = getRouterParam(event, 'id')
        
        const post = await Post.findById(id) as PostDocument | null
        if (!post) {
            throw createError<ApiError>({
                statusCode: 404,
                message: 'Post not found'
            })
        }

        const likeIndex = post.likes.findIndex(
            (like: mongoose.Types.ObjectId) => like.toString() === user.id
        )

        if (likeIndex === -1) {
            post.likes.push(new mongoose.Types.ObjectId(user.id))
        } else {
            post.likes.splice(likeIndex, 1)
        }

        await post.save()
        return post.toObject()
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