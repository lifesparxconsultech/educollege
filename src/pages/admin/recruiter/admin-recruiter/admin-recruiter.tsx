import AdminLayout from "@/components/admin/admin-layout.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useContent, useContentPagination } from "@/contexts/ContentContext.tsx";
import { RecruiterFormData, TopRecruiter } from "@/dto/recruiter.ts";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient.ts";
import { toast } from "sonner";
import { Edit, ExternalLink, Search, Trash2, RefreshCw, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
import RecruiterForm from "@/pages/admin/recruiter/recruiter-form/recruiter-form.tsx";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog.tsx";

// Enhanced filter interface
interface Filters {
    industry: string;
    status: string;
    packageRange: string;
}

// Filter constants
const FILTER_ALL_VALUE = 'all';

export default function AdminRecruiter() {
    const { user } = useAuth();
    const {
        topRecruiters,
        loading,
        searchTerm,
        setSearchTerm,
        fetchTopRecruiters,
        searchAllContent,
        refresh,
        clearCache
    } = useContent();

    // Get pagination hook
    const { loadMore } = useContentPagination();

    // Local state
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedRecruiter, setSelectedRecruiter] = useState<TopRecruiter | null>(null);
    const [localLoading, setLocalLoading] = useState(false);
    const [filters, setFilters] = useState<Filters>({
        industry: FILTER_ALL_VALUE,
        status: FILTER_ALL_VALUE,
        packageRange: FILTER_ALL_VALUE
    });
    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState("");

    // Initialize data loading with optimized context
    useEffect(() => {
        // Load initial recruiters with smaller batch
        fetchTopRecruiters({ limit: 20, force: false });
    }, [fetchTopRecruiters]);

    // // Debounced search effect using the context's built-in search
    // useEffect(() => {
    //     if (searchTerm.trim()) {
    //         searchAllContent();
    //     } else {
    //         // Reset to default view when search is cleared
    //         fetchTopRecruiters({ limit: 20, force: false });
    //     }
    // }, [searchTerm, searchAllContent, fetchTopRecruiters]);

    // Helper function to extract package value for filtering
    const getPackageValue = (packageStr: string): number => {
        if (!packageStr) return 0;
        const match = packageStr.match(/(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]) : 0;
    };

    // Memoized filtered recruiters (client-side filtering for additional filters)
    const filteredRecruiters = useMemo(() => {
        let filtered = topRecruiters;

        if(search.trim()){
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(r =>
            r.company_name.toLowerCase().includes(searchLower)||
            r.industry.toLowerCase().includes(searchLower) ||
            r.average_package.toLowerCase().includes(searchLower)
            )
        }
        if (filters.industry && filters.industry !== FILTER_ALL_VALUE) {
            filtered = filtered.filter(recruiter =>
                recruiter.industry.toLowerCase().includes(filters.industry.toLowerCase())
            );
        }

        if (filters.status && filters.status !== FILTER_ALL_VALUE) {
            const isActive = filters.status === 'active';
            filtered = filtered.filter(recruiter => recruiter.is_active === isActive);
        }

        if (filters.packageRange && filters.packageRange !== FILTER_ALL_VALUE) {
            filtered = filtered.filter(recruiter => {
                if (!recruiter.average_package) return false;
                const packageValue = getPackageValue(recruiter.average_package);

                switch (filters.packageRange) {
                    case 'below-5':
                        return packageValue < 5;
                    case '5-10':
                        return packageValue >= 5 && packageValue <= 10;
                    case '10-20':
                        return packageValue >= 10 && packageValue <= 20;
                    case 'above-20':
                        return packageValue > 20;
                    default:
                        return true;
                }
            });
        }

        return filtered.sort((a, b) => a.display_order - b.display_order);
    }, [topRecruiters, filters, search]);

    // Get unique values for filter options
    const filterOptions = useMemo(() => {
        const industries = [...new Set(topRecruiters.map(recruiter => recruiter.industry))].filter(Boolean);

        return {
            industries: industries.sort()
        };
    }, [topRecruiters]);

    // Handlers
    const handleAdd = useCallback(() => {
        setIsFormDialogOpen(true);
        setSelectedRecruiter(null);
        setIsEditMode(false);
    }, []);

    const handleEdit = useCallback((recruiter: TopRecruiter) => {
        setIsEditMode(true);
        setSelectedRecruiter(recruiter);
        setIsFormDialogOpen(true);
    }, []);

    const handleFormSubmit = useCallback(async (data: RecruiterFormData) => {
        setLocalLoading(true);
        try {
            if (isEditMode && selectedRecruiter) {
                // Edit Recruiter
                const { error } = await supabase
                    .from('top_recruiters')
                    .update(data)
                    .eq('id', selectedRecruiter.id);

                if (error) throw error;
                toast.success('Recruiter updated successfully.');
            } else {
                // Add Recruiter
                const { error } = await supabase.from('top_recruiters').insert({
                    ...data,
                    created_by: user?.id
                });

                if (error) throw error;
                toast.success('Recruiter added successfully.');
            }

            // Refresh recruiters data using optimized context
            await refresh('topRecruiters');
            setIsFormDialogOpen(false);
            setSelectedRecruiter(null);
        } catch (error) {
            console.error('Form submission error:', error);
            toast.error(isEditMode ? 'Failed to update recruiter.' : 'Failed to add recruiter.');
        } finally {
            setLocalLoading(false);
        }
    }, [isEditMode, selectedRecruiter, user?.id, refresh]);

    const handleFormCancel = useCallback(() => {
        setIsFormDialogOpen(false);
        setSelectedRecruiter(null);
        setIsEditMode(false);
    }, []);

    const handleDeleteClick = useCallback((recruiter: TopRecruiter) => {
        setIsDeleteDialogOpen(true);
        setSelectedRecruiter(recruiter);
    }, []);

    const handleDelete = useCallback(async () => {
        if (!selectedRecruiter) return;

        setLocalLoading(true);
        try {
            const { error } = await supabase
                .from('top_recruiters')
                .delete()
                .eq('id', selectedRecruiter.id);

            if (error) throw error;

            await refresh('topRecruiters');
            toast.success('Recruiter deleted successfully.');
            setIsDeleteDialogOpen(false);
            setSelectedRecruiter(null);
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete recruiter');
        } finally {
            setLocalLoading(false);
        }
    }, [selectedRecruiter, refresh]);

    // Handle load more for pagination
    const handleLoadMore = useCallback(() => {
        loadMore('topRecruiters', topRecruiters.length, 20);
    }, [loadMore, topRecruiters.length]);

    // Handle manual refresh
    const handleRefresh = useCallback(async () => {
        clearCache('topRecruiters');
        await fetchTopRecruiters({ force: true, limit: 20 });
        toast.success('Recruiters refreshed');
    }, [clearCache, fetchTopRecruiters]);

    // Handle filter changes
    const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({
            industry: FILTER_ALL_VALUE,
            status: FILTER_ALL_VALUE,
            packageRange: FILTER_ALL_VALUE
        });
    }, []);

    // Combined loading state
    const isLoading = loading.topRecruiters || localLoading;

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Top Recruiters</h1>
                        <p className="text-gray-600 mt-1">
                            Manage companies that recruit our graduates ({filteredRecruiters.length} total)
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
                        <Button onClick={handleAdd} className="flex items-center space-x-2">
                            <Plus className="h-4 w-4" />
                            <span>Add Recruiter</span>
                        </Button>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search recruiters..."
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
                        </Button>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Industry
                                    </label>
                                    <Select
                                        value={filters.industry}
                                        onValueChange={(value) => handleFilterChange('industry', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All industries" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={FILTER_ALL_VALUE}>All industries</SelectItem>
                                            {filterOptions.industries.map(industry => (
                                                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

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
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Package Range (LPA)
                                    </label>
                                    <Select
                                        value={filters.packageRange}
                                        onValueChange={(value) => handleFilterChange('packageRange', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All packages" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={FILTER_ALL_VALUE}>All packages</SelectItem>
                                            <SelectItem value="below-5">Below 5 LPA</SelectItem>
                                            <SelectItem value="5-10">5-10 LPA</SelectItem>
                                            <SelectItem value="10-20">10-20 LPA</SelectItem>
                                            <SelectItem value="above-20">Above 20 LPA</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-end mt-4">
                                <Button variant="outline" onClick={clearFilters} size="sm">
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <span className="animate-spin h-8 w-8 border-4 border-t-transparent border-blue-600 rounded-full"></span>
                        <span className="ml-4 text-gray-600 font-medium">Loading Recruiters...</span>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Recruiters Grid */}
                        {filteredRecruiters.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm py-20">
                                <div className="flex flex-col items-center space-y-4 text-center">
                                    <ExternalLink className="h-12 w-12 text-gray-300" />
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No recruiters found</h3>
                                        <p className="text-gray-500 mb-4">
                                            {searchTerm || Object.values(filters).some(f => f !== FILTER_ALL_VALUE)
                                                ? 'Try adjusting your search or filters.'
                                                : 'Get started by adding your first recruiter.'}
                                        </p>
                                        {!searchTerm && Object.values(filters).every(f => f === FILTER_ALL_VALUE) && (
                                            <Button onClick={handleAdd} className="flex items-center space-x-2">
                                                <Plus className="h-4 w-4" />
                                                <span>Add Recruiter</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredRecruiters.map((recruiter) => (
                                    <div key={recruiter.id} className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 transition hover:shadow-lg">
                                        <div className="flex items-start gap-4">
                                            <img
                                                src={recruiter.logo}
                                                alt={recruiter.company_name}
                                                className="w-14 h-14 object-cover rounded-md border"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/placeholder-company.png';
                                                }}
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

                                            {user?.id === recruiter.created_by && (
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(recruiter)}
                                                        className="text-blue-600 hover:bg-blue-50"
                                                        disabled={isLoading}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(recruiter)}
                                                        className="text-red-600 hover:bg-red-50"
                                                        disabled={isLoading}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Load More Button */}
                        {filteredRecruiters.length > 0 && filteredRecruiters.length >= 20 && (
                            <div className="text-center">
                                <Button
                                    variant="outline"
                                    onClick={handleLoadMore}
                                    disabled={isLoading}
                                    className="w-full sm:w-auto"
                                >
                                    {isLoading ? 'Loading...' : 'Load More Recruiters'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Form Dialog */}
                <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                    <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
                        <DialogHeader>
                            <DialogTitle>
                                {isEditMode ? 'Edit Recruiter' : 'Add New Recruiter'}
                            </DialogTitle>
                        </DialogHeader>
                        <RecruiterForm
                            isEdit={isEditMode}
                            initialData={selectedRecruiter}
                            onSubmit={handleFormSubmit}
                            onCancel={handleFormCancel}
                            loading={localLoading}
                        />
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <ConfirmationDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={handleDelete}
                    title='Delete Recruiter'
                    description={`Are you sure you want to delete "${selectedRecruiter?.company_name}"? This action cannot be undone.`}
                    confirmText='Delete'
                    cancelText='Cancel'
                    variant='destructive'
                />
            </div>
        </AdminLayout>
    )
}