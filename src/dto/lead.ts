export interface Lead {
    id: number;
    name: string;
    email: string;
    phone: string;
    program: string;
    status?: string;
    message: string;
    created_at?: string;
}

export interface LeadFormData {
    id: number;
    name: string;
    email: string;
    phone: string;
    program: string;
    message: string;
    status?: string;
}