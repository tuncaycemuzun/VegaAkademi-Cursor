import { defineEventHandler, getRouterParam } from 'h3'
import mongoose from 'mongoose'
import Post from '~/server/models/Post'
import { getAuthUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
    try {
        const user = await getAuthUser(event)
        const id = getRouterParam(event, 'id')
        
        const post = await Post.findById(id)
        if (!post) {
            throw createError({
                statusCode: 404,
                message: 'Post not found'
            })
        }

        if (post.author.toString() !== user.id) {
            throw createError({
                statusCode: 401,
                message: 'Not authorized'
            })
        }

        post.isActive = !post.isActive
        await post.save()

        return post
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message
        })
    }
}) 