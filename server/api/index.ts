import { defineEventHandler } from 'h3'
import mongoose from 'mongoose'

// MongoDB connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || '')
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (error: any) {
        console.error(`Error: ${error.message}`)
        process.exit(1)
    }
}

connectDB()

export default defineEventHandler(() => {
    return 'API is running'
}) 