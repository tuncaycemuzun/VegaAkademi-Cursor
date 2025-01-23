import { defineEventHandler, readBody } from 'h3'
import mongoose from 'mongoose'
import sanitizeHtml from 'sanitize-html'
import Post from '~/server/models/Post'
import { getAuthUser } from '~/server/utils/auth'
import { sanitizeOptions } from '~/server/utils/sanitize'

const createSlug = (text: string): string => {
    const trMap: { [key: string]: string } = {
        'çÇ': 'c',
        'ğĞ': 'g',
        'şŞ': 's',
        'üÜ': 'u',
        'ıİ': 'i',
        'öÖ': 'o'
    }

    for (let key in trMap) {
        text = text.replace(new RegExp('[' + key + ']', 'g'), trMap[key])
    }

    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove invalid chars
        .replace(/\s+/g, '-')          // Replace spaces with -
        .replace(/^-+/, '')            // Trim - from start of text
        .replace(/-+$/, '')            // Trim - from end of text
        .replace(/-+/g, '-')           // Replace multiple - with single -
}

export default defineEventHandler(async (event) => {
    try {
        const user = await getAuthUser(event)
        const { title, content, tags } = await readBody(event)
        const slug = createSlug(title)

        // Sanitize HTML content
        const sanitizedContent = sanitizeHtml(content, sanitizeOptions)

        const post = await Post.create({
            title,
            content: sanitizedContent,
            slug,
            tags,
            author: new mongoose.Types.ObjectId(user.id)
        })

        return post
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message
        })
    }
}) 