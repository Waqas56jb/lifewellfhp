'use client';

import { ResourceManager } from '@/components/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Locations"
      subtitle="Office address, hours, and contact details used on the public site."
      endpoint="/api/admin/locations"
      createDefaults={{ published: true, is_primary: true, hours: {} }}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'city', label: 'City' },
        { key: 'phone', label: 'Phone' },
        {
          key: 'published',
          label: 'Published',
          render: (r) => (r.published ? <span className="badge ok">Live</span> : 'Draft'),
        },
      ]}
      fields={[
        { key: 'name', label: 'Name' },
        { key: 'address_line1', label: 'Address line 1', full: true },
        { key: 'address_line2', label: 'Address line 2', full: true },
        { key: 'city', label: 'City' },
        { key: 'state', label: 'State' },
        { key: 'postal_code', label: 'Postal code' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
        { key: 'is_primary', label: 'Primary location', type: 'checkbox' },
        { key: 'published', label: 'Published', type: 'checkbox' },
      ]}
    />
  );
}
