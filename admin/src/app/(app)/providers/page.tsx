'use client';

import { ResourceManager } from '@/components/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Providers"
      subtitle="Clinician profiles shown on Meet Your Provider. Save to update the public bio."
      endpoint="/api/admin/providers"
      createDefaults={{ published: true, sort_order: 0, education: [], certifications: [] }}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'credentials', label: 'Credentials' },
        {
          key: 'published',
          label: 'Published',
          render: (r) => (r.published ? <span className="badge ok">Live</span> : 'Draft'),
        },
      ]}
      fields={[
        { key: 'name', label: 'Name' },
        { key: 'slug', label: 'URL slug' },
        { key: 'credentials', label: 'Credentials' },
        { key: 'title', label: 'Title / role' },
        { key: 'photo_url', label: 'Photo URL', type: 'url', full: true },
        { key: 'bio', label: 'Biography', type: 'textarea', full: true },
        { key: 'education', label: 'Education (JSON list)', type: 'json', full: true },
        { key: 'certifications', label: 'Certifications (JSON list)', type: 'json', full: true },
        { key: 'sort_order', label: 'Sort order', type: 'number' },
        { key: 'published', label: 'Published', type: 'checkbox' },
      ]}
    />
  );
}
