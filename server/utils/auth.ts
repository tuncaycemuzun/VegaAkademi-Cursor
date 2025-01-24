import { H3Event, createError } from 'h3'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import type { IUser } from '../models/User'

export const getAuthUser = async (event: H3Event) => {
    const token = event.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
        throw createError({
            statusCode: 401,
            message: 'Not authorized, no token'
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as jwt.JwtPayload
        const user = await User.findById(decoded.id).select('-password') as IUser | null
        
        if (!user) {
            throw createError({
                statusCode: 401,
                message: 'Not authorized, user not found'
            })
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    } catch (error) {
        throw createError({
            statusCode: 401,
            message: 'Not authorized, token failed'
        })
    }
}

export const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '30d'
    })
} 