'use client';

import { ResourceManager } from '@/components/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Homepage & page sections"
      subtitle="Editable marketing blocks (hero copy, CTAs, welcome text). Content is JSON."
      endpoint="/api/admin/sections"
      createDefaults={{ page_key: 'home', section_key: 'hero', published: true, content: '{}' }}
      columns={[
        { key: 'page_key', label: 'Page' },
        { key: 'section_key', label: 'Section' },
        { key: 'title', label: 'Title' },
      ]}
      fields={[
        { key: 'page_key', label: 'Page key (e.g. home)' },
        { key: 'section_key', label: 'Section key (e.g. hero)' },
        { key: 'title', label: 'Title' },
        {
          key: 'content',
          label: 'Content JSON',
          type: 'json',
          full: true,
        },
        { key: 'published', label: 'Published', type: 'checkbox' },
      ]}
    />
  );
}
