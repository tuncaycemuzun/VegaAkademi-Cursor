import mongoose, { Document, Types } from 'mongoose'
import type { EditorJSContent } from '~/utils/editorjs-renderer'

interface BaseComment {
    content: string;
    author: Types.ObjectId;
}

export interface IComment extends Document, BaseComment {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export type ICommentCreate = BaseComment;

interface BasePost {
    title: string;
    content: string | EditorJSContent;
    slug: string;
    author: Types.ObjectId;
    tags: string[];
    status: 'draft' | 'published' | 'archived';
    likes: Types.ObjectId[];
    isActive: boolean;
    coverImage: string | null;
}

export interface IPost extends Document, BasePost {
    id: string;
    comments: IComment[];
    createdAt: Date;
    updatedAt: Date;
}

export interface PostDocument extends Omit<IPost, 'comments'> {
    comments: mongoose.Types.DocumentArray<IComment>;
    toObject(): PostObject;
}

export interface PostObject extends Omit<BasePost, 'author' | 'likes'> {
    id: string;
    author: { id: string; name: string };
    likes: string[];
    isLiked?: boolean;
    comments: Array<{
        id: string;
        content: string;
        author: { id: string; name: string };
        createdAt: Date;
        updatedAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: {
        currentTime: () => {
            const now = new Date()
            return new Date(now.getTime() - (3 * 60 * 60 * 1000)) // UTC-3
        }
    },
    toJSON: { 
        virtuals: true,
        transform: (_doc: any, ret: any) => {
            ret.id = ret._id.toString()
            delete ret._id
            delete ret.__v
            // Convert dates to UTC-3
            if (ret.createdAt) ret.createdAt = new Date(new Date(ret.createdAt).getTime() - (3 * 60 * 60 * 1000))
            if (ret.updatedAt) ret.updatedAt = new Date(new Date(ret.updatedAt).getTime() - (3 * 60 * 60 * 1000))
            return ret
        }
    },
    toObject: { 
        virtuals: true,
        transform: (_doc: any, ret: any) => {
            ret.id = ret._id.toString()
            delete ret._id
            delete ret.__v
            // Convert dates to UTC-3
            if (ret.createdAt) ret.createdAt = new Date(new Date(ret.createdAt).getTime() - (3 * 60 * 60 * 1000))
            if (ret.updatedAt) ret.updatedAt = new Date(new Date(ret.updatedAt).getTime() - (3 * 60 * 60 * 1000))
            return ret
        }
    }
})

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    content: {
        type: mongoose.Schema.Types.Mixed as any,
        required: true
    },
    coverImage: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    tags: [{
        type: String,
        lowercase: true,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: {
        currentTime: () => {
            const now = new Date()
            return new Date(now.getTime() - (3 * 60 * 60 * 1000)) // UTC-3
        }
    },
    toJSON: { 
        virtuals: true,
        transform: (_doc: any, ret: any) => {
            ret.id = ret._id.toString()
            delete ret._id
            delete ret.__v
            // Convert dates to UTC-3
            if (ret.createdAt) ret.createdAt = new Date(new Date(ret.createdAt).getTime() - (3 * 60 * 60 * 1000))
            if (ret.updatedAt) ret.updatedAt = new Date(new Date(ret.updatedAt).getTime() - (3 * 60 * 60 * 1000))
            return ret
        }
    },
    toObject: { 
        virtuals: true,
        transform: (_doc: any, ret: any) => {
            ret.id = ret._id.toString()
            delete ret._id
            delete ret.__v
            // Convert dates to UTC-3
            if (ret.createdAt) ret.createdAt = new Date(new Date(ret.createdAt).getTime() - (3 * 60 * 60 * 1000))
            if (ret.updatedAt) ret.updatedAt = new Date(new Date(ret.updatedAt).getTime() - (3 * 60 * 60 * 1000))
            return ret
        }
    }
})

export const Post = mongoose.models.Post || mongoose.model<PostDocument>('Post', postSchema) 