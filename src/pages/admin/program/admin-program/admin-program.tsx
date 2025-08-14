import AdminLayout from "@/components/admin/admin-layout.tsx";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { useAuth } from "@/contexts/AuthContext";
import { useContent, useContentPagination } from "@/contexts/ContentContext";
import { Program, ProgramFormData } from "@/dto/program.ts";
import { supabase } from "@/lib/supabaseClient";
import { Edit, Filter, Plus, Search, Trash2, RefreshCw, X } from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import ProgramForm from "@/pages/admin/program/program-form/program-form.tsx";

// Filter constants
const FILTER_ALL_VALUE = 'all';

// Enhanced filter interface
interface Filters {
    category: string;
    duration: string;
    fees: string;
    university: string;
}

// Main Component
const AdminPrograms = () => {
    const { user } = useAuth();
    const {
        universities,
        programs,
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
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<Filters>({
        category: FILTER_ALL_VALUE,
        duration: FILTER_ALL_VALUE,
        fees: FILTER_ALL_VALUE,
        university: FILTER_ALL_VALUE
    });
    const [search, setSearch] = useState("");

    // Initialize data loading with optimized context - only once
    useEffect(() => {
      // Load both programs and universities with smaller batch only if not already loaded
      fetchMultiple(['programs', 'universities'], { limit: 20, force: false });
    }, []); // Empty dependency array ensures this runs only once

    // // Debounced search effect using the context's built-in search
    // useEffect(() => {
    //   if (searchTerm.trim()) {
    //     searchAllContent();
    //   } else if (searchTerm === '') {
    //     // Only reset to default view when search is explicitly cleared
    //     fetchMultiple(['programs', 'universities'], { limit: 20, force: false });
    //   }
    // }, []); // Removed dependencies to prevent refetch on tab switch

    // Memoized filtered programs (client-side filtering for additional filters)
    const filteredPrograms = useMemo(() => {
        let filtered = programs;

        if(search.trim()){
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(searchLower) ||
                p.category.toLowerCase().includes(searchLower)
            );
        }

        if (filters.category && filters.category !== FILTER_ALL_VALUE) {
            filtered = filtered.filter(program => program.category === filters.category);
        }

        if (filters.duration && filters.duration !== FILTER_ALL_VALUE) {
            const duration = parseInt(filters.duration);
            filtered = filtered.filter(program => program.duration === duration);
        }

        if (filters.fees && filters.fees !== FILTER_ALL_VALUE) {
            const [min, max] = filters.fees.split('-').map(Number);
            filtered = filtered.filter(program => {
                if (max) {
                    return program.fees >= min && program.fees <= max;
                }
                return program.fees >= min;
            });
        }

        if (filters.university && filters.university !== FILTER_ALL_VALUE) {
            filtered = filtered.filter(program => program.university_id === filters.university);
        }

        return filtered;
    }, [programs, filters, search]);

    // Get unique values for filter options
    const filterOptions = useMemo(() => {
        const categories = [...new Set(programs.map(program => program.category))].filter(Boolean);
        const durations = [...new Set(programs.map(program => program.duration))].filter(Boolean);
        const activeUniversities = universities.filter(uni =>
            programs.some(program => program.university_id === uni.id)
        );

        return {
            categories: categories.sort(),
            durations: durations.sort((a, b) => a - b),
            universities: activeUniversities.sort((a, b) => a.name.localeCompare(b.name))
        };
    }, [programs, universities]);

    // Handlers
    const handleAdd = useCallback(() => {
        setIsFormDialogOpen(true);
        setSelectedProgram(null);
        setIsEditMode(false);
    }, []);

    const handleEdit = useCallback((program: Program) => {
        setIsEditMode(true);
        setSelectedProgram(program);
        setIsFormDialogOpen(true);
    }, []);

    const handleFormSubmit = useCallback(async (data: ProgramFormData) => {
        setLocalLoading(true);
        try {
            if (isEditMode && selectedProgram) {
                // Update existing program
                const { error } = await supabase
                    .from('programs')
                    .update(data)
                    .eq('id', selectedProgram.id);

                if (error) throw error;
                toast.success('Program updated successfully!');
            } else {
                // Create new program
                const { error } = await supabase.from('programs').insert({
                    ...data,
                    created_by: user?.id
                });

                if (error) throw error;
                toast.success('Program added successfully!');
            }

            // Refresh programs data using optimized context
            await refresh('programs');
            setIsFormDialogOpen(false);
            setSelectedProgram(null);
        } catch (error) {
            console.error('Form submission error:', error);
            toast.error(isEditMode ? 'Failed to update program' : 'Failed to add program');
        } finally {
            setLocalLoading(false);
        }
    }, [isEditMode, selectedProgram, user?.id, refresh]);

    const handleFormCancel = useCallback(() => {
        setIsFormDialogOpen(false);
        setSelectedProgram(null);
        setIsEditMode(false);
    }, []);

    const handleDeleteClick = useCallback((program: Program) => {
        setIsDeleteDialogOpen(true);
        setSelectedProgram(program);
    }, []);

    const handleDelete = useCallback(async () => {
        if (!selectedProgram) return;

        setLocalLoading(true);
        try {
            const { error } = await supabase
                .from('programs')
                .delete()
                .eq('id', selectedProgram.id);

            if (error) throw error;

            await refresh('programs');
            toast.success('Program deleted successfully!');
            setIsDeleteDialogOpen(false);
            setSelectedProgram(null);
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete program');
        } finally {
            setLocalLoading(false);
        }
    }, [selectedProgram, refresh]);

    // Handle load more for pagination
    const handleLoadMore = useCallback(() => {
        loadMore('programs', programs.length, 20);
    }, [loadMore, programs.length]);

    // Handle manual refresh
    const handleRefresh = useCallback(async () => {
        clearCache('programs');
        clearCache('universities');
        await fetchMultiple(['programs', 'universities'], { force: true, limit: 20 });
        toast.success('Programs refreshed');
    }, [clearCache, fetchMultiple]);

    // Handle filter changes
    const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({
            category: FILTER_ALL_VALUE,
            duration: FILTER_ALL_VALUE,
            fees: FILTER_ALL_VALUE,
            university: FILTER_ALL_VALUE
        });
    }, []);

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Combined loading state
    const isLoading = loading.programs || loading.universities || localLoading;

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
                        <p className="text-gray-600 mt-1">
                            Manage academic programs and courses ({filteredPrograms.length} total)
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
                            <span>Add Program</span>
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
                                placeholder="Search programs..."
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Category Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <Select
                                        value={filters.category}
                                        onValueChange={(value) => handleFilterChange('category', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={FILTER_ALL_VALUE}>All categories</SelectItem>
                                            {filterOptions.categories.map(category => (
                                                <SelectItem key={category} value={category}>{category}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Duration Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Duration
                                    </label>
                                    <Select
                                        value={filters.duration}
                                        onValueChange={(value) => handleFilterChange('duration', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Any duration" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={FILTER_ALL_VALUE}>Any duration</SelectItem>
                                            {filterOptions.durations.map(duration => (
                                                <SelectItem key={duration} value={duration.toString()}>
                                                    {duration} {duration === 1 ? 'Year' : 'Years'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Fees Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fees Range
                                    </label>
                                    <Select
                                        value={filters.fees}
                                        onValueChange={(value) => handleFilterChange('fees', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Any fees" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={FILTER_ALL_VALUE}>Any fees</SelectItem>
                                            <SelectItem value="0-50000">₹0 - ₹50,000</SelectItem>
                                            <SelectItem value="50000-100000">₹50,000 - ₹1,00,000</SelectItem>
                                            <SelectItem value="100000-200000">₹1,00,000 - ₹2,00,000</SelectItem>
                                            <SelectItem value="200000-500000">₹2,00,000 - ₹5,00,000</SelectItem>
                                            <SelectItem value="500000">₹5,00,000+</SelectItem>
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
                                                <SelectItem key={university.id} value={university.id}>
                                                    {university.name}
                                                </SelectItem>
                                            ))}
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

                {/* Programs Table */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <span className="animate-spin h-8 w-8 border-4 border-t-transparent border-blue-600 rounded-full"></span>
                        <span className="ml-4 text-gray-600 font-medium">Loading Programs...</span>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Program
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        University
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Duration
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Fees
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {filteredPrograms.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            <div className="flex flex-col items-center space-y-2">
                                                <Search className="h-8 w-8 text-gray-300" />
                                                <p>No programs found.</p>
                                                {searchTerm || Object.values(filters).some(f => f !== FILTER_ALL_VALUE) ? (
                                                    <p className="text-sm">Try adjusting your search or filters.</p>
                                                ) : null}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPrograms.map((program) => (
                                        <tr key={program.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {program.title}
                                                    </div>
                                                    {program.description && (
                                                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                            {program.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    {program.university_details?.logo && (
                                                        <img
                                                            className="h-8 w-8 rounded object-cover mr-2"
                                                            src={program.university_details.logo}
                                                            alt={program.university_details.name}
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    )}
                                                    <span className="text-sm text-gray-900">
                              {program.university_details?.name || 'N/A'}
                            </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {program.category}
                          </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {program.duration} {program.duration === 1 ? 'Year' : 'Years'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {formatCurrency(program.fees)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    {user?.id === program.created_by && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEdit(program)}
                                                                disabled={isLoading}
                                                                className="text-blue-600 hover:bg-blue-50"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteClick(program)}
                                                                disabled={isLoading}
                                                                className="text-red-600 hover:bg-red-50"
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
                        {filteredPrograms.length > 0 && filteredPrograms.length >= 20 && (
                            <div className="px-6 py-4 border-t border-gray-200 text-center">
                                <Button
                                    variant="outline"
                                    onClick={handleLoadMore}
                                    disabled={isLoading}
                                    className="w-full sm:w-auto"
                                >
                                    {isLoading ? 'Loading...' : 'Load More Programs'}
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
                                {isEditMode ? 'Edit Program' : 'Add New Program'}
                            </DialogTitle>
                        </DialogHeader>
                        <ProgramForm
                            isEdit={isEditMode}
                            initialData={selectedProgram}
                            universities={universities}
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
                    title="Delete Program"
                    description={`Are you sure you want to delete "${selectedProgram?.title}"? This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="destructive"
                />
            </div>
        </AdminLayout>
    );
};

export default AdminPrograms;