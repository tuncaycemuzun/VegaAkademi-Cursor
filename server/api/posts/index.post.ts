import { defineEventHandler, readBody, createError } from 'h3'
import type { ApiError, CreatePostRequest } from '~/server/types/api'
import Post from '~/server/models/Post'
import { getAuthUser } from '~/server/utils/auth'
import { Types } from 'mongoose'
import sanitizeHtml from 'sanitize-html'
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

const generateUniqueSlug = async (baseSlug: string): Promise<string> => {
    let slug = baseSlug
    let counter = 1

    while (true) {
        // Check if slug exists
        const existingPost = await Post.findOne({ slug })
        
        if (!existingPost) {
            return slug
        }

        // If exists, add random string
        const random = Math.random().toString(36).substring(2, 8) // 6 characters
        slug = `${baseSlug}-${random}`
        
        counter++
        // Safety check to prevent infinite loop
        if (counter > 10) {
            throw createError<ApiError>({
                statusCode: 500,
                message: 'Could not generate unique slug'
            })
        }
    }
}

export default defineEventHandler(async (event) => {
    try {
        const user = await getAuthUser(event)
        const { title, content, tags } = await readBody<CreatePostRequest>(event)

        // Generate base slug
        const baseSlug = createSlug(title)
        
        // Get unique slug
        const slug = await generateUniqueSlug(baseSlug)

        // Sanitize HTML content
        const sanitizedContent = sanitizeHtml(content, sanitizeOptions)

        const post = await Post.create({
            title,
            content: sanitizedContent,
            slug,
            tags,
            author: new Types.ObjectId(user.id)
        })

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