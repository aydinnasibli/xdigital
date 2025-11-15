import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI && process.env.NODE_ENV !== 'production') {
    console.warn('Warning: MONGODB_URI is not defined. Database features will not work.');
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
        console.log('Using cached MongoDB connection');
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts);
        console.log('Creating new MongoDB connection');
    }

    try {
        cached.conn = await cached.promise;
        console.log('MongoDB connected');
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;