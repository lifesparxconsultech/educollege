import React, {FormEvent, useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { Button } from '@/components/ui/button';
import { HeroCarousel, HeroCarouselFormData } from "@/dto/hero.ts";
import {useForm} from "react-hook-form";

interface HeroCarouselFormProps {
    isEdit: boolean;
    initialData: HeroCarousel | null;
    onSubmit: (data: HeroCarouselFormData) => Promise<void>;
    onCancel: () => void;
    loading: boolean;
    nextDisplayOrder: number;
}

export default function HeroForm ({
                                      isEdit,
                                      initialData,
                                      onSubmit,
                                      onCancel,
                                      loading,
                                      nextDisplayOrder
}:HeroCarouselFormProps){

    const form = useForm({
        defaultValues: {
            title: initialData?.title || '',
            subtitle: initialData?.subtitle || '',
            description: initialData?.description || '',
            background_image: initialData?.background_image || '',
            cta_text: initialData?.cta_text || '',
            cta_link: initialData?.cta_link || '',
            is_active: initialData?.is_active || true,
            display_order: initialData?.display_order || 1
        }
    })

    // Initialize form data
    useEffect(() => {
        if (isEdit && initialData) {
            form.reset({
                title: initialData.title || '',
                subtitle: initialData.subtitle || '',
                description: initialData.description || '',
                background_image: initialData.background_image || '',
                cta_text: initialData.cta_text || '',
                cta_link: initialData.cta_link || '',
                is_active: initialData.is_active || true,
                display_order: initialData.display_order || nextDisplayOrder
            });
        }
    }, [isEdit, initialData, nextDisplayOrder]);

    // Handle form submission
    const handleSubmit = async (data: HeroCarouselFormData, e: FormEvent) => {
        e.preventDefault();
        await onSubmit(data);
        if(!isEdit){
            form.reset();
        }
    };

    if(isEdit && !initialData) return null

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        {...form.register('title', {required: true})}
                        placeholder="Enter slide title"
                        showCharCount={true}
                        maxChars={30}
                    />
                </div>

                <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                        id="subtitle"
                        {...form.register('subtitle', {required: true})}
                        placeholder="Enter slide subtitle..."
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    rows={3}
                    {...form.register('description', {required: true})}
                    placeholder="Enter slide description (optional)..."
                    className="resize-none"
                    showCharCount={true}
                    maxChars={30}
                />
            </div>

            <div>
                <Label>Background Image *</Label>
                <ImageUpload
                    value={form.watch('background_image')}
                    onChange={(value) => form.setValue('background_image', value)}
                    placeholder='Upload slide image'
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="cta_text">CTA Text *</Label>
                    <Input
                        id="cta_text"
                        {...form.register('cta_text', {required: true})}
                        placeholder="e.g., Learn More, Get Started..."
                    />
                </div>

                <div>
                    <Label htmlFor="cta_link">CTA Link *</Label>
                    <Input
                        id="cta_link"
                        type="url"
                        {...form.register('cta_link', {required: true})}
                        placeholder="https://example.com/page"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="display_order">Display Order *</Label>
                    <Input
                        id="display_order"
                        type="number"
                        min="1"
                        placeholder="1"
                        {...form.register('display_order', {required: true})}
                    />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                    <input
                        type="checkbox"
                        id="is_active"
                        {...form.register('is_active', {required: true})}
                    />
                    <Label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                        Active Slide
                    </Label>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2"
                >
                    {loading ? (
                        <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    <span>{isEdit ? 'Update Slide' : 'Create Slide'}</span>
                </Button>
            </div>
        </form>
    );
};
