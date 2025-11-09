export type ServiceType = 'web_development' | 'smm' | 'digital_solutions'
export type ProjectStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'on_hold'

export interface User {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
    created_at: string
    updated_at: string
}

export interface Project {
    id: string
    user_id: string
    name: string
    service_type: ServiceType
    status: ProjectStatus
    details: Record<string, any>
    created_at: string
    updated_at: string
}

export interface ProjectFile {
    id: string
    project_id: string
    file_name: string
    file_url: string
    file_size: number | null
    uploaded_at: string
}