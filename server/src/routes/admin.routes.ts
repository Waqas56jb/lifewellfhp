import { Router } from 'express';
import { asyncHandler } from '../middleware/index.js';
import {
  requireAdmin,
  requirePermission,
  requireSuperAdmin,
} from '../middleware/adminAuth.js';
import { createCrudRouter } from './crudFactory.js';
import {
  handleAdminLogin,
  handleAdminMe,
  listAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from '../controllers/adminAuth.controller.js';
import {
  listLeads,
  getLead,
  updateLead,
  deleteLead,
} from '../controllers/leads.controller.js';
import {
  getAnalyticsSummary,
} from '../controllers/analytics.controller.js';
import { getSupabase } from '../lib/supabase.js';
import {
  announcementCreate,
  announcementUpdate,
  serviceCreate,
  serviceUpdate,
  providerCreate,
  providerUpdate,
  insuranceCreate,
  insuranceUpdate,
  testimonialCreate,
  testimonialUpdate,
  faqCreate,
  faqUpdate,
  locationCreate,
  locationUpdate,
  blogCreate,
  blogUpdate,
  mediaCreate,
  mediaUpdate,
  videoCreate,
  videoUpdate,
  sectionCreate,
  sectionUpdate,
  bookingCreate,
  bookingUpdate,
  seoCreate,
  seoUpdate,
} from '../validation/adminSchemas.js';
import { badRequest } from '../utils/errors.js';

export const adminRouter: Router = Router();

adminRouter.post('/auth/login', asyncHandler(handleAdminLogin));
adminRouter.get('/auth/me', requireAdmin, asyncHandler(handleAdminMe));

adminRouter.get(
  '/dashboard',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const sb = getSupabase();
    const [leads, services, posts, testimonials, faqs, media] = await Promise.all([
      sb.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      sb.from('services').select('id', { count: 'exact', head: true }),
      sb.from('blog_posts').select('id', { count: 'exact', head: true }),
      sb.from('testimonials').select('id', { count: 'exact', head: true }).eq('published', true),
      sb.from('faqs').select('id', { count: 'exact', head: true }),
      sb.from('media_assets').select('id', { count: 'exact', head: true }),
    ]);
    res.json({
      success: true,
      data: {
        newLeads: leads.count ?? 0,
        services: services.count ?? 0,
        posts: posts.count ?? 0,
        testimonials: testimonials.count ?? 0,
        faqs: faqs.count ?? 0,
        media: media.count ?? 0,
      },
    });
  })
);

adminRouter.get('/leads', requireAdmin, requirePermission('leads'), asyncHandler(listLeads));
adminRouter.get('/leads/:id', requireAdmin, requirePermission('leads'), asyncHandler(getLead));
adminRouter.patch('/leads/:id', requireAdmin, requirePermission('leads'), asyncHandler(updateLead));
adminRouter.delete('/leads/:id', requireAdmin, requirePermission('leads'), asyncHandler(deleteLead));

adminRouter.use(
  '/announcements',
  createCrudRouter({
    table: 'announcements',
    module: 'announcements',
    createSchema: announcementCreate,
    updateSchema: announcementUpdate,
    orderBy: { column: 'sort_order', ascending: true },
  })
);

adminRouter.use(
  '/services',
  createCrudRouter({
    table: 'services',
    module: 'services',
    createSchema: serviceCreate,
    updateSchema: serviceUpdate,
    orderBy: { column: 'sort_order', ascending: true },
  })
);

adminRouter.use(
  '/providers',
  createCrudRouter({
    table: 'providers',
    module: 'providers',
    createSchema: providerCreate,
    updateSchema: providerUpdate,
    orderBy: { column: 'sort_order', ascending: true },
  })
);

adminRouter.use(
  '/insurance',
  createCrudRouter({
    table: 'insurance_plans',
    module: 'insurance',
    createSchema: insuranceCreate,
    updateSchema: insuranceUpdate,
    orderBy: { column: 'sort_order', ascending: true },
  })
);

adminRouter.use(
  '/testimonials',
  createCrudRouter({
    table: 'testimonials',
    module: 'testimonials',
    createSchema: testimonialCreate,
    updateSchema: testimonialUpdate,
    orderBy: { column: 'sort_order', ascending: true },
  })
);

adminRouter.use(
  '/faqs',
  createCrudRouter({
    table: 'faqs',
    module: 'faqs',
    createSchema: faqCreate,
    updateSchema: faqUpdate,
    orderBy: { column: 'sort_order', ascending: true },
  })
);

adminRouter.use(
  '/locations',
  createCrudRouter({
    table: 'locations',
    module: 'locations',
    createSchema: locationCreate,
    updateSchema: locationUpdate,
    orderBy: { column: 'created_at', ascending: false },
  })
);

adminRouter.use(
  '/blog',
  createCrudRouter({
    table: 'blog_posts',
    module: 'blog',
    createSchema: blogCreate,
    updateSchema: blogUpdate,
    orderBy: { column: 'updated_at', ascending: false },
  })
);

adminRouter.use(
  '/media',
  createCrudRouter({
    table: 'media_assets',
    module: 'media',
    createSchema: mediaCreate,
    updateSchema: mediaUpdate,
    orderBy: { column: 'created_at', ascending: false },
  })
);

adminRouter.use(
  '/videos',
  createCrudRouter({
    table: 'videos',
    module: 'videos',
    createSchema: videoCreate,
    updateSchema: videoUpdate,
    orderBy: { column: 'sort_order', ascending: true },
  })
);

adminRouter.use(
  '/sections',
  createCrudRouter({
    table: 'site_sections',
    module: 'sections',
    createSchema: sectionCreate,
    updateSchema: sectionUpdate,
    orderBy: { column: 'page_key', ascending: true },
  })
);

adminRouter.use(
  '/booking',
  createCrudRouter({
    table: 'booking_settings',
    module: 'booking',
    createSchema: bookingCreate,
    updateSchema: bookingUpdate,
    orderBy: { column: 'updated_at', ascending: false },
  })
);

adminRouter.use(
  '/seo',
  createCrudRouter({
    table: 'seo_meta',
    module: 'seo',
    createSchema: seoCreate,
    updateSchema: seoUpdate,
    orderBy: { column: 'path', ascending: true },
  })
);

adminRouter.get(
  '/analytics/summary',
  requireAdmin,
  requirePermission('analytics'),
  asyncHandler(getAnalyticsSummary)
);

adminRouter.get('/users', requireAdmin, requireSuperAdmin, asyncHandler(listAdminUsers));
adminRouter.post('/users', requireAdmin, requireSuperAdmin, asyncHandler(createAdminUser));
adminRouter.patch('/users/:id', requireAdmin, requireSuperAdmin, asyncHandler(updateAdminUser));
adminRouter.delete('/users/:id', requireAdmin, requireSuperAdmin, asyncHandler(deleteAdminUser));

// Health of admin stack
adminRouter.get(
  '/health',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    try {
      const { error } = await getSupabase().from('admin_users').select('id', { count: 'exact', head: true });
      if (error) throw badRequest(error.message);
      res.json({ success: true, database: 'ok' });
    } catch (err) {
      res.status(503).json({
        success: false,
        database: 'error',
        message: err instanceof Error ? err.message : 'Database unavailable',
      });
    }
  })
);
