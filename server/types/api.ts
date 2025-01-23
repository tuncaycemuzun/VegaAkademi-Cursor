import { Types } from 'mongoose'

export interface AuthUser {
    id: string
    name: string
    email: string
    role: string
}

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest extends LoginRequest {
    name: string
}

export interface CreatePostRequest {
    title: string
    content: string
    tags?: string[]
}

export interface CreateCommentRequest {
    content: string
}

export interface ApiError {
    statusCode: number
    message: string
}

export interface UpdatePostRequest {
    title?: string
    content?: string
} 