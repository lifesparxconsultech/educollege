import {Lead, LeadFormData} from "@/dto/lead.ts";
import {useForm} from "react-hook-form";
import React, {useEffect, useState, useRef} from "react";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Save} from "lucide-react";
import {supabase} from "@/lib/supabaseClient.ts";
import {toast} from "sonner";
import {useAuth} from "@/contexts/AuthContext.tsx";
import {useContent} from "@/contexts/ContentContext.tsx";
import {statuses} from "@/pages/admin/lead/contants/constant.ts";

interface LeadFormProps {
    isOpen?: boolean;
    isEdit?: boolean;
    initialData?: Lead;
    onSubmit?: (data: LeadFormData) => void;
    loading?: boolean;
    onCancel?: () => void;
}

export default function LeadForm({
                                     isEdit,
                                     initialData,
                                     onSubmit,
                                     loading,
                                     onCancel
                                 }: LeadFormProps) {
    const {user} = useAuth();
    const {programs, fetchPrograms} = useContent();
    const [isAdmin, setIsAdmin] = useState(true);
    const isInitialized = useRef(false);

    const form = useForm<LeadFormData>({
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            program: '',
            message: '',
            status: '',
        }
    });

    const checkIsAdmin = async (userId: string) => {
        const { data, error } = await supabase
            .from('admins')
            .select('user_id')
            .eq('user_id', userId)
            .maybeSingle();

        return !!data && !error;
    };

    // Combined effect for admin check and initial setup
    useEffect(() => {
        if (isInitialized.current) return;

        const init = async () => {
            if (!user) {
                setIsAdmin(false);
                toast.error('User not found.');
                return;
            }

            const adminStatus = await checkIsAdmin(user?.id);
            setIsAdmin(adminStatus);

            if (!adminStatus) {
                toast.error('Access denied. You are not an admin.');
                return;
            }

            fetchPrograms();
            isInitialized.current = true;
        };

        init();
    }, [user, fetchPrograms]);

    // FIXED: Form initialization effect with proper timing
    useEffect(() => {
        if (isEdit && initialData) {
            // Use setTimeout to ensure form is ready
            setTimeout(() => {
                form.reset({
                    name: initialData.name || '',
                    email: initialData.email || '',
                    phone: initialData.phone?.toString() || '', // Convert to string
                    program: initialData.program || '',
                    message: initialData.message || '',
                    status: initialData.status || '',
                });

                // Force re-render by setting values individually as backup
                form.setValue('name', initialData.name || '');
                form.setValue('email', initialData.email || '');
                form.setValue('phone', initialData.phone?.toString() || '');
                form.setValue('program', initialData.program || '');
                form.setValue('message', initialData.message || '');
                form.setValue('status', initialData.status || '');

                }, 100);
        } else if (!isEdit) {
            // Reset to empty form when not in edit mode
            form.reset({
                name: '',
                email: '',
                phone: '',
                program: '',
                message: '',
                status: '',
            });
            console.log('Form reset to empty');
        }
    }, [isEdit, initialData]); // Removed 'form' to prevent infinite loops

    const handleSubmit = async (data: Lead) => {
        console.log('Submitting form data:', data); // Debug log
        await onSubmit?.(data);
        if (!isEdit) {
            form.reset();
        }
    };

    if (isEdit && !initialData) {
        console.log('Edit mode but no initial data provided'); // Debug log
        return null;
    }

    // Debug logs
    console.log('LeadForm render:', { isEdit, initialData, formValues: form.getValues() });

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div>
                <Label htmlFor='name'>Name</Label>
                <Input
                    id='name'
                    type="text"
                    {...form.register('name', {required: true})}
                    value={form.watch('name')} // Add explicit value
                    onChange={(e) => form.setValue('name', e.target.value)} // Add explicit onChange
                    showCharCount={true}
                    maxChars={50}
                />
                {/* Debug: Show current value */}
            </div>

            <div>
                <Label htmlFor='email'>Email</Label>
                <Input
                    id='email'
                    type="email"
                    {...form.register('email', {required: true})}
                    value={form.watch('email')} // Add explicit value
                    onChange={(e) => form.setValue('email', e.target.value)} // Add explicit onChange
                />
            </div>

            <div>
                <Label htmlFor='phone'>Phone</Label>
                <Input
                    id='phone'
                    type="text"
                    {...form.register('phone')}
                    value={form.watch('phone')} // Add explicit value
                    onChange={(e) => form.setValue('phone', e.target.value)} // Add explicit onChange
                />
            </div>

            <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Program of Interest
                </Label>
                <select
                    id='program'
                    {...form.register('program', {
                        required: true,
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={form.watch('program')} // Explicit value binding
                    onChange={(e) => form.setValue('program', e.target.value)} // Explicit onChange
                >
                    <option value="">Select a program</option>
                    {programs.length > 0 ? (
                        programs.map((prog) => (
                            <option key={prog.id} value={prog.title}>
                                {prog.title}
                            </option>
                        ))
                    ) : (
                        <option disabled>Loading...</option>
                    )}
                </select>
            </div>

            {isAdmin && (
                <div>
                    <Label htmlFor='status'>Status</Label>
                    <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        id="status"
                        {...form.register('status', {required: true})}
                        value={form.watch('status')} // Explicit value binding
                        onChange={(e) => form.setValue('status', e.target.value)} // Explicit onChange
                    >
                        <option value="" disabled>
                            Select status
                        </option>
                        {statuses
                            .filter((s) => s !== 'all')
                            .map((status) => (
                                <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                            ))}
                    </select>
                </div>
            )}

            <div>
                <Label htmlFor='message'>Message</Label>
                <Textarea
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    {...form.register('message')}
                    value={form.watch('message')} // Add explicit value
                    onChange={(e) => form.setValue('message', e.target.value)} // Add explicit onChange
                />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? (
                        <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-2"/>
                    ) : (
                        <Save className="h-4 w-4 mr-2"/>
                    )}
                    {isEdit ? 'Update Lead' : 'Submit'}
                </Button>
            </div>
        </form>
    );
}