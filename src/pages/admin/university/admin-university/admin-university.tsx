import { useAuth } from "@/contexts/AuthContext.tsx";
import { useContent, useContentPagination } from "@/contexts/ContentContext.tsx";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { University, UniversityFormData } from "@/dto/university.ts";
import { supabase } from "@/lib/supabaseClient.ts";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/admin-layout.tsx";
import { Edit, Plus, Search, Trash2, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
import UniversityForm from "@/pages/admin/university/university-form/university-form.tsx";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";

// Enhanced filter interface
interface Filters {
    naacGrade: string;
    minRating: string;
    location: string;
}

// Filter constants
const FILTER_ALL_VALUE = 'all';

const AdminUniversity = () => {
    const { user } = useAuth();
    const {
        universities,
        loading,
        searchTerm,
        fetchUniversities,
        refresh,
        clearCache
    } = useContent();

    // Get pagination hook
    const { loadMore } = useContentPagination();

    // Local state
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);
    const [filters, setFilters] = useState<Filters>({
        naacGrade: FILTER_ALL_VALUE,
        minRating: FILTER_ALL_VALUE,
        location: FILTER_ALL_VALUE
    });
    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState('');

    // Initialize data loading with optimized context
    useEffect(() => {
        // Load initial universities with smaller batch
        fetchUniversities({ limit: 20, force: false });
    }, []);

    // // Debounced search effect using the context's built-in search
    // useEffect(() => {
    //     if (searchTerm.trim()) {
    //         fetchUniversities({ searchTerm, limit: 20, force: true });
    //     } else {
    //         // Reset to default view when search is cleared
    //         fetchUniversities({ limit: 20, force: false });
    //     }
    // }, [searchTerm, setSearchTerm, fetchUniversities]);

    // Memoized filtered universities (client-side filtering for additional filters)
    const filteredUniversities = useMemo(() => {
        let filtered = universities;

        if (search.trim()) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(uni =>
                uni.name.toLowerCase().includes(searchLower) ||
                uni.location?.toLowerCase().includes(searchLower) ||
                uni.naacGrade?.toLowerCase().includes(searchLower)
            );
        }

        if (filters.naacGrade && filters.naacGrade !== FILTER_ALL_VALUE) {
            filtered = filtered.filter(uni => uni.naacGrade === filters.naacGrade);
        }

        if (filters.minRating && filters.minRating !== FILTER_ALL_VALUE) {
            const minRating = parseFloat(filters.minRating);
            filtered = filtered.filter(uni => uni.rating >= minRating);
        }

        if (filters.location && filters.location !== FILTER_ALL_VALUE) {
            filtered = filtered.filter(uni =>
                uni.location.toLowerCase().includes(filters.location.toLowerCase())
            );
        }

        return filtered;
    }, [universities, filters, search]);

    // Get unique values for filter options
    const filterOptions = useMemo(() => {
        const naacGrades = [...new Set(universities.map(uni => uni.naacGrade))].filter(Boolean);
        const locations = [...new Set(universities.map(uni => uni.location))].filter(Boolean);

        return {
            naacGrades: naacGrades.sort(),
            locations: locations.sort()
        };
    }, [universities]);

    // Handlers
    const handleAdd = useCallback(() => {
        setIsFormDialogOpen(true);
        setSelectedUniversity(null);
        setIsEditMode(false);
    }, []);

    const handleEdit = useCallback((university: University) => {
        setIsEditMode(true);
        setSelectedUniversity(university);
        setIsFormDialogOpen(true);
    }, []);

    const handleFormSubmit = useCallback(async (data: UniversityFormData) => {
        setLocalLoading(true);
        try {
            if (isEditMode && selectedUniversity) {
                // Edit University
                const { error } = await supabase
                    .from('universities')
                    .update(data)
                    .eq('id', selectedUniversity.id);

                if (error) throw error;
                toast.success('University updated successfully.');
            } else {
                // Add University
                const { error } = await supabase.from('universities').insert({
                    ...data,
                    created_by: user?.id
                });

                if (error) throw error;
                toast.success('University added successfully.');
            }

            // Refresh universities data using optimized context
            await refresh('universities');
            setIsFormDialogOpen(false);
            setSelectedUniversity(null);
        } catch (error) {
            toast.error(isEditMode ? 'Failed to update university.' : 'Failed to add university.');
        } finally {
            setLocalLoading(false);
        }
    }, [isEditMode, selectedUniversity, user?.id, refresh]);

    const handleFormCancel = useCallback(() => {
        setIsFormDialogOpen(false);
        setSelectedUniversity(null);
        setIsEditMode(false);
    }, []);

    const handleDeleteClick = useCallback((university: University) => {
        setIsDeleteDialogOpen(true);
        setSelectedUniversity(university);
    }, []);

    const handleDelete = useCallback(async () => {
        if (!selectedUniversity) return;

        setLocalLoading(true);
        try {
            const { error } = await supabase
                .from('universities')
                .delete()
                .eq('id', selectedUniversity.id);

            if (error) throw error;

            await refresh('universities');
            toast.success('University deleted successfully.');
            setIsDeleteDialogOpen(false);
            setSelectedUniversity(null);
        } catch (error) {
            toast.error('Failed to delete university');
        } finally {
            setLocalLoading(false);
        }
    }, [selectedUniversity, refresh]);

    // Handle load more for pagination
    const handleLoadMore = useCallback(() => {
        loadMore('universities', universities.length, 20);
    }, [loadMore, universities.length]);

    // Handle manual refresh
    const handleRefresh = useCallback(async () => {
        clearCache('universities');
        await fetchUniversities({ force: true, limit: 20 });
        toast.success('Universities refreshed');
    }, [clearCache, fetchUniversities]);

    // Handle filter changes
    const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({
            naacGrade: FILTER_ALL_VALUE,
            minRating: FILTER_ALL_VALUE,
            location: FILTER_ALL_VALUE
        });
    }, []);

    // Combined loading state
    const isLoading = loading.universities || localLoading;

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Universities</h1>
                        <p className="text-gray-600 mt-1">
                            Manage university listings and information ({filteredUniversities.length} total)
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
                            <span>Add University</span>
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
                                placeholder="Search universities..."
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
                                        NAAC Grade
                                    </label>
                                    <Select
                                        value={filters.naacGrade}
                                        onValueChange={(value) => handleFilterChange('naacGrade', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All grades" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={FILTER_ALL_VALUE}>All grades</SelectItem>
                                            {filterOptions.naacGrades.map(grade => (
                                                <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Minimum Rating
                                    </label>
                                    <Select
                                        value={filters.minRating}
                                        onValueChange={(value) => handleFilterChange('minRating', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Any rating" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={FILTER_ALL_VALUE}>Any rating</SelectItem>
                                            <SelectItem value="4">4+ Stars</SelectItem>
                                            <SelectItem value="3">3+ Stars</SelectItem>
                                            <SelectItem value="2">2+ Stars</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Location
                                    </label>
                                    <Select
                                        value={filters.location}
                                        onValueChange={(value) => handleFilterChange('location', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All locations" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={FILTER_ALL_VALUE}>All locations</SelectItem>
                                            {filterOptions.locations.map(location => (
                                                <SelectItem key={location} value={location}>{location}</SelectItem>
                                            ))}
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
                        <span className="ml-4 text-gray-600 font-medium">Loading Universities...</span>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        University
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        NAAC Grade
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Rating
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Programs
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {filteredUniversities.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            <div className="flex flex-col items-center space-y-2">
                                                <Search className="h-8 w-8 text-gray-300" />
                                                <p>No universities found.</p>
                                                {searchTerm || Object.values(filters).some(f => f !== FILTER_ALL_VALUE) ? (
                                                    <p className="text-sm">Try adjusting your search or filters.</p>
                                                ) : null}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUniversities.map((university) => (
                                        <tr key={university.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <img
                                                        className="h-10 w-10 rounded-lg object-cover mr-4"
                                                        src={university.logo}
                                                        alt={university.name}
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/placeholder-university.png';
                                                        }}
                                                    />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {university.name}
                                                        </div>
                                                        {university.location && (
                                                            <div className="text-xs text-gray-500">
                                                                {university.location}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {university.naacGrade}
                          </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <span className="text-sm text-gray-900">{university.rating}/5</span>
                                                    <div className="flex ml-2">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span
                                                                key={i}
                                                                className={`text-xs ${
                                                                    i < university.rating ? 'text-yellow-400' : 'text-gray-300'
                                                                }`}
                                                            >
                                  ★
                                </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {university.programs}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    {user?.id === university.created_by && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEdit(university)}
                                                                className="text-blue-600 hover:bg-blue-50"
                                                                disabled={isLoading}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteClick(university)}
                                                                className="text-red-600 hover:bg-red-50"
                                                                disabled={isLoading}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Load More Button */}
                        {filteredUniversities.length > 0 && filteredUniversities.length >= 20 && (
                            <div className="px-6 py-4 border-t border-gray-200 text-center">
                                <Button
                                    variant="outline"
                                    onClick={handleLoadMore}
                                    disabled={isLoading}
                                    className="w-full sm:w-auto"
                                >
                                    {isLoading ? 'Loading...' : 'Load More Universities'}
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
                                {isEditMode ? 'Edit University' : 'Add New University'}
                            </DialogTitle>
                        </DialogHeader>
                        <UniversityForm
                            isEdit={isEditMode}
                            initialData={selectedUniversity}
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

export default AdminUniversity;