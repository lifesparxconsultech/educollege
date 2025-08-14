import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import AdminLayout from '@/components/admin/admin-layout.tsx';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/ui/image-upload';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  category: z.string().min(1, 'Category is required'),
  tags: z.string(),
  status: z.enum(['draft', 'published']),
  featuredImage: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

type BlogFormData = z.infer<typeof blogSchema>;

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  featuredImage?: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  seoTitle?: string;
  seoDescription?: string;
}

const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Top 10 Universities for Engineering in India',
    content: 'Engineering education in India has seen tremendous growth...',
    excerpt: 'Discover the best engineering universities in India for 2024',
    category: 'Engineering',
    tags: ['engineering', 'universities', 'education'],
    status: 'published',
    featuredImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
    author: 'Admin',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    seoTitle: 'Best Engineering Universities in India 2024',
    seoDescription: 'Complete guide to top engineering universities in India with admission details and rankings.'
  },
  {
    id: '2',
    title: 'MBA vs Executive MBA: Which is Right for You?',
    content: 'Choosing between MBA and Executive MBA can be challenging...',
    excerpt: 'Understanding the differences between MBA and Executive MBA programs',
    category: 'MBA',
    tags: ['mba', 'executive-mba', 'career'],
    status: 'draft',
    author: 'Admin',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-12',
  }
];

const categories = ['Engineering', 'MBA', 'Medical', 'Law', 'Technology', 'Business', 'Education'];

export default function AdminBlog() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(mockBlogPosts);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      category: '',
      tags: '',
      status: 'draft',
      featuredImage: '',
      seoTitle: '',
      seoDescription: '',
    },
  });

  const onSubmit = (data: BlogFormData) => {
    const tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    if (editingPost) {
      // Update existing post
      const updatedPost: BlogPost = {
        ...editingPost,
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        category: data.category,
        status: data.status,
        featuredImage: data.featuredImage,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        tags: tagsArray,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setBlogPosts(prev => prev.map(post => post.id === editingPost.id ? updatedPost : post));
      setIsEditDialogOpen(false);
      setEditingPost(null);
      toast({
        title: "Success",
        description: "Blog post updated successfully",
      });
    } else {
      // Add new post
      const newPost: BlogPost = {
        id: Date.now().toString(),
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        category: data.category,
        status: data.status,
        featuredImage: data.featuredImage,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        tags: tagsArray,
        author: 'Admin',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setBlogPosts(prev => [newPost, ...prev]);
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Blog post created successfully",
      });
    }
    
    form.reset();
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    form.reset({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags.join(', '),
      status: post.status,
      featuredImage: post.featuredImage || '',
      seoTitle: post.seoTitle || '',
      seoDescription: post.seoDescription || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setPostToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      setBlogPosts(prev => prev.filter(post => post.id !== postToDelete));
      setPostToDelete(null);
      setDeleteConfirmOpen(false);
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
    }
  };

  const BlogForm = () => (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            {...form.register('title')}
            placeholder="Enter blog title"
          />
          {form.formState.errors.title && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select onValueChange={(value) => form.setValue('category', value)} value={form.watch('category')}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.category && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.category.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="excerpt">Excerpt *</Label>
        <Textarea
          id="excerpt"
          {...form.register('excerpt')}
          placeholder="Brief description of the blog post"
          rows={3}
        />
        {form.formState.errors.excerpt && (
          <p className="text-sm text-red-600 mt-1">{form.formState.errors.excerpt.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          {...form.register('content')}
          placeholder="Write your blog content here..."
          rows={8}
        />
        {form.formState.errors.content && (
          <p className="text-sm text-red-600 mt-1">{form.formState.errors.content.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            {...form.register('tags')}
            placeholder="engineering, technology, education"
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select onValueChange={(value) => form.setValue('status', value as 'draft' | 'published')} value={form.watch('status')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Featured Image</Label>
        <ImageUpload
          value={form.watch('featuredImage') || ''}
          onChange={(value) => form.setValue('featuredImage', value)}
          placeholder="Upload featured image"
        />
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="seoTitle">SEO Title</Label>
            <Input
              id="seoTitle"
              {...form.register('seoTitle')}
              placeholder="SEO optimized title"
            />
          </div>
          <div>
            <Label htmlFor="seoDescription">SEO Description</Label>
            <Textarea
              id="seoDescription"
              {...form.register('seoDescription')}
              placeholder="SEO meta description"
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            setEditingPost(null);
            form.reset();
          }}
        >
          Cancel
        </Button>
        <Button type="submit">
          {editingPost ? 'Update Post' : 'Create Post'}
        </Button>
      </div>
    </form>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Blog Management</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              form.reset();
              setEditingPost(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingPost(null);
                form.reset({
                  title: '',
                  content: '',
                  excerpt: '',
                  category: '',
                  tags: '',
                  status: 'draft',
                  featuredImage: '',
                  seoTitle: '',
                  seoDescription: '',
                });
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Blog Post</DialogTitle>
              </DialogHeader>
              <BlogForm />
            </DialogContent>
          </Dialog>
        </div>

        {/* Blog Posts Table */}
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {post.featuredImage && (
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium">{post.title}</div>
                        <div className="text-sm text-gray-500">{post.excerpt.substring(0, 50)}...</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{post.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.author}</TableCell>
                  <TableCell>{post.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(post)}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingPost(null);
            form.reset();
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Blog Post</DialogTitle>
            </DialogHeader>
            <BlogForm />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmationDialog
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Blog Post"
          description="Are you sure you want to delete this blog post? This action cannot be undone."
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    </AdminLayout>
  );
}