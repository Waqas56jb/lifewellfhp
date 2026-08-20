'use client';

import { ResourceManager } from '@/components/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Blog & mental health resources"
      subtitle="Articles and educational content. Draft until you publish."
      endpoint="/api/admin/blog"
      createDefaults={{ published: false }}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'Slug' },
        {
          key: 'published',
          label: 'Status',
          render: (r) => (r.published ? <span className="badge ok">Published</span> : <span className="badge warn">Draft</span>),
        },
      ]}
      fields={[
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'Slug' },
        { key: 'author_name', label: 'Author' },
        { key: 'excerpt', label: 'Excerpt', type: 'textarea', full: true },
        { key: 'body', label: 'Body', type: 'textarea', full: true },
        { key: 'cover_image_url', label: 'Cover image URL' },
        { key: 'seo_title', label: 'SEO title' },
        { key: 'seo_description', label: 'SEO description', type: 'textarea' },
        { key: 'og_image_url', label: 'Social share image URL' },
        { key: 'published', label: 'Published', type: 'checkbox' },
      ]}
    />
  );
}
