'use client';

import { ResourceManager } from '@/components/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Insurance"
      subtitle="Plans shown on the Fees & Insurance page."
      endpoint="/api/admin/insurance"
      createDefaults={{ published: true, self_pay: false, sort_order: 0 }}
      columns={[
        { key: 'name', label: 'Plan' },
        {
          key: 'self_pay',
          label: 'Self-pay',
          render: (r) => (r.self_pay ? 'Yes' : 'No'),
        },
        {
          key: 'published',
          label: 'Published',
          render: (r) => (r.published ? <span className="badge ok">Live</span> : 'Draft'),
        },
      ]}
      fields={[
        { key: 'name', label: 'Name' },
        { key: 'logo_url', label: 'Logo URL' },
        { key: 'notes', label: 'Notes', type: 'textarea', full: true },
        { key: 'sort_order', label: 'Sort order', type: 'number' },
        { key: 'self_pay', label: 'Self-pay option', type: 'checkbox' },
        { key: 'published', label: 'Published', type: 'checkbox' },
      ]}
    />
  );
}
