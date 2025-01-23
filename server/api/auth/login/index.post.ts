import { defineEventHandler, readBody, createError } from 'h3'
import type { LoginRequest, AuthUser, ApiError } from '~/server/types/api'
import User from '~/server/models/User'
import { generateToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
    try {
        const { email, password } = await readBody<LoginRequest>(event)

        const user = await User.findOne({ email }).select('+password')
        if (!user) {
            throw createError<ApiError>({
                statusCode: 401,
                message: 'Invalid email or password'
            })
        }

        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            throw createError<ApiError>({
                statusCode: 401,
                message: 'Invalid email or password'
            })
        }

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