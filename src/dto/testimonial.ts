export interface Testimonial {
    id?: number;
    name: string;
    role: string;
    company: string;
    university: string;
    content: string;
    image: string;
    rating: number;
    program?: string;
    created_by?: string;
}

export interface TestimonialFormData {
    name: string;
    role: string;
    university: string;
    company: string;
    content: string;
    image: string;
    rating: number;
    program: string;
}
