import {Blog, BlogFormData} from "@/dto/blog.ts";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {ImageUpload} from "@/components/ui/image-upload.tsx";
import {Button} from "@/components/ui/button.tsx";
import React, {useEffect, FormEvent} from "react";
import {useForm} from "react-hook-form";
import {categories} from "@/pages/admin/blog/constant/contant.tsx";

interface BlogFormProps{
    isEdit: boolean;
    initialData: Blog;
    onSubmit: (data: BlogFormData) => Promise<void>;
    loading: boolean;
    onCancel: () => void;
}

export default function BlogForm({
    isEdit,
    initialData,
    onSubmit,
    onCancel,
    loading,
                                 }: BlogFormProps){
    const form = useForm<BlogFormData>({
        defaultValues: {
            title: initialData?.title,
            content: initialData?.content,
            excerpt: initialData?.excerpt,
            category: initialData?.category,
            status: initialData?.status,
            featured_image: initialData?.featured_image,
            seo_title: initialData?.seo_title,
            seo_description: initialData?.seo_description,
            tags: initialData?.tags,

        }
    });

    useEffect(() => {
        if(isEdit && initialData){
            form.reset({
                title: initialData?.title,
                content: initialData?.content,
                excerpt: initialData?.excerpt,
                category: initialData?.category,
                status: initialData?.status,
                featured_image: initialData?.featured_image,
                seo_title: initialData?.seo_title,
                seo_description: initialData?.seo_description,
                tags: initialData?.tags,
            })
        }
    }, [isEdit, initialData, form]);

    const handleSubmit = async (data: BlogFormData, e: FormEvent) => {
        e.preventDefault();
        await onSubmit(data);
        if(!isEdit){
            form.reset();
        }
    }

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                        id="title"
                        {...form.register('title')}
                        placeholder="Enter blog title"
                        showCharCount={true}
                        maxChars={100}
                    />
                </div>
                <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select onValueChange={(value) => form.setValue('category', value)} value={form.watch('category')}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select category"/>
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                    {category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <Label htmlFor="excerpt">Excerpt *</Label>
                <Textarea
                    id="excerpt"
                    {...form.register('excerpt')}
                    placeholder="Brief description of the blog post"
                    rows={3}
                    showCharCount={true}
                    maxChars={400}
                />
            </div>

            <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                    id="content"
                    {...form.register('content')}
                    placeholder="Write your blog content here..."
                    rows={8}
                    showCharCount={true}
                    maxChars={2000}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="tags">Tag</Label>
                    <Input
                        id="tags"
                        {...form.register('tags')}
                        placeholder="engineering"
                    />
                </div>
                <div>
                    <Label htmlFor="status">Status</Label>
                    <Select onValueChange={
                        (value) => form.setValue('status', value as 'draft' | 'published')}
                            value={form.watch('status')
                    }>
                        <SelectTrigger>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <Label>Featured Image</Label>
                <ImageUpload
                    value={form.watch('featured_image') || ''}
                    onChange={(value) => form.setValue('featured_image', value)}
                    placeholder="Upload featured image"
                />
            </div>

            <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="seo_title">SEO Title</Label>
                        <Input
                            id="seo_title"
                            {...form.register('seo_title')}
                            placeholder="SEO optimized title"
                            showCharCount={true}
                            maxChars={200}
                        />
                    </div>
                    <div>
                        <Label htmlFor="seo_description">SEO Description</Label>
                        <Textarea
                            id="seo_description"
                            {...form.register('seo_description')}
                            placeholder="SEO meta description"
                            rows={3}
                            showCharCount={true}
                            maxChars={400}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button type="submit">
                    {isEdit ? 'Update Post' : 'Create Post'}
                </Button>
            </div>
        </form>

    )
}