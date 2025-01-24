import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import mongoose from 'mongoose'
import type { ApiError, CreateCommentRequest } from '~/server/types/api'
import Post from '~/server/models/Post'
import type { PostDocument, ICommentCreate } from '~/server/models/Post'
import { getAuthUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
    try {
        const user = await getAuthUser(event)
        const id = getRouterParam(event, 'id')
        const { content } = await readBody<CreateCommentRequest>(event)
        
        const post = await Post.findById(id) as PostDocument | null
        if (!post) {
            throw createError<ApiError>({
                statusCode: 404,
                message: 'Post not found'
            })
        }

        const comment: ICommentCreate = {
            content,
            author: new mongoose.Types.ObjectId(user.id)
        }

        post.comments.push(comment)
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