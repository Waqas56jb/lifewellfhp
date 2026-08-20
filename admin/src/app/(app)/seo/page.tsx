'use client';

import { ResourceManager } from '@/components/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="SEO"
      subtitle="Titles, descriptions, and social images by public path (for example / or /faqs)."
      endpoint="/api/admin/seo"
      createDefaults={{ noindex: false }}
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
        { key: 'og_image_url', label: 'Social image URL', type: 'url', full: true },
        { key: 'noindex', label: 'Hide from search', type: 'checkbox' },
      ]}
    />
  );
}
