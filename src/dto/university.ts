export interface University {
    id: string;
    name: string;
    logo: string;
    naacGrade: string;
    rating: number;
    programs: number;
    description?: string;
    website?: string;
    location?: string;
    created_by: string;
}

export interface UniversityFormData {
    name: string;
    logo: string;
    naacGrade: string;
    rating: number;
    programs: number;
    description: string;
    website: string;
    location: string;
}
