'use client';

import { ResourceManager } from '@/components/ResourceManager';
import { SeoPreview } from '@/components/SitePreviews';

export default function Page() {
  return (
    <ResourceManager
      title="SEO"
      subtitle="Google title, description, and social image by public path. Preview the search snippet, then Save to publish."
      endpoint="/api/admin/seo"
      createDefaults={{ noindex: false, path: '/' }}
      itemLabel={(r) => String(r.path || r.title || 'SEO row')}
      preview={{
        hint: 'Search and social preview only. Visitors and Google pick this up after Save.',
        liveHref: (row) => String(row.path || '/'),
        render: (form) => (
          <SeoPreview
            path={String(form.path || '/')}
            title={String(form.title || '')}
            description={String(form.description || '')}
            ogImage={form.og_image_url ? String(form.og_image_url) : null}
            noindex={Boolean(form.noindex)}
          />
        ),
      }}
      columns={[
        { key: 'path', label: 'Path' },
        { key: 'title', label: 'Title' },
        {
          key: 'noindex',
          label: 'Index',
          render: (r) => (r.noindex ? <span className="badge warn">Noindex</span> : <span className="badge ok">Index</span>),
        },
      ]}
      fields={[
        { key: 'path', label: 'Path (e.g. /faqs)' },
        { key: 'title', label: 'Title', full: true },
        { key: 'description', label: 'Meta description', type: 'textarea', full: true },
        { key: 'og_image_url', label: 'Social image URL', full: true },
        { key: 'noindex', label: 'Hide from search', type: 'checkbox' },
      ]}
    />
  );
}
