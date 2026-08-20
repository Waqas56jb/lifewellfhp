'use client';

import { ResourceManager } from '@/components/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Photos & media"
      subtitle="Store image URLs and alt text used across the site."
      endpoint="/api/admin/media"
      createDefaults={{ folder: 'general' }}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'folder', label: 'Folder' },
        { key: 'url', label: 'URL', render: (r) => String(r.url || '').slice(0, 48) },
      ]}
      fields={[
        { key: 'title', label: 'Title' },
        { key: 'url', label: 'File / CDN URL', full: true },
        { key: 'alt_text', label: 'Alt text', full: true },
        { key: 'mime_type', label: 'MIME type' },
        { key: 'folder', label: 'Folder' },
        { key: 'width', label: 'Width', type: 'number' },
        { key: 'height', label: 'Height', type: 'number' },
      ]}
    />
  );
}
