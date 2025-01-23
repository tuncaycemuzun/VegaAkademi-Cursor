import mongoose, { Document, Types } from 'mongoose'

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
    content: string;
    slug: string;
    author: Types.ObjectId;
    tags: string[];
    status: 'draft' | 'published';
    likes: Types.ObjectId[];
    isActive: boolean;
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
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'published'
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [commentSchema],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

const Post = mongoose.models.Post || mongoose.model<PostDocument>('Post', postSchema)
export default Post 