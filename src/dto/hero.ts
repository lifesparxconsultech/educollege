export interface HeroCarousel {
    id?: string;
    title: string;
    subtitle: string;
    description?: string;
    background_image: string;
    cta_text: string;
    cta_link: string;
    is_active: boolean;
    display_order: number;
    created_at?: string;
}

export interface HeroCarouselFormData{
    id?: string;
    title: string;
    subtitle: string;
    description: string;
    background_image: string;
    cta_text: string;
    cta_link: string;
    is_active: boolean;
    display_order: number;
}
