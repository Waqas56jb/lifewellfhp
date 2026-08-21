'use client';

import { ResourceManager } from '@/components/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Booking"
      subtitle="CharmHealth public calendar URL. Book buttons on the site open the in-site booking page, which embeds this calendar."
      endpoint="/api/admin/booking"
      createDefaults={{ label: 'Book appointment', provider: 'charmhealth', active: true }}
      columns={[
        { key: 'label', label: 'Label' },
        { key: 'provider', label: 'Provider' },
        { key: 'booking_url', label: 'URL', render: (r) => String(r.booking_url || '').slice(0, 48) },
      ]}
      fields={[
        { key: 'label', label: 'Button label' },
        { key: 'provider', label: 'Provider name' },
        { key: 'booking_url', label: 'Booking URL', type: 'url', full: true },
        { key: 'active', label: 'Active', type: 'checkbox' },
      ]}
    />
  );
}
