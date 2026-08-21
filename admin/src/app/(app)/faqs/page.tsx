'use client';

import { ResourceManager } from '@/components/ResourceManager';
import { FaqPreview } from '@/components/SitePreviews';

export default function Page() {
  return (
    <ResourceManager
      title="FAQs"
      subtitle="Questions on /faqs (General) and /fees-insurance (Fees). Preview before save; visitors update only after Save."
      endpoint="/api/admin/faqs"
      createDefaults={{ published: true, sort_order: 0, category: 'General' }}
      itemLabel={(r) => String(r.question || 'FAQ')}
      preview={{
        hint: 'Matches the public FAQ accordion. Category Fees goes to the Fees & Insurance page.',
        liveHref: (row) => (String(row.category || '') === 'Fees' ? '/fees-insurance' : '/faqs'),
        render: (form) => (
          <FaqPreview
            question={String(form.question || '')}
            answer={String(form.answer || '')}
            category={String(form.category || 'General')}
          />
        ),
      }}
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
        {
          key: 'category',
          label: 'Category',
          type: 'select',
          options: [
            { value: 'General', label: 'General → /faqs' },
            { value: 'Fees', label: 'Fees → /fees-insurance' },
          ],
        },
        { key: 'sort_order', label: 'Sort order', type: 'number' },
        { key: 'published', label: 'Published', type: 'checkbox' },
      ]}
    />
  );
}
