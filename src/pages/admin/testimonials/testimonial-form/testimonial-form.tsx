import {Testimonial, TestimonialFormData} from "@/dto/testimonial.ts";
import {useForm} from "react-hook-form";
import React, {FormEvent, useEffect} from "react";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {ImageUpload} from "@/components/ui/image-upload.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Save} from "lucide-react";
import {useContent} from "@/contexts/ContentContext.tsx";

interface TestimonialFormProps {
    isEdit: boolean;
    initialData: Testimonial;
    onSubmit: (data: TestimonialFormData) => Promise<void>;
    loading: boolean;
    onCancel: () => void;
}

export default function TestimonialForm({
    isEdit,
    initialData,
    onSubmit,
    onCancel,
    loading
}: TestimonialFormProps) {
    const {universities, programs, fetchMultiple} = useContent();
    const form = useForm<TestimonialFormData>({
        defaultValues: {
            name: initialData?.name || '',
            role: initialData?.role || '',
            university: initialData?.university || '',
            content: initialData?.content || '',
            image: initialData?.image || '',
            rating: initialData?.rating || 5,
            program: initialData?.program ||'',
            company: initialData?.company || '',
        }
    });

    useEffect(() => {
        if(isEdit && initialData){
            form.reset({
                name: initialData?.name || '',
                role: initialData?.role || '',
                university: initialData?.university || '',
                content: initialData?.content || '',
                image: initialData?.image || '',
                rating: initialData?.rating || 5,
                program: initialData?.program ||'',
                company: initialData?.company || '',
            })
        }
        fetchMultiple(['universities', 'programs'])
    }, [isEdit, initialData, form]);

    const handleSubmit = async (data: TestimonialFormData, e: FormEvent) => {
        e.preventDefault();
        await onSubmit(data);
        if(!isEdit){
            form.reset();
        }
    }

    if (isEdit && !initialData) return null;

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="name">Student Name</Label>
                    <Input
                        id="name"
                        {...form.register('name', {required: true})}
                        placeholder="Enter student name"
                        showCharCount={true}
                        maxChars={50}
                    />
                </div>

                <div>
                    <Label htmlFor="role">Company Role</Label>
                    <Input
                        id="role"
                        {...form.register('role', {required: true})}
                        placeholder="e.g., Role in Company"
                        showCharCount={true}
                        maxChars={50}
                    />
                </div>

                <div className="col-span-2">
                    <Label htmlFor="university">University</Label>
                    <select
                        id="university"
                        {...form.register('university', {required: true})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="">Select university</option>
                        {universities.map((uni) => (
                            <option key={uni.id} value={uni.name}>
                                {uni.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-span-2">
                    <Label htmlFor="program">Program</Label>
                    <select
                        id="program"
                        {...form.register('program', {required: true})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="">Select program</option>
                        {programs.map((prog) => (
                            <option key={prog.id} value={prog.title}>
                                {prog.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-span-2">
                    <Label htmlFor="image">Student Photo</Label>
                    <ImageUpload
                        value={form.watch('image')}
                        onChange={(value) => form.setValue('image', value)}
                        placeholder="Upload student photo"
                    />
                </div>

                <div className="col-span-2">
                    <Label htmlFor="content">Testimonial Content</Label>
                    <Textarea
                        id="content"
                        {...form.register('content', {required: true})}
                        placeholder="Enter testimonial content"
                        rows={4}
                        showCharCount={true}
                        maxChars={200}
                    />
                </div>

                <div>
                    <Label htmlFor="rating">Rating</Label>
                    <select
                        id="rating"
                        {...form.register('rating', {valueAsNumber: true})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value={5}>5 Stars</option>
                        <option value={4}>4 Stars</option>
                        <option value={3}>3 Stars</option>
                        <option value={2}>2 Stars</option>
                        <option value={1}>1 Star</option>
                    </select>
                </div>

                <div>
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                        id="company"
                        {...form.register('company', {required: true})}
                        placeholder="e.g., Company Name"
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? (
                        <span
                            className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-2"/>
                    ) : (
                        <Save className="h-4 w-4 mr-2"/>
                    )}
                    {isEdit ? 'Update Testimonial' : 'Add Testimonial'}
                </Button>
            </div>
        </form>
    )
}