'use client';

import { ResourceManager } from '@/components/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Blog"
      subtitle="Articles on /blog. Drafts stay off the public site until published."
      endpoint="/api/admin/blog"
      createDefaults={{ published: false }}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'Slug' },
        {
          key: 'published',
          label: 'Published',
          render: (r) => (r.published ? <span className="badge ok">Live</span> : 'Draft'),
        },
      ]}
      fields={[
        { key: 'title', label: 'Title', full: true },
        { key: 'slug', label: 'URL slug' },
        { key: 'author_name', label: 'Author' },
        { key: 'cover_image_url', label: 'Cover image URL', type: 'url', full: true },
        { key: 'excerpt', label: 'Excerpt', type: 'textarea', full: true },
        { key: 'body', label: 'Article body', type: 'textarea', full: true },
        { key: 'seo_title', label: 'SEO title' },
        { key: 'seo_description', label: 'SEO description', type: 'textarea' },
        { key: 'og_image_url', label: 'Social image URL', type: 'url', full: true },
        { key: 'published', label: 'Published', type: 'checkbox' },
      ]}
    />
  );
}
