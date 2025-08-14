import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Save } from 'lucide-react';
import AdminLayout from '../../components/admin/admin-layout.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { ImageUpload } from '../../components/ui/image-upload';
import { ConfirmationDialog } from '../../components/ui/confirmation-dialog';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useContent } from '@/contexts/ContentContext';


interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  university: string;
  content: string;
  image: string;
  rating: number;
  program?: string;
  created_by?: string;
}

interface TestimonialFormData {
  name: string;
  role: string;
  university: string;
  company: string;
  content: string;
  image: string;
  rating: number;
  program: string;
}

const AdminTestimonials: React.FC = () => {
  const { user } = useAuth();
  const {universities, programs,testimonials,fetchMultiple, searchTerm, setSearchTerm, refresh} = useContent();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);

  const [loading, setLoading] = useState(false);
  const [, setError] = useState('');

  const addForm = useForm<TestimonialFormData>({
    defaultValues: {
      name: '',
      role: '',
      university: '',
      content: '',
      image: '',
      rating: 5,
      program: '',
      company: '',
    }
  });

  const editForm = useForm<TestimonialFormData>();

  useEffect(() => {
    fetchMultiple(['testimonials', 'universities', 'programs']);
  }, [searchTerm]);

  const handleAdd = async (data: TestimonialFormData, e : React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from('testimonials')
      .insert({
        ...data,
        created_by: user?.id
      });
    if (error) {
      toast.error('Failed to add testimonials');
      return;
    } else {
      await refresh('testimonials');
      toast.success('Testimonial added successfully!');
      setIsAddDialogOpen(false);
      addForm.reset();
    }
    setLoading(false);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    editForm.reset({
      name: testimonial.name,
      role: testimonial.role,
      university: testimonial.university,
      content: testimonial.content,
      image: testimonial.image,
      rating: testimonial.rating,
      program: testimonial.program,
      company: testimonial.company || '',

    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: TestimonialFormData) => {
    if(!selectedTestimonial) return;
    setLoading(true);
    const { error } = await supabase
      .from('testimonials')
      .update(data)
      .eq('id', selectedTestimonial.id);

      if(error){
        toast.error('Failed to update testimonials');
        return;
      }else{
        await refresh('testimonials');
        toast.success('Testimonial updated successfully!');
        setIsEditDialogOpen(false);
        setSelectedTestimonial(null);
      }
    setLoading(false);
  };

  const handleDeleteClick = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTestimonial) return;
    setLoading(true);
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', selectedTestimonial.id);

    if (error) {
      toast.error('Failed to delete testimonials');
      setError(error.message);
    } else {
      await refresh('testimonials');
      toast.success('Testimonial deleted successfully!');
      setIsDeleteDialogOpen(false);
      setSelectedTestimonial(null);
    }
    setLoading(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
            <p className="text-gray-600 mt-1">Manage student testimonials and reviews</p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Testimonial</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Testimonial</DialogTitle>
              </DialogHeader>
              <form onSubmit={addForm.handleSubmit(handleAdd)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="add-name">Student Name</Label>
                    <Input
                      id="add-name"
                      {...addForm.register('name', { required: true })}
                      placeholder="Enter student name"
                      showCharCount={true}
                      maxChars={50}
                    />
                  </div>

                  <div>
                    <Label htmlFor="add-role">Company Role</Label>
                    <Input
                      id="add-role"
                      {...addForm.register('role', { required: true })}
                      placeholder="e.g., Role in Company"
                      showCharCount={true}
                      maxChars={50}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="add-university">University</Label>
                    <select
                      id="add-university"
                      {...addForm.register('university', { required: true })}
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
                    <Label htmlFor="add-program">Program</Label>
                    <select
                      id="add-program"
                      {...addForm.register('program', { required: true })}
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
                    <Label htmlFor="add-image">Student Photo</Label>
                    <ImageUpload
                      value={addForm.watch('image')}
                      onChange={(value) => addForm.setValue('image', value)}
                      placeholder="Upload student photo"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="add-content">Testimonial Content</Label>
                    <Textarea
                      id="add-content"
                      {...addForm.register('content', { required: true })}
                      placeholder="Enter testimonial content"
                      rows={4}
                      showCharCount={true}
                      maxChars={200}
                    />
                  </div>

                  <div>
                    <Label htmlFor="add-rating">Rating</Label>
                    <select
                      id="add-rating"
                      {...addForm.register('rating', { valueAsNumber: true })}
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
                    <Label htmlFor="add-company">Company Name</Label>
                    <Input
                      id="add-company"
                      {...addForm.register('company', { required: true })}
                      placeholder="e.g., Company Name"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                    <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                    Add Testimonial
                    </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search testimonials..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Testimonials Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="animate-spin h-8 w-8 border-4 border-t-transparent border-blue-600 rounded-full"></span>
          <span className="ml-4 text-gray-600 font-medium">Loading Testimonials...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full bg-gray-500 object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-xs text-gray-600">{testimonial.role}</p>
                    <p className="text-xs text-gray-500">{testimonial.university}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(testimonial)}
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(testimonial)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-4 line-clamp-3">{testimonial.content}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
        

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Testimonial</DialogTitle>
            </DialogHeader>
            <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Student Name</Label>
                  <Input
                    id="edit-name"
                    {...editForm.register('name', { required: true })}
                    placeholder="Enter student name"
                    showCharCount={true}
                    maxChars={50}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-role">Role/Program</Label>
                  <Input
                    id="edit-role"
                    {...editForm.register('role', { required: true })}
                    placeholder="e.g., MBA Graduate"
                    showCharCount={true}
                    maxChars={50}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="edit-university">University</Label>
                  <select
                    id="edit-university"
                    {...editForm.register('university', { required: true })}
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
                    <Label htmlFor="edit-program">Program</Label>
                    <select
                      id="edit-program"
                      {...editForm.register('program', { required: true })}
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
                  <Label htmlFor="edit-image">Student Photo</Label>
                  <ImageUpload
                    value={editForm.watch('image')}
                    onChange={(value) => editForm.setValue('image', value)}
                    placeholder="Upload student photo"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="edit-content">Testimonial Content</Label>
                  <Textarea
                    id="edit-content"
                    {...editForm.register('content', { required: true })}
                    placeholder="Enter testimonial content"
                    rows={4}
                    showCharCount={true}
                    maxChars={200}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-rating">Rating</Label>
                  <select
                    id="edit-rating"
                    {...editForm.register('rating', { valueAsNumber: true })}
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
                    <Label htmlFor="edit-company">Company Name</Label>
                    <Input
                      id="edit-company"
                      {...editForm.register('company', { required: true })}
                      placeholder="e.g., Company Name"
                    />
                  </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Update Testimonial
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          title="Delete Testimonial"
          description={`Are you sure you want to delete testimonial by "${selectedTestimonial?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />
      </div>
    </AdminLayout>
  );
};

export default AdminTestimonials;
