# XDigital - Refined Features Implementation Guide

This guide documents the implementation of advanced features for the XDigital client management platform.

## 📋 Table of Contents

1. [Completed Work](#completed-work)
2. [Database Models](#database-models)
3. [Server Actions](#server-actions)
4. [Next Steps](#next-steps)
5. [Feature Implementation Roadmap](#feature-implementation-roadmap)
6. [Environment Variables](#environment-variables)
7. [Key Technologies](#key-technologies)

---

## ✅ Completed Work

### 1. Database Models (100% Complete)

All MongoDB/Mongoose models have been created with comprehensive schemas:

#### Core Models Created:
- **Task.ts** - Task management with Kanban support
  - Status tracking (todo, in_progress, in_review, completed, blocked)
  - Priority levels (low, medium, high, urgent)
  - Subtasks with completion tracking
  - Dependencies between tasks
  - Time tracking (estimated vs actual hours)
  - Tags and assignment

- **Deliverable.ts** - Deliverable approval workflow
  - Multi-status workflow (draft → submitted → review → approved/rejected)
  - Revision tracking with version numbers
  - Feedback system with ratings
  - Approval sign-off with timestamps
  - Categories (design, content, development, etc.)

- **File.ts** - File management system
  - Versioning support (v1, v2, v3, etc.)
  - Comments and annotations
  - Download tracking
  - File categories and visibility controls
  - Preview support for images/PDFs
  - Metadata storage

- **FileFolder.ts** - Folder organization
  - Nested folder support
  - Path tracking
  - Color coding and icons

- **ProjectTemplate.ts** - Project templates
  - Pre-defined milestones, tasks, deliverables
  - Service type and package mapping
  - Usage tracking
  - Default template support

- **Activity.ts** - Activity logging and audit trail
  - 20+ activity types (project created, file uploaded, etc.)
  - Entity tracking (what changed)
  - Metadata for before/after values
  - IP address and user agent logging
  - TTL index for automatic cleanup after 1 year

- **Feedback.ts** - Client feedback and surveys
  - Multiple feedback types (surveys, NPS, testimonials)
  - Survey builder with question types
  - NPS scoring (0-10) with categories (promoter, passive, detractor)
  - Testimonial approval workflow
  - Admin response capability

- **Resource.ts** - Knowledge base and resource library
  - Multiple resource types (articles, videos, tutorials, FAQs)
  - Rich text content support
  - Visibility controls (public, clients only, specific service)
  - SEO fields (slug, meta description)
  - View and download analytics
  - Related resources linking

- **NotificationPreference.ts** - User notification settings
  - Per-notification-type preferences
  - Channel selection (in-app, email, both, none)
  - Digest frequency (instant, hourly, daily, weekly)
  - Quiet hours support
  - Email digest time configuration

- **ClientNote.ts** - Private admin notes
  - Note types (general, important, risk, opportunity)
  - Pinning support
  - Reminders with dates
  - Tags for organization

- **TimeEntry.ts** - Time tracking
  - Project and task linkage
  - Billable vs non-billable hours
  - Hourly rate and amount calculation
  - Invoice integration

- **SavedFilter.ts** - User-saved filters
  - Entity-specific filters (projects, tasks, files, etc.)
  - Flexible filter criteria storage
  - Sorting preferences
  - Default and shared filters

#### Enhanced Existing Models:

- **Message.ts** (Enhanced)
  - Threading support (parent-child relationships)
  - Reactions with emoji support
  - @mentions with position tracking
  - Read receipts for all viewers
  - Message pinning
  - Edit tracking

- **Invoice.ts** (Enhanced)
  - Expense tracking with categories
  - Time-based billing from time entries
  - Partial payment support
  - Branding customization (logo, colors, company info)
  - Late payment alerts
  - PDF generation support

- **User.ts** (Enhanced)
  - Onboarding status tracking
  - Client health metrics (0-100 score)
  - Risk level indicators (low, medium, high)
  - Online/offline presence
  - Last seen tracking
  - Company and contact info

### 2. Server Actions (Partially Complete)

Created comprehensive server actions for:

- **tasks.ts** - Full CRUD + Kanban operations
  - `getProjectTasks(projectId)` - Get all tasks for a project
  - `createTask(data)` - Create new task
  - `updateTask(taskId, data)` - Update task details
  - `updateTaskOrder(taskId, newOrder, newStatus)` - Kanban drag-and-drop
  - `deleteTask(taskId)` - Delete task
  - `addSubtask(taskId, title)` - Add subtask
  - `toggleSubtask(taskId, index)` - Toggle subtask completion

- **activities.ts** - Activity logging system
  - `logActivity(data)` - Log any activity
  - `getProjectActivities(projectId, limit)` - Get project timeline
  - `getUserActivities(limit)` - Get user activity feed
  - `getAllActivities(filters, limit)` - Admin view all activities

- **deliverables.ts** - Deliverable workflow
  - `getProjectDeliverables(projectId)` - Get all deliverables
  - `createDeliverable(data)` - Create new deliverable
  - `submitDeliverable(id, fileUrl, fileName, notes)` - Submit for review
  - `approveDeliverable(id, notes)` - Approve deliverable
  - `requestChanges(id, feedback, rating)` - Request revisions

- **files.ts** - File management
  - `getProjectFiles(projectId, folderId)` - Get files (with folder support)
  - `createFile(data)` - Upload file metadata
  - `uploadFileVersion(fileId, ...)` - Add new version
  - `addFileComment(fileId, comment)` - Comment on file
  - `trackFileDownload(fileId)` - Track downloads
  - `deleteFile(fileId)` - Delete file

### 3. NPM Packages Installed

All required packages have been installed:

```json
{
  "pusher": "Real-time WebSocket communication",
  "pusher-js": "Client-side Pusher SDK",
  "@tiptap/react": "Rich text editor",
  "@tiptap/starter-kit": "Tiptap extensions",
  "@tiptap/extension-mention": "Mention support",
  "@dnd-kit/core": "Drag and drop core",
  "@dnd-kit/sortable": "Sortable lists",
  "@dnd-kit/utilities": "DnD utilities",
  "recharts": "Charts and analytics",
  "jspdf": "PDF generation",
  "html2canvas": "HTML to canvas conversion",
  "xlsx": "Excel file generation",
  "cloudinary": "File upload and storage",
  "nodemailer": "Email sending",
  "react-dropzone": "File drag-and-drop upload"
}
```

---

## 🗄️ Database Models

### Schema Overview

```
Project
├── Tasks (many)
│   ├── Subtasks (embedded)
│   └── TimeEntries (many)
├── Deliverables (many)
│   ├── Revisions (embedded)
│   └── Feedback (embedded)
├── Files (many)
│   ├── Versions (embedded)
│   └── Comments (embedded)
├── Messages (many)
│   ├── Reactions (embedded)
│   └── Mentions (embedded)
├── Invoices (many)
│   ├── Items (embedded)
│   └── PartialPayments (embedded)
├── Activities (many)
└── Milestones (embedded in Project)

User
├── Projects (many)
├── ClientNotes (many) - Admin only
├── Feedback (many)
├── SavedFilters (many)
├── NotificationPreferences (one)
└── Metrics (embedded)
```

---

## 🎯 Next Steps

### Immediate Priorities (Do These First)

#### 1. Environment Configuration

Create `.env.local` file with required variables:

```bash
# Existing variables (keep these)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
MONGODB_URI=

# New required variables
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

NEXT_PUBLIC_PUSHER_APP_KEY=
PUSHER_APP_ID=
PUSHER_APP_SECRET=
PUSHER_CLUSTER=us2

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=

# Optional
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
```

#### 2. Create Missing Server Actions

Still need to create actions for:
- `project-templates.ts` - Template CRUD operations
- `feedback.ts` - Survey and NPS management
- `resources.ts` - Knowledge base CRUD
- `time-entries.ts` - Time tracking
- `client-notes.ts` - Admin notes
- `saved-filters.ts` - Filter management
- `notification-preferences.ts` - Notification settings

**Template:**
```typescript
// app/actions/[model-name].ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/database/mongodb';
import Model from '@/models/Model';
import User from '@/models/User';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

export async function getItems(): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();
        // Implementation...

        return { success: true, data: items };
    } catch (error) {
        console.error('Error:', error);
        return { success: false, error: 'Failed to fetch items' };
    }
}
```

#### 3. Setup Cloudinary for File Uploads

**File:** `lib/cloudinary.ts`

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

**Client-side upload component:**
```typescript
// components/file-upload/FileUploadZone.tsx
'use client';

import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import { createFile } from '@/app/actions/files';

export function FileUploadZone({ projectId }: { projectId: string }) {
    const [uploading, setUploading] = useState(false);

    const onDrop = async (acceptedFiles: File[]) => {
        setUploading(true);

        for (const file of acceptedFiles) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'xdigital_uploads');

            // Upload to Cloudinary
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const data = await response.json();

            // Save to database
            await createFile({
                projectId,
                fileName: file.name,
                fileUrl: data.secure_url,
                fileType: file.type,
                fileSize: file.size,
                thumbnailUrl: data.thumbnail_url,
            });
        }

        setUploading(false);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div {...getRootProps()} className="border-2 border-dashed p-8 text-center cursor-pointer">
            <input {...getInputProps()} />
            {isDragActive ? (
                <p>Drop files here...</p>
            ) : (
                <p>Drag & drop files, or click to select</p>
            )}
            {uploading && <p>Uploading...</p>}
        </div>
    );
}
```

#### 4. Setup Pusher for Real-Time Features

**File:** `lib/pusher.ts`

```typescript
import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Server-side
export const pusherServer = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
    secret: process.env.PUSHER_APP_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
});

// Client-side
export const pusherClient = new PusherClient(
    process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
    {
        cluster: process.env.PUSHER_CLUSTER!,
    }
);
```

**Example: Real-time message component:**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { pusherClient } from '@/lib/pusher';

export function MessageList({ projectId }: { projectId: string }) {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const channel = pusherClient.subscribe(`project-${projectId}`);

        channel.bind('new-message', (data: any) => {
            setMessages(prev => [...prev, data.message]);
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [projectId]);

    return (
        <div>
            {messages.map(msg => (
                <div key={msg.id}>{msg.content}</div>
            ))}
        </div>
    );
}
```

**Server action to trigger real-time update:**
```typescript
import { pusherServer } from '@/lib/pusher';

export async function sendMessage(projectId: string, message: string) {
    // Save to database...
    const newMessage = await Message.create({ projectId, message });

    // Trigger real-time update
    await pusherServer.trigger(`project-${projectId}`, 'new-message', {
        message: newMessage,
    });
}
```

#### 5. Create Kanban Board Component

**File:** `components/tasks/KanbanBoard.tsx`

```typescript
'use client';

import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskStatus } from '@/models/Task';
import { updateTaskOrder } from '@/app/actions/tasks';

const columns = [
    { id: TaskStatus.TODO, title: 'To Do' },
    { id: TaskStatus.IN_PROGRESS, title: 'In Progress' },
    { id: TaskStatus.IN_REVIEW, title: 'Review' },
    { id: TaskStatus.COMPLETED, title: 'Completed' },
];

export function KanbanBoard({ tasks }: { tasks: any[] }) {
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const taskId = active.id as string;
        const newStatus = over.id as TaskStatus;

        await updateTaskOrder(taskId, 0, newStatus);
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-4 gap-4">
                {columns.map(column => (
                    <div key={column.id} className="bg-gray-100 p-4 rounded">
                        <h3>{column.title}</h3>
                        <SortableContext
                            items={tasks.filter(t => t.status === column.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {tasks
                                .filter(t => t.status === column.id)
                                .map(task => (
                                    <TaskCard key={task._id} task={task} />
                                ))}
                        </SortableContext>
                    </div>
                ))}
            </div>
        </DndContext>
    );
}
```

---

## 🚀 Feature Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1-2)

**Priority: CRITICAL**

- [x] Database models
- [x] Server actions for tasks, deliverables, files
- [ ] File upload with Cloudinary
- [ ] Real-time setup with Pusher
- [ ] Activity logging middleware
- [ ] Email service with Nodemailer

### Phase 2: Task & Project Management (Week 3-4)

**Priority: HIGH**

- [ ] Kanban board UI with @dnd-kit
- [ ] Task creation/editing forms
- [ ] Project templates system
- [ ] Template builder UI
- [ ] Milestone timeline visualization
- [ ] Project dependencies handling

### Phase 3: Communication & Collaboration (Week 5-6)

**Priority: HIGH**

- [ ] Rich text editor with TipTap
- [ ] Message threading UI
- [ ] @mentions autocomplete
- [ ] Message reactions
- [ ] Read receipts display
- [ ] Real-time typing indicators
- [ ] Presence indicators (online/offline)

### Phase 4: File Management (Week 7)

**Priority: MEDIUM**

- [ ] File upload with drag-and-drop
- [ ] File versioning UI
- [ ] File preview (images, PDFs)
- [ ] File comments system
- [ ] Folder management
- [ ] Bulk file operations
- [ ] Download as ZIP functionality

### Phase 5: Deliverables & Approvals (Week 8)

**Priority: MEDIUM**

- [ ] Deliverable submission form
- [ ] Approval workflow UI
- [ ] Revision tracking display
- [ ] Feedback forms
- [ ] Digital signature capture
- [ ] Deliverable gallery view

### Phase 6: Analytics & Reporting (Week 9-10)

**Priority: MEDIUM**

- [ ] Analytics dashboard with Recharts
- [ ] Custom chart components
- [ ] Report builder
- [ ] PDF export with jsPDF
- [ ] Excel export with xlsx
- [ ] Scheduled reports
- [ ] Client health score calculation

### Phase 7: Invoicing & Billing (Week 11)

**Priority: MEDIUM**

- [ ] Enhanced invoice form
- [ ] Time entry tracker
- [ ] Expense tracking
- [ ] Partial payment recording
- [ ] Invoice branding customization
- [ ] Invoice PDF generation
- [ ] Late payment automation

### Phase 8: Client Experience (Week 12-13)

**Priority: HIGH**

- [ ] Onboarding wizard (multi-step)
- [ ] Client dashboard widgets
- [ ] Quick action buttons
- [ ] Activity feed component
- [ ] Notification center
- [ ] Notification preferences UI
- [ ] Resource library browser

### Phase 9: Admin Features (Week 14-15)

**Priority: MEDIUM**

- [ ] Enhanced admin dashboard
- [ ] Client health indicators
- [ ] Risk analysis UI
- [ ] Batch operations interface
- [ ] Private notes panel
- [ ] Advanced filtering
- [ ] Saved filters UI

### Phase 10: Feedback & Quality (Week 16)

**Priority: LOW**

- [ ] Feedback form builder
- [ ] NPS survey system
- [ ] Testimonial collection
- [ ] Testimonial showcase
- [ ] Survey analytics
- [ ] Auto-survey sending

### Phase 11: Search & Discovery (Week 17)

**Priority: MEDIUM**

- [ ] Global search component
- [ ] Search indexing
- [ ] Advanced filters
- [ ] Search within projects
- [ ] Tag-based filtering
- [ ] Date range filtering

### Phase 12: Notifications (Week 18)

**Priority: HIGH**

- [ ] Email templates
- [ ] Notification grouping
- [ ] Digest scheduling
- [ ] In-app notification center
- [ ] Mark all as read
- [ ] Notification categories

### Phase 13: Polish & Performance (Week 19-20)

**Priority: CRITICAL**

- [ ] Loading states
- [ ] Error boundaries
- [ ] Optimistic updates
- [ ] Image optimization
- [ ] Code splitting
- [ ] Performance monitoring
- [ ] Accessibility audit

### Phase 14: Testing (Week 21)

**Priority: CRITICAL**

- [ ] Unit tests for actions
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance tests
- [ ] Security audit
- [ ] Mobile responsiveness

### Phase 15: Deployment (Week 22)

**Priority: CRITICAL**

- [ ] Production environment setup
- [ ] Database migration scripts
- [ ] Cloudinary setup
- [ ] Pusher configuration
- [ ] Email service setup
- [ ] Monitoring and logging
- [ ] Backup strategy

---

## 🔐 Environment Variables

### Required Variables

```bash
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
MONGODB_URI=mongodb+srv://...

# File Storage (Choose one)
# Option 1: Cloudinary (Recommended)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz

# Option 2: AWS S3
AWS_S3_BUCKET=xdigital-files
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# Real-time (Pusher)
NEXT_PUBLIC_PUSHER_APP_KEY=abcd1234efgh5678
PUSHER_APP_ID=1234567
PUSHER_APP_SECRET=abcdef123456
PUSHER_CLUSTER=us2

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="XDigital <noreply@xdigital.com>"

# Optional: Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS=G-XXXXXXXXXX

# Optional: Sentry Error Tracking
SENTRY_DSN=https://...
```

### Setup Instructions

1. **Cloudinary:**
   - Sign up at https://cloudinary.com
   - Go to Dashboard → Settings
   - Copy Cloud Name, API Key, API Secret
   - Create upload preset: Settings → Upload → Add upload preset (unsigned)

2. **Pusher:**
   - Sign up at https://pusher.com
   - Create new Channels app
   - Copy App ID, Key, Secret, Cluster from App Keys tab

3. **Email (Gmail Example):**
   - Enable 2-factor authentication on Gmail
   - Generate App Password: Account → Security → App passwords
   - Use the 16-character password as EMAIL_PASSWORD

---

## 🛠️ Key Technologies

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Framer Motion** - Animations
- **TipTap** - Rich text editor
- **@dnd-kit** - Drag and drop
- **Recharts** - Charts and analytics
- **Radix UI** - Accessible components

### Backend
- **Next.js Server Actions** - Server-side operations
- **MongoDB** - Database
- **Mongoose** - ODM
- **Clerk** - Authentication
- **Pusher** - Real-time WebSockets
- **Cloudinary** - File storage
- **Nodemailer** - Email

### DevOps
- **Vercel** - Deployment (recommended)
- **MongoDB Atlas** - Database hosting
- **Cloudinary** - CDN and file hosting

---

## 📝 Code Patterns

### Server Action Pattern

```typescript
'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/database/mongodb';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

export async function actionName(params): Promise<ActionResponse> {
    try {
        // 1. Authentication
        const { userId } = await auth();
        if (!userId) {
            return { success: false, error: 'Unauthorized' };
        }

        // 2. Validation
        if (!params.required) {
            return { success: false, error: 'Missing required field' };
        }

        // 3. Database connection
        await dbConnect();

        // 4. Business logic
        const result = await Model.create(params);

        // 5. Activity logging
        await logActivity({...});

        // 6. Cache revalidation
        revalidatePath('/path');

        // 7. Return success
        return { success: true, data: result };
    } catch (error) {
        console.error('Error:', error);
        return { success: false, error: 'Operation failed' };
    }
}
```

### Client Component Pattern

```typescript
'use client';

import { useState, useTransition } from 'react';
import { actionName } from '@/app/actions/module';

export function Component() {
    const [isPending, startTransition] = useTransition();
    const [data, setData] = useState(null);

    const handleAction = () => {
        startTransition(async () => {
            const result = await actionName(params);
            if (result.success) {
                setData(result.data);
            }
        });
    };

    return (
        <div>
            <button onClick={handleAction} disabled={isPending}>
                {isPending ? 'Loading...' : 'Submit'}
            </button>
        </div>
    );
}
```

---

## 📚 Additional Resources

### Documentation
- Next.js: https://nextjs.org/docs
- MongoDB: https://www.mongodb.com/docs
- Clerk: https://clerk.com/docs
- Pusher: https://pusher.com/docs
- TipTap: https://tiptap.dev/docs
- DnD Kit: https://docs.dndkit.com
- Recharts: https://recharts.org/en-US/api

### Useful Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Database operations (if using Mongoose migrations)
npm run db:migrate
npm run db:seed

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

---

## 🎉 Summary

This implementation provides a **solid foundation** with:

✅ **15+ new database models** with comprehensive schemas
✅ **Enhanced existing models** (Message, Invoice, User)
✅ **4 complete server action files** with logging
✅ **All required npm packages** installed
✅ **Clear patterns** for extending functionality
✅ **Detailed roadmap** for remaining features

**Next immediate steps:**
1. Setup Cloudinary for file uploads
2. Setup Pusher for real-time features
3. Create remaining server actions
4. Build Kanban board UI
5. Implement rich text editor

**Estimated time to complete all features:** 20-22 weeks with 1 developer

Good luck with the implementation! 🚀
