import mongoose from 'mongoose'
import env from './env.js'


export default {
    connect: async () => {
        try {
            await mongoose.connect(env.DATABASE)
            return mongoose.connection
        } catch (error) {
            throw error
        }
    }
}
