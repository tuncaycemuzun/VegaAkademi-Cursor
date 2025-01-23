import { defineEventHandler, readBody, createError } from 'h3'
import type { RegisterRequest, AuthUser, ApiError } from '~/server/types/api'
import User from '~/server/models/User'
import { generateToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
    try {
        const { name, email, password } = await readBody<RegisterRequest>(event)

        const userExists = await User.findOne({ email })
        if (userExists) {
            throw createError<ApiError>({
                statusCode: 400,
                message: 'User already exists'
            })
        }

        const user = await User.create({
            name,
            email,
            password
        })

        const response: AuthUser & { token: string } = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id)
        }

        return response
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