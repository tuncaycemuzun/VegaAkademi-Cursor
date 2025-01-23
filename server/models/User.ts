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
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
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