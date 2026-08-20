'use client';

import { ResourceManager } from '@/components/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Videos"
      subtitle="YouTube or educational videos. Published items appear on the homepage."
      endpoint="/api/admin/videos"
      createDefaults={{ published: true, provider: 'youtube', sort_order: 0 }}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'provider', label: 'Source' },
        {
          key: 'published',
          label: 'Published',
          render: (r) => (r.published ? <span className="badge ok">Live</span> : 'Draft'),
        },
      ]}
      fields={[
        { key: 'title', label: 'Title' },
        {
          key: 'provider',
          label: 'Source',
          type: 'select',
          options: [
            { value: 'youtube', label: 'YouTube' },
            { value: 'vimeo', label: 'Vimeo' },
            { value: 'file', label: 'File URL' },
            { value: 'embed', label: 'Embed' },
          ],
        },
        { key: 'url', label: 'URL', type: 'url', full: true },
        { key: 'thumbnail_url', label: 'Thumbnail URL', type: 'url', full: true },
        { key: 'description', label: 'Description', type: 'textarea', full: true },
        { key: 'embed_html', label: 'Embed HTML (optional)', type: 'textarea', full: true },
        { key: 'sort_order', label: 'Sort order', type: 'number' },
        { key: 'published', label: 'Published', type: 'checkbox' },
      ]}
    />
  );
}
