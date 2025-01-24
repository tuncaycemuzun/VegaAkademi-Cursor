import { defineEventHandler } from 'h3'
import mongoose from 'mongoose'
import sanitizeHtml from 'sanitize-html'
import { Post } from '~/server/models/Post'
import { getAuthUser } from '~/server/utils/auth'
import { sanitizeOptions } from '~/server/utils/sanitize'

export default defineEventHandler(async (event) => {
    try {
        const user = await getAuthUser(event)

        const posts = await Post.find({ author: new mongoose.Types.ObjectId(user.id) })
            .populate('author', 'name')
            .populate('comments.author', 'name')
            .sort({ createdAt: -1 })

        const postsWithData = posts.map(post => {
            const postObject = post.toObject()
            return {
                ...postObject,
                content: sanitizeHtml(postObject.content, sanitizeOptions),
                likesCount: post.likes.length,
                commentsCount: post.comments.length
            }
        })

        return postsWithData
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message
        })
    }
}) 