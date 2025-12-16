import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import BlogPost from '../models/BlogPost';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

const DEFAULT_BLOG_POSTS = [
    {
        slug: 'complete-guide-link-building-2024',
        title: 'Complete Guide to Link Building in 2024',
        excerpt: 'Learn the strategies and tactics that top SEO agencies use to build high-quality backlinks.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
        category: 'Link Building',
        author: { name: 'Sarah Chen', role: 'Head of SEO' },
        date: '2024-01-15',
        readTime: '12 min read',
        featured: false,
        status: 'published' as const,
        views: 2340,
        sortOrder: 1,
    },
    {
        slug: 'how-build-high-quality-backlinks',
        title: 'How to Build High-Quality Backlinks',
        excerpt: 'Discover proven strategies for building authoritative backlinks that drive real SEO results.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
        category: 'SEO',
        author: { name: 'John Doe', role: 'SEO Specialist' },
        date: '2024-01-10',
        readTime: '8 min read',
        featured: false,
        status: 'published' as const,
        views: 1856,
        sortOrder: 2,
    },
    {
        slug: 'guest-posting-best-practices',
        title: 'Guest Posting Best Practices',
        excerpt: 'Learn how to effectively use guest posting as part of your link building strategy.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
        category: 'Guest Posting',
        author: { name: 'Emily Rodriguez', role: 'Content Strategist' },
        date: '2024-01-08',
        readTime: '10 min read',
        featured: false,
        status: 'draft' as const,
        views: 0,
        sortOrder: 3,
    },
];

async function ensureSeeded(): Promise<void> {
    const count = await BlogPost.countDocuments();
    if (count === 0) {
        await BlogPost.insertMany(DEFAULT_BLOG_POSTS);
    }
}

export const getPublicBlogPosts = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    await ensureSeeded();
    const posts = await BlogPost.find({ status: 'published' })
        .sort({ sortOrder: 1, createdAt: -1 })
        .lean();
    sendSuccess(res, 'Blog posts retrieved', { posts });
});

export const getAllBlogPosts = asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
    await ensureSeeded();
    const posts = await BlogPost.find({})
        .sort({ sortOrder: 1, createdAt: -1 })
        .lean();
    sendSuccess(res, 'All blog posts retrieved', { posts });
});

export const getBlogPostById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const post = await BlogPost.findOne({ $or: [{ _id: id }, { slug: id }] }).lean();

    if (!post) {
        throw new AppError('Blog post not found', 404);
    }

    sendSuccess(res, 'Blog post retrieved', { post });
});

export const createBlogPost = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const post = await BlogPost.create({
        slug: req.body.slug,
        title: req.body.title,
        excerpt: req.body.excerpt,
        content: req.body.content || '',
        category: req.body.category,
        author: req.body.author,
        date: req.body.date || new Date().toISOString().split('T')[0],
        readTime: req.body.readTime,
        featuredImage: req.body.featuredImage,
        metaTitle: req.body.metaTitle || req.body.title,
        metaDescription: req.body.metaDescription || req.body.excerpt,
        featured: req.body.featured || false,
        status: req.body.status || 'draft',
        views: req.body.views || 0,
        sortOrder: req.body.sortOrder ?? 0,
    });

    sendSuccess(res, 'Blog post created', { post }, 201);
});

export const updateBlogPost = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData: any = {};

    if (req.body.slug !== undefined) updateData.slug = req.body.slug;
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.excerpt !== undefined) updateData.excerpt = req.body.excerpt;
    if (req.body.content !== undefined) updateData.content = req.body.content;
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.author !== undefined) updateData.author = req.body.author;
    if (req.body.date !== undefined) updateData.date = req.body.date;
    if (req.body.readTime !== undefined) updateData.readTime = req.body.readTime;
    if (req.body.featuredImage !== undefined) updateData.featuredImage = req.body.featuredImage;
    if (req.body.metaTitle !== undefined) updateData.metaTitle = req.body.metaTitle;
    if (req.body.metaDescription !== undefined) updateData.metaDescription = req.body.metaDescription;
    if (req.body.featured !== undefined) updateData.featured = req.body.featured;
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.views !== undefined) updateData.views = req.body.views;
    if (req.body.sortOrder !== undefined) updateData.sortOrder = req.body.sortOrder;

    const post = await BlogPost.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!post) {
        throw new AppError('Blog post not found', 404);
    }

    sendSuccess(res, 'Blog post updated', { post });
});

export const deleteBlogPost = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const post = await BlogPost.findByIdAndDelete(id);

    if (!post) {
        throw new AppError('Blog post not found', 404);
    }

    sendSuccess(res, 'Blog post deleted');
});

