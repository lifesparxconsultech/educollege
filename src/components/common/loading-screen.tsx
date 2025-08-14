import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingScreen: React.FC = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Header Skeleton */}
            <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center">
                    <Skeleton className="h-8 w-32" />
                    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                        <div className="hidden md:flex space-x-6">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-18" />
                            <Skeleton className="h-6 w-12" />
                        </div>
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
            </div>

            {/* Hero Section Skeleton */}
            <div className="relative h-[80vh] bg-muted">
                <div className="container flex h-full items-center">
                    <div className="max-w-2xl space-y-6">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-12 w-48" />
                    </div>
                </div>
            </div>

            {/* Featured Universities Section Skeleton */}
            <div className="py-16 bg-background">
                <div className="container">
                    <div className="text-center mb-12">
                        <Skeleton className="h-10 w-96 mx-auto mb-4" />
                        <Skeleton className="h-6 w-2/3 mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="rounded-lg border bg-card p-6">
                                <div className="flex items-center space-x-4 mb-4">
                                    <Skeleton className="w-16 h-16 rounded-lg" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-3/4 mb-4" />
                                <div className="flex space-x-2 mb-4">
                                    <Skeleton className="h-6 w-16" />
                                    <Skeleton className="h-6 w-20" />
                                    <Skeleton className="h-6 w-18" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Program Categories Skeleton */}
            <div className="py-16 bg-muted/50">
                <div className="container">
                    <div className="text-center mb-12">
                        <Skeleton className="h-10 w-80 mx-auto mb-4" />
                        <Skeleton className="h-6 w-2/3 mx-auto" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="text-center">
                                <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                                <Skeleton className="h-5 w-20 mx-auto mb-2" />
                                <Skeleton className="h-4 w-16 mx-auto" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Loading Animation */}
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                        <div className="w-12 h-12 border-3 border-primary/30 border-r-primary rounded-full animate-spin absolute top-2 left-1/2 transform -translate-x-1/2 animation-delay-150"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Loading Your Education Portal</h3>
                    <p className="text-sm text-muted-foreground">Preparing the best programs for you...</p>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;