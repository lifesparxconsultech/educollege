import React, { useEffect, useState } from 'react';
import { Search, Filter, Download, Eye, Trash2, Save, Edit } from 'lucide-react';
import AdminLayout from '../../components/admin/admin-layout.tsx';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ConfirmationDialog } from '../../components/ui/confirmation-dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import { useContent } from '@/contexts/ContentContext';

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  program: string;
  status: string;
  source?: string;
  message: string;
  created_at?: string;
}

const AdminLeads: React.FC = () => {
  const { user } = useAuth();
  const { leads, fetchLeads, searchTerm, setSearchTerm, refresh } = useContent();
  const [statusFilter, setStatusFilter] = useState('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(true); // default true for dev

  const statuses = ['all', 'new', 'contacted', 'qualified', 'converted', 'lost'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const editForm = useForm<Lead>();


  const checkIsAdmin = async (userId: string) => {
    const { data, error } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    return !!data && !error;
  };

  useEffect(() => {
    const init = async () => {

      if (!user) {
        setIsAdmin(false);
        toast.error('User not found.');
        return;
      }

      const isAdmin = await checkIsAdmin(user?.id);
      setIsAdmin(isAdmin);

      if (!isAdmin) {
        toast.error('Access denied. You are not an admin.');
        return;
      }

      fetchLeads();
    };

    init();
  }, [searchTerm, statusFilter]);

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    editForm.reset(lead);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: Lead) => {
    if (!selectedLead) return;
    setLoading(true);
    const { error } = await supabase
      .from('leads')
      .update(data)
      .eq('id', selectedLead.id);

    if (error) {
      toast.error('Failed to update lead.');
      setError(error.message);
    } else {
      await refresh('leads');
      toast.success('Lead updated!');
      setIsEditDialogOpen(false);
      setSelectedLead(null);
    }
    setLoading(false);
  };

  const handleDeleteClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedLead) return;
    setLoading(true);
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', selectedLead.id);

    if (error) {
      toast.error('Failed to delete lead.');
      setError(error.message);
    } else {
      await refresh('leads');
      toast.success('Lead deleted!');
      setIsDeleteDialogOpen(false);
      setSelectedLead(null);
    }
    setLoading(false);
  };

  const handleExport = () => {
    if (leads.length === 0) {
      toast.error('No leads to export.');
      return;
    }

    const exportData = leads.map(lead => ({
      Name: lead.name,
      Email: lead.email,
      Phone: lead.phone,
      Program: lead.program,
      // University: lead.university || '',
      // Source: lead.source || '',
      Status: lead.status,
      Message: lead.message,
      CreatedAt: lead.created_at ? formatDate(lead.created_at) : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
    XLSX.writeFile(workbook, 'leads_export.xlsx');

    toast.success('Leads exported!');
  };

  return (
    <>
      {isAdmin ? (
        <AdminLayout>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
                <p className="text-gray-600 mt-1">Manage and track student inquiries</p>
              </div>
              <Button onClick={handleExport} className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export Leads</span>
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search leads..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    className="p-2 border border-gray-300 rounded-md"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>


            {loading ? (
              <div className="flex justify-center items-center py-20">
                <span className="animate-spin h-8 w-8 border-4 border-t-transparent border-blue-600 rounded-full"></span>
                <span className="ml-4 text-gray-600 font-medium">Loading Testimonials...</span>
              </div>
            ) : leads.length === 0 ? (
              <div className="flex justify-center items-center py-20">
                <span className="text-gray-600 font-medium">No Leads Found</span>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program Interest</th>

                        {leads.some(lead => lead.status) && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                              <div className="text-sm text-gray-500">{lead.email}</div>
                              <div className="text-sm text-gray-500">{lead.phone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{lead.program}</div>
                              <div className="text-sm text-gray-500">{lead.university}</div>
                            </div>
                          </td>
                          {lead.status && (
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                                {lead.status}
                              </span>
                            </td>
                          )}
                          <td className="px-6 py-4 text-sm text-gray-900">{formatDate(lead.created_at)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm"
                                onClick={() => handleEdit(lead)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(lead)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Lead</DialogTitle>
                </DialogHeader>

                <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
                  <div>
                    <Label htmlFor='name'>Name</Label>
                    <Input type="text" {...editForm.register('name', { required: true })} />
                  </div>

                  <div>
                    <Label htmlFor='email' >Email</Label>
                    <Input type="email" {...editForm.register('email', { required: true })} />
                  </div>

                  <div>
                    <Label htmlFor='phone'>Phone</Label>
                    <Input type="text" {...editForm.register('phone')} />
                  </div>

                  <div>
                    <Label htmlFor='program'>Program</Label>
                    <Input type="text" {...editForm.register('program')} />
                  </div>

                  <div>
                    <Label htmlFor='status'>Status</Label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      id="status"
                      {...editForm.register('status', { required: true })}
                      defaultValue="" // ← this sets the placeholder as the default
                    >
                      <option value="" disabled hidden>
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

                  <div>
                    <Label htmlFor='message'>Message</Label>
                    <Textarea
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      {...editForm.register('message')}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="ghost"
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
                      Update Lead
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
              title="Delete Lead"
              description={`Are you sure you want to delete the lead from "${selectedLead?.name}"? This action cannot be undone.`}
              confirmText="Delete"
              cancelText="Cancel"
              variant="destructive"
            />
          </div>
        </AdminLayout>
      ) : (
        <AdminLayout>
          <div className="text-center py-20 text-red-600 font-semibold">
            Access Denied. You are not an admin.
          </div>
        </AdminLayout>
      )} </>
  );
};

export default AdminLeads;
