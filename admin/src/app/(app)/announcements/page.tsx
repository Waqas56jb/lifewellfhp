'use client';

import { ResourceManager } from '@/components/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Announcements"
      subtitle="Website notices shown to visitors (office closures, telehealth updates, etc.)."
      endpoint="/api/admin/announcements"
      createDefaults={{ tone: 'info', active: true, sort_order: 0 }}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'tone', label: 'Tone' },
        {
          key: 'active',
          label: 'Active',
          render: (r) => (r.active ? <span className="badge ok">Yes</span> : <span className="badge">No</span>),
        },
      ]}
      fields={[
        { key: 'title', label: 'Title' },
        {
          key: 'tone',
          label: 'Tone',
          type: 'select',
          options: [
            { value: 'info', label: 'Info' },
            { value: 'warning', label: 'Warning' },
            { value: 'urgent', label: 'Urgent' },
          ],
        },
        { key: 'body', label: 'Body', type: 'textarea', full: true },
        { key: 'sort_order', label: 'Sort order', type: 'number' },
        { key: 'active', label: 'Active', type: 'checkbox' },
      ]}
    />
  );
}
