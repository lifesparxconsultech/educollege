import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Program, ProgramFormData } from "@/dto/program.ts";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {University} from "@/dto/university.ts";

// Single Reusable Form Component
interface ProgramFormProps {
  isEdit: boolean;
  initialData?: Program;
  universities: University[];
  onSubmit: (data: ProgramFormData) => Promise<void>;
  loading: boolean;
  onCancel: () => void;
}

const ProgramForm: React.FC<ProgramFormProps> = ({
  isEdit,
  initialData,
  universities,
  onSubmit,
  loading,
  onCancel
}) => {
  const form = useForm<ProgramFormData>({
    defaultValues: {
      title: initialData?.title || '',
      category: initialData?.category || 'MBA',
      duration: initialData?.duration || 0,
      fees: initialData?.fees || 0,
      description: initialData?.description || '',
      eligibility: initialData?.eligibility || [],
      curriculum: initialData?.curriculum || [],
      accreditation: initialData?.accreditation || [],
      mode: initialData?.mode || 'online',
      featured: initialData?.featured || false,
      university_id: initialData?.university_id || '',
    }
  });

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (isEdit && initialData) {
      form.reset({
        title: initialData.title,
        category: initialData.category,
        duration: initialData.duration || 0,
        fees: initialData.fees || 0,
        description: initialData.description || '',
        eligibility: initialData.eligibility || [],
        curriculum: initialData.curriculum || [],
        accreditation: initialData.accreditation || [],
        mode: initialData.mode || 'online',
        featured: initialData.featured || false,
        university_id: initialData.university_id || '',
      });
    }
  }, [isEdit, initialData, form]);


  const handleSubmit = async (data: ProgramFormData) => {
    await onSubmit(data);
    if (!isEdit) {
      form.reset();
    }
  };

  if (isEdit && !initialData) return null;

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="title">Program Title</Label>
          <Input
            id="title"
            {...form.register('title', { required: true })}
            placeholder="Enter program title"
            showCharCount={true}
            maxChars={20}
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            {...form.register('category')}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="MBA">MBA</option>
            <option value="BBA">BBA</option>
            <option value="PG Diploma">PG Diploma</option>
            <option value="UG Diploma">UG Diploma</option>
          </select>
        </div>

        <div>
          <Label htmlFor="university">University</Label>
          <select
            id="university"
            {...form.register('university_id', { required: true })}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select a University</option>
            {universities.map((uni) => (
              <option key={uni.id} value={uni.id}>
                {uni.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            {...form.register('duration', { required: true })}
            placeholder="e.g., 2 years"
          />
        </div>

        <div>
          <Label htmlFor="fees">Fees</Label>
          <Input
            id="fees"
            {...form.register('fees', { required: true })}
            placeholder="e.g., ₹2,50,000"
          />
        </div>

        <div>
          <Label htmlFor="featured">Featured</Label>
          <select
            id="featured"
            {...form.register('featured')}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        <div>
          <Label htmlFor="mode">Mode</Label>
          <select
            id="mode"
            {...form.register('mode')}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>
        <div>
          <Label htmlFor="accreditation">Accreditation</Label>
          <Input
            id="accreditation"
            displayMultipleInput={true}
            multipleValue={form.watch('accreditation')}
            onMultipleChange={(values) => form.setValue('accreditation', values)}
            showCharCount={true}
            maxChars={50}
            placeholder="e.g., UGC Approved"
          />
        </div>

        <div>
          <Label htmlFor="curriculum">Add Curriculum</Label>
          <Input
            displayMultipleInput={true}
            placeholder="e.g., Marketing, Finance, Operations"
            multipleValue={form.watch('curriculum')}
            onMultipleChange={(values) => form.setValue('curriculum', values)}
            showCharCount={true}
            maxChars={50}
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="eligibility">Eligibility</Label>          
          <Input
            id="eligibility"
            displayMultipleInput={true}
            multipleValue={form.watch('eligibility')}
            onMultipleChange={(values) => form.setValue('eligibility', values)}
            showCharCount={true}
            maxChars={50}
            placeholder="e.g., 10th pass, 12th pass"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...form.register('description')}
            placeholder="Enter program description"
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
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isEdit ? 'Update Program' : 'Add Program'}
        </Button>
      </div>
    </form>
  );
};

export default ProgramForm