import AdminLayout from "@/components/admin/admin-layout.tsx";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { useContent, useContentPagination } from "@/contexts/ContentContext";
import { Lead } from "@/dto/lead.ts";
import { supabase } from "@/lib/supabaseClient";
import { Download, Edit, Filter, Plus, Search, Trash2, RefreshCw, X, User, Mail, Phone, Calendar } from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { formatDate, statuses, getStatusColor } from "@/pages/admin/lead/contants/constant.ts";
import LeadForm from "@/pages/admin/lead/lead-form/lead-form.tsx";

// Filter constants
const FILTER_ALL_VALUE = 'all';

// Enhanced filter interface
interface Filters {
    status: string;
    program: string;
    university: string;
    source: string;
    dateRange: string;
}

// Main Component
const AdminLeads = () => {
    const {
        leads,
        loading,
        searchTerm,
        fetchMultiple,
        refresh,
        clearCache
    } = useContent();

    // Get pagination hook
    const { loadMore } = useContentPagination();

    // Local state
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<Filters>({
        status: FILTER_ALL_VALUE,
        program: FILTER_ALL_VALUE,
        university: FILTER_ALL_VALUE,
        source: FILTER_ALL_VALUE,
        dateRange: FILTER_ALL_VALUE
    });
    const [search, setSearch] = useState('');

    // Initialize data loading with optimized context - only once
    useEffect(() => {
        // Load leads with smaller batch only if not already loaded
        fetchMultiple(['leads'], { limit: 20, force: false });
    }, []); // Empty dependency array ensures this runs only once

    // // Debounced search effect using the context's built-in search
    // useEffect(() => {
    //     if (searchTerm.trim()) {
    //         searchAllContent();
    //     } else if (searchTerm === '') {
    //         // Only reset to default view when search is explicitly cleared
    //         fetchMultiple(['leads'], { limit: 20, force: false });
    //     }
    // }, [searchTerm]); // Removed dependencies to prevent refetch on tab switch

    // Memoized filtered leads (client-side filtering for additional filters)
    const filteredLeads = useMemo(() => {
        let filtered = leads;

        if(search.trim()){
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(l =>
            l.name.toLowerCase().includes(searchLower) ||
            l.program.toLowerCase().includes(searchLower)
            )
        }
        if (filters.status && filters.status !== FILTER_ALL_VALUE) {
            filtered = filtered.filter(lead => lead.status === filters.status);
        }

        if (filters.program && filters.program !== FILTER_ALL_VALUE) {
            filtered = filtered.filter(lead => lead.program === filters.program);
        }

        if (filters.university && filters.university !== FILTER_ALL_VALUE) {
            filtered = filtered.filter(lead => lead.university === filters.university);
        }

        if (filters.source && filters.source !== FILTER_ALL_VALUE) {
            filtered = filtered.filter(lead => lead.source === filters.source);
        }

        if (filters.dateRange && filters.dateRange !== FILTER_ALL_VALUE) {
            const now = new Date();
            const startDate = new Date();

            switch (filters.dateRange) {
                case 'today':
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case 'quarter':
                    startDate.setMonth(now.getMonth() - 3);
                    break;
            }

            filtered = filtered.filter(lead => {
                if (!lead.created_at) return false;
                const leadDate = new Date(lead.created_at);
                return leadDate >= startDate;
            });
        }

        return filtered;
    }, [leads, filters, search]);

    // Get unique values for filter options
    const filterOptions = useMemo(() => {
        const programs = [...new Set(leads.map(lead => lead.program))].filter(Boolean);
        const universities = [...new Set(leads.map(lead => lead.university))].filter(Boolean);
        const sources = [...new Set(leads.map(lead => lead.source))].filter(Boolean);

        return {
            programs: programs.sort(),
            universities: universities.sort(),
            sources: sources.sort(),
            statuses: statuses.filter(status => status !== 'all')
        };
    }, [leads]);

    // Handlers
    const handleAdd = useCallback(() => {
        setIsFormDialogOpen(true);
        setSelectedLead(null);
        setIsEditMode(false);
    }, []);

    const handleEdit = useCallback((lead: Lead) => {
        setIsEditMode(true);
        setSelectedLead({...lead});
        setIsFormDialogOpen(true);
    }, []);

    const handleFormSubmit = useCallback(async (data: Lead) => {
        setLocalLoading(true);
        try {
            if (isEditMode && selectedLead) {
                // Update existing lead
                const { error } = await supabase
                    .from('leads')
                    .update(data)
                    .eq('id', selectedLead.id);

                if (error) throw error;
                toast.success('Lead updated successfully!');
            } else {
                // Create new lead
                const { error } = await supabase.from('leads').insert(data);

                if (error) throw error;
                toast.success('Lead added successfully!');
            }

            // Refresh leads data using optimized context
            await refresh('leads');
            setIsFormDialogOpen(false);
            setSelectedLead(null);
        } catch (error) {
            console.error('Form submission error:', error);
            toast.error(isEditMode ? 'Failed to update lead' : 'Failed to add lead');
        } finally {
            setLocalLoading(false);
        }
    }, [isEditMode, selectedLead, refresh]);

    const handleFormCancel = useCallback(() => {
        setIsFormDialogOpen(false);
        setSelectedLead(null);
        setIsEditMode(false);
    }, []);

    const handleDeleteClick = useCallback((lead: Lead) => {
        setIsDeleteDialogOpen(true);
        setSelectedLead(lead);
    }, []);

    const handleDelete = useCallback(async () => {
        if (!selectedLead) return;

        setLocalLoading(true);
        try {
            const { error } = await supabase
                .from('leads')
                .delete()
                .eq('id', selectedLead.id);

            if (error) throw error;

            await refresh('leads');
            toast.success('Lead deleted successfully!');
            setIsDeleteDialogOpen(false);
            setSelectedLead(null);
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete lead');
        } finally {
            setLocalLoading(false);
        }
    }, [selectedLead, refresh]);

    // Handle load more for pagination
    const handleLoadMore = useCallback(() => {
        loadMore('leads', leads.length, 20);
    }, [loadMore, leads.length]);

    // Handle manual refresh
    const handleRefresh = useCallback(async () => {
        clearCache('leads');
        await fetchMultiple(['leads'], { force: true, limit: 20 });
        toast.success('Leads refreshed');
    }, [clearCache, fetchMultiple]);

    // Handle filter changes
    const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({
            status: FILTER_ALL_VALUE,
            program: FILTER_ALL_VALUE,
            university: FILTER_ALL_VALUE,
            source: FILTER_ALL_VALUE,
            dateRange: FILTER_ALL_VALUE
        });
    }, []);

    // Handle export with filtered data
    const handleExport = useCallback(() => {
        if (filteredLeads.length === 0) {
            toast.error('No leads to export.');
            return;
        }

        const exportData = filteredLeads.map(lead => ({
            Name: lead.name,
            Email: lead.email,
            Phone: lead.phone,
            Program: lead.program,
            University: lead.university || '',
            Status: lead.status,
            Source: lead.source || '',
            Message: lead.message,
            CreatedAt: lead.created_at ? formatDate(lead.created_at) : ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
        XLSX.writeFile(workbook, `leads_export_${new Date().toISOString().split('T')[0]}.xlsx`);

        toast.success(`${filteredLeads.length} leads exported successfully!`);
    }, [filteredLeads]);

    // Combined loading state
    const isLoading = loading.leads || localLoading;

    // Get summary statistics
    const summaryStats = useMemo(() => {
        const total = filteredLeads.length;
        const statusCounts = filteredLeads.reduce((acc, lead) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            total,
            new: statusCounts['new'] || 0,
            contacted: statusCounts['contacted'] || 0,
            qualified: statusCounts['qualified'] || 0,
            converted: statusCounts['converted'] || 0
        };
    }, [filteredLeads]);

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
                        <p className="text-gray-600 mt-1">
                            Manage and track student inquiries ({filteredLeads.length} total)
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="flex items-center space-x-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleExport}
                            disabled={filteredLeads.length === 0}
                            className="flex items-center space-x-2"
                        >
                            <Download className="h-4 w-4" />
                            <span>Export ({filteredLeads.length})</span>
                        </Button>
                        <Button onClick={handleAdd} className="flex items-center space-x-2">
                            <Plus className="h-4 w-4" />
                            <span>Add Lead</span>
                        </Button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white rounded-lg shadow-sm p-4 border">
                        <div className="text-2xl font-bold text-gray-900">{summaryStats.total}</div>
                        <div className="text-sm text-gray-600">Total Leads</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 border">
                        <div className="text-2xl font-bold text-blue-600">{summaryStats.new}</div>
                        <div className="text-sm text-gray-600">New</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 border">
                        <div className="text-2xl font-bold text-yellow-600">{summaryStats.contacted}</div>
                        <div className="text-sm text-gray-600">Contacted</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 border">
                        <div className="text-2xl font-bold text-purple-600">{summaryStats.qualified}</div>
                        <div className="text-sm text-gray-600">Qualified</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 border">
                        <div className="text-2xl font-bold text-green-600">{summaryStats.converted}</div>
                        <div className="text-sm text-gray-600">Converted</div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search leads..."
                                className="pl-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2"
                        >
                            <Filter className="h-4 w-4" />
                            <span>Filters</span>
                            {Object.values(filters).some(f => f !== FILTER_ALL_VALUE) && (
                                <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {Object.values(filters).filter(f => f !== FILTER_ALL_VALUE).length}
                </span>
                            )}
                        </Button>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                {/* Status Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <Select
                                        value={filters.status}
                                        onValueChange={(value) => handleFilterChange('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={FILTER_ALL_VALUE}>All statuses</SelectItem>
                                            {filterOptions.statuses.map(status => (
                                                <SelectItem key={status} value={status}>
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Program Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Program
                                    </label>
                                    <Select
                                        value={filters.program}
                                        onValueChange={(value) => handleFilterChange('program', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All programs" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={FILTER_ALL_VALUE}>All programs</SelectItem>
                                            {filterOptions.programs.map(program => (
                                                <SelectItem key={program} value={program}>{program}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* University Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        University
                                    </label>
                                    <Select
                                        value={filters.university}
                                        onValueChange={(value) => handleFilterChange('university', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All universities" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={FILTER_ALL_VALUE}>All universities</SelectItem>
                                            {filterOptions.universities.map(university => (
                                                <SelectItem key={university} value={university}>{university}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Source Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Source
                                    </label>
                                    <Select
                                        value={filters.source}
                                        onValueChange={(value) => handleFilterChange('source', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All sources" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={FILTER_ALL_VALUE}>All sources</SelectItem>
                                            {filterOptions.sources.map(source => (
                                                <SelectItem key={source} value={source}>{source}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Date Range Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date Range
                                    </label>
                                    <Select
                                        value={filters.dateRange}
                                        onValueChange={(value) => handleFilterChange('dateRange', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All time" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={FILTER_ALL_VALUE}>All time</SelectItem>
                                            <SelectItem value="today">Today</SelectItem>
                                            <SelectItem value="week">Last 7 days</SelectItem>
                                            <SelectItem value="month">Last 30 days</SelectItem>
                                            <SelectItem value="quarter">Last 3 months</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-end mt-4">
                                <Button variant="outline" onClick={clearFilters} size="sm">
                                    <X className="h-4 w-4 mr-1" />
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Leads Table */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <span className="animate-spin h-8 w-8 border-4 border-t-transparent border-blue-600 rounded-full"></span>
                        <span className="ml-4 text-gray-600 font-medium">Loading Leads...</span>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Program Interest
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Source
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {filteredLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            <div className="flex flex-col items-center space-y-2">
                                                <Search className="h-8 w-8 text-gray-300" />
                                                <p>No leads found.</p>
                                                {searchTerm || Object.values(filters).some(f => f !== FILTER_ALL_VALUE) ? (
                                                    <p className="text-sm">Try adjusting your search or filters.</p>
                                                ) : (
                                                    <Button onClick={handleAdd} className="mt-2">
                                                        Add First Lead
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLeads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-2">
                                                        <User className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-900">{lead.name}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Mail className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm text-gray-600">{lead.email}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Phone className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm text-gray-600">{lead.phone}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{lead.program}</div>
                                                    {lead.university && (
                                                        <div className="text-sm text-blue-600">{lead.university}</div>
                                                    )}
                                                    {lead.message && (
                                                        <div className="text-xs text-gray-500 mt-1 line-clamp-2" title={lead.message}>
                                                            {lead.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                            {lead.status?.charAt(0).toUpperCase() + lead.status?.slice(1) || 'Unknown'}
                          </span>
                                            </td>
                                            <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {lead.source || 'Direct'}
                          </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-gray-900">
                              {lead.created_at ? formatDate(lead.created_at) : 'N/A'}
                            </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(lead)}
                                                        disabled={isLoading}
                                                        className="text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(lead)}
                                                        disabled={isLoading}
                                                        className="text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Load More Button */}
                        {filteredLeads.length > 0 && filteredLeads.length >= 20 && (
                            <div className="px-6 py-4 border-t border-gray-200 text-center">
                                <Button
                                    variant="outline"
                                    onClick={handleLoadMore}
                                    disabled={isLoading}
                                    className="w-full sm:w-auto"
                                >
                                    {isLoading ? 'Loading...' : 'Load More Leads'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Form Dialog */}
                <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {isEditMode ? 'Edit Lead' : 'Add New Lead'}
                            </DialogTitle>
                        </DialogHeader>
                        <LeadForm
                            isEdit={isEditMode}
                            initialData={selectedLead}
                            onSubmit={handleFormSubmit}
                            loading={localLoading}
                            onCancel={handleFormCancel}
                        />
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <ConfirmationDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={handleDelete}
                    title="Delete Lead"
                    description={`Are you sure you want to delete "${selectedLead?.name}"'s lead? This action cannot be undone.`}
                    confirmText="Delete Lead"
                    cancelText="Cancel"
                    variant="destructive"
                />
            </div>
        </AdminLayout>
    );
};

export default AdminLeads;