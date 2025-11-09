// Export all model types for easy import throughout the app
import type { IUser } from '@/models/User';
import type { IProject } from '@/models/Project';
import type { INotification } from '@/models/Notification';
import type { IMessage } from '@/models/Message';
import type { IInvoice } from '@/models/Invoice';
import type { IAnalytics } from '@/models/Analytics';

export type { IUser, IProject, INotification, IMessage, IInvoice, IAnalytics };

// Export all enums
export {
    ServiceType,
    ProjectStatus,
    WebDevPackage,
    SMMPackage,
    DigitalSolutionsPackage,
} from '@/models/Project';

export { NotificationType } from '@/models/Notification';
export { MessageSender } from '@/models/Message';
export { InvoiceStatus, PaymentMethod } from '@/models/Invoice';
export { AnalyticsMetricType } from '@/models/Analytics';

// Helper type for creating new documents (without _id, createdAt, updatedAt)
export type CreateUser = Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>;
export type CreateProject = Omit<IProject, '_id' | 'createdAt' | 'updatedAt'>;
export type CreateNotification = Omit<INotification, '_id' | 'createdAt' | 'updatedAt'>;
export type CreateMessage = Omit<IMessage, '_id' | 'createdAt' | 'updatedAt'>;
export type CreateInvoice = Omit<IInvoice, '_id' | 'createdAt' | 'updatedAt'>;
export type CreateAnalytics = Omit<IAnalytics, '_id' | 'createdAt' | 'updatedAt'>;