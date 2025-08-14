import {University, UniversityFormData} from "@/dto/university.ts";
import React, {useEffect} from "react";
import {useForm} from "react-hook-form";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {ImageUpload} from "@/components/ui/image-upload.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Save} from "lucide-react";

interface UniversityFormProps {
    isEdit: boolean;
    initialData?: University;
    onSubmit: (data: UniversityFormData) => Promise<void>;
    loading: boolean;
    onCancel: () => void;
}
const UniversityForm: React.FC<UniversityFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    loading,
    isEdit
}) => {
    const form = useForm<UniversityFormData>({
        defaultValues: {
            name: initialData?.name || '',
            logo: initialData?.logo || '',
            naacGrade: initialData?.naacGrade || 'A',
            rating: initialData?.rating || 4.0,
            programs: initialData?.programs || 0,
            description: initialData?.description || '',
            website: initialData?.website || '',
            location: initialData?.location || '',
        }
    });

    useEffect(() => {
        if(isEdit && initialData){
            form.reset({
                name: initialData?.name || '',
                logo: initialData?.logo || '',
                naacGrade: initialData?.naacGrade || 'A',
                rating: initialData?.rating || 4.0,
                programs: initialData?.programs || 0,
                description: initialData?.description || '',
                website: initialData?.website || '',
                location: initialData?.location || '',
            })
        }
    }, [isEdit, initialData, form]);

    const handleSubmit = async (data: UniversityFormData)=> {
        await onSubmit(data);
        if(!isEdit){
            form.reset();
        }
    }

    if (isEdit && !initialData) return null;

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <Label htmlFor="name">University Name</Label>
                    <Input
                        id="name"
                        {...form.register('name', {required: true})}
                        placeholder="Enter university name"
                        showCharCount={true}
                        maxChars={50}
                    />
                </div>

                <div className="col-span-2">
                    <Label htmlFor="logo">Logo</Label>
                    <ImageUpload
                        value={form.watch('logo')}
                        onChange={(value) => form.setValue('logo', value)}
                        placeholder="Upload university logo"
                    />
                </div>

                <div>
                    <Label htmlFor="naac">NAAC Grade</Label>
                    <select
                        id="naac"
                        {...form.register('naacGrade')}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="A++">A++</option>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="B++">B++</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                    </select>
                </div>

                <div>
                    <Label htmlFor="rating">Rating</Label>
                    <Input
                        id="rating"
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        {...form.register('rating', {valueAsNumber: true})}
                    />
                </div>

                <div>
                    <Label htmlFor="programs">Number of Programs</Label>
                    <Input
                        id="programs"
                        type="number"
                        {...form.register('programs', {valueAsNumber: true})}
                    />
                </div>

                <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                        id="location"
                        {...form.register('location')}
                        placeholder="Enter location"
                    />
                </div>

                <div className="col-span-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                        id="website"
                        type="url"
                        {...form.register('website')}
                        placeholder="https://university-website.com"
                    />
                </div>

                <div className="col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        {...form.register('description')}
                        placeholder="Enter university description"
                        rows={3}
                        showCharCount={true}
                        maxChars={250}
                    />
                </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <Button
                type="button"
                variant="outline"
                onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                type="submit"
                disabled={loading}
                >
                    {loading ? (
                        <span
                            className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-2"/>
                    ) : (
                        <Save className='h-4 w-4 mr-2' />
                    )}
                    {isEdit ? 'Update University' : 'Add University'}
                </Button>
            </div>
        </form>
)
}

export default UniversityForm