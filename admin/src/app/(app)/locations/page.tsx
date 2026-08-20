'use client';

import { ResourceManager } from '@/components/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Locations, hours & contact"
      subtitle="Office details and hours shown on contact pages."
      endpoint="/api/admin/locations"
      createDefaults={{ published: true, is_primary: false, hours: {} }}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'city', label: 'City' },
        { key: 'phone', label: 'Phone' },
        {
          key: 'is_primary',
          label: 'Primary',
          render: (r) => (r.is_primary ? 'Yes' : 'No'),
        },
      ]}
      fields={[
        { key: 'name', label: 'Location name' },
        { key: 'address_line1', label: 'Address line 1' },
        { key: 'address_line2', label: 'Address line 2' },
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
