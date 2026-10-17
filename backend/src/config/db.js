import mongoose from 'mongoose';
import { env } from './env.js';
export async function connectDB() {
    mongoose.set('strictQuery', true);
    mongoose.set('autoIndex', env.nodeEnv !== 'production');
    try {
        await mongoose.connect(env.mongoUri, {
            serverSelectionTimeoutMS: 8000,
            connectTimeoutMS: 8000,
            family: 4
        });
        if (env.nodeEnv !== 'production') {
            await Promise.all(mongoose.modelNames().map((name) => mongoose.model(name).init()));
        }
        console.log('✓ MongoDB connected and indexes ready');
        return mongoose.connection;
    }
    catch (error) {
        const clean = new Error('MongoDB is not reachable. Start MongoDB or check MONGODB_URI.');
        clean.code = 'DB_UNAVAILABLE';
        clean.cause = error;
        throw clean;
    }
}
export async function pingDB() {
    if (mongoose.connection.readyState !== 1 || !mongoose.connection.db)
        return false;
    await mongoose.connection.db.admin().ping();
    return true;
}
