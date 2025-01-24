import { defineEventHandler, readBody, createError } from 'h3'
import type { ApiError, CreatePostRequest } from '~/server/types/api'
import Post from '~/server/models/Post'
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

const saveBase64Image = async (base64Data: string): Promise<string> => {
    try {
        // Debug için base64 verisinin ilk kısmını logla
        console.log('Base64 data prefix:', base64Data.substring(0, 50))

        // base64 formatını kontrol et
        if (!base64Data.startsWith('data:image/')) {
            throw new Error('Invalid base64 format: Does not start with data:image/')
        }

        // base64'ün data kısmını ve dosya tipini ayır
        const matches = base64Data.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/)
        
        if (!matches) {
            throw new Error('Invalid base64 format: Could not parse image data')
        }

        const fileType = matches[1].toLowerCase()
        const base64Image = matches[2]

        // Desteklenen formatları kontrol et
        const supportedTypes = ['jpeg', 'jpg', 'png', 'gif', 'webp']
        if (!supportedTypes.includes(fileType)) {
            throw new Error(`Unsupported image type: ${fileType}`)
        }

        // Benzersiz dosya adı oluştur
        const fileName = `${randomUUID()}.${fileType}`
        
        // Base64'ü buffer'a çevir
        const buffer = Buffer.from(base64Image, 'base64')
        
        // Dosya yolunu oluştur (public/uploads klasörüne kaydet)
        const uploadDir = join(process.cwd(), 'public/uploads')
        const filePath = join(uploadDir, fileName)
        
        // Dosyayı kaydet
        await writeFile(filePath, buffer)
        
        return fileName
    } catch (error) {
        console.error('Error in saveBase64Image:', error)
        throw error
    }
}

export default defineEventHandler(async (event) => {
    try {
        const user = await getAuthUser(event)
        const body = await readBody(event)

        const { title, content, coverImage } = body

        // Debug için body'i logla
        console.log('Received post data:', {
            title,
            contentLength: content?.length,
            coverImageLength: coverImage?.length
        })

        if (!title || !content) {
            throw createError({
                statusCode: 400,
                message: 'Title and content are required'
            })
        }
        
        // Generate base slug
        const baseSlug = createSlug(title)
        
        // Get unique slug
        const slug = await generateUniqueSlug(baseSlug)

        let savedImageName = null
        if (coverImage) {
            try {
                savedImageName = await saveBase64Image(coverImage)
                console.log('Image saved successfully:', savedImageName)
            } catch (error: any) {
                console.error('Image save error:', error.message)
                throw createError({
                    statusCode: 400,
                    message: `Failed to save image: ${error.message}`
                })
            }
        }

        const post = await Post.create({
            title,
            content,
            slug,
            coverImage: savedImageName,
            author: user.id,
            status: 'draft'
        })

        await post.populate('author', 'name')

        return post.toObject()
    } catch (error: any) {
        console.error('Create post error:', error)
        if (error.statusCode) {
            throw error
        }
        throw createError({
            statusCode: 500,
            message: error.message || 'Internal server error'
        })
    }
}) 