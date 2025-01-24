import { defineEventHandler, readBody, createError } from 'h3'
import type { ApiError } from '~/server/types/api'
import { Post } from '~/server/models/Post'
import { getAuthUser } from '~/server/utils/auth'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

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

// Function to save base64 image
const saveBase64Image = async (base64Data: string): Promise<string> => {
    try {
        // Extract the actual base64 data
        const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
        
        if (!matches || matches.length !== 3) {
            throw new Error('Invalid base64 string')
        }

        const imageBuffer = Buffer.from(matches[2], 'base64')
        const mimeType = matches[1]
        const extension = mimeType.split('/')[1]
        const filename = `${randomUUID()}.${extension}`
        const uploadDir = join(process.cwd(), 'public', 'uploads')
        const filePath = join(uploadDir, filename)

        await writeFile(filePath, imageBuffer)
        return filename
    } catch (error: any) {
        console.error('Error saving image:', error)
        throw new Error('Failed to save image')
    }
}

export default defineEventHandler(async (event) => {
    try {
        const session = await getAuthUser(event)
        const body = await readBody(event)

        // Validate required fields
        if (!body.title?.trim()) {
            throw createError({
                statusCode: 400,
                message: 'Title is required'
            })
        }

        if (!body.content?.blocks?.length) {
            throw createError({
                statusCode: 400,
                message: 'Content is required'
            })
        }

        // Generate slug
        const baseSlug = createSlug(body.title)
        const slug = await generateUniqueSlug(baseSlug)

        // Handle cover image if exists
        let coverImage = null
        if (body.coverImage) {
            coverImage = await saveBase64Image(body.coverImage)
        }

        // Create post
        const post = await Post.create({
            title: body.title.trim(),
            content: body.content,
            slug,
            coverImage,
            author: session.id,
            status: 'draft'
        })

        return post
    } catch (error: any) {
        console.error('Create post error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to create post'
        })
    }
}) 