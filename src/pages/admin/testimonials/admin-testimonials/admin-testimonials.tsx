import AdminLayout from "@/components/admin/admin-layout.tsx";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { useAuth } from "@/contexts/AuthContext";
import { useContent, useContentPagination } from "@/contexts/ContentContext";
import { Testimonial, TestimonialFormData } from "@/dto/testimonial.ts";
import { supabase } from "@/lib/supabaseClient";
import { Edit, Filter, Plus, Search, Trash2, RefreshCw, X } from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import TestimonialForm from "@/pages/admin/testimonials/testimonial-form/testimonial-form.tsx";

// Filter constants
const FILTER_ALL_VALUE = 'all';

// Enhanced filter interface
interface Filters {
    university: string;
    rating: string;
    role: string;
    company: string;
}

// Main Component
const AdminTestimonials = () => {
    const { user } = useAuth();
    const {
        testimonials,
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
    const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<Filters>({
        university: FILTER_ALL_VALUE,
        rating: FILTER_ALL_VALUE,
        role: FILTER_ALL_VALUE,
        company: FILTER_ALL_VALUE
    });
    const [search, setSearch] = useState("");

    // Initialize data loading with optimized context - only once
    useEffect(() => {
        // Load testimonials with smaller batch only if not already loaded
        fetchMultiple(['testimonials'], { limit: 20, force: false });
    }, []); // Empty dependency array ensures this runs only once

    // // Debounced search effect using the context's built-in search
    // useEffect(() => {
    //     if (searchTerm.trim()) {
    //         searchAllContent();
    //     } else if (searchTerm === '') {
    //         // Only reset to default view when search is explicitly cleared
    //         fetchMultiple(['testimonials'], { limit: 20, force: false });
    //     }
    // }, [searchTerm]); // Removed dependencies to prevent refetch on tab switch

    // Memoized filtered testimonials (client-side filtering for additional filters)
    const filteredTestimonials = useMemo(() => {
        let filtered = testimonials;

        if(search.trim()){
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(t =>
            t.name.toLowerCase().includes(searchLower) ||
            t.company.toLowerCase().includes(searchLower) ||
            t.program.toLowerCase().includes(searchLower) ||
            t.university.toLowerCase().includes(searchLower)
            );
        }
        if (filters.university && filters.university !== FILTER_ALL_VALUE) {
            filtered = filtered.filter(testimonial => testimonial.university === filters.university);
        }

        if (filters.rating && filters.rating !== FILTER_ALL_VALUE) {
            const rating = parseInt(filters.rating);
            filtered = filtered.filter(testimonial => testimonial.rating === rating);
        }

        if (filters.role && filters.role !== FILTER_ALL_VALUE) {
            filtered = filtered.filter(testimonial => testimonial.role === filters.role);
        }

        if (filters.company && filters.company !== FILTER_ALL_VALUE) {
            filtered = filtered.filter(testimonial => testimonial.company === filters.company);
        }

        return filtered;
    }, [testimonials, filters, search]);

    // Get unique values for filter options
    const filterOptions = useMemo(() => {
        const universities = [...new Set(testimonials.map(testimonial => testimonial.university))].filter(Boolean);
        const ratings = [...new Set(testimonials.map(testimonial => testimonial.rating))].filter(Boolean);
        const roles = [...new Set(testimonials.map(testimonial => testimonial.role))].filter(Boolean);
        const companies = [...new Set(testimonials.map(testimonial => testimonial.company))].filter(Boolean);

        return {
            universities: universities.sort(),
            ratings: ratings.sort((a, b) => b - a), // Sort ratings descending
            roles: roles.sort(),
            companies: companies.sort()
        };
    }, [testimonials]);

    // Handlers
    const handleAdd = useCallback(() => {
        setIsFormDialogOpen(true);
        setSelectedTestimonial(null);
        setIsEditMode(false);
    }, []);

    const handleEdit = useCallback((testimonial: Testimonial) => {
        setIsEditMode(true);
        setSelectedTestimonial(testimonial);
        setIsFormDialogOpen(true);
    }, []);

    const handleFormSubmit = useCallback(async (data: TestimonialFormData) => {
        setLocalLoading(true);
        try {
            if (isEditMode && selectedTestimonial) {
                // Update existing testimonial
                const { error } = await supabase
                    .from('testimonials')
                    .update(data)
                    .eq('id', selectedTestimonial.id);

                if (error) throw error;
                toast.success('Testimonial updated successfully!');
            } else {
                // Create new testimonial
                const { error } = await supabase.from('testimonials').insert({
                    ...data,
                    created_by: user?.id
                });

                if (error) throw error;
                toast.success('Testimonial added successfully!');
            }

            // Refresh testimonials data using optimized context
            await refresh('testimonials');
            setIsFormDialogOpen(false);
            setSelectedTestimonial(null);
        } catch (error) {
            console.error('Form submission error:', error);
            toast.error(isEditMode ? 'Failed to update testimonial' : 'Failed to add testimonial');
        } finally {
            setLocalLoading(false);
        }
    }, [isEditMode, selectedTestimonial, user?.id, refresh]);

    const handleFormCancel = useCallback(() => {
        setIsFormDialogOpen(false);
        setSelectedTestimonial(null);
        setIsEditMode(false);
    }, []);

    const handleDeleteClick = useCallback((testimonial: Testimonial) => {
        setIsDeleteDialogOpen(true);
        setSelectedTestimonial(testimonial);
    }, []);

    const handleDelete = useCallback(async () => {
        if (!selectedTestimonial) return;

        setLocalLoading(true);
        try {
            const { error } = await supabase
                .from('testimonials')
                .delete()
                .eq('id', selectedTestimonial.id);

            if (error) throw error;

            await refresh('testimonials');
            toast.success('Testimonial deleted successfully!');
            setIsDeleteDialogOpen(false);
            setSelectedTestimonial(null);
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete testimonial');
        } finally {
            setLocalLoading(false);
        }
    }, [selectedTestimonial, refresh]);

    // Handle load more for pagination
    const handleLoadMore = useCallback(() => {
        loadMore('testimonials', testimonials.length, 20);
    }, [loadMore, testimonials.length]);

    // Handle manual refresh
    const handleRefresh = useCallback(async () => {
        clearCache('testimonials');
        await fetchMultiple(['testimonials'], { force: true, limit: 20 });
        toast.success('Testimonials refreshed');
    }, [clearCache, fetchMultiple]);

    // Handle filter changes
    const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({
            university: FILTER_ALL_VALUE,
            rating: FILTER_ALL_VALUE,
            role: FILTER_ALL_VALUE,
            company: FILTER_ALL_VALUE
        });
    }, []);

    // Combined loading state
    const isLoading = loading.testimonials || localLoading;

    // Render star rating
    const renderStarRating = (rating: number) => {
        return (
            <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                    <svg
                        key={i}
                        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        );
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
                        <p className="text-gray-600 mt-1">
                            Manage student testimonials and reviews ({filteredTestimonials.length} total)
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
                            <span>Add Testimonial</span>
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
                                placeholder="Search testimonials..."
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

                                {/* Rating Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rating
                                    </label>
                                    <Select
                                        value={filters.rating}
                                        onValueChange={(value) => handleFilterChange('rating', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Any rating" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={FILTER_ALL_VALUE}>Any rating</SelectItem>
                                            {filterOptions.ratings.map(rating => (
                                                <SelectItem key={rating} value={rating.toString()}>
                                                    {rating} {rating === 1 ? 'Star' : 'Stars'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Role Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role
                                    </label>
                                    <Select
                                        value={filters.role}
                                        onValueChange={(value) => handleFilterChange('role', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All roles" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={FILTER_ALL_VALUE}>All roles</SelectItem>
                                            {filterOptions.roles.map(role => (
                                                <SelectItem key={role} value={role}>{role}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Company Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Company
                                    </label>
                                    <Select
                                        value={filters.company}
                                        onValueChange={(value) => handleFilterChange('company', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All companies" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={FILTER_ALL_VALUE}>All companies</SelectItem>
                                            {filterOptions.companies.map(company => (
                                                <SelectItem key={company} value={company}>{company}</SelectItem>
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

                {/* Testimonials Grid */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <span className="animate-spin h-8 w-8 border-4 border-t-transparent border-blue-600 rounded-full"></span>
                        <span className="ml-4 text-gray-600 font-medium">Loading Testimonials...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTestimonials.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
                                <Search className="h-16 w-16 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No testimonials found</h3>
                                <p className="text-sm text-center max-w-sm">
                                    {searchTerm || Object.values(filters).some(f => f !== FILTER_ALL_VALUE)
                                        ? "Try adjusting your search or filters to find testimonials."
                                        : "Get started by adding your first testimonial."}
                                </p>
                                {!searchTerm && Object.values(filters).every(f => f === FILTER_ALL_VALUE) && (
                                    <Button onClick={handleAdd} className="mt-4">
                                        Add First Testimonial
                                    </Button>
                                )}
                            </div>
                        ) : (
                            filteredTestimonials.map((testimonial) => (
                                <div key={testimonial.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={testimonial.image}
                                                alt={testimonial.name}
                                                className="w-12 h-12 rounded-full bg-gray-500 object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=6366f1&color=fff`;
                                                }}
                                            />
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-900">{testimonial.name}</h4>
                                                <p className="text-xs text-gray-600">{testimonial.role}</p>
                                                <p className="text-xs text-gray-500">{testimonial.company}</p>
                                                <p className="text-xs text-blue-600 font-medium">{testimonial.university}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {user?.id === testimonial.created_by && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(testimonial)}
                                                        disabled={isLoading}
                                                        className="text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(testimonial)}
                                                        disabled={isLoading}
                                                        className="text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">{testimonial.content}</p>

                                    <div className="flex items-center justify-between">
                                        {renderStarRating(testimonial.rating)}
                                        {testimonial.program && (
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {testimonial.program}
                      </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Load More Button */}
                {filteredTestimonials.length > 0 && filteredTestimonials.length >= 20 && (
                    <div className="text-center">
                        <Button
                            variant="outline"
                            onClick={handleLoadMore}
                            disabled={isLoading}
                            className="w-full sm:w-auto"
                        >
                            {isLoading ? 'Loading...' : 'Load More Testimonials'}
                        </Button>
                    </div>
                )}

                {/* Form Dialog */}
                <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {isEditMode ? 'Edit Testimonial' : 'Add New Testimonial'}
                            </DialogTitle>
                        </DialogHeader>
                        <TestimonialForm
                            isEdit={isEditMode}
                            initialData={selectedTestimonial}
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
                    title="Delete Testimonial"
                    description={`Are you sure you want to delete "${selectedTestimonial?.name}"'s testimonial? This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="destructive"
                />
            </div>
        </AdminLayout>
    );
};

export default AdminTestimonials;