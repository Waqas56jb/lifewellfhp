'use client';

import { ResourceManager } from '@/components/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Videos"
      subtitle="YouTube, Vimeo, hosted files, or raw embed snippets for educational content."
      endpoint="/api/admin/videos"
      createDefaults={{ provider: 'youtube', published: true, sort_order: 0 }}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'provider', label: 'Provider' },
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
          label: 'Provider',
          type: 'select',
          options: [
            { value: 'youtube', label: 'YouTube' },
            { value: 'vimeo', label: 'Vimeo' },
            { value: 'file', label: 'File URL' },
            { value: 'embed', label: 'Embed HTML' },
          ],
        },
        { key: 'url', label: 'URL', full: true },
        { key: 'embed_html', label: 'Embed HTML (optional)', type: 'textarea', full: true },
        { key: 'description', label: 'Description', type: 'textarea', full: true },
        { key: 'thumbnail_url', label: 'Thumbnail URL' },
        { key: 'sort_order', label: 'Sort order', type: 'number' },
        { key: 'published', label: 'Published', type: 'checkbox' },
      ]}
    />
  );
}
