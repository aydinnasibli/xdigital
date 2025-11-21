import { Types } from 'mongoose';

/**
 * Type helper to convert MongoDB types to serializable types
 * - ObjectId -> string
 * - Date -> string
 * - Recursively applies to nested objects and arrays
 */
export type Serialized<T> = T extends Types.ObjectId
  ? string
  : T extends Date
  ? string
  : T extends Array<infer U>
  ? Array<Serialized<U>>
  : T extends object
  ? { [K in keyof T]: Serialized<T[K]> }
  : T;

/**
 * Recursively serialize MongoDB ObjectIds to strings
 * @param obj - The object to serialize
 * @returns The serialized object with all ObjectIds converted to strings
 */
export function serializeMongoDocument<T>(obj: any): Serialized<T> {
  if (!obj) return obj;

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => serializeMongoDocument(item)) as Serialized<T>;
  }

  // Handle ObjectId
  if (obj instanceof Types.ObjectId) {
    return obj.toString() as Serialized<T>;
  }

  // Handle Date objects - convert to ISO string for Next.js serialization
  if (obj instanceof Date) {
    return obj.toISOString() as Serialized<T>;
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

    return serialized as Serialized<T>;
  }

  // Return primitive values as-is
  return obj as Serialized<T>;
}

/**
 * Helper to safely convert a Mongoose document to a plain object with serialized IDs
 * @param doc - The Mongoose document
 * @returns Plain object with all ObjectIds converted to strings
 */
export function toSerializedObject<T = any>(doc: any): Serialized<T> {
  if (!doc) return doc;

  const plainObj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return serializeMongoDocument<T>(plainObj);
}
