import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, User, ArrowRight, Search } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';

const Blog: React.FC = () => {
  const {
    blogs,
    loading,
    searchTerm,
    setSearchTerm,
    fetchBlogs,
    searchAllContent,
  } = useContent();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleBlogs, setVisibleBlogs] = useState(9); // Show 9 blogs initially

  // Initialize data loading
  useEffect(() => {
    fetchBlogs({ limit: 50, force: false });
  }, []);

  // Handle search functionality
  useEffect(() => {
    if (searchTerm.trim()) {
      searchAllContent();
    } else if (searchTerm === '') {
      fetchBlogs({ limit: 50, force: false });
    }
  }, [searchTerm, searchAllContent, fetchBlogs]);

  // Filter only published blogs
  const publishedBlogs = useMemo(() => {
    return blogs.filter(blog => blog.status === 'published');
  }, [blogs]);

  // Get unique categories from published blogs
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(publishedBlogs.map(blog => blog.category))].filter(Boolean);
    return ['All', ...uniqueCategories.sort()];
  }, [publishedBlogs]);

  // Filter blogs by selected category
  const filteredBlogs = useMemo(() => {
    if (selectedCategory === 'All') {
      return publishedBlogs;
    }
    return publishedBlogs.filter(blog => blog.category === selectedCategory);
  }, [publishedBlogs, selectedCategory]);

  // Get visible blogs for pagination
  const displayedBlogs = useMemo(() => {
    return filteredBlogs.slice(0, visibleBlogs);
  }, [filteredBlogs, visibleBlogs]);

  // Get featured blog (first blog)
  const featuredBlog = displayedBlogs[0];
  const regularBlogs = displayedBlogs.slice(1);

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
  };

  // Calculate read time (rough estimate: 200 words per minute)
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };

  // Handle load more
  const handleLoadMore = () => {
    setVisibleBlogs(prev => prev + 6);
  };

  // Handle category filter
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setVisibleBlogs(9); // Reset to initial count when changing category
  };

  const isLoading = loading.blogs;

  return (
      <div className="min-h-screen bg-background">
        <Header/>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-edu-primary to-edu-primary-dark text-white section-padding">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Education Blog
              </h1>
              <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
                Stay updated with the latest trends in online education, career insights, and industry developments
              </p>
            </div>
          </div>
        </section>

        {/* Blog Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
                <Input
                    type="text"
                    placeholder="Search articles..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {categories.map((category) => (
                  <Badge
                      key={category}
                      variant={category === selectedCategory ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </Badge>
              ))}
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-primary rounded-full"></div>
                  <span className="ml-4 text-gray-600 font-medium">Loading articles...</span>
                </div>
            ) : (
                <>
                  {/* Featured Post */}
                  {featuredBlog && (
                      <div className="mb-12">
                        <Card className="overflow-hidden">
                          <div className="md:flex">
                            <div className="md:w-1/2">
                              {featuredBlog.featured_image ? (
                                  <img
                                      src={featuredBlog.featured_image}
                                      alt={featuredBlog.title}
                                      className="w-full h-64 md:h-full object-cover"
                                  />
                              ) : (
                                  <div
                                      className="w-full h-64 md:h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                                    <div className="text-center text-primary">
                                      <h3 className="text-2xl font-bold mb-2">{featuredBlog.category || 'Article'}</h3>
                                      <p className="text-sm opacity-80">Featured Post</p>
                                    </div>
                                  </div>
                              )}
                            </div>
                            <div className="md:w-1/2 p-6">
                              <Badge className="mb-2">{featuredBlog.category || 'Uncategorized'}</Badge>
                              <h2 className="text-2xl font-bold mb-4 line-clamp-2">
                                {featuredBlog.title}
                              </h2>
                              <p className="text-muted-foreground mb-4 line-clamp-3">
                                {featuredBlog.excerpt || 'Read this interesting article...'}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4"/>
                                  {formatDate(featuredBlog.created_at)}
                                </div>
                                <span>{calculateReadTime(featuredBlog.content)}</span>
                              </div>
                              <Link
                                  to={`/blogs/${featuredBlog?.id}`}
                                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
                              >
                                Read More <ArrowRight className="h-4 w-4"/>
                              </Link>
                            </div>
                          </div>
                        </Card>
                      </div>
                  )}

                  {/* Blog Grid */}
                  {regularBlogs.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {regularBlogs.map((post) => (
                            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                              <div className="aspect-video overflow-hidden">
                                {post.featured_image ? (
                                    <img
                                        src={post.featured_image}
                                        alt={post.title}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div
                                        className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                                      <div className="text-center text-primary">
                                        <h4 className="font-semibold">{post.category || 'Article'}</h4>
                                      </div>
                                    </div>
                                )}
                              </div>
                              <CardHeader className="pb-2">
                                <Badge className="w-fit mb-2">{post.category || 'Uncategorized'}</Badge>
                                <CardTitle className="line-clamp-2 text-lg">
                                  {post.title}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                                  {post.excerpt || 'Read this interesting article...'}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3"/>
                                    {formatDate(post.created_at)}
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            {calculateReadTime(post.content)}
                          </span>
                                  <Link
                                      to={`/blogs/${post?.id}`}
                                      className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium"
                                  >
                                    Read More <ArrowRight className="h-3 w-3"/>
                                  </Link>
                                </div>
                              </CardContent>
                            </Card>
                        ))}
                      </div>
                  ) : (
                      // Empty State
                      <div className="text-center py-20">
                        <div className="flex flex-col items-center space-y-4">
                          <Search className="h-16 w-16 text-gray-300"/>
                          <h3 className="text-xl font-semibold text-gray-900">No articles found</h3>
                          <p className="text-gray-600 max-w-md">
                            {searchTerm ?
                                "Try adjusting your search terms or browse different categories." :
                                selectedCategory !== 'All' ?
                                    `No articles found in "${selectedCategory}" category.` :
                                    "No published articles available at the moment."
                            }
                          </p>
                          {(searchTerm || selectedCategory !== 'All') && (
                              <button
                                  onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('All');
                                  }}
                                  className="text-primary hover:text-primary/80 font-medium"
                              >
                                Clear filters
                              </button>
                          )}
                        </div>
                      </div>
                  )}

                  {/* Load More */}
                  {filteredBlogs.length > visibleBlogs && (
                      <div className="text-center mt-12">
                        <button
                            onClick={handleLoadMore}
                            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Load More Articles
                        </button>
                      </div>
                  )}
                </>
            )}
          </div>
        </section>

        <Footer/>
      </div>
  );
};

export default Blog;