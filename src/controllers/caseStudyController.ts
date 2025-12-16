import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import CaseStudy from '../models/CaseStudy';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

const DEFAULT_CASE_STUDIES = [
    {
        slug: 'career-coaching-platform',
        client: 'Career Coaching Platform',
        name: 'Career Guidance Service', // For admin interface
        industry: 'Professional Services',
        logo: '💼',
        trafficIncrease: '14,582%',
        trafficGrowth: '14,582%', // For admin compatibility
        trafficBefore: '241',
        trafficAfter: '36K',
        linksBuilt: 551,
        drBefore: 12,
        drAfter: 58,
        keywordsTop10: 847,
        duration: '18 months',
        featuredImage: '/career-coaching-website-analytics-dashboard.jpg',
        overview:
            'A career coaching and resume writing service approached us with virtually no organic presence. Despite having excellent services and client testimonials, they were invisible in search results, relying entirely on paid advertising for leads. Our mission was to build their domain authority from the ground up and establish them as a trusted resource in the career development space.',
        challenges: [
            'Domain Rating of only 12 with minimal backlink profile',
            'Competing against established job boards and career sites with DRs of 70+',
            'No existing content strategy or keyword targeting',
            'Limited brand recognition in a crowded market',
            'High customer acquisition costs from paid channels',
        ],
        strategy: [
            'Conducted comprehensive competitor backlink analysis to identify link opportunities',
            'Developed a content hub strategy focused on career advice and interview tips',
            'Targeted guest posting opportunities on HR, business, and career publications',
            'Built relationships with career coaches and HR professionals for natural link acquisition',
            'Implemented digital PR campaigns around job market trends and salary data',
        ],
        execution: [
            'Month 1-3: Foundation building with 45 high-quality guest posts on relevant industry sites',
            'Month 4-6: Launched career statistics resource page that attracted natural editorial links',
            'Month 7-12: Scaled link acquisition to 40+ links per month while maintaining quality standards',
            'Month 13-18: Focused on competitive keyword targeting with strategic anchor text distribution',
        ],
        results: [
            { label: 'Organic Traffic', before: '241/mo', after: '36,000/mo', change: '+14,582%' },
            { label: 'Domain Rating', before: '12', after: '58', change: '+46 points' },
            { label: 'Keywords in Top 10', before: '23', after: '847', change: '+3,582%' },
            { label: 'Monthly Leads', before: '8', after: '340', change: '+4,150%' },
        ],
        testimonial: {
            quote:
                'We went from being invisible online to ranking #1 for our most valuable keywords. The ROI has been incredible - our cost per lead dropped by 80% while lead quality actually improved.',
            author: 'Sarah Mitchell',
            role: 'Founder & CEO',
        },
        status: 'published' as const,
        sortOrder: 1,
    },
    {
        slug: 'employee-relocation-service',
        client: 'Employee Relocation Service',
        name: 'Employee Relocation Service',
        industry: 'Corporate Services',
        logo: '🏢',
        trafficIncrease: '6,098%',
        trafficGrowth: '6,098%',
        trafficBefore: '357',
        trafficAfter: '22.1K',
        linksBuilt: 262,
        drBefore: 18,
        drAfter: 52,
        keywordsTop10: 423,
        duration: '14 months',
        featuredImage: '/corporate-relocation-services-analytics.jpg',
        overview:
            'A B2B employee relocation company serving Fortune 500 clients needed to establish thought leadership and capture high-intent search traffic. Their services were excellent but their online visibility was poor, causing them to lose deals to competitors with stronger digital presence.',
        challenges: [
            'B2B niche with long sales cycles and complex decision-making processes',
            'Limited content resources and internal marketing capacity',
            'Competing against national relocation firms with established brands',
            'Need for highly targeted traffic from HR directors and C-suite executives',
            'Geographic targeting requirements for multiple service areas',
        ],
        strategy: [
            'Focused on building links from HR, business, and real estate publications',
            'Created comprehensive relocation guides targeting specific metro areas',
            'Developed thought leadership content around remote work and employee mobility trends',
            'Targeted niche industry publications read by HR decision-makers',
            'Built relationships with commercial real estate and corporate housing sites',
        ],
        execution: [
            'Month 1-4: Secured 85 placements on HR and business publications',
            'Month 5-8: Launched city-specific relocation guides with localized link building',
            'Month 9-14: Expanded into digital PR with employee mobility research reports',
        ],
        results: [
            { label: 'Organic Traffic', before: '357/mo', after: '22,100/mo', change: '+6,098%' },
            { label: 'Domain Rating', before: '18', after: '52', change: '+34 points' },
            { label: 'Enterprise Leads', before: '2/mo', after: '28/mo', change: '+1,300%' },
            { label: 'Average Deal Size', before: '$45K', after: '$78K', change: '+73%' },
        ],
        status: 'published' as const,
        sortOrder: 2,
    },
    {
        slug: 'online-learning-platform',
        client: 'Online Learning Platform',
        name: 'Online Courses Platform',
        industry: 'EdTech',
        logo: '📚',
        trafficIncrease: '84%',
        trafficGrowth: '84%',
        trafficBefore: '5M',
        trafficAfter: '9.3M',
        linksBuilt: 682,
        drBefore: 65,
        drAfter: 78,
        keywordsTop10: 12500,
        duration: '12 months',
        featuredImage: '/online-education-platform-growth-chart.jpg',
        overview:
            'An established online learning platform with millions of monthly visitors engaged us to accelerate their growth and defend market position against well-funded competitors. Despite their existing success, they were losing ground on key educational keywords.',
        challenges: [
            'Already high domain authority made incremental gains more difficult',
            'Aggressive competition from venture-backed EdTech startups',
            'Need to maintain link quality standards at scale',
            'Broad keyword portfolio requiring diverse link sources',
            'International expansion requiring multi-language link building',
        ],
        strategy: [
            'Implemented enterprise-scale link building across 6 countries',
            'Created linkable assets including industry reports and free tools',
            'Developed scholarship programs that attracted .edu backlinks',
            'Partnered with educational institutions for co-branded content',
            'Launched podcast sponsorship campaign targeting learning-focused shows',
        ],
        execution: [
            'Month 1-3: Audit of existing backlink profile and competitor gap analysis',
            'Month 4-6: Launched 3 major linkable assets generating 200+ organic backlinks',
            'Month 7-12: Scaled international link building across EU, UK, and APAC markets',
        ],
        results: [
            { label: 'Organic Traffic', before: '5M/mo', after: '9.3M/mo', change: '+84%' },
            { label: 'Domain Rating', before: '65', after: '78', change: '+13 points' },
            { label: 'Revenue from Organic', before: '$2.1M/mo', after: '$4.2M/mo', change: '+100%' },
            { label: 'Market Share', before: '12%', after: '19%', change: '+58%' },
        ],
        testimonial: {
            quote:
                'At our scale, finding a link building partner that could move the needle seemed impossible. They not only delivered but helped us capture significant market share from our biggest competitors.',
            author: 'James Chen',
            role: 'VP of Growth',
        },
        status: 'published' as const,
        sortOrder: 3,
    },
    {
        slug: 'healthy-snacks-delivery',
        client: 'Healthy Snacks Delivery',
        name: 'Snack Delivery Service',
        industry: 'E-Commerce',
        logo: '🥗',
        trafficIncrease: '2,341%',
        trafficGrowth: '2,341%',
        trafficBefore: '428K',
        trafficAfter: '995K',
        linksBuilt: 423,
        drBefore: 48,
        drAfter: 67,
        keywordsTop10: 2840,
        duration: '18 months',
        featuredImage: '/healthy-snack-subscription-box-ecommerce.jpg',
        overview:
            'A direct-to-consumer healthy snack subscription service needed to compete against major retailers and established snack brands in organic search. Their products were exceptional but their SEO could not match the marketing budgets of bigger players.',
        challenges: [
            'Competing against Amazon, Walmart, and major CPG brands',
            'Seasonal fluctuations in snack-related search volume',
            'Limited budget compared to enterprise competitors',
            'Need for both branded and non-branded keyword growth',
            'High customer acquisition costs threatening profitability',
        ],
        strategy: [
            'Focused on food, health, and lifestyle publication placements',
            'Created nutrition guides and healthy eating resources as link magnets',
            'Developed influencer partnership program with food bloggers',
            'Targeted health and wellness podcasts for brand mentions and links',
            'Built links around specific diet trends (keto, paleo, vegan)',
        ],
        execution: [
            'Month 1-4: Secured 150 placements on food and health blogs',
            'Month 5-10: Launched diet-specific landing pages with targeted link building',
            'Month 11-18: Scaled successful tactics while testing new link sources',
        ],
        results: [
            { label: 'Organic Traffic', before: '428K/mo', after: '995K/mo', change: '+132%' },
            { label: 'Domain Rating', before: '48', after: '67', change: '+19 points' },
            { label: 'Organic Revenue', before: '$890K/mo', after: '$2.4M/mo', change: '+170%' },
            { label: 'CAC Reduction', before: '$28', after: '$14', change: '-50%' },
        ],
        status: 'draft' as const,
        sortOrder: 4,
    },
];

async function ensureSeeded(): Promise<void> {
    const count = await CaseStudy.countDocuments();
    if (count === 0) {
        await CaseStudy.insertMany(DEFAULT_CASE_STUDIES);
    }
}

export const getPublicCaseStudies = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    await ensureSeeded();
    const caseStudies = await CaseStudy.find({ status: 'published' })
        .sort({ sortOrder: 1, createdAt: 1 })
        .lean();
    sendSuccess(res, 'Case studies retrieved', { caseStudies });
});

export const getAllCaseStudies = asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
    await ensureSeeded();
    const caseStudies = await CaseStudy.find({})
        .sort({ sortOrder: 1, createdAt: 1 })
        .lean();
    sendSuccess(res, 'All case studies retrieved', { caseStudies });
});

export const getCaseStudyById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const caseStudy = await CaseStudy.findOne({ $or: [{ _id: id }, { slug: id }] }).lean();

    if (!caseStudy) {
        throw new AppError('Case study not found', 404);
    }

    sendSuccess(res, 'Case study retrieved', { caseStudy });
});

export const createCaseStudy = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const caseStudy = await CaseStudy.create({
        slug: req.body.slug,
        client: req.body.client,
        name: req.body.name || req.body.client,
        industry: req.body.industry,
        logo: req.body.logo,
        trafficIncrease: req.body.trafficIncrease,
        trafficGrowth: req.body.trafficGrowth || req.body.trafficIncrease,
        trafficBefore: req.body.trafficBefore,
        trafficAfter: req.body.trafficAfter,
        linksBuilt: req.body.linksBuilt,
        drBefore: req.body.drBefore,
        drAfter: req.body.drAfter,
        keywordsTop10: req.body.keywordsTop10,
        duration: req.body.duration,
        featuredImage: req.body.featuredImage,
        overview: req.body.overview,
        description: req.body.description || req.body.overview,
        challenges: req.body.challenges || [],
        strategy: req.body.strategy || [],
        execution: req.body.execution || [],
        results: req.body.results || [],
        testimonial: req.body.testimonial,
        status: req.body.status || 'published',
        sortOrder: req.body.sortOrder ?? 0,
    });

    sendSuccess(res, 'Case study created', { caseStudy }, 201);
});

export const updateCaseStudy = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData: any = {};

    if (req.body.slug !== undefined) updateData.slug = req.body.slug;
    if (req.body.client !== undefined) updateData.client = req.body.client;
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.industry !== undefined) updateData.industry = req.body.industry;
    if (req.body.logo !== undefined) updateData.logo = req.body.logo;
    if (req.body.trafficIncrease !== undefined) updateData.trafficIncrease = req.body.trafficIncrease;
    if (req.body.trafficGrowth !== undefined) updateData.trafficGrowth = req.body.trafficGrowth;
    if (req.body.trafficBefore !== undefined) updateData.trafficBefore = req.body.trafficBefore;
    if (req.body.trafficAfter !== undefined) updateData.trafficAfter = req.body.trafficAfter;
    if (req.body.linksBuilt !== undefined) updateData.linksBuilt = req.body.linksBuilt;
    if (req.body.drBefore !== undefined) updateData.drBefore = req.body.drBefore;
    if (req.body.drAfter !== undefined) updateData.drAfter = req.body.drAfter;
    if (req.body.keywordsTop10 !== undefined) updateData.keywordsTop10 = req.body.keywordsTop10;
    if (req.body.duration !== undefined) updateData.duration = req.body.duration;
    if (req.body.featuredImage !== undefined) updateData.featuredImage = req.body.featuredImage;
    if (req.body.overview !== undefined) updateData.overview = req.body.overview;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.challenges !== undefined) updateData.challenges = req.body.challenges;
    if (req.body.strategy !== undefined) updateData.strategy = req.body.strategy;
    if (req.body.execution !== undefined) updateData.execution = req.body.execution;
    if (req.body.results !== undefined) updateData.results = req.body.results;
    if (req.body.testimonial !== undefined) updateData.testimonial = req.body.testimonial;
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.sortOrder !== undefined) updateData.sortOrder = req.body.sortOrder;

    const caseStudy = await CaseStudy.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!caseStudy) {
        throw new AppError('Case study not found', 404);
    }

    sendSuccess(res, 'Case study updated', { caseStudy });
});

export const deleteCaseStudy = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const caseStudy = await CaseStudy.findByIdAndDelete(id);

    if (!caseStudy) {
        throw new AppError('Case study not found', 404);
    }

    sendSuccess(res, 'Case study deleted');
});

