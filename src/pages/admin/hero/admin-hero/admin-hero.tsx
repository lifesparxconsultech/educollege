import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus, Edit, Trash2, MoveUp, MoveDown, Eye, EyeClosed, RefreshCw, Search, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useContent, useContentPagination } from '@/contexts/ContentContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext
} from '@/components/ui/carousel';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { HeroCarousel, HeroCarouselFormData } from "@/dto/hero.ts";
import AdminLayout from "@/components/admin/admin-layout.tsx";
import HeroForm from "@/pages/admin/hero/hero-form/hero-form.tsx";

// Enhanced filter interface
interface Filters {
    status: string;
}

// Filter constants
const FILTER_ALL_VALUE = 'all';

const AdminHero: React.FC = () => {
    const { user } = useAuth();
    const {
        heroCarousel,
        loading,
        searchTerm,
        fetchHeroCarousel,
        refresh,
        clearCache
    } = useContent();

    // Get pagination hook
    const { loadMore } = useContentPagination();

    // Local state
    const [isCarouselFormOpen, setIsCarouselFormOpen] = useState(false);
    const [editingCarouselItem, setEditingCarouselItem] = useState<HeroCarousel | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedCarouselItem, setSelectedCarouselItem] = useState<HeroCarousel | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);
    const [filters, setFilters] = useState<Filters>({
        status: FILTER_ALL_VALUE
    });
    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState('');
    // Initialize data loading with optimized context
    useEffect(() => {
        // Load initial hero carousel with smaller batch
        fetchHeroCarousel({ limit: 20, force: false });
    }, [fetchHeroCarousel]);

    // // Debounced search effect using the context's built-in search
    // useEffect(() => {
    //     if (searchTerm.trim()) {
    //         searchAllContent();
    //     } else {
    //         // Reset to default view when search is cleared
    //         fetchHeroCarousel({ limit: 20, force: false });
    //     }
    // }, [searchTerm, searchAllContent, fetchHeroCarousel]);

    // Memoized filtered hero carousel (client-side filtering for additional filters)
    const filteredHeroCarousel = useMemo(() => {
        let filtered = heroCarousel;

        if(search.trim()){
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(h =>
            h.title.toLowerCase().includes(searchLower)
            )
        }
        if (filters.status && filters.status !== FILTER_ALL_VALUE) {
            const isActive = filters.status === 'active';
            filtered = filtered.filter(item => item.is_active === isActive);
        }

        return filtered.sort((a, b) => a.display_order - b.display_order);
    }, [heroCarousel, filters, search]);

    // Handlers
    const handleAdd = useCallback(() => {
        setIsCarouselFormOpen(true);
        setEditingCarouselItem(null);
    }, []);

    const handleEdit = useCallback((item: HeroCarousel) => {
        setEditingCarouselItem(item);
        setIsCarouselFormOpen(true);
    }, []);

    const handleFormSubmit = useCallback(async (data: HeroCarouselFormData) => {
        setLocalLoading(true);
        try {
            const payload = { ...data, created_by: user?.id };

            if (editingCarouselItem) {
                // Edit Hero Carousel Item
                const { error } = await supabase
                    .from('hero_carousel')
                    .update(payload)
                    .eq('id', editingCarouselItem.id);

                if (error) throw error;
                toast.success('Slide updated successfully.');
            } else {
                // Add Hero Carousel Item
                const { error } = await supabase
                    .from('hero_carousel')
                    .insert([payload]);

                if (error) throw error;
                toast.success('Slide added successfully.');
            }

            // Refresh hero carousel data using optimized context
            await refresh('heroCarousel');
            setIsCarouselFormOpen(false);
            setEditingCarouselItem(null);
        } catch (error) {
            console.error('Form submission error:', error);
            toast.error(editingCarouselItem ? 'Failed to update slide.' : 'Failed to add slide.');
        } finally {
            setLocalLoading(false);
        }
    }, [editingCarouselItem, user?.id, refresh]);

    const handleFormCancel = useCallback(() => {
        setIsCarouselFormOpen(false);
        setEditingCarouselItem(null);
    }, []);

    const handleDeleteClick = useCallback((item: HeroCarousel) => {
        setIsDeleteDialogOpen(true);
        setSelectedCarouselItem(item);
    }, []);

    const handleDelete = useCallback(async () => {
        if (!selectedCarouselItem) return;

        setLocalLoading(true);
        try {
            const { error } = await supabase
                .from('hero_carousel')
                .delete()
                .eq('id', selectedCarouselItem.id);

            if (error) throw error;

            await refresh('heroCarousel');
            toast.success('Slide deleted successfully.');
            setIsDeleteDialogOpen(false);
            setSelectedCarouselItem(null);
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete slide');
        } finally {
            setLocalLoading(false);
        }
    }, [selectedCarouselItem, refresh]);

    const moveCarouselItem = useCallback(async (id: string, direction: 'up' | 'down') => {
        const index = filteredHeroCarousel.findIndex((item) => item.id === id);
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === filteredHeroCarousel.length - 1)
        ) return;

        setLocalLoading(true);
        try {
            const newItems = [...filteredHeroCarousel];
            const swapIndex = direction === 'up' ? index - 1 : index + 1;

            // Swap
            [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];

            // Update display_order
            newItems.forEach((item, idx) => {
                item.display_order = idx + 1;
            });

            // Save to Supabase
            const updates = newItems.map(({ id, display_order }) =>
                supabase.from('hero_carousel').update({ display_order }).eq('id', id)
            );

            await Promise.all(updates);
            await refresh('heroCarousel');
            toast.success('Order updated successfully.');
        } catch (error) {
            console.error('Move error:', error);
            toast.error('Failed to update order');
        } finally {
            setLocalLoading(false);
        }
    }, [filteredHeroCarousel, refresh]);

    // Handle load more for pagination
    const handleLoadMore = useCallback(() => {
        loadMore('heroCarousel', heroCarousel.length, 20);
    }, [loadMore, heroCarousel.length]);

    // Handle manual refresh
    const handleRefresh = useCallback(async () => {
        clearCache('heroCarousel');
        await fetchHeroCarousel({ force: true, limit: 20 });
        toast.success('Hero carousel refreshed');
    }, [clearCache, fetchHeroCarousel]);

    // Handle filter changes
    const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({
            status: FILTER_ALL_VALUE
        });
    }, []);

    // Combined loading state
    const isLoading = loading.heroCarousel || localLoading;

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Hero Carousel Management</h1>
                        <p className="text-gray-600 mt-1">
                            Manage homepage hero carousel slides ({filteredHeroCarousel.length} total)
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
                            onClick={() => setShowPreview(!showPreview)}
                            className="flex items-center space-x-2"
                        >
                            {showPreview ? (
                                <>
                                    <EyeClosed className="h-4 w-4" />
                                    <span>Hide Preview</span>
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4" />
                                    <span>Live Preview</span>
                                </>
                            )}
                        </Button>
                        <Button onClick={handleAdd} className="flex items-center space-x-2">
                            <Plus className="h-4 w-4" />
                            <span>Add Slide</span>
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
                                placeholder="Search slides..."
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
                            </div>

                            <div className="flex justify-end mt-4">
                                <Button variant="outline" onClick={clearFilters} size="sm">
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Live Preview */}
                {showPreview && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
                        {isLoading ? (
                            <div className="text-center text-gray-500 py-8">Loading preview...</div>
                        ) : filteredHeroCarousel.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">No slides to preview.</div>
                        ) : (
                            <Carousel className="w-full max-w-4xl mx-auto">
                                <CarouselContent>
                                    {filteredHeroCarousel.map((item) => (
                                        <CarouselItem
                                            key={item.id}
                                            className="relative h-[300px] rounded overflow-hidden"
                                        >
                                            <div
                                                className="w-full h-full bg-cover bg-center flex flex-col justify-center items-start p-6 text-white"
                                                style={{
                                                    backgroundImage: `url(${item.background_image})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                }}
                                            >
                                                <h2 className="text-2xl font-bold drop-shadow-lg">{item.title}</h2>
                                                <p className="text-lg drop-shadow-lg mb-2">{item.subtitle}</p>
                                                {item.description && (
                                                    <p className="text-sm drop-shadow-lg mb-4 max-w-md">{item.description}</p>
                                                )}
                                                <a
                                                    href={item.cta_link}
                                                    className="inline-block px-6 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    {item.cta_text}
                                                </a>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className="left-2" />
                                <CarouselNext className="right-2" />
                            </Carousel>
                        )}
                    </div>
                )}

                {/* Content */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <span className="animate-spin h-8 w-8 border-4 border-t-transparent border-blue-600 rounded-full"></span>
                        <span className="ml-4 text-gray-600 font-medium">Loading Slides...</span>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Hero Carousel Items */}
                        {filteredHeroCarousel.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm py-20">
                                <div className="flex flex-col items-center space-y-4 text-center">
                                    <Eye className="h-12 w-12 text-gray-300" />
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No slides found</h3>
                                        <p className="text-gray-500 mb-4">
                                            {searchTerm || Object.values(filters).some(f => f !== FILTER_ALL_VALUE)
                                                ? 'Try adjusting your search or filters.'
                                                : 'Get started by creating your first hero slide.'}
                                        </p>
                                        {!searchTerm && Object.values(filters).every(f => f === FILTER_ALL_VALUE) && (
                                            <Button onClick={handleAdd} className="flex items-center space-x-2">
                                                <Plus className="h-4 w-4" />
                                                <span>Add Slide</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <div className="divide-y divide-gray-200">
                                    {filteredHeroCarousel.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className="p-6 flex justify-between items-center gap-4 hover:bg-gray-50"
                                        >
                                            {/* Image thumbnail */}
                                            <div className="w-32 h-20 rounded overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-300">
                                                {item.background_image ? (
                                                    <img
                                                        src={item.background_image}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/placeholder-slide.png';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>

                                            {/* Slide content */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">{item.title}</h3>
                                                <p className="text-gray-600 truncate">{item.subtitle}</p>
                                                {item.description && (
                                                    <p className="text-sm text-gray-500 truncate mt-1">{item.description}</p>
                                                )}
                                                <div className="flex items-center space-x-4 mt-2">
                                                    <small className="text-xs text-gray-500">
                                                        Order: {item.display_order}
                                                    </small>
                                                    <div className="flex items-center space-x-1">
                                                        <div className={`w-2 h-2 rounded-full ${item.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                                        <small className="text-xs text-gray-500">
                                                            {item.is_active ? 'Active' : 'Inactive'}
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Controls */}
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant='ghost'
                                                    size="sm"
                                                    onClick={() => moveCarouselItem(item.id, 'up')}
                                                    disabled={index === 0 || isLoading}
                                                    className="text-gray-600 hover:bg-gray-100"
                                                >
                                                    <MoveUp className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size="sm"
                                                    onClick={() => moveCarouselItem(item.id, 'down')}
                                                    disabled={index === filteredHeroCarousel.length - 1 || isLoading}
                                                    className="text-gray-600 hover:bg-gray-100"
                                                >
                                                    <MoveDown className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size="sm"
                                                    onClick={() => handleEdit(item)}
                                                    disabled={isLoading}
                                                    className="text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => handleDeleteClick(item)}
                                                    variant='ghost'
                                                    size="sm"
                                                    disabled={isLoading}
                                                    className="text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Load More Button */}
                                {filteredHeroCarousel.length > 0 && filteredHeroCarousel.length >= 20 && (
                                    <div className="px-6 py-4 border-t border-gray-200 text-center">
                                        <Button
                                            variant="outline"
                                            onClick={handleLoadMore}
                                            disabled={isLoading}
                                            className="w-full sm:w-auto"
                                        >
                                            {isLoading ? 'Loading...' : 'Load More Slides'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Form Dialog */}
                <Dialog open={isCarouselFormOpen} onOpenChange={setIsCarouselFormOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingCarouselItem ? 'Edit Slide' : 'Add New Slide'}
                            </DialogTitle>
                        </DialogHeader>
                        <HeroForm
                            isEdit={!!editingCarouselItem}
                            initialData={editingCarouselItem}
                            onSubmit={handleFormSubmit}
                            onCancel={handleFormCancel}
                            loading={localLoading}
                            nextDisplayOrder={heroCarousel.length + 1}
                        />
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <ConfirmationDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={handleDelete}
                    title="Delete Slide"
                    description={`Are you sure you want to delete "${selectedCarouselItem?.title}"? This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="destructive"
                />
            </div>
        </AdminLayout>
    );
};

export default AdminHero;