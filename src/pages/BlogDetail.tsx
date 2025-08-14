import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowLeft, Share2, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContent } from '@/contexts/ContentContext';

const BlogDetail: React.FC = () => {
    const { id } = useParams();
    const { blogs, fetchBlogs, loading } = useContent();
    const [relatedBlogs, setRelatedBlogs] = useState<any[]>([]);

    // Find the current blog post by slug (assuming slug is derived from title or id)
    const currentPost = blogs.find(blog =>
        // Try to match by slug (if you have a slug field) or generate slug from title
        blog.id === id
    );

    // Calculate read time based on content length
    function calculateReadTime(content: string): string {
        const wordsPerMinute = 200;
        const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return `${minutes} min read`;
    }

    // Format date
    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Parse tags (assuming tags are stored as comma-separated string)
    function parseTags(tagsString: string): string[] {
        if (!tagsString) return [];
        return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    // Get related blogs based on category or tags
    function getRelatedBlogs(currentBlog: any, allBlogs: any[]): any[] {
        return allBlogs
            .filter(blog =>
                blog.id !== currentBlog.id &&
                blog.status === 'published' &&
                (blog.category === currentBlog.category ||
                    parseTags(blog.tags).some(tag =>
                        parseTags(currentBlog.tags).includes(tag)
                    ))
            )
            .slice(0, 3);
    }

    useEffect(() => {
        // Fetch blogs if not already loaded
        if (blogs.length === 0) {
            fetchBlogs({ limit: 50 });
        }
    }, [blogs.length, fetchBlogs]);

    useEffect(() => {
        // Set related blogs when current post is found
        if (currentPost && blogs.length > 0) {
            setRelatedBlogs(getRelatedBlogs(currentPost, blogs));
        }
    }, [currentPost, blogs]);

    // Loading state
    if (loading.blogs) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Blog not found
    if (!currentPost) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
                        <p className="text-muted-foreground mb-8">The blog post you're looking for doesn't exist or may have been removed.</p>
                        <Link to="/blogs">
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Blog
                            </Button>
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Don't show unpublished posts
    if (currentPost.status !== 'published') {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Blog Post Not Available</h1>
                        <p className="text-muted-foreground mb-8">This blog post is not currently available for viewing.</p>
                        <Link to="/blog">
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Blog
                            </Button>
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* SEO Meta Tags (if needed) */}
            {currentPost.seo_title && (
                <title>{currentPost.seo_title}</title>
            )}

            {/* Article Header */}
            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <div className="mb-8">
                    <Link to="/blogs">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Blog
                        </Button>
                    </Link>
                </div>

                {/* Article Meta */}
                <div className="mb-8">
                    <Badge className="mb-4">{currentPost.category}</Badge>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                        {currentPost.title}
                    </h1>

                    {currentPost.excerpt && (
                        <p className="text-lg text-muted-foreground mb-6">
                            {currentPost.excerpt}
                        </p>
                    )}

                    {/* Author and Date Info */}
                    <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
                        {/*{currentPost.created_by && (*/}
                        {/*    <div className="flex items-center gap-2">*/}
                        {/*        <User className="h-4 w-4" />*/}
                        {/*        <span className="font-medium">{currentPost.created_by}</span>*/}
                        {/*    </div>*/}
                        {/*)}*/}

                        {currentPost.created_at && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(currentPost.created_at)}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{calculateReadTime(currentPost.content)}</span>
                        </div>
                    </div>

                    {/* Share Button */}
                    <div className="flex gap-2 mb-8">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: currentPost.title,
                                        text: currentPost.excerpt || currentPost.title,
                                        url: window.location.href,
                                    });
                                } else {
                                    // Fallback: copy to clipboard
                                    navigator.clipboard.writeText(window.location.href);
                                    // You could show a toast notification here
                                }
                            }}
                        >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Article
                        </Button>
                    </div>
                </div>

                {/* Featured Image */}
                {currentPost.featured_image && (
                    <div className="mb-8">
                        <img
                            src={currentPost.featured_image}
                            alt={currentPost.title}
                            className="w-full h-64 md:h-96 object-cover rounded-lg"
                            onError={(e) => {
                                // Hide image if it fails to load
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    </div>
                )}

                {/* Article Content */}
                <div className="mb-8">
                    <div
                        className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground"
                        dangerouslySetInnerHTML={{ __html: currentPost.content }}
                    />
                </div>

                {/* Tags */}
                {currentPost.tags && parseTags(currentPost.tags).length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Tags:</h3>
                        <div className="flex flex-wrap gap-2">
                            {parseTags(currentPost.tags).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Related Articles */}
                {relatedBlogs.length > 0 && (
                    <div className="border-t pt-8">
                        <h3 className="text-xl font-bold mb-4">Related Articles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedBlogs.map((blog) => (
                                <Link
                                    key={blog.id}
                                    to={`/blogs/${blog?.id}`}
                                    className="group"
                                >
                                    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                        {blog.featured_image && (
                                            <img
                                                src={blog.featured_image}
                                                alt={blog.title}
                                                className="w-full h-40 object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        )}
                                        <div className="p-4">
                                            <Badge className="mb-2 text-xs">{blog.category}</Badge>
                                            <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                {blog.title}
                                            </h4>
                                            {blog.excerpt && (
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                                    {blog.excerpt}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                {blog.created_by && <span>{blog.created_by}</span>}
                                                {blog.created_at && (
                                                    <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Additional Info */}
                <div className="border-t pt-6 mt-8">
                    <div className="text-center text-sm text-muted-foreground">
                        <p>Published on {currentPost.created_at ? formatDate(currentPost.created_at) : 'Unknown date'}</p>
                        {currentPost.seo_description && (
                            <p className="mt-2 italic">{currentPost.seo_description}</p>
                        )}
                    </div>
                </div>
            </article>

            <Footer />
        </div>
    );
};

export default BlogDetail;