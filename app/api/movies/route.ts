// app/api/movies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Movie } from '@/models/Movie';
import { ErrorHandler } from '@/utils/error-handling';
import { cache } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Max 100 items
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const featured = searchParams.get('featured') === 'true';
    const active = searchParams.get('active') !== 'false'; // Default to true
    const premium = searchParams.get('premium');
    const genre = searchParams.get('genre');
    const search = searchParams.get('search');

    // Build filter object
    const filter: any = {};
    
    if (active) {
      filter.isActive = true;
    }
    
    if (featured) {
      filter.isFeatured = true;
    }
    
    if (premium !== null) {
      filter.isPremium = premium === 'true';
    }
    
    if (genre) {
      filter.genres = genre;
    }
    
    if (search) {
      filter.$text = { $search: search };
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    switch (sortBy) {
      case 'title':
        sort.title = sortOrder;
        break;
      case 'releaseDate':
        sort.releaseDate = sortOrder;
        break;
      case 'rating':
        sort.rating = sortOrder;
        break;
      case 'views':
        sort.views = sortOrder;
        break;
      case 'createdAt':
      default:
        sort.createdAt = sortOrder;
        break;
    }

    // Create cache key
    const cacheKey = `movies:${JSON.stringify({ filter, sort, skip, limit })}`;
    
    // Try to get from cache first
    let movies = cache.get(cacheKey);
    
    if (!movies) {
      // Execute query
      movies = await Movie.find(filter)
        .populate('genres', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      // Cache the results for 10 minutes
      cache.set(cacheKey, movies, 600);
    }

    // Get total count for pagination (with cache)
    const countCacheKey = `movies:count:${JSON.stringify(filter)}`;
    let total = cache.get(countCacheKey);
    
    if (!total) {
      total = await Movie.countDocuments(filter);
      cache.set(countCacheKey, total, 600);
    }

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // Transform data for API response
    const transformedMovies = movies.map((movie: any) => ({
      _id: movie._id,
      title: movie.title,
      originalTitle: movie.originalTitle,
      overview: movie.overview,
      poster: movie.poster,
      backdrop: movie.backdrop,
      trailer: movie.trailer,
      genres: movie.genres,
      rating: movie.rating,
      imdbRating: movie.imdbRating,
      releaseDate: movie.releaseDate,
      duration: movie.duration,
      language: movie.language,
      country: movie.country,
      director: movie.director,
      cast: movie.cast,
      isActive: movie.isActive,
      isFeatured: movie.isFeatured,
      isPremium: movie.isPremium,
      views: movie.views,
      likes: movie.likes,
      dislikes: movie.dislikes,
      createdAt: movie.createdAt,
      updatedAt: movie.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: transformedMovies,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        hasNext,
        hasPrev
      },
      filters: {
        featured,
        active,
        premium,
        genre,
        search,
        sortBy,
        sortOrder: sortOrder === 1 ? 'asc' : 'desc'
      }
    });

  } catch (error) {
    console.error('Movies API error:', error);
    
    return ErrorHandler.createErrorResponse(
      new ErrorHandler.AppError(
        'Failed to fetch movies',
        500,
        true,
        'MOVIES_FETCH_ERROR',
        { 
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      )
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Implement movie creation (admin only)
    return NextResponse.json(
      { error: 'Movie creation not implemented yet' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Movie creation error:', error);
    return ErrorHandler.createErrorResponse(
      new ErrorHandler.AppError('Failed to create movie', 500)
    );
  }
}