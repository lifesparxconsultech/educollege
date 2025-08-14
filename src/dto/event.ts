export interface Event {
    id?: number;
    title: string;
    description: string;
    event_date: string;
    event_time: string;
    location: string;
    event_type: string;
    image?: string;
    registration_link?: string;
    is_active: boolean;
    created_by?: string;
}

export interface EventFormData {
    id?: number;
    title: string;
    description: string;
    event_date: string;
    event_time: string;
    location: string;
    event_type: string;
    image?: string;
    registration_link?: string;
    is_active: boolean;
    created_by?: string;
}
