'use client';

import { ResourceManager } from '@/components/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="SEO & social sharing"
      subtitle="Per-path titles, descriptions, and Open Graph images."
      endpoint="/api/admin/seo"
      createDefaults={{ noindex: false }}
      columns={[
        { key: 'path', label: 'Path' },
        { key: 'title', label: 'Title' },
        {
          key: 'noindex',
          label: 'Noindex',
          render: (r) => (r.noindex ? 'Yes' : 'No'),
        },
      ]}
      fields={[
        { key: 'path', label: 'Path (e.g. /faqs)' },
        { key: 'title', label: 'SEO title' },
        { key: 'description', label: 'Meta description', type: 'textarea', full: true },
        { key: 'og_image_url', label: 'Social image URL', full: true },
        { key: 'noindex', label: 'Noindex', type: 'checkbox' },
      ]}
    />
  );
}
