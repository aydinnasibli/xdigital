# XDigital - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Features](#features)
4. [Architecture](#architecture)
5. [Getting Started](#getting-started)
6. [Project Structure](#project-structure)
7. [Database Schema](#database-schema)
8. [API Reference](#api-reference)
9. [Authentication & Authorization](#authentication--authorization)
10. [Real-time Features](#real-time-features)
11. [Deployment](#deployment)
12. [Development Guidelines](#development-guidelines)

---

## Project Overview

**XDigital** is a full-stack SaaS platform designed for digital agencies to manage client projects across web development, social media marketing (SMM), and digital solutions services. The platform provides a comprehensive project management solution with real-time collaboration, task tracking, file management, and analytics.

### Key Objectives
- Enable digital agencies to manage multiple client projects from a single platform
- Provide clients with a transparent portal to track project progress
- Streamline workflows with templates, automated notifications, and real-time updates
- Deliver insights through integrated analytics and reporting

### Target Users
- **Admins**: Agency staff managing multiple client projects
- **Clients**: Business owners and stakeholders tracking their projects

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router with Turbopack)
- **React**: 19.2.0
- **Styling**: Tailwind CSS 4
- **UI Components**:
  - Radix UI (headless components)
  - Lucide React (icons)
  - Shadcn/ui component library
- **Animations**:
  - Framer Motion
  - GSAP
  - Three.js + React Three Fiber (3D graphics)
- **Data Visualization**: Recharts
- **Drag & Drop**: @dnd-kit
- **Forms**: react-hook-form
- **Notifications**: Sonner (toast)

### Backend
- **Runtime**: Node.js (Next.js API Routes & Server Actions)
- **Database**: MongoDB with Mongoose 8.20.0
- **Authentication**: Clerk v6.35.2
- **Real-time**: Pusher (server v5.2.0, client v8.4.0)
- **Email**: Resend v6.4.2 with React Email
- **CMS**: Sanity v4.15.0
- **File Storage**: Cloudinary v2.8.0
- **Monitoring**: Sentry v10.25.0
- **Analytics**: Google Analytics Data API v5.2.1

### Development Tools
- **Language**: TypeScript 5
- **Linting**: ESLint 9
- **Package Manager**: npm/yarn
- **Version Control**: Git

---

## Features

### 1. User Management
- **Authentication**: Clerk-based with social login and email/password
- **Roles**: Admin and User (Client) roles with granular permissions
- **Profiles**: Company info, position, contact details
- **Onboarding**: Guided onboarding workflow for new users
- **Status Tracking**: Online/offline status and last seen
- **Health Scores**: Client engagement and risk assessment

### 2. Project Management
- **Service Types**:
  - Web Development
  - Social Media Marketing
  - Digital Solutions
- **Package Tiers**: Basic, Standard, Premium, Enterprise
- **Status Tracking**: Pending, In Progress, Review, Completed, On Hold, Cancelled
- **Customization**: Brand colors, logos, contact info, social media
- **Templates**: Pre-configured project templates with milestones
- **Deployment Tracking**: Vercel integration and deployment URLs
- **Analytics Integration**: Google Analytics for performance monitoring

### 3. Task Management
- **Kanban Board**: Drag-and-drop task organization
- **Priorities**: Low, Medium, High, Urgent
- **Statuses**: To Do, In Progress, In Review, Completed, Blocked
- **Subtasks**: Nested task completion tracking
- **Dependencies**: Task dependency management
- **Time Tracking**: Estimated vs actual hours
- **Assignments**: Multi-user task assignment with notifications
- **Tags**: Flexible categorization

### 4. Milestone Tracking
- Project milestones with due dates
- Completion tracking and timeline visualization
- Progress indicators

### 5. Real-time Messaging
- **Project Channels**: Dedicated messaging per project
- **Pusher Integration**: WebSocket-based real-time updates
- **Threading**: Parent-child message replies
- **Reactions**: Emoji reactions to messages
- **Mentions**: @user mentions with notifications
- **Pinning**: Pin important messages
- **Edit History**: Track message edits
- **Typing Indicators**: Real-time typing status
- **Read Receipts**: Message read tracking

### 6. File Management
- **Cloudinary Storage**: Scalable file uploads with CDN
- **Folder Organization**: Nested folder structure
- **Version Control**: Complete file versioning system
- **Categories**: Project Asset, Brand Asset, Document, Image, Video, Design, Code
- **Visibility Controls**: Private, Client, Public
- **Comments**: File-level commenting
- **Previews**: Automatic preview generation for images
- **Download Tracking**: Monitor file access

### 7. Notifications System
- **Multi-Channel**: In-app and email notifications
- **Preferences**: Granular control per notification type
- **Types**: Project Updates, Messages, Milestones, General
- **Digest Options**: Instant, Hourly, Daily, Weekly
- **Quiet Hours**: Schedule notification-free periods
- **Channel Selection**: In-app, Email, Both, or None

### 8. Analytics & Reporting
- **Google Analytics**: Website performance metrics
- **Custom Metrics**: Project-specific tracking
- **Performance Monitoring**: Speed and uptime tracking
- **PDF Reports**: Automated report generation
- **SEO Tracking**: Search engine performance

### 9. Activity Feed
- **Comprehensive Logging**: All project activities tracked
- **Activity Types**: Project updates, tasks, files, messages, user actions
- **Auto-Cleanup**: TTL index with 1-year retention
- **Detailed Metadata**: IP addresses and user agents
- **Audit Trail**: Complete history of changes

### 10. Resource Library
- **Knowledge Base**: Centralized resources for clients
- **Types**: Articles, Videos, Tutorials, FAQs, Documents, Templates, Brand Assets
- **Categories**: Web Development, Social Media, Digital Solutions, Branding, General
- **Visibility**: Public and private resources
- **Featured**: Highlight important resources
- **Analytics**: View and download tracking
- **SEO**: Slug-based URLs

### 11. Admin Features
- **Dashboard**: Overview of all clients and projects
- **Client Notes**: General, Important, Risk, Opportunity, Reminder
- **Reminders**: Priority-based reminders with email notifications
- **Template Management**: Create and manage project templates
- **Resource Management**: Control knowledge base content
- **Payment Tracking**: Monitor client payments
- **Global Search**: Search across all entities
- **Activity Monitoring**: System-wide activity feed

### 12. Marketing Site (Sanity CMS)
- **Pricing Pages**: Manage pricing packages
- **FAQs**: Frequently asked questions
- **Portfolio**: Project showcases
- **Feature Comparison**: Service tier comparisons

---

## Architecture

### Application Pattern
**Monolithic Next.js Application** with:
- App Router for file-based routing
- Server Components for improved performance
- Server Actions for backend logic
- API Routes for webhooks and file uploads
- Real-time updates via Pusher WebSocket

### Data Flow

```
┌─────────────┐
│   Client    │
│   (Browser) │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│   Next.js App Router    │
│   (Server Components)   │
└──────┬──────────────────┘
       │
       ├─────────────┬──────────────┬─────────────┐
       ▼             ▼              ▼             ▼
┌─────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│   Server    │ │   API    │ │  Pusher  │ │   Email  │
│   Actions   │ │  Routes  │ │ (Real-   │ │ (Resend) │
│             │ │          │ │  time)   │ │          │
└──────┬──────┘ └────┬─────┘ └──────────┘ └──────────┘
       │             │
       ▼             ▼
┌─────────────────────────┐
│   Mongoose Models       │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│   MongoDB Database      │
└─────────────────────────┘
```

### Authentication Flow

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│   Clerk Auth        │
│   (Sign In/Up)      │
└──────┬──────────────┘
       │
       ├──────────────┐
       ▼              ▼
┌─────────────┐ ┌──────────────┐
│   Webhook   │ │   JWT Token  │
│   Handler   │ │   Generated  │
└──────┬──────┘ └──────┬───────┘
       │                │
       ▼                │
┌─────────────┐         │
│   MongoDB   │         │
│   User Sync │         │
└─────────────┘         │
                        │
       ┌────────────────┘
       │
       ▼
┌──────────────────────┐
│   Protected Routes   │
│   & Server Actions   │
└──────────────────────┘
```

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB database (local or Atlas)
- Clerk account
- Pusher account
- Resend account
- Cloudinary account
- Sanity account (optional, for CMS)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd xdigital
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/xdigital

   # Authentication (Clerk)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   CLERK_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

   # Real-time (Pusher)
   PUSHER_APP_ID=your-app-id
   PUSHER_KEY=your-key
   NEXT_PUBLIC_PUSHER_KEY=your-public-key
   PUSHER_SECRET=your-secret
   PUSHER_CLUSTER=us2

   # Email (Resend)
   RESEND_API_KEY=re_...
   EMAIL_FROM=noreply@yourdomain.com

   # File Storage (Cloudinary)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-preset

   # CMS (Sanity)
   NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_TOKEN=sk...

   # Monitoring (Sentry)
   SENTRY_ORG=your-org
   SENTRY_PROJECT=your-project
   SENTRY_AUTH_TOKEN=your-token
   NEXT_PUBLIC_SENTRY_DSN=https://...

   # Analytics
   GOOGLE_ANALYTICS_PROPERTY_ID=your-property-id
   GOOGLE_ANALYTICS_CREDENTIALS={"type":"service_account",...}

   # Application
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Set up Clerk webhook**

   In your Clerk dashboard:
   - Go to Webhooks
   - Add endpoint: `http://localhost:3000/api/webhooks/clerk`
   - Subscribe to events: `user.created`, `user.updated`, `user.deleted`
   - Copy the webhook secret to `CLERK_WEBHOOK_SECRET`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Main app: http://localhost:3000
   - Sanity Studio: http://localhost:3000/studio

### First-Time Setup

1. **Create an admin user**
   - Sign up through the application
   - In Clerk dashboard, set the user's `publicMetadata`:
     ```json
     {
       "role": "admin"
     }
     ```

2. **Seed initial data** (optional)
   - Create project templates via admin dashboard
   - Add resources to the knowledge base
   - Configure notification preferences

---

## Project Structure

```
xdigital/
├── app/                          # Next.js App Router
│   ├── (root)/                   # Marketing site (public)
│   │   ├── page.tsx             # Home page
│   │   ├── about/               # About page
│   │   ├── web/                 # Web dev service
│   │   ├── socialmedia/         # SMM service
│   │   ├── digitalsolutions/    # Digital solutions
│   │   ├── sign-in/             # Login page
│   │   └── sign-up/             # Registration
│   ├── dashboard/               # Client dashboard (protected)
│   │   ├── page.tsx            # Dashboard home
│   │   ├── projects/           # Client projects
│   │   ├── notifications/      # Notifications
│   │   ├── settings/           # User settings
│   │   ├── resources/          # Knowledge base
│   │   ├── search/             # Global search
│   │   ├── payments/           # Payment history
│   │   ├── monitoring/         # Performance
│   │   └── onboarding/         # Onboarding flow
│   ├── admin/                   # Admin dashboard (protected)
│   │   ├── dashboard/          # Admin overview
│   │   ├── projects/           # Project management
│   │   ├── clients/            # Client management
│   │   ├── messages/           # All messages
│   │   ├── templates/          # Project templates
│   │   ├── resources/          # Resource management
│   │   ├── reminders/          # Reminders
│   │   ├── activities/         # Activity log
│   │   ├── analytics/          # Analytics
│   │   └── payments/           # Payment tracking
│   ├── actions/                 # Server Actions (backend logic)
│   │   ├── projects.ts         # Project operations
│   │   ├── messages.ts         # Messaging
│   │   ├── files.ts            # File operations
│   │   ├── tasks.ts            # Task management
│   │   ├── notifications.ts    # Notifications
│   │   ├── analytics.ts        # Analytics
│   │   ├── search.ts           # Search
│   │   ├── activities.ts       # Activity logging
│   │   └── admin/              # Admin-specific
│   ├── api/                     # API Routes
│   │   ├── webhooks/clerk/     # Clerk webhook
│   │   └── upload/             # File upload
│   ├── studio/                  # Sanity CMS
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Global styles
│   └── error.tsx               # Error boundary
├── models/                      # Mongoose schemas
│   ├── User.ts                 # User model
│   ├── Project.ts              # Project model
│   ├── Task.ts                 # Task model
│   ├── Message.ts              # Message model
│   ├── File.ts                 # File model
│   ├── FileFolder.ts           # Folder model
│   ├── Notification.ts         # Notification model
│   ├── Activity.ts             # Activity log
│   ├── Analytics.ts            # Analytics data
│   ├── ProjectTemplate.ts      # Templates
│   ├── Resource.ts             # Resources
│   ├── ClientNote.ts           # Client notes
│   ├── Reminder.ts             # Reminders
│   └── ...
├── components/                  # React components
│   ├── ui/                     # Base UI components
│   ├── dashboard/              # Dashboard components
│   ├── admin/                  # Admin components
│   ├── projects/               # Project components
│   ├── tasks/                  # Task components
│   ├── files/                  # File components
│   ├── notifications/          # Notification components
│   ├── analytics/              # Analytics components
│   ├── providers/              # Context providers
│   └── ...
├── lib/                         # Utilities and services
│   ├── database/               # Database connection
│   ├── auth/                   # Auth utilities
│   ├── services/               # Business logic
│   │   ├── email.service.ts
│   │   ├── pusher.service.ts
│   │   ├── notification.service.ts
│   │   ├── analytics.service.ts
│   │   ├── seo.service.ts
│   │   ├── performance.service.ts
│   │   └── pdf-report.service.ts
│   ├── hooks/                  # Custom hooks
│   ├── utils/                  # Utility functions
│   └── ...
├── sanity/                      # Sanity CMS config
│   ├── schemaTypes/            # Content schemas
│   └── lib/                    # Sanity client
├── types/                       # TypeScript types
├── public/                      # Static assets
├── next.config.ts              # Next.js config
├── sanity.config.ts            # Sanity config
├── tailwind.config.ts          # Tailwind config
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies
```

---

## Database Schema

### User Collection
```typescript
{
  clerkId: string              // Unique Clerk user ID
  email: string                // User email (unique)
  firstName?: string
  lastName?: string
  userName?: string
  imageUrl?: string            // Profile image
  role: 'user' | 'admin'       // User role
  phone?: string
  company?: string
  position?: string
  website?: string
  onboardingStatus: string     // Onboarding state
  onboardingCompletedAt?: Date
  metrics?: {                  // User metrics
    totalProjects: number
    activeProjects: number
    completedProjects: number
    totalRevenue: number
    lastActivityDate?: Date
    lastLoginDate?: Date
    healthScore: number        // 0-100
    riskLevel: 'low' | 'medium' | 'high'
  }
  isActive: boolean            // Account status
  isOnline: boolean            // Online status
  lastSeenAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Project Collection
```typescript
{
  userId: ObjectId             // Reference to User
  clerkUserId: string
  projectName: string
  projectDescription: string
  serviceType: string          // web_development | social_media_marketing | digital_solutions
  package: object              // Package details (tier-specific)
  status: string               // pending | in_progress | review | completed | on_hold | cancelled
  templateId?: ObjectId        // Template reference
  deploymentUrl?: string       // Production URL
  vercelProjectId?: string     // Vercel integration
  googleAnalyticsPropertyId?: string
  customization?: {
    businessName?: string
    industry?: string
    brandColors?: {
      primary: string
      secondary: string
      accent: string
    }
    logoUrl?: string
    contactInfo?: {
      email: string
      phone: string
      address: string
    }
    socialMedia?: {
      facebook: string
      twitter: string
      instagram: string
      linkedin: string
    }
    specialRequirements?: string
  }
  timeline?: {
    startDate?: Date
    estimatedCompletion?: Date
    completedDate?: Date
  }
  milestones?: [{
    title: string
    description?: string
    dueDate?: Date
    completed: boolean
    completedDate?: Date
  }]
  createdAt: Date
  updatedAt: Date
}
```

### Task Collection
```typescript
{
  projectId: ObjectId          // Reference to Project
  title: string
  description?: string
  status: string               // todo | in_progress | in_review | completed | blocked
  priority: string             // low | medium | high | urgent
  assignedTo?: ObjectId        // Reference to User
  assignedBy?: ObjectId
  dueDate?: Date
  estimatedHours?: number
  actualHours?: number
  tags?: string[]
  subtasks?: [{
    title: string
    completed: boolean
    completedDate?: Date
    completedBy?: ObjectId
  }]
  dependencies?: ObjectId[]    // Task dependencies
  milestoneId?: ObjectId       // Associated milestone
  order: number                // For Kanban ordering
  completedDate?: Date
  completedBy?: ObjectId
  createdBy: ObjectId
  createdAt: Date
  updatedAt: Date
}
```

### Message Collection
```typescript
{
  projectId: ObjectId          // Reference to Project
  userId: ObjectId             // Reference to User
  clerkUserId: string
  sender: 'client' | 'admin'
  message: string              // Rendered message
  messageRaw?: string          // Original raw message
  parentMessageId?: ObjectId   // For threading
  threadReplies?: ObjectId[]   // Reply IDs
  reactions?: [{
    emoji: string
    userId: ObjectId
    userName: string
    createdAt: Date
  }]
  mentions?: [{
    userId: ObjectId
    userName: string
    position: number           // Position in message
  }]
  isPinned: boolean
  pinnedAt?: Date
  pinnedBy?: ObjectId
  isEdited: boolean
  editedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### File Collection
```typescript
{
  projectId: ObjectId          // Reference to Project
  folderId?: ObjectId          // Reference to FileFolder
  fileName: string
  fileUrl: string              // Cloudinary URL
  fileType: string             // MIME type
  fileSize: number             // Bytes
  category: string             // project_asset | brand_asset | document | etc.
  visibility: string           // private | client | public
  description?: string
  tags?: string[]
  currentVersion: number
  versions: [{                 // Version history
    versionNumber: number
    fileUrl: string
    fileName: string
    fileSize: number
    uploadedBy: ObjectId
    uploadedAt: Date
    notes?: string
  }]
  comments: [{
    userId: ObjectId
    userName: string
    userImageUrl?: string
    comment: string
    createdAt: Date
    updatedAt?: Date
  }]
  isPreviewable: boolean
  previewUrl?: string
  thumbnailUrl?: string
  metadata?: object            // File-specific metadata
  uploadedBy: ObjectId
  downloadCount: number
  lastDownloadedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Notification Collection
```typescript
{
  userId: ObjectId             // Reference to User
  clerkUserId: string
  projectId?: ObjectId         // Optional project reference
  type: string                 // project_update | message | milestone | general
  title: string
  message: string
  isRead: boolean
  readAt?: Date
  link?: string                // Link to related resource
  createdAt: Date
  updatedAt: Date
}
```

### Activity Collection
```typescript
{
  type: string                 // Activity type enum
  entityType: string           // project | task | milestone | file | message | user
  entityId?: ObjectId          // Reference to entity
  projectId?: ObjectId         // Optional project reference
  userId: ObjectId             // Who performed the action
  userName: string
  userImageUrl?: string
  title: string                // Activity title
  description?: string         // Detailed description
  metadata?: object            // Additional context (oldValue, newValue, etc.)
  ipAddress?: string
  userAgent?: string
  createdAt: Date              // TTL index: auto-delete after 1 year
}
```

### Other Collections
- **FileFolder**: Nested folder structure
- **NotificationPreference**: User notification settings
- **Analytics**: Custom metrics and performance data
- **ProjectTemplate**: Reusable project templates
- **Resource**: Knowledge base content
- **ClientNote**: Admin notes about clients
- **Reminder**: Admin reminders
- **ReminderEmailLog**: Email tracking

---

## API Reference

### Server Actions (Primary API)

Server Actions are the primary way to interact with the backend. They are located in `/app/actions/`.

#### Projects
```typescript
// Get all projects for current user
getProjects(): Promise<Project[]>

// Get single project
getProject(projectId: string): Promise<Project>

// Create new project
createProject(formData: ProjectFormData): Promise<Project>

// Update project
updateProject(projectId: string, formData: Partial<ProjectFormData>): Promise<Project>

// Delete project
deleteProject(projectId: string): Promise<void>

// Get project statistics
getProjectStats(): Promise<ProjectStats>

// Update deployment info (admin only)
updateProjectDeployment(projectId: string, deploymentData: DeploymentData): Promise<Project>
```

#### Messages
```typescript
// Get messages for a project
getMessages(projectId: string): Promise<Message[]>

// Send a message
sendMessage(projectId: string, message: string, parentMessageId?: string): Promise<Message>

// Edit message
editMessage(messageId: string, newMessage: string): Promise<Message>

// Delete message
deleteMessage(messageId: string): Promise<void>

// Pin/unpin message
togglePinMessage(messageId: string): Promise<Message>

// Add reaction
addReaction(messageId: string, emoji: string): Promise<Message>

// Remove reaction
removeReaction(messageId: string, emoji: string): Promise<Message>
```

#### Tasks
```typescript
// Get tasks for a project
getTasks(projectId: string): Promise<Task[]>

// Create task
createTask(taskData: TaskFormData): Promise<Task>

// Update task
updateTask(taskId: string, taskData: Partial<TaskFormData>): Promise<Task>

// Delete task
deleteTask(taskId: string): Promise<void>

// Update task order (for Kanban)
updateTaskOrder(projectId: string, tasks: Task[]): Promise<void>

// Assign task
assignTask(taskId: string, userId: string): Promise<Task>
```

#### Files
```typescript
// Get files for a project
getFiles(projectId: string, folderId?: string): Promise<File[]>

// Upload file
uploadFile(formData: FormData): Promise<File>

// Delete file
deleteFile(fileId: string): Promise<void>

// Create folder
createFolder(projectId: string, folderName: string, parentFolderId?: string): Promise<FileFolder>

// Add file version
addFileVersion(fileId: string, versionData: FileVersionData): Promise<File>

// Add file comment
addFileComment(fileId: string, comment: string): Promise<File>
```

#### Notifications
```typescript
// Get notifications for current user
getNotifications(): Promise<Notification[]>

// Mark notification as read
markNotificationAsRead(notificationId: string): Promise<Notification>

// Mark all as read
markAllNotificationsAsRead(): Promise<void>

// Get unread count
getUnreadNotificationCount(): Promise<number>
```

#### Analytics
```typescript
// Get Google Analytics data
getAnalyticsData(projectId: string, startDate: string, endDate: string): Promise<AnalyticsData>

// Get custom metrics
getCustomMetrics(projectId: string): Promise<CustomMetrics>

// Generate PDF report
generatePDFReport(projectId: string, options: ReportOptions): Promise<string>
```

#### Search
```typescript
// Global search
search(query: string, filters?: SearchFilters): Promise<SearchResults>
```

### API Routes (REST Endpoints)

#### Clerk Webhook
```
POST /api/webhooks/clerk
Content-Type: application/json

Headers:
  svix-id: <webhook-id>
  svix-timestamp: <timestamp>
  svix-signature: <signature>

Events:
  - user.created: Create user in MongoDB
  - user.updated: Update user in MongoDB
  - user.deleted: Delete user and cascade delete related data
```

#### File Upload
```
POST /api/upload
Content-Type: multipart/form-data

Body:
  file: <file-blob>
  projectId: <project-id>

Response:
{
  url: string
  publicId: string
  width?: number
  height?: number
  format: string
}
```

---

## Authentication & Authorization

### Clerk Integration

**Authentication** is handled by Clerk, providing:
- Email/password authentication
- Social login (Google, GitHub, etc.)
- Magic link authentication
- Session management
- User profile management

### Role-Based Access Control

Roles are stored in Clerk's `publicMetadata`:

```typescript
// Setting user role (in Clerk dashboard or via Clerk API)
{
  "publicMetadata": {
    "role": "admin" // or "user"
  }
}
```

### Protected Routes

**Middleware Pattern**:
```typescript
// lib/auth/admin.ts
export async function requireAdmin() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const user = await clerkClient.users.getUser(userId)
  const role = user.publicMetadata?.role as string

  if (role !== 'admin') {
    throw new Error('Forbidden: Admin access required')
  }

  return { userId, user }
}
```

**Usage in Server Actions**:
```typescript
export async function adminOnlyAction() {
  await requireAdmin() // Throws if not admin

  // Admin-only logic here
}
```

### Webhook Security

Clerk webhooks are verified using Svix:
```typescript
import { Webhook } from 'svix'

const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
const payload = wh.verify(body, headers) // Throws if invalid
```

---

## Real-time Features

### Pusher Integration

**Real-time messaging** is powered by Pusher WebSocket.

#### Channel Structure

```typescript
// Project-specific channels
const channelName = `project-${projectId}`

// Admin channel (all messages)
const adminChannelName = 'admin-messages'
```

#### Events

```typescript
// New message
pusher.trigger(channelName, 'new-message', {
  message: Message
})

// Typing indicator
pusher.trigger(channelName, 'typing', {
  userId: string
  userName: string
  isTyping: boolean
})

// Read receipt
pusher.trigger(channelName, 'read-receipt', {
  userId: string
  messageId: string
})

// Message edited
pusher.trigger(channelName, 'message-edited', {
  messageId: string
  newMessage: string
})

// Message deleted
pusher.trigger(channelName, 'message-deleted', {
  messageId: string
})
```

#### Client-Side Usage

```typescript
// components/providers/PusherProvider.tsx
import { usePusher } from '@/lib/hooks/usePusher'

function MessageComponent({ projectId }: { projectId: string }) {
  const { subscribe, unsubscribe } = usePusher()

  useEffect(() => {
    const channelName = `project-${projectId}`
    const channel = subscribe(channelName)

    channel.bind('new-message', (data: { message: Message }) => {
      // Update UI with new message
    })

    return () => {
      unsubscribe(channelName)
    }
  }, [projectId])
}
```

### Notification Strategy

**Important**: Pusher is ONLY used for real-time messaging, NOT for general notifications.

- **In-app notifications**: Stored in MongoDB, fetched on page load
- **Email notifications**: Sent via Resend for important events
- **Real-time messages**: Delivered via Pusher WebSocket
- **User preferences**: Control notification channels per type

---

## Deployment

### Environment Setup

Ensure all environment variables are configured in your production environment.

### Database

1. **MongoDB Atlas** (recommended):
   - Create a cluster
   - Whitelist your application's IP addresses
   - Copy connection string to `MONGODB_URI`

2. **Indexes** (automatically created by Mongoose):
   - User: `clerkId`, `email`
   - Project: `userId`, `clerkUserId`
   - Task: `projectId`
   - Message: `projectId`, `createdAt`
   - File: `projectId`, `folderId`
   - Notification: `userId`, `isRead`
   - Activity: `projectId`, `userId`, `createdAt` (TTL)

### Vercel Deployment (Recommended)

1. **Connect repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Configure build settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Deploy**: Vercel will auto-deploy on push to main branch

### Clerk Setup

1. Configure **production instance** in Clerk
2. Update **redirect URLs**:
   - Sign-in URL: `https://yourdomain.com/sign-in`
   - Sign-up URL: `https://yourdomain.com/sign-up`
   - After sign-in: `https://yourdomain.com/dashboard`
   - After sign-up: `https://yourdomain.com/dashboard/onboarding`

3. Configure **webhook** endpoint:
   - URL: `https://yourdomain.com/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`

### Pusher Setup

1. Create production app in Pusher dashboard
2. Copy credentials to environment variables
3. Configure **CORS** for your domain

### Sanity Studio

1. Deploy Sanity Studio:
   ```bash
   npm run sanity:deploy
   ```

2. Access at: `https://yourdomain.com/studio`

### Cloudinary Setup

1. Create upload preset in Cloudinary dashboard
2. Configure **allowed formats** and **transformations**
3. Set up **folder structure** for organization

### Monitoring

1. **Sentry**: Configure DSN and enable source maps
2. **Vercel Analytics**: Enable in Vercel dashboard
3. **Google Analytics**: Add property ID and service account credentials

---

## Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled, no implicit any
- **ESLint**: Follow configured rules
- **Formatting**: Use consistent spacing and naming
- **Comments**: Document complex logic and business rules

### Component Structure

```typescript
// components/MyComponent.tsx
import { ComponentProps } from '@/types'

interface MyComponentProps extends ComponentProps {
  // Props definition
}

export function MyComponent({ ...props }: MyComponentProps) {
  // Component logic

  return (
    // JSX
  )
}
```

### Server Actions

```typescript
'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

export async function myServerAction(data: FormData) {
  // 1. Authenticate
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  // 2. Validate input
  const validatedData = validateInput(data)

  // 3. Perform database operation
  const result = await Model.create(validatedData)

  // 4. Revalidate cache
  revalidatePath('/dashboard')

  // 5. Return result
  return result
}
```

### Error Handling

```typescript
import { logError } from '@/lib/sentry-logger'

try {
  // Operation
} catch (error) {
  logError(error as Error, {
    context: 'Operation description',
    userId,
    projectId
  })
  throw new Error('User-friendly error message')
}
```

### Database Queries

```typescript
import dbConnect from '@/lib/database/mongodb'
import { Model } from '@/models/Model'

// Always connect to DB first
await dbConnect()

// Use lean() for read-only queries (better performance)
const data = await Model.find({ userId }).lean()

// Populate references when needed
const project = await Project.findById(id).populate('userId')
```

### Testing

```bash
# Run tests (if configured)
npm run test

# Run linter
npm run lint

# Type checking
npm run type-check
```

### Git Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: add feature"`
3. Push and create PR: `git push origin feature/your-feature`
4. Review and merge to main

### Commit Messages

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `style:` Formatting changes
- `test:` Adding tests
- `chore:` Maintenance tasks

---

## Support & Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [MongoDB Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [Pusher Channels Documentation](https://pusher.com/docs/channels)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Community
- GitHub Issues: Report bugs and request features
- Discussions: Ask questions and share ideas

### License
[Your License Here]

---

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Core project management features
- Real-time messaging
- File management with versioning
- Analytics integration
- Resource library
- Admin dashboard

---

**Last Updated**: November 27, 2025

For questions or support, please contact the development team.
