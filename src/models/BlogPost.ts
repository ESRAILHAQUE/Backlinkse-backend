import mongoose, { Document, Model, Schema } from 'mongoose';

export interface BlogAuthor {
    name: string;
    role: string;
}

export interface BlogPostDocument extends Document {
    slug: string;
    title: string;
    excerpt?: string;
    content: string;
    category: string;
    author?: BlogAuthor;
    date: string;
    readTime?: string;
    featuredImage?: string;
    metaTitle?: string;
    metaDescription?: string;
    featured?: boolean;
    status: 'published' | 'draft';
    views?: number;
    sortOrder?: number;
    createdAt: Date;
    updatedAt: Date;
}

const BlogAuthorSchema = new Schema<BlogAuthor>(
    {
        name: { type: String, required: true, trim: true },
        role: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const BlogPostSchema = new Schema<BlogPostDocument>(
    {
        slug: { type: String, required: true, unique: true, trim: true },
        title: { type: String, required: true, trim: true },
        excerpt: { type: String, trim: true },
        content: { type: String, required: true },
        category: { type: String, required: true, trim: true },
        author: { type: BlogAuthorSchema },
        date: { type: String, required: true, trim: true },
        readTime: { type: String, trim: true },
        featuredImage: { type: String, trim: true },
        metaTitle: { type: String, trim: true },
        metaDescription: { type: String, trim: true },
        featured: { type: Boolean, default: false },
        status: { type: String, enum: ['published', 'draft'], default: 'draft' },
        views: { type: Number, default: 0 },
        sortOrder: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
BlogPostSchema.index({ slug: 1 });
BlogPostSchema.index({ status: 1, sortOrder: 1 });
BlogPostSchema.index({ category: 1 });

const BlogPost: Model<BlogPostDocument> =
    mongoose.models.BlogPost || mongoose.model<BlogPostDocument>('BlogPost', BlogPostSchema);

export default BlogPost;

