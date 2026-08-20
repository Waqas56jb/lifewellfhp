'use client';

import { ResourceManager } from '@/components/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Provider profiles"
      subtitle="Credentials, bio, education, and certifications."
      endpoint="/api/admin/providers"
      createDefaults={{ published: true, sort_order: 0, education: [], certifications: [] }}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'credentials', label: 'Credentials' },
        { key: 'title', label: 'Title' },
      ]}
      fields={[
        { key: 'name', label: 'Name' },
        { key: 'slug', label: 'Slug' },
        { key: 'credentials', label: 'Credentials' },
        { key: 'title', label: 'Role / title' },
        { key: 'bio', label: 'Bio', type: 'textarea', full: true },
        { key: 'photo_url', label: 'Photo URL', type: 'url' },
        { key: 'sort_order', label: 'Sort order', type: 'number' },
        { key: 'published', label: 'Published', type: 'checkbox' },
      ]}
    />
  );
}
