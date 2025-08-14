import {Event, EventFormData} from "@/dto/event.ts";
import {useForm} from "react-hook-form";
import React, {useEffect} from "react";
import {Label} from "@radix-ui/react-label";
import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {ImageUpload} from "@/components/ui/image-upload.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Save} from "lucide-react";

interface EventFormProps {
    isEdit: boolean;
    initialData: Event;
    onSubmit: (data: EventFormData) => Promise<void>;
    loading: boolean;
    onCancel: () => void;
}

export default function EventForm({
    isEdit,
    initialData,
    onSubmit,
    onCancel,
    loading
}: EventFormProps) {

    const form = useForm<EventFormData>({
        defaultValues: {
            title: initialData?.title || '',
            description: initialData?.description || '',
            event_date: initialData?.event_date ||'',
            event_time: initialData?.event_time || '',
            location: initialData?.location || '',
            event_type: initialData?.event_type || '',
            image: initialData?.image || '',
            registration_link: initialData?.registration_link || '',
            is_active: initialData?.is_active || true
        }
    });

    useEffect(() => {
        if(isEdit && initialData){
            form.reset({
                title: initialData?.title || '',
                description: initialData?.description || '',
                event_date: initialData?.event_date ||'',
                event_time: initialData?.event_time || '',
                location: initialData?.location || '',
                event_type: initialData?.event_type || '',
                image: initialData?.image || '',
                registration_link: initialData?.registration_link || '',
                is_active: initialData?.is_active || true
            })
        }
    }, [isEdit, initialData, form]);

    const handleSubmit = async (data: EventFormData) => {
        await onSubmit(data);
        if(!isEdit){
            form.reset();
        }
    }

    if(isEdit && !initialData) return null;

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor='title'>Event Title</Label>
                    <Input id='title'
                           placeholder='Enter event title' {...form.register('title', {required: true})} />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor='event-type'>Event Type</Label>
                    <select id='event-type' {...form.register('event_type', {required: true})}
                            className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value='' disabled>Select event type</option>
                        <option value='webinar'>Webinar</option>
                        <option value='workshop'>Workshop</option>
                        <option value='seminar'>Seminar</option>
                        <option value='admission'>Admission</option>
                        <option value='exam'>Exam</option>
                        <option value='joining'>Joining</option>
                        <option value='other'>Other</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor='event-date'>Event Date</Label>
                    <Input id='event-date' type='date' {...form.register('event_date', {required: true})} />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor='event-time'>Event Time</Label>
                    <Input id='event-time' type='time' {...form.register('event_time', {required: true})} />
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-1.5">
                    <Label htmlFor='location'>Event Location</Label>
                    <Input id='location'
                           placeholder='Enter event location' {...form.register('location', {required: true})} />
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-1.5">
                    <Label htmlFor='description'>Event Description</Label>
                    <Textarea rows={4} id='description'
                              placeholder='Enter event description' {...form.register('description', {required: true})} />
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-1.5">
                    <Label htmlFor='registration-link'>Registration Link</Label>
                    <Input id='registration-link' type='url'
                           placeholder='https://example.com/register' {...form.register('registration_link')} />
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-1.5">
                    <Label htmlFor='image'>Event Image</Label>
                    <ImageUpload
                        value={form.watch('image')}
                        onChange={(value) => form.setValue('image', value)}
                        placeholder='Upload event image'
                    />
                </div>

                <div className="col-span-1 sm:col-span-2 flex items-center gap-2 mt-2">
                    <input
                        type='checkbox'
                        id='is-active'
                        {...form.register('is_active')}
                        className='accent-primary'
                    />
                    <Label htmlFor='is-active'>Active Event</Label>
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
                    {isEdit ? 'Update Event' : 'Add Event'}
                </Button>
            </div>
        </form>
    )
}