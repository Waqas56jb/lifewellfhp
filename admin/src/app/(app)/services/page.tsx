'use client';

import { ResourceManager } from '@/components/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Services"
      subtitle="Treatment areas currently listed on the public website. Add, edit, unpublish, or delete any service."
      endpoint="/api/admin/services"
      createDefaults={{ published: true, sort_order: 0 }}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'Slug' },
        {
          key: 'published',
          label: 'Published',
          render: (r) => (r.published ? <span className="badge ok">Live</span> : <span className="badge">Draft</span>),
        },
      ]}
      fields={[
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'URL slug' },
        { key: 'summary', label: 'Summary', type: 'textarea', full: true },
        { key: 'body', label: 'Full content', type: 'textarea', full: true },
        { key: 'seo_title', label: 'SEO title' },
        { key: 'seo_description', label: 'SEO description', type: 'textarea' },
        { key: 'sort_order', label: 'Sort order', type: 'number' },
        { key: 'published', label: 'Published', type: 'checkbox' },
      ]}
    />
  );
}
