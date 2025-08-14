import AdminLayout from "@/components/admin/admin-layout.tsx";
import React, {useState, useEffect, useMemo, useCallback} from "react";
import {Blog, BlogFormData} from "@/dto/blog.ts";
import {useContent, useContentPagination} from "@/contexts/ContentContext.tsx";
import {useAuth} from "@/contexts/AuthContext.tsx";
import {supabase} from "@/lib/supabaseClient.ts";
import {toast} from "sonner";
import {Filter, Pencil, Plus, RefreshCw, Search, Trash2, X} from "lucide-react";
import {Badge} from "@/components/ui/badge.tsx";
import {Button} from "@/components/ui/button.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
import BlogForm from "@/pages/admin/blog/blog-form/blog-form.tsx";
import {ConfirmationDialog} from "@/components/ui/confirmation-dialog.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

interface Filters {
    status: string;
    category: string;
}

const FILTER_ALL_VALUE = "all";

export default function AdminBlog(){
    const {user} = useAuth();
    const {
        blogs,
        loading,
        searchTerm,
        fetchBlogs,
        refresh,
        clearCache,
    } = useContent();
    const {loadMore} = useContentPagination();

    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);
    const [filters, setFilters] = useState<Filters>({
        status: FILTER_ALL_VALUE,
        category: FILTER_ALL_VALUE,
    });

    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState('');
    // Initialize data loading
    useEffect(() => {
        fetchBlogs({limit: 20, force: false});
    }, []);

    // Handle search functionality
    // useEffect(() => {
    //     if(searchTerm.trim()){
    //         searchAllContent();
    //     } else if (searchTerm === '') {
    //         // Only reset when search is explicitly cleared
    //         fetchBlogs({limit: 20, force: false});
    //     }
    // }, [searchTerm]); // Added searchTerm as dependency

    const filteredBlogs = useMemo(() => {
        let filtered = blogs;

        if(search.trim()){
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(b =>
            b.title.toLowerCase().includes(searchLower) ||
            b.category.toLowerCase().includes(searchLower) || b.category.toLowerCase().includes(searchLower)
            )
        }
        if(filters.status && filters.status !== FILTER_ALL_VALUE){
            filtered = filtered.filter(blog => blog.status === filters.status);
        }

        if(filters.category && filters.category !== FILTER_ALL_VALUE ){
            filtered = filtered.filter(blog => blog.category === filters.category);
        }

        return filtered;
    }, [blogs, filters, search]);

    const filterOption = useMemo(() => {
        const status = [...new Set(blogs.map(blog => blog.status))].filter(Boolean);
        const category = [...new Set(blogs.map(blog => blog.category))].filter(Boolean);

        return {
            status: status.sort(),
            category: category.sort(),
        }
    }, [blogs]);

    const handleAdd = useCallback(() => {
        setIsFormDialogOpen(true);
        setSelectedBlog(null);
        setIsEditMode(false);
    }, [])

    const handleEdit = useCallback((blog : Blog) => {
        setIsEditMode(true);
        setSelectedBlog({...blog}); // Create a copy to prevent reference issues
        setIsFormDialogOpen(true);
    }, []);

    const handleFormSubmit = useCallback(async (data: BlogFormData) =>{
        setLocalLoading(true);
        try{
            if(isEditMode && selectedBlog){
                //EDIT
                const { error } = await supabase
                    .from('blogs')
                    .update(data)
                    .eq('id', selectedBlog?.id);
                if (error) throw error;
                toast.success('Blog updated successfully.');
            }else{
                //ADD
                const { error } = await supabase
                    .from('blogs')
                    .insert({
                        ...data,
                        created_by: user?.id
                    });
                if (error) throw error;
                toast.success('Blog added successfully.');
            }
            await refresh('blogs')
            setIsFormDialogOpen(false);
            setSelectedBlog(null);
        }catch (error){
            console.error('Form submission error:', error);
            toast.error(isEditMode ? 'Failed to update blog' : 'Failed to add blog');
        }finally {
            setLocalLoading(false);
        }
    },[isEditMode, selectedBlog, user?.id, refresh]);

    const handleFormCancel = useCallback(() => {
        setIsFormDialogOpen(false);
        setSelectedBlog(null);
        setIsEditMode(false);
    }, []);

    const handleDeleteClick = useCallback((blog: Blog) => {
        setIsDeleteDialogOpen(true);
        setSelectedBlog({...blog}); // Create a copy
    },[]);

    const handleDelete = useCallback(async () => {
        if(!selectedBlog) return;
        setLocalLoading(true);
        try{
            const { error } = await supabase
                .from('blogs')
                .delete()
                .eq('id', selectedBlog?.id);
            if (error) throw error;
            await refresh('blogs');
            toast.success('Blog deleted successfully.');
            setIsDeleteDialogOpen(false);
            setSelectedBlog(null);
        }catch (error){
            console.error('Delete error:', error);
            toast.error('Failed to delete blog');
        }finally {
            setLocalLoading(false);
        }
    }, [selectedBlog, refresh])

    const handleLoadMore = useCallback(() => {
        loadMore('blogs', blogs.length, 20)
    },[loadMore, blogs.length])

    const handleRefresh = useCallback(async () => {
        clearCache('blogs');
        await fetchBlogs({force: true, limit: 20});
        toast.success('Blogs refreshed successfully.');
    }, [clearCache, fetchBlogs]);

    const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({
            status: FILTER_ALL_VALUE,
            category: FILTER_ALL_VALUE,
        });
    }, []);

    // Format date helper
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isLoading = loading.blogs || localLoading;

    return (
        <AdminLayout>
            <div className='space-y-6'>
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Blogs</h1>
                        <p className="text-gray-600 mt-1">
                            Manage Blog listings and information ({filteredBlogs.length} total)
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
                            <span>Add Blog</span>
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
                                placeholder="Search blogs..."
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
                                            <SelectValue placeholder="All status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={FILTER_ALL_VALUE}>All Status</SelectItem>
                                            {filterOption.status.map(status => (
                                                <SelectItem key={status} value={status}>
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <Select
                                        value={filters.category}
                                        onValueChange={(value) => handleFilterChange('category', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={FILTER_ALL_VALUE}>Any Category</SelectItem>
                                            {filterOption.category.map(category => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
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

                {/* Content */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <span className="animate-spin h-8 w-8 border-4 border-t-transparent border-blue-600 rounded-full"></span>
                        <span className="ml-4 text-gray-600 font-medium">Loading Blogs...</span>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {filteredBlogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            <div className="flex flex-col items-center space-y-2">
                                                <Search className="h-8 w-8 text-gray-300" />
                                                <p>No blogs found.</p>
                                                {searchTerm || Object.values(filters).some(f => f !== FILTER_ALL_VALUE) ? (
                                                    <p className="text-sm">Try adjusting your search or filters.</p>
                                                ) : (
                                                    <Button onClick={handleAdd} className="mt-2">
                                                        Add First Blog
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBlogs.map((blog) => (
                                        <tr key={blog.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    {blog.featured_image && (
                                                        <img
                                                            src={blog.featured_image}
                                                            alt={blog.title}
                                                            className="w-12 h-12 object-cover rounded flex-shrink-0"
                                                        />
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-medium text-gray-900 truncate">
                                                            {blog.title ? blog.title.substring(0,40) + '...' : 'No Title'}
                                                        </div>
                                                        <div className="text-sm text-gray-500 truncate">
                                                            {blog.excerpt ? blog.excerpt.substring(0, 40) + '...' : 'No excerpt'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="secondary">
                                                    {blog.category || 'Uncategorized'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={blog.status === 'published' ? 'default' : 'secondary'}>
                                                    {blog.status || 'draft'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {formatDate(blog.created_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(blog)}
                                                        disabled={isLoading}
                                                        className="text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(blog)}
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
                        {filteredBlogs.length > 0 && filteredBlogs.length >= 20 && (
                            <div className="px-6 py-4 border-t border-gray-200 text-center">
                                <Button
                                    variant="outline"
                                    onClick={handleLoadMore}
                                    disabled={isLoading}
                                    className="w-full sm:w-auto"
                                >
                                    {isLoading ? 'Loading...' : 'Load More Blogs'}
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
                                {isEditMode ? 'Edit Blog' : 'Add New Blog'}
                            </DialogTitle>
                        </DialogHeader>
                        <BlogForm
                            isEdit={isEditMode}
                            initialData={selectedBlog}
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
                    title='Delete Blog'
                    description={`Are you sure you want to delete "${selectedBlog?.title}"? This action cannot be undone.`}
                    confirmText='Delete Blog'
                    cancelText='Cancel'
                    variant='destructive'
                />
            </div>
        </AdminLayout>
    )
}