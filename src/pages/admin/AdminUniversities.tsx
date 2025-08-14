
import React, { useState } from 'react';
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
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useContent } from '@/contexts/ContentContext';


interface University {
  id: string;
  name: string;
  logo: string;
  naacGrade: string;
  rating: number;
  programs: number;
  description?: string;
  website?: string;
  location?: string;
  created_by: string;
}

interface UniversityFormData {
  name: string;
  logo: string;
  naacGrade: string;
  rating: number;
  programs: number;
  description: string;
  website: string;
  location: string;
}

const AdminUniversities: React.FC = () => {
  const { user } = useAuth();
  const {universities, searchTerm, setSearchTerm, refresh} = useContent();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(false);

  const addForm = useForm<UniversityFormData>({
    defaultValues: {
      name: '',
      logo: '',
      naacGrade: 'A',
      rating: 4.0,
      programs: 0,
      description: '',
      website: '',
      location: ''
    }
  });

  const editForm = useForm<UniversityFormData>();

  const handleAdd = async (data: UniversityFormData) => {
    setLoading(true);
    const { error } = await supabase.from('universities').insert({
      ...data,
      created_by: user?.id
    });
    if (error) {
      toast.error('Failed to add university');
    } else {
      await refresh('universities');
      toast.success('University added successfully!');
      setIsAddDialogOpen(false);
      addForm.reset();
    }
    setLoading(false);
  };

  const handleEdit = (university: University) => {
    setSelectedUniversity(university);
    editForm.reset({
      name: university.name,
      logo: university.logo,
      naacGrade: university.naacGrade,
      rating: university.rating,
      programs: university.programs,
      description: university.description || '',
      website: university.website || '',
      location: university.location || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: UniversityFormData) => {
    if (!selectedUniversity) return;
    setLoading(true);
    const { error } = await supabase
      .from('universities')
      .update(data)
      .eq('id', selectedUniversity.id);

    if (error) {
      toast.error('Failed to update university');
    } else {
      await refresh('universities');
      toast.success('University updated successfully!');
      setIsEditDialogOpen(false);
      setSelectedUniversity(null);
    }
    setLoading(false);
  };

  const handleDeleteClick = (university: University) => {
    setSelectedUniversity(university);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedUniversity) return;
    setLoading(true);
    const { error } = await supabase
      .from('universities')
      .delete()
      .eq('id', selectedUniversity.id);

    if (error) {
      toast.error('Failed to delete university');
    } else {
      await refresh('universities');
      toast.success('University deleted successfully!');
      setIsDeleteDialogOpen(false);
      setSelectedUniversity(null);
    }
    setLoading(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Universities</h1>
            <p className="text-gray-600 mt-1">Manage university listings and information</p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add University</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New University</DialogTitle>
              </DialogHeader>
              <form onSubmit={addForm.handleSubmit(handleAdd)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="add-name">University Name</Label>
                    <Input
                      id="add-name"
                      {...addForm.register('name', { required: true })}
                      placeholder="Enter university name"
                      showCharCount={true}
                      maxChars={50}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="add-logo">Logo</Label>
                    <ImageUpload
                      value={addForm.watch('logo')}
                      onChange={(value) => addForm.setValue('logo', value)}
                      placeholder="Upload university logo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="add-naac">NAAC Grade</Label>
                    <select
                      id="add-naac"
                      {...addForm.register('naacGrade')}
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
                    <Label htmlFor="add-rating">Rating</Label>
                    <Input
                      id="add-rating"
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      {...addForm.register('rating', { valueAsNumber: true })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="add-programs">Number of Programs</Label>
                    <Input
                      id="add-programs"
                      type="number"
                      {...addForm.register('programs', { valueAsNumber: true })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="add-location">Location</Label>
                    <Input
                      id="add-location"
                      {...addForm.register('location')}
                      placeholder="Enter location"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="add-website">Website</Label>
                    <Input
                      id="add-website"
                      type="url"
                      {...addForm.register('website')}
                      placeholder="https://university-website.com"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="add-description">Description</Label>
                    <Textarea
                      id="add-description"
                      {...addForm.register('description')}
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
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                    <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}Add University</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search universities..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="animate-spin h-8 w-8 border-4 border-t-transparent border-blue-600 rounded-full"></span>
          <span className="ml-4 text-gray-600 font-medium">Loading Testimonials...</span>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">University</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NAAC Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Programs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              {universities.length === 0 ? (
                <tbody className='divide-y divide-gray-200'>
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No universities found.
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="divide-y divide-gray-200">
                {universities.map((university) => (
                  <tr key={university.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img className="h-10 w-10 rounded-lg object-cover mr-4" src={university.logo} alt={university?.name} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{university?.name}</div>
                          {university.location && (
                            <div className="text-xs text-gray-500">{university.location}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {university.naacGrade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{university.rating}/5</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{university.programs}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {user?.id === university.created_by && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(university)}
                              className="text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(university)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              )}
              
            </table>
          </div>
        </div>
        )}

        

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit University</DialogTitle>
            </DialogHeader>
            <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="edit-name">University Name</Label>
                  <Input
                    id="edit-name"
                    {...editForm.register('name', { required: true })}
                    placeholder="Enter university name"
                    maxChars={50}
                    showCharCount={true}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="edit-logo">Logo</Label>
                  <ImageUpload
                    value={editForm.watch('logo')}
                    onChange={(value) => editForm.setValue('logo', value)}
                    placeholder="Upload university logo"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-naac">NAAC Grade</Label>
                  <select
                    id="edit-naac"
                    {...editForm.register('naacGrade')}
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
                  <Label htmlFor="edit-rating">Rating</Label>
                  <Input
                    id="edit-rating"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    {...editForm.register('rating', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-programs">Number of Programs</Label>
                  <Input
                    id="edit-programs"
                    type="number"
                    {...editForm.register('programs', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    {...editForm.register('location')}
                    placeholder="Enter location"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="edit-website">Website</Label>
                  <Input
                    id="edit-website"
                    type="url"
                    {...editForm.register('website')}
                    placeholder="https://university-website.com"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    {...editForm.register('description')}
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
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                  <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}Update University</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          title="Delete University"
          description={`Are you sure you want to delete "${selectedUniversity?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />
      </div>
    </AdminLayout>
  );
};

export default AdminUniversities;
