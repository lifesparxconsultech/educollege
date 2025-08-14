// src/context/ContentContext.tsx
import { createContext, useContext, useState, ReactNode, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

type University = {
  id: string;
  name: string;
  logo: string;
  naacGrade: string;
  rating: number;
  programs: number;
  description: string;
  website: string;
  location: string;
  created_by: string;
};

type Program = {
  id: string;
  title: string;
  category: string;
  duration: number;
  fees: number;
  description?: string;
  eligibility?: string[];
  curriculum?: string[];
  accreditation: string[];
  featured?: boolean;
  mode?: string;
  created_at?: string;
  created_by?: string;
  university_details?: University;
  university_id?: string;
};

type Testimonial = {
  id: number;
  name: string;
  role: string;
  company: string;
  university: string;
  content: string;
  image: string;
  rating: number;
  program?: string;
  created_by?: string;
};

type Lead = {
  id: number;
  name: string;
  email: string;
  phone: string;
  program: string;
  status: string;
  university?: string;
  source?: string;
  message: string;
  created_at?: string;
};

type Event = {
  id: number;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  event_type: string;
  image?: string;
  registration_link?: string;
  is_active: boolean;
  created_by: string;
};

type TopRecruiter = {
  id: string;
  company_name: string;
  logo: string;
  industry: string;
  description?: string;
  website?: string;
  average_package?: string;
  hiring_count?: number;
  is_active: boolean;
  display_order: number;
  created_by?: string;
};

type HeroCarousel = {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  background_image: string;
  cta_text: string;
  cta_link: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
};

type Blog = {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string;
  status: string;
  featured_image?: string;
  seo_title?: string;
  seo_description?: string;
  created_by?: string;
  created_at?: string;
}

type ContentState = {
  universities: University[];
  programs: Program[];
  testimonials: Testimonial[];
  leads: Lead[];
  events: Event[];
  topRecruiters: TopRecruiter[];
  heroCarousel: HeroCarousel[];
  blogs: Blog[];
};

type LoadingState = Record<keyof ContentState, boolean>;
type CacheState = Record<keyof ContentState, { data: any[]; timestamp: number; lastQuery?: string }>;

type ContentContextType = {
  universities: University[];
  programs: Program[];
  testimonials: Testimonial[];
  leads: Lead[];
  events: Event[];
  topRecruiters: TopRecruiter[];
  heroCarousel: HeroCarousel[];
  blogs: Blog[];
  loading: LoadingState;
  globalLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchAllContent: () => Promise<void>;
  fetchUniversities: (options?: FetchOptions) => Promise<void>;
  fetchPrograms: (options?: FetchOptions) => Promise<void>;
  fetchTestimonials: (options?: FetchOptions) => Promise<void>;
  fetchLeads: (options?: FetchOptions) => Promise<void>;
  fetchEvents: (options?: FetchOptions) => Promise<void>;
  fetchTopRecruiters: (options?: FetchOptions) => Promise<void>;
  fetchHeroCarousel: (options?: FetchOptions) => Promise<void>;
  fetchBlogs: (options?: FetchOptions) => Promise<void>;
  fetchMultiple: (keys: (keyof ContentState)[], options?: FetchOptions) => Promise<void>;
  refresh: (key: keyof ContentState) => Promise<void>;
  clearCache: (key?: keyof ContentState) => void;
};

type FetchOptions = {
  force?: boolean;
  limit?: number;
  offset?: number;
  searchTerm?: string;
};

const ContentContext = createContext<ContentContextType | undefined>(undefined);

// Configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const DEFAULT_LIMIT = 20; // Reduced from 50
const DEBOUNCE_DELAY = 300;

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<ContentState>({
    universities: [],
    programs: [],
    testimonials: [],
    leads: [],
    events: [],
    topRecruiters: [],
    heroCarousel: [],
    blogs: [],
  });

  const [loading, setLoading] = useState<LoadingState>({
    universities: false,
    programs: false,
    testimonials: false,
    leads: false,
    events: false,
    topRecruiters: false,
    heroCarousel: false,
    blogs: false,
  });

  const [globalLoading, setGlobalLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Cache and request deduplication
  const cacheRef = useRef<CacheState>({
    universities: { data: [], timestamp: 0 },
    programs: { data: [], timestamp: 0 },
    testimonials: { data: [], timestamp: 0 },
    leads: { data: [], timestamp: 0 },
    events: { data: [], timestamp: 0 },
    topRecruiters: { data: [], timestamp: 0 },
    heroCarousel: { data: [], timestamp: 0 },
    blogs: { data: [], timestamp: 0 },
  });

  const activeRequestsRef = useRef<Map<string, Promise<any>>>(new Map());
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Helper function to check if cache is valid
  const isCacheValid = (key: keyof ContentState, searchTerm?: string): boolean => {
    const cache = cacheRef.current[key];
    const isWithinTimeLimit = Date.now() - cache.timestamp < CACHE_DURATION;
    const isSameQuery = cache.lastQuery === (searchTerm || '');
    return isWithinTimeLimit && isSameQuery && cache.data.length > 0;
  };

  // Helper function to update cache
  const updateCache = (key: keyof ContentState, data: any[], searchTerm?: string) => {
    cacheRef.current[key] = {
      data,
      timestamp: Date.now(),
      lastQuery: searchTerm || '',
    };
  };

  // Generic fetch handler with caching and deduplication
  const fetchWithCache = useCallback(async <T,>(
      key: keyof ContentState,
      fetcher: () => Promise<{ data: T[] | null; error: any }>,
      options: FetchOptions = {}
    ): Promise<void> => {
    const { force = false, searchTerm: queryTerm } = options;
    const requestKey = `${key}-${queryTerm || 'default'}`;

    // Check cache first (unless forced)
    if (!force && isCacheValid(key, queryTerm)) {
      setContent(prev => ({ ...prev, [key]: cacheRef.current[key].data }));
      return;
    }

// Check for active request (deduplication)
    if (activeRequestsRef.current.has(requestKey)) {
      await activeRequestsRef.current.get(requestKey);
      return;
    }

// ✅ Only set loading if cache is empty
    if (!isCacheValid(key, queryTerm)) {
      setLoading(prev => ({ ...prev, [key]: true }));
    }

// Create and cache the request promise
    const requestPromise = (async () => {
      try {
        const { data, error } = await fetcher();
        if (!error && data) {
          setContent(prev => ({ ...prev, [key]: data }));
          updateCache(key, data, queryTerm);
        } else if (error) {
          console.error(`Error fetching ${key}:`, error);
        }
      } catch (error) {
        console.error(`Exception fetching ${key}:`, error);
      } finally {
        setLoading(prev => ({ ...prev, [key]: false }));
        activeRequestsRef.current.delete(requestKey);
      }
    })();

    activeRequestsRef.current.set(requestKey, requestPromise);
    await requestPromise;
  }, []);

  // Optimized fetch functions
  const fetchUniversities = useCallback(async (options: FetchOptions = {}) => {
    const { limit = DEFAULT_LIMIT, searchTerm: queryTerm } = options;

    await fetchWithCache('universities', async () => {
      let query = supabase.from('universities').select('*').limit(limit);

      if (queryTerm) {
        query = query.ilike('name', `%${queryTerm}%`);
      }

      return await query;
    }, options);
  }, [fetchWithCache]);

  const fetchPrograms = useCallback(async (options: FetchOptions = {}) => {
    const { limit = DEFAULT_LIMIT, searchTerm: queryTerm } = options;

    await fetchWithCache('programs', async () => {
      let query = supabase
          .from('programs')
          .select('*, university_details:universities(id, name, logo)')
          .order('created_at', { ascending: false })
          .limit(limit);

      if (queryTerm) {
        query = query.ilike('title', `%${queryTerm}%`);
      }

      return await query;
    }, options);
  }, [fetchWithCache]);

  const fetchTestimonials = useCallback(async (options: FetchOptions = {}) => {
    const { limit = DEFAULT_LIMIT, searchTerm: queryTerm } = options;

    await fetchWithCache('testimonials', async () => {
      let query = supabase
          .from('testimonials')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

      if (queryTerm) {
        query = query.ilike('name', `%${queryTerm}%`);
      }

      return await query;
    }, options);
  }, [fetchWithCache]);

  const fetchLeads = useCallback(async (options: FetchOptions = {}) => {
    const { limit = DEFAULT_LIMIT, searchTerm: queryTerm } = options;

    await fetchWithCache('leads', async () => {
      let query = supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

      if (queryTerm) {
        query = query.ilike('name', `%${queryTerm}%`);
      }

      return await query;
    }, options);
  }, [fetchWithCache]);

  const fetchEvents = useCallback(async (options: FetchOptions = {}) => {
    const { limit = DEFAULT_LIMIT, searchTerm: queryTerm } = options;

    await fetchWithCache('events', async () => {
      let query = supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

      if (queryTerm) {
        query = query.ilike('title', `%${queryTerm}%`);
      }

      return await query;
    }, options);
  }, [fetchWithCache]);

  const fetchTopRecruiters = useCallback(async (options: FetchOptions = {}) => {
    const { limit = DEFAULT_LIMIT, searchTerm: queryTerm } = options;

    await fetchWithCache('topRecruiters', async () => {
      let query = supabase
          .from('top_recruiters')
          .select('*')
          .order('display_order', { ascending: true })
          .limit(limit);

      if (queryTerm) {
        query = query.ilike('company_name', `%${queryTerm}%`);
      }

      return await query;
    }, options);
  }, [fetchWithCache]);

  const fetchHeroCarousel = useCallback(async (options: FetchOptions = {}) => {
    const { limit = 10, searchTerm: queryTerm } = options; // Smaller limit for carousel

    await fetchWithCache('heroCarousel', async () => {
      let query = supabase
          .from('hero_carousel')
          .select('*')
          .order('display_order', { ascending: true })
          .limit(limit);

      if (queryTerm) {
        query = query.ilike('title', `%${queryTerm}%`);
      }

      return await query;
    }, options);
  }, [fetchWithCache]);

  const fetchBlogs = useCallback(async (options: FetchOptions = {}) => {
    const { limit = DEFAULT_LIMIT, searchTerm: queryTerm } = options;

    await fetchWithCache('blogs',async () => {
      let query = supabase
          .from('blogs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
      if (queryTerm) {
        query = query.ilike('title', `%${queryTerm}%`);
      }
      return query;
    }, options);
  }, [fetchWithCache]);

  // Optimized fetchMultiple with parallel execution
  const fetchMultiple = useCallback(async (
      keys: (keyof ContentState)[],
      options: FetchOptions = {}
  ) => {
    setGlobalLoading(true);

    const fetchMap = {
      universities: fetchUniversities,
      programs: fetchPrograms,
      testimonials: fetchTestimonials,
      leads: fetchLeads,
      events: fetchEvents,
      topRecruiters: fetchTopRecruiters,
      heroCarousel: fetchHeroCarousel,
      blogs: fetchBlogs,
    };

    // Execute all fetches in parallel
    const promises = keys.map(key => fetchMap[key]?.(options));

    try {
      await Promise.allSettled(promises); // Use allSettled to prevent one failure from stopping others
    } catch (error) {
      console.error('Error in fetchMultiple:', error);
    } finally {
      setGlobalLoading(false);
    }
  }, [fetchUniversities, fetchPrograms, fetchTestimonials, fetchLeads, fetchEvents, fetchTopRecruiters, fetchHeroCarousel, fetchBlogs]);

  // Optimized refresh function
  const refresh = useCallback(async (key: keyof ContentState) => {
    const fetchMap = {
      universities: fetchUniversities,
      programs: fetchPrograms,
      testimonials: fetchTestimonials,
      leads: fetchLeads,
      events: fetchEvents,
      topRecruiters: fetchTopRecruiters,
      heroCarousel: fetchHeroCarousel,
      blogs: fetchBlogs,
    };

    await fetchMap[key]?.({ force: true });
  }, [fetchUniversities, fetchPrograms, fetchTestimonials, fetchLeads, fetchEvents, fetchTopRecruiters, fetchHeroCarousel, fetchBlogs]);

  // Debounced search function
  const searchAllContent = useCallback(async () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (!searchTerm.trim()) {
        // If search term is empty, fetch default data
        await fetchMultiple(['universities', 'programs', 'testimonials', 'leads', 'events', 'topRecruiters', 'heroCarousel', 'blogs']);
        return;
      }

      setGlobalLoading(true);

      try {
        await fetchMultiple(
            ['universities', 'programs', 'testimonials', 'leads', 'events', 'topRecruiters', 'heroCarousel','blogs'],
            { searchTerm, force: true }
        );
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setGlobalLoading(false);
      }
    }, DEBOUNCE_DELAY);
  }, [searchTerm, fetchMultiple]);

  // Clear cache function
  const clearCache = useCallback((key?: keyof ContentState) => {
    if (key) {
      cacheRef.current[key] = { data: [], timestamp: 0 };
    } else {
      // Clear all cache
      Object.keys(cacheRef.current).forEach(k => {
        cacheRef.current[k as keyof ContentState] = { data: [], timestamp: 0 };
      });
    }
  }, []);

  // Memoized context value
  const contextValue = useMemo(() => ({
    ...content,
    loading,
    globalLoading,
    searchTerm,
    setSearchTerm,
    searchAllContent,
    fetchUniversities,
    fetchPrograms,
    fetchTestimonials,
    fetchLeads,
    fetchEvents,
    fetchTopRecruiters,
    fetchHeroCarousel,
    fetchBlogs,
    fetchMultiple,
    refresh,
    clearCache,
  }), [
    content,
    loading,
    globalLoading,
    searchTerm,
    searchAllContent,
    fetchUniversities,
    fetchPrograms,
    fetchTestimonials,
    fetchLeads,
    fetchEvents,
    fetchTopRecruiters,
    fetchHeroCarousel,
    fetchBlogs,
    fetchMultiple,
    refresh,
    clearCache,
  ]);

  return (
      <ContentContext.Provider value={contextValue}>
        {children}
      </ContentContext.Provider>
  );
};

export const useContent = (): ContentContextType => {
  const context = useContext(ContentContext);
  if (!context) throw new Error('useContent must be used within a ContentProvider');
  return context;
};

// Additional hook for pagination
export const useContentPagination = () => {
  const context = useContent();

  const loadMore = useCallback(async (
      key: keyof ContentState,
      currentLength: number,
      limit: number = DEFAULT_LIMIT
  ) => {
    const fetchMap = {
      universities: context.fetchUniversities,
      programs: context.fetchPrograms,
      testimonials: context.fetchTestimonials,
      leads: context.fetchLeads,
      events: context.fetchEvents,
      topRecruiters: context.fetchTopRecruiters,
      heroCarousel: context.fetchHeroCarousel,
    };

    await fetchMap[key]?.({ offset: currentLength, limit, force: true });
  }, [context]);

  return { loadMore };
};