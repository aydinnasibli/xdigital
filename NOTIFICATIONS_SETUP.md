# 🔔 Notification System Setup Guide

## Overview

The xDigital platform now has a complete notification system with:
- ✅ **Database Notifications** - Persistent notification history
- ✅ **Toast Notifications** - Instant visual feedback (Sonner)
- ✅ **Real-time Messaging** - Live chat with Pusher (optional)
- ✅ **Email Notifications** - Important offline alerts (optional)

---

## 🚀 Quick Start

### 1. Install Dependencies (Already Done)
```bash
npm install sonner pusher pusher-js resend react-email @react-email/components
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and configure:

#### Required (Core Functionality):
```env
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

#### Optional (Enhanced Features):

**For Real-time Messaging** (Pusher):
```env
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=us2
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=us2
```
👉 Get free account at: https://dashboard.pusher.com/

**For Email Notifications** (Resend):
```env
RESEND_API_KEY=re_...
EMAIL_FROM=XDigital <notifications@yourdomain.com>
```
👉 Get free account at: https://resend.com/api-keys

---

## 📚 How to Use Notifications

### Creating Notifications in Your Actions

```typescript
import { createNotification } from '@/app/actions/notifications';
import { NotificationType } from '@/models/Notification';

// Example: Notify client when invoice is created
await createNotification({
    userId: clientClerkId, // Clerk user ID
    projectId: project._id.toString(),
    type: NotificationType.INVOICE,
    title: 'New Invoice',
    message: `Invoice ${invoiceNumber} for $${amount} has been created`,
    link: `/dashboard/projects/${projectId}`,
    sendEmail: true, // Only if RESEND_API_KEY is configured
    emailSubject: `New Invoice: ${invoiceNumber}`,
});
```

### Toast Notifications (Client-Side)

```typescript
'use client';
import { toast } from 'sonner';

// Success toast
toast.success('Task created successfully!');

// Error toast
toast.error('Failed to create task');

// With action button
toast.success('Invoice created', {
    action: {
        label: 'View',
        onClick: () => router.push('/dashboard/invoices')
    }
});
```

---

## 🔗 Integration Examples

### Example 1: Invoice Created

```typescript
// app/actions/invoices.ts
import { createNotification } from '@/app/actions/notifications';
import { NotificationType } from '@/models/Notification';
import { sendInvoiceEmail } from '@/lib/services/email.service';

export async function createInvoice(data) {
    // ... create invoice in database

    // Send notification to client
    await createNotification({
        userId: project.client.clerkId,
        projectId: projectId,
        type: NotificationType.INVOICE,
        title: 'New Invoice',
        message: `Invoice ${invoiceNumber} for $${total} has been created`,
        link: `/dashboard/projects/${projectId}`,
        sendEmail: true,
    });

    return { success: true, data: invoice };
}
```

### Example 2: Deliverable Approved

```typescript
// app/actions/deliverables.ts
import { createNotification } from '@/app/actions/notifications';
import { NotificationType } from '@/models/Notification';

export async function approveDeliverable(deliverableId: string) {
    // ... approve deliverable in database

    // Notify client
    await createNotification({
        userId: project.client.clerkId,
        projectId: deliverable.projectId.toString(),
        type: NotificationType.MILESTONE,
        title: 'Deliverable Approved',
        message: `${deliverable.title} has been approved`,
        link: `/dashboard/projects/${deliverable.projectId}/deliverables`,
        sendEmail: true,
    });

    return { success: true };
}
```

### Example 3: Task Assigned

```typescript
// app/actions/tasks.ts
import { createNotification } from '@/app/actions/notifications';
import { NotificationType } from '@/models/Notification';

export async function createTask(data) {
    // ... create task in database

    // If task is assigned, notify assignee
    if (task.assignedTo) {
        await createNotification({
            userId: assignedUserClerkId,
            projectId: task.projectId.toString(),
            type: NotificationType.PROJECT_UPDATE,
            title: 'New Task Assigned',
            message: `You have been assigned: ${task.title}`,
            link: `/dashboard/projects/${task.projectId}/tasks`,
            sendEmail: false, // Don't email for task assignments
        });
    }

    return { success: true, data: task };
}
```

---

## 🎯 Notification Types

Available notification types (from `models/Notification.ts`):

```typescript
enum NotificationType {
    PROJECT_UPDATE = 'project_update',
    MESSAGE = 'message',
    INVOICE = 'invoice',
    MILESTONE = 'milestone',
    GENERAL = 'general',
}
```

---

## 🔌 Pusher Real-time Messaging (Optional)

### Server-Side (Sending Messages)

```typescript
import { sendRealtimeMessage } from '@/lib/services/pusher.service';

// Send message via Pusher
await sendRealtimeMessage(projectId, {
    _id: message._id.toString(),
    sender: 'admin',
    message: 'Hello!',
    createdAt: new Date(),
});
```

### Client-Side (Receiving Messages)

```typescript
'use client';
import Pusher from 'pusher-js';

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

const channel = pusher.subscribe(`project-${projectId}`);

channel.bind('new-message', (data) => {
    // Update UI with new message
    setMessages(prev => [...prev, data]);
});
```

---

## 📧 Email Templates

Pre-built email templates in `lib/services/email.service.ts`:

- `sendInvoiceEmail()` - Invoice notifications
- `sendDeliverableApprovedEmail()` - Approval notifications
- `sendTaskAssignedEmail()` - Task assignments

### Customize Email Templates

Edit the HTML in `/lib/services/email.service.ts` or create React email components in `/emails/` directory.

---

## ✅ Testing

### Test Database Notifications (No config needed)
1. Create an invoice/task/deliverable as admin
2. Check notification bell in dashboard
3. Should see new notification

### Test Toast Notifications (No config needed)
1. Perform any action (create/update/delete)
2. Should see toast popup in top-right

### Test Pusher (Requires PUSHER credentials)
1. Configure Pusher environment variables
2. Open project in two browser windows
3. Send message in one window
4. Should appear instantly in other window

### Test Emails (Requires RESEND_API_KEY)
1. Configure Resend API key
2. Create an invoice with `sendEmail: true`
3. Check recipient's email inbox

---

## 🐛 Troubleshooting

### Notifications not appearing?
✅ Check MongoDB connection
✅ Verify user exists in database
✅ Check browser console for errors

### Pusher not working?
✅ Verify PUSHER env variables are set
✅ Check Pusher dashboard for connection status
✅ Ensure NEXT_PUBLIC_PUSHER_KEY is set (client-side)

### Emails not sending?
✅ Verify RESEND_API_KEY is set
✅ Check Resend dashboard for delivery status
✅ Verify EMAIL_FROM domain is verified in Resend

### Toast not showing?
✅ Ensure `<ToastProvider />` is in root layout
✅ Check that sonner is installed
✅ Verify client component has 'use client' directive

---

## 📖 API Reference

### createNotification(params)

Creates a notification in the database and optionally sends email/Pusher event.

**Parameters:**
- `userId` (string, required) - Clerk user ID
- `projectId` (string, optional) - MongoDB project ID
- `type` (NotificationType, required) - Notification type
- `title` (string, required) - Notification title
- `message` (string, required) - Notification message
- `link` (string, optional) - Link to relevant page
- `sendEmail` (boolean, optional) - Whether to send email
- `emailSubject` (string, optional) - Email subject line

**Returns:** `Promise<{success: boolean; error?: string}>`

---

## 🚀 Next Steps

1. ✅ Configure environment variables for services you want to use
2. ✅ Add notification calls to your existing actions
3. ✅ Customize email templates for your brand
4. ✅ Test notifications end-to-end
5. ✅ Deploy to production!

---

## 📝 Notes

- **Graceful Degradation**: System works even if Pusher/Resend aren't configured
- **Database is Source of Truth**: Notifications always saved to MongoDB
- **Optional Enhancements**: Real-time and email are optional layers
- **Cost**: Pusher and Resend have generous free tiers for startups

---

Need help? Check the code examples in:
- `/lib/services/notification.service.ts` - Core notification logic
- `/lib/services/email.service.ts` - Email templates
- `/lib/services/pusher.service.ts` - Real-time messaging
- `/app/actions/notifications.ts` - Server actions

