import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { useContent } from '@/contexts/ContentContext';

interface LeadFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void; // ✅ optional callback from parent
  programTitle?: string;
}

interface LeadFormData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  program: string;
  message: string;
}

const LeadForm: React.FC<LeadFormProps> = ({ isOpen, onClose, onSubmit, programTitle }) => {
  const { programs, fetchPrograms } = useContent();

  const [loading, setLoading] = useState(false);
  const [, setError] = useState('');

  const addForm = useForm<LeadFormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      program: programTitle || '',
      message: ''
    }
  });

  const handleSubmit = async (data: LeadFormData) => {
    setLoading(true);
    const { error } = await supabase.from('leads').insert(data);

    if (error) {
      setError(error.message);
      toast.error('Failed to submit lead. Please try again.');
    } else {
      toast.success('Lead submitted successfully!');
      onClose();
      addForm.reset();

      // ✅ Call parent's submit handler if provided
      if (typeof onSubmit === 'function') {
        onSubmit();
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && programs.length === 0) {
      fetchPrograms();
    }
  }, [isOpen, programs.length, fetchPrograms]);

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Get Program Information</h3>
              <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={addForm.handleSubmit(handleSubmit)} className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </Label>
                <Input
                    id='add-name'
                    {...addForm.register('name', {
                      required: true,
                    })}
                    placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </Label>
                <Input
                    id='add-email'
                    {...addForm.register('email', {
                      required: true,
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    placeholder="Enter your email"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </Label>
                <Input
                    id='add-phone'
                    {...addForm.register('phone', {
                      required: true,
                      pattern: {
                        value: /^\d{10}$/,
                        message: 'Please enter a valid phone number'
                      }
                    })}
                    placeholder="Enter your phone number"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Program of Interest
                </Label>
                <select
                    id='add-program'
                    {...addForm.register('program', {
                      required: true,
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md"
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

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </Label>
                <Textarea
                    id='add-message'
                    {...addForm.register('message')}
                    placeholder="Any specific questions or requirements?"
                    rows={3}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default LeadForm;
