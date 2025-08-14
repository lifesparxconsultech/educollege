export interface Blog{
    id?: string;
    title: string;
    content: string;
    excerpt: string;
    category: string;
    tags: string;
    status: string;
    featured_image?: string;
    seo_title?: string;
    seo_description?: string;
    created_by?: string;
    created_at?: string;
}

export interface BlogFormData{
    id?: string;
    title?: string;
    content: string;
    excerpt: string;
    category: string;
    tags: string;
    status: string;
    featured_image?: string;
    author: string;
    seo_title?: string;
    seo_description?: string;
    created_by?: string;
    created_at?: string;
}