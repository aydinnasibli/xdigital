import { Types } from 'mongoose';

/**
 * Recursively serialize MongoDB ObjectIds to strings
 * @param obj - The object to serialize
 * @returns The serialized object with all ObjectIds converted to strings
 */
export function serializeMongoDocument<T>(obj: any): T {
  if (!obj) return obj;

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => serializeMongoDocument(item)) as T;
  }

  // Handle ObjectId
  if (obj instanceof Types.ObjectId) {
    return obj.toString() as T;
  }

  // Handle Date objects - convert to ISO string for Next.js serialization
  if (obj instanceof Date) {
    return obj.toISOString() as T;
  }

  // Handle plain objects
  if (typeof obj === 'object' && obj !== null) {
    const serialized: any = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        // Convert ObjectId to string
        if (value instanceof Types.ObjectId) {
          serialized[key] = value.toString();
        }
        // Convert Date to ISO string
        else if (value instanceof Date) {
          serialized[key] = value.toISOString();
        }
        // Recursively handle nested objects and arrays
        else if (typeof value === 'object' && value !== null) {
          serialized[key] = serializeMongoDocument(value);
        }
        // Keep primitive values as-is
        else {
          serialized[key] = value;
        }
      }
    }

    return serialized as T;
  }

  // Return primitive values as-is
  return obj;
}

/**
 * Helper to safely convert a Mongoose document to a plain object with serialized IDs
 * @param doc - The Mongoose document
 * @returns Plain object with all ObjectIds converted to strings
 */
export function toSerializedObject<T>(doc: any): T {
  if (!doc) return doc;

  const plainObj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return serializeMongoDocument<T>(plainObj);
}
