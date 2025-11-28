import mongoose from 'mongoose';
import { logWarning } from '@/lib/monitoring/sentry';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('MONGODB_URI is required in production environment');
    }
    logWarning('MONGODB_URI is not defined. Database features will not work.', {
        context: 'mongodb-init',
        nodeEnv: process.env.NODE_ENV
    });
}

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
    global.mongooseCache = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined. Please set it in your environment variables.');
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts);
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;