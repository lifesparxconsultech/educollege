import {RecruiterFormData, TopRecruiter} from "@/dto/recruiter.ts";
import {useForm} from "react-hook-form";
import React, {useEffect} from "react";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {ImageUpload} from "@/components/ui/image-upload.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Plus} from "lucide-react";

interface RecruiterFormProps {
    isEdit: boolean;
    initialData: TopRecruiter;
    onSubmit: (data: RecruiterFormData) => Promise<void>;
    onCancel: () => void;
    loading: boolean;
}
export default function RecruiterForm({
    initialData,
    isEdit,
    onSubmit,
    onCancel,
    loading
}: RecruiterFormProps){
    const form = useForm<RecruiterFormData>({
        defaultValues: {
            company_name: initialData?.company_name || '',
            logo: initialData?.logo ||'',
            industry: initialData?.industry ||'',
            description: initialData?.description ||'',
            website: initialData?.website ||'',
            average_package: initialData?.average_package || '',
            hiring_count: initialData?.hiring_count || 0,
            is_active: initialData?.is_active || true,
            display_order: initialData?.display_order || 0
        }
    });

    useEffect(() => {
        if(isEdit && initialData){
            form.reset({
                company_name: initialData?.company_name || '',
                logo: initialData?.logo ||'',
                industry: initialData?.industry ||'',
                description: initialData?.description ||'',
                website: initialData?.website ||'',
                average_package: initialData?.average_package || '',
                hiring_count: initialData?.hiring_count || 0,
                is_active: initialData?.is_active || true,
                display_order: initialData?.display_order || 0
            })
        }
    }, [isEdit, initialData, form]);

    const handleSubmit = async (data: RecruiterFormData) => {
        await onSubmit(data);
        if(!isEdit){
            form.reset();
        }
    }
    return (
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                        id="company_name"
                        {...form.register('company_name', {required: true})}
                        placeholder="Company name"
                        showCharCount={true}
                        maxChars={20}
                    />
                </div>

                <div className="col-span-2">
                    <Label htmlFor="logo">Company Logo</Label>
                    <ImageUpload
                        value={form.watch('logo')}
                        onChange={(value) => form.setValue('logo', value)}
                        placeholder="Upload company logo"
                    />
                </div>

                <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                        id="industry"
                        {...form.register('industry', {required: true})}
                        placeholder="Technology, Finance, Healthcare, etc."
                    />
                </div>

                <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                        id="website"
                        type="url"
                        {...form.register('website')}
                        placeholder="https://company.com"
                    />
                </div>

                <div>
                    <Label htmlFor="average_package">Average Package</Label>
                    <Input
                        id="average_package"
                        {...form.register('average_package')}
                        placeholder="₹10-15 LPA"
                    />
                </div>

                <div>
                    <Label htmlFor="hiring_count">Hiring Count</Label>
                    <Input
                        id="hiring_count"
                        type="number"
                        {...form.register('hiring_count', {valueAsNumber: true})}
                        placeholder="50"
                    />
                </div>

                <div>
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                        id="display_order"
                        type="number"
                        {...form.register('display_order', {valueAsNumber: true})}
                        placeholder="1"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="add-is_active"
                        {...form.register('is_active')}
                    />
                    <Label htmlFor="add-is_active">Active Recruiter</Label>
                </div>

                <div className="col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="add-description"
                        {...form.register('description')}
                        placeholder="Brief description about the company"
                        rows={3}
                        showCharCount={true}
                        maxChars={500}
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
                        <Plus className="h-4 w-4 mr-2"/>
                    )}
                    {isEdit ? 'Update Recruiter' : 'Add Recruiter'}
                </Button>
            </div>
        </form>
    )
}