export interface TopRecruiter {
    id: string;
    company_name: string;
    logo: string;
    industry: string;
    description?: string;
    website?: string;
    average_package?: string;
    hiring_count?: number;
    is_active: boolean;
    display_order: number;
    created_by?: string;
}

export interface RecruiterFormData {
    company_name: string;
    logo: string;
    industry: string;
    description: string;
    website: string;
    average_package: string;
    hiring_count: number;
    is_active: boolean;
    display_order: number;
}
