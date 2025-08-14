import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Building2, ExternalLink, Save, Search } from 'lucide-react';
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

interface TopRecruiter {
  id: string;
  company_name: string;
  logo: string;
  industry: string;
  description?: string;
  website?: string;
  average_package?: string;
  hiring_count?: number;
  is_active: boolean;
  display_order: number;
  created_by?: string;
}

interface RecruiterFormData {
  company_name: string;
  logo: string;
  industry: string;
  description: string;
  website: string;
  average_package: string;
  hiring_count: number;
  is_active: boolean;
  display_order: number;
}

const AdminRecruiters: React.FC = () => {
  const { user } = useAuth();
  const { topRecruiters, fetchTopRecruiters, searchTerm, setSearchTerm, refresh } = useContent();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRecruiter, setSelectedRecruiter] = useState<TopRecruiter | null>(null);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState('');

  const addForm = useForm<RecruiterFormData>({
    defaultValues: {
      company_name: '',
      logo: '',
      industry: '',
      description: '',
      website: '',
      average_package: '',
      hiring_count: 0,
      is_active: true,
      display_order: 0
    }
  });

  const editForm = useForm<RecruiterFormData>();

  // const fetchRecruiters = async () => {
  //   setLoading(true);

  //   const { data, error } = await supabase
  //     .from('recruiters')
  //     .select('*')
  //     .ilike('company_name', `%${searchTerm}`)
  //     .order('created_at', { ascending: false });

  //   if (error) {
  //     setError(error.message);
  //     toast.error('Failed to fetch recruiters');
  //   } else {
  //     setRecruiters(data || []);
  //   }
  //   setLoading(false);
  // }

  useEffect(() => {
    fetchTopRecruiters();
  }, [searchTerm]);

  const handleAdd = async (data: RecruiterFormData) => {
    setLoading(true);
    const { error } = await supabase
      .from('top_recruiters')
      .insert([{ ...data, created_by: user?.id }])

    if (error) {
      toast.error('Failed to add recruiter');
      setError(error.message);
    } else {
      await refresh('top_recruiters');
      toast.success('Recruiter added successfully!');
      setIsAddDialogOpen(false);
      addForm.reset();
    }
    setLoading(false);
  };

  const handleEdit = (recruiter: TopRecruiter) => {
    setSelectedRecruiter(recruiter);
    editForm.reset({
      company_name: recruiter.company_name,
      logo: recruiter.logo,
      industry: recruiter.industry,
      description: recruiter.description || '',
      website: recruiter.website || '',
      average_package: recruiter.average_package || '',
      hiring_count: recruiter.hiring_count || 0,
      is_active: recruiter.is_active,
      display_order: recruiter.display_order
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: RecruiterFormData) => {
    if (!selectedRecruiter) return;
    setLoading(true);
    const { error } = await supabase
      .from('top_recruiters')
      .update(data)
      .eq('id', selectedRecruiter.id);

    if (error) {
      toast.error('Failed to update recruiter');
      setError(error.message);
    } else {
      await refresh('top_recruiters');
      toast.success('Recruiter updated successfully!');
      setIsEditDialogOpen(false);
      setSelectedRecruiter(null);
    }
    setLoading(false);
  };

  const handleDeleteClick = (recruiter: TopRecruiter) => {
    setSelectedRecruiter(recruiter);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedRecruiter) return;

    setLoading(true);
    const { error } = await supabase
      .from('top_recruiters')
      .delete()
      .eq('id', selectedRecruiter.id);

    if (error) {
      toast.error('Failed to delete recruiter');
      setError(error.message);
    } else {
      await refresh('top_recruiters');
      toast.success('Recruiter deleted successfully!');
      setIsDeleteDialogOpen(false);
      setSelectedRecruiter(null);
    }
    setLoading(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Top Recruiters</h1>
            <p className="text-gray-600 mt-1">Manage companies that recruit our graduates</p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Recruiter</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Recruiter</DialogTitle>
              </DialogHeader>
              <form onSubmit={addForm.handleSubmit(handleAdd)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="add-company_name">Company Name</Label>
                    <Input
                      id="add-company_name"
                      {...addForm.register('company_name', { required: true })}
                      placeholder="Company name"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="add-logo">Company Logo</Label>
                    <ImageUpload
                      value={addForm.watch('logo')}
                      onChange={(value) => addForm.setValue('logo', value)}
                      placeholder="Upload company logo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="add-industry">Industry</Label>
                    <Input
                      id="add-industry"
                      {...addForm.register('industry', { required: true })}
                      placeholder="Technology, Finance, Healthcare, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="add-website">Website</Label>
                    <Input
                      id="add-website"
                      type="url"
                      {...addForm.register('website')}
                      placeholder="https://company.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="add-average_package">Average Package</Label>
                    <Input
                      id="add-average_package"
                      {...addForm.register('average_package')}
                      placeholder="₹10-15 LPA"
                    />
                  </div>

                  <div>
                    <Label htmlFor="add-hiring_count">Hiring Count</Label>
                    <Input
                      id="add-hiring_count"
                      type="number"
                      {...addForm.register('hiring_count', { valueAsNumber: true })}
                      placeholder="50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="add-display_order">Display Order</Label>
                    <Input
                      id="add-display_order"
                      type="number"
                      {...addForm.register('display_order', { valueAsNumber: true })}
                      placeholder="1"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="add-is_active"
                      {...addForm.register('is_active')}
                    />
                    <Label htmlFor="add-is_active">Active Recruiter</Label>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="add-description">Description</Label>
                    <Textarea
                      id="add-description"
                      {...addForm.register('description')}
                      placeholder="Brief description about the company"
                      rows={3}
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
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    <span>Add Recruiter</span>
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

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

        {/* Recruiters Grid */}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="animate-spin h-8 w-8 border-4 border-t-transparent border-blue-600 rounded-full"></span>
          <span className="ml-4 text-gray-600 font-medium">Loading Recruiters...</span>
          </div>
        ) : topRecruiters.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <span className="text-gray-600 font-medium">No Recruiters Found</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topRecruiters.map((recruiter) => (
              <div key={recruiter.id} className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 transition hover:shadow-lg">
                <div className="flex items-start gap-4">
                  <img
                    src={recruiter.logo}
                    alt={recruiter.company_name}
                    className="w-14 h-14 object-cover rounded-md border"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{recruiter.company_name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">{recruiter.industry}</p>
                  </div>
                </div>

                {recruiter.description && (
                  <p className="text-sm text-gray-600 mt-3 line-clamp-3">{recruiter.description}</p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-gray-700">
                  {recruiter.average_package && (
                    <div className="flex justify-between">
                      <span>Package:</span>
                      <span className="font-medium text-green-600">{recruiter.average_package}</span>
                    </div>
                  )}

                  {recruiter.hiring_count && (
                    <div className="flex justify-between">
                      <span>Hiring:</span>
                      <span className="font-medium">{recruiter.hiring_count} positions</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Order:</span>
                    <span className="font-medium">{recruiter.display_order}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Status:</span>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${recruiter.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-xs text-gray-500">{recruiter.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t pt-4">
                  {recruiter.website ? (
                    <a
                      href={recruiter.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit Site
                    </a>
                  ) : <span className="text-sm text-gray-400 italic">No Website</span>}

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(recruiter)}                      
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(recruiter)}
                      className="text-red-600 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
              <DialogTitle>Edit Recruiter</DialogTitle>
            </DialogHeader>
            <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="edit-company_name">Company Name</Label>
                  <Input
                    id="edit-company_name"
                    {...editForm.register('company_name', { required: true })}
                    placeholder="Company name"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="edit-logo">Company Logo</Label>
                  <ImageUpload
                    value={editForm.watch('logo')}
                    onChange={(value) => editForm.setValue('logo', value)}
                    placeholder="Upload company logo"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-industry">Industry</Label>
                  <Input
                    id="edit-industry"
                    {...editForm.register('industry', { required: true })}
                    placeholder="Technology, Finance, Healthcare, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="edit-website">Website</Label>
                  <Input
                    id="edit-website"
                    type="url"
                    {...editForm.register('website')}
                    placeholder="https://company.com"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-average_package">Average Package</Label>
                  <Input
                    id="edit-average_package"
                    {...editForm.register('average_package')}
                    placeholder="₹10-15 LPA"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-hiring_count">Hiring Count</Label>
                  <Input
                    id="edit-hiring_count"
                    type="number"
                    {...editForm.register('hiring_count', { valueAsNumber: true })}
                    placeholder="50"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-display_order">Display Order</Label>
                  <Input
                    id="edit-display_order"
                    type="number"
                    {...editForm.register('display_order', { valueAsNumber: true })}
                    placeholder="1"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-is_active"
                    {...editForm.register('is_active')}
                  />
                  <Label htmlFor="edit-is_active">Active Recruiter</Label>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    {...editForm.register('description')}
                    placeholder="Brief description about the company"
                    rows={3}
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
                  )}Update Recruiter</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          title="Delete Recruiter"
          description={`Are you sure you want to delete "${selectedRecruiter?.company_name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />
      </div>
    </AdminLayout>
  );
};

export default AdminRecruiters;
