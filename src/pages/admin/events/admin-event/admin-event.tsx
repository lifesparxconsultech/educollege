import { useAuth } from "@/contexts/AuthContext.tsx";
import { useContent, useContentPagination } from "@/contexts/ContentContext.tsx";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Event } from '@/dto/event.ts'
import { supabase } from "@/lib/supabaseClient.ts";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/admin-layout.tsx";
import { Calendar, Clock, Edit, MapPin, Search, Trash2, RefreshCw, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { getevent_typeColor } from "@/pages/admin/events/constant/contant.tsx";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog.tsx";
import EventForm from "@/pages/admin/events/event-form/event-form.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";

// Enhanced filter interface
interface Filters {
    eventType: string;
    status: string;
    location: string;
}

// Filter constants
const FILTER_ALL_VALUE = 'all';

export default function AdminEvent() {
    const { user } = useAuth();
    const {
        events,
        loading,
        searchTerm,
        fetchEvents,
        refresh,
        clearCache
    } = useContent();

    // Get pagination hook
    const { loadMore } = useContentPagination();

    // Local state
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [localLoading, setLocalLoading] = useState(false);
    const [filters, setFilters] = useState<Filters>({
        eventType: FILTER_ALL_VALUE,
        status: FILTER_ALL_VALUE,
        location: FILTER_ALL_VALUE
    });
    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState('');

    // Initialize data loading with optimized context
    useEffect(() => {
        // Load initial events with smaller batch
        fetchEvents({ limit: 20, force: false });
    }, [fetchEvents]);

    // // Debounced search effect using the context's built-in search
    // useEffect(() => {
    //     if (searchTerm.trim()) {
    //         searchAllContent();
    //     } else {
    //         // Reset to default view when search is cleared
    //         fetchEvents({ limit: 20, force: false });
    //     }
    // }, [searchTerm, searchAllContent, fetchEvents]);

    // Memoized filtered events (client-side filtering for additional filters)
    const filteredEvents = useMemo(() => {
        let filtered = events;
        if(search.trim()){
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(e =>
            e.title.toLowerCase().includes(searchLower)
            )
        }
        if (filters.eventType && filters.eventType !== FILTER_ALL_VALUE) {
            filtered = filtered.filter(event => event.event_type === filters.eventType);
        }

        if (filters.status && filters.status !== FILTER_ALL_VALUE) {
            const isActive = filters.status === 'active';
            filtered = filtered.filter(event => event.is_active === isActive);
        }

        if (filters.location && filters.location !== FILTER_ALL_VALUE) {
            filtered = filtered.filter(event =>
                event.location.toLowerCase().includes(filters.location.toLowerCase())
            );
        }

        return filtered;
    }, [events, filters, search]);

    // Get unique values for filter options
    const filterOptions = useMemo(() => {
        const eventTypes = [...new Set(events.map(event => event.event_type))].filter(Boolean);
        const locations = [...new Set(events.map(event => event.location))].filter(Boolean);

        return {
            eventTypes: eventTypes.sort(),
            locations: locations.sort()
        };
    }, [events]);

    // Handlers
    const handleAdd = useCallback(() => {
        setIsFormDialogOpen(true);
        setSelectedEvent(null);
        setIsEditMode(false);
    }, []);

    const handleEdit = useCallback((event: Event) => {
        setIsEditMode(true);
        setSelectedEvent(event);
        setIsFormDialogOpen(true);
    }, []);

    const handleFormSubmit = useCallback(async (data: Event) => {
        setLocalLoading(true);
        try {
            if (isEditMode && selectedEvent) {
                // Edit Event
                const { error } = await supabase
                    .from('events')
                    .update(data)
                    .eq('id', selectedEvent.id);

                if (error) throw error;
                toast.success('Event updated successfully.');
            } else {
                // Add Event
                const { error } = await supabase.from('events').insert({
                    ...data,
                    created_by: user?.id
                });

                if (error) throw error;
                toast.success('Event added successfully.');
            }

            // Refresh events data using optimized context
            await refresh('events');
            setIsFormDialogOpen(false);
            setSelectedEvent(null);
        } catch (error) {
            console.error('Form submission error:', error);
            toast.error(isEditMode ? 'Failed to update event.' : 'Failed to add event.');
        } finally {
            setLocalLoading(false);
        }
    }, [isEditMode, selectedEvent, user?.id, refresh]);

    const handleFormCancel = useCallback(() => {
        setIsFormDialogOpen(false);
        setSelectedEvent(null);
        setIsEditMode(false);
    }, []);

    const handleDeleteClick = useCallback((event: Event) => {
        setIsDeleteDialogOpen(true);
        setSelectedEvent(event);
    }, []);

    const handleDelete = useCallback(async () => {
        if (!selectedEvent) return;

        setLocalLoading(true);
        try {
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', selectedEvent.id);

            if (error) throw error;

            await refresh('events');
            toast.success('Event deleted successfully.');
            setIsDeleteDialogOpen(false);
            setSelectedEvent(null);
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete event');
        } finally {
            setLocalLoading(false);
        }
    }, [selectedEvent, refresh]);

    // Handle load more for pagination
    const handleLoadMore = useCallback(() => {
        loadMore('events', events.length, 20);
    }, [loadMore, events.length]);

    // Handle manual refresh
    const handleRefresh = useCallback(async () => {
        clearCache('events');
        await fetchEvents({ force: true, limit: 20 });
        toast.success('Events refreshed');
    }, [clearCache, fetchEvents]);

    // Handle filter changes
    const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({
            eventType: FILTER_ALL_VALUE,
            status: FILTER_ALL_VALUE,
            location: FILTER_ALL_VALUE
        });
    }, []);

    // Combined loading state
    const isLoading = loading.events || localLoading;

    return (
        <AdminLayout>
            <div className='space-y-6'>
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
                        <p className="text-gray-600 mt-1">
                            Manage upcoming events and notifications ({filteredEvents.length} total)
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
                            <span>Add Event</span>
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
                                placeholder="Search events..."
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
                                        Event Type
                                    </label>
                                    <Select
                                        value={filters.eventType}
                                        onValueChange={(value) => handleFilterChange('eventType', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={FILTER_ALL_VALUE}>All types</SelectItem>
                                            {filterOptions.eventTypes.map(type => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
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
                        <span className="ml-4 text-gray-600 font-medium">Loading Events...</span>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Events Grid */}
                        {filteredEvents.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm py-20">
                                <div className="flex flex-col items-center space-y-4 text-center">
                                    <Calendar className="h-12 w-12 text-gray-300" />
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                                        <p className="text-gray-500 mb-4">
                                            {searchTerm || Object.values(filters).some(f => f !== FILTER_ALL_VALUE)
                                                ? 'Try adjusting your search or filters.'
                                                : 'Get started by creating your first event.'}
                                        </p>
                                        {!searchTerm && Object.values(filters).every(f => f === FILTER_ALL_VALUE) && (
                                            <Button onClick={handleAdd} className="flex items-center space-x-2">
                                                <Plus className="h-4 w-4" />
                                                <span>Add Event</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredEvents.map((event) => (
                                    <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                        {event.image && (
                                            <img
                                                src={event.image}
                                                alt={event.title}
                                                className="w-full h-32 object-cover rounded-lg mb-4"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/placeholder-event.png';
                                                }}
                                            />
                                        )}

                                        <div className="space-y-3">
                                            <div className="flex items-start justify-between">
                                                <h3 className="font-semibold text-gray-900 line-clamp-2">{event.title}</h3>
                                                <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ml-2 ${getevent_typeColor(event.event_type)}`}>
                                                    {event.event_type}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>

                                            <div className="space-y-2 text-sm text-gray-500">
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="h-4 w-4 flex-shrink-0" />
                                                    <span className="truncate">{event.event_date}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="h-4 w-4 flex-shrink-0" />
                                                    <span className="truncate">{event.event_time}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <MapPin className="h-4 w-4 flex-shrink-0" />
                                                    <span className="truncate">{event.location}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                                <div className="flex items-center space-x-1">
                                                    <div className={`w-2 h-2 rounded-full ${event.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    <span className="text-xs text-gray-500">
                                                        {event.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>

                                                {user?.id === event.created_by && (
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            onClick={() => handleEdit(event)}
                                                            disabled={isLoading}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-blue-600 hover:bg-blue-50"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteClick(event)}
                                                            className="text-red-600 hover:bg-red-50"
                                                            disabled={isLoading}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Load More Button */}
                        {filteredEvents.length > 0 && filteredEvents.length >= 20 && (
                            <div className="text-center">
                                <Button
                                    variant="outline"
                                    onClick={handleLoadMore}
                                    disabled={isLoading}
                                    className="w-full sm:w-auto"
                                >
                                    {isLoading ? 'Loading...' : 'Load More Events'}
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
                                {isEditMode ? 'Edit Event' : 'Add New Event'}
                            </DialogTitle>
                        </DialogHeader>
                        <EventForm
                            isEdit={isEditMode}
                            initialData={selectedEvent}
                            onSubmit={handleFormSubmit}
                            loading={localLoading}
                            onCancel={handleFormCancel}
                        />
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <ConfirmationDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={handleDelete}
                    title='Delete Event'
                    description={`Are you sure you want to delete "${selectedEvent?.title}"? This action cannot be undone.`}
                    confirmText='Delete'
                    cancelText='Cancel'
                    variant='destructive'
                />
            </div>
        </AdminLayout>
    )
}