import mongoose, { Document } from 'mongoose'
import bcrypt from 'bcryptjs'

interface BaseUser {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
}

export interface IUser extends Document, BaseUser {
    id: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface UserDocument extends IUser {
    toObject(): Omit<BaseUser, 'password'> & { id: string };
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
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
        transform: (_, ret) => {
            ret.id = ret._id.toString()
            delete ret._id
            delete ret.__v
            if (ret.password) delete ret.password
            // Convert dates to UTC-3
            if (ret.createdAt) ret.createdAt = new Date(new Date(ret.createdAt).getTime() - (3 * 60 * 60 * 1000))
            if (ret.updatedAt) ret.updatedAt = new Date(new Date(ret.updatedAt).getTime() - (3 * 60 * 60 * 1000))
            return ret
        }
    },
    toObject: { 
        virtuals: true,
        transform: (_, ret) => {
            ret.id = ret._id.toString()
            delete ret._id
            delete ret.__v
            if (ret.password) delete ret.password
            // Convert dates to UTC-3
            if (ret.createdAt) ret.createdAt = new Date(new Date(ret.createdAt).getTime() - (3 * 60 * 60 * 1000))
            if (ret.updatedAt) ret.updatedAt = new Date(new Date(ret.updatedAt).getTime() - (3 * 60 * 60 * 1000))
            return ret
        }
    }
})

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.models.User || mongoose.model<UserDocument>('User', userSchema)
export default User 