'use client';

import { ResourceManager } from '@/components/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="FAQs"
      subtitle="Common questions about telehealth, appointments, and care."
      endpoint="/api/admin/faqs"
      createDefaults={{ published: true, sort_order: 0 }}
      columns={[
        { key: 'question', label: 'Question' },
        { key: 'category', label: 'Category' },
        {
          key: 'published',
          label: 'Published',
          render: (r) => (r.published ? <span className="badge ok">Live</span> : 'Draft'),
        },
      ]}
      fields={[
        { key: 'question', label: 'Question', full: true },
        { key: 'answer', label: 'Answer', type: 'textarea', full: true },
        { key: 'category', label: 'Category' },
        { key: 'sort_order', label: 'Sort order', type: 'number' },
        { key: 'published', label: 'Published', type: 'checkbox' },
      ]}
    />
  );
}
