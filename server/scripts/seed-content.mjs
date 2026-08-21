import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing Supabase env');
  process.exit(1);
}

const sb = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const upserts = [
  {
    table: 'announcements',
    rows: [
      {
        title: 'Telehealth visits available',
        body: 'Secure video appointments for psychiatric and primary care.',
        tone: 'info',
        active: true,
        sort_order: 0,
      },
    ],
  },
  {
    table: 'services',
    rows: [
      {
        slug: 'psychiatric-evaluations',
        title: 'Psychiatric Evaluations',
        summary: 'Comprehensive telehealth psychiatric assessment.',
        body: 'Initial evaluation to understand symptoms, history, and treatment options.',
        published: true,
        sort_order: 1,
        seo_title: 'Psychiatric Evaluations',
        seo_description: 'Telehealth psychiatric evaluations with a board-certified PMHNP.',
      },
      {
        slug: 'medication-management',
        title: 'Medication Management',
        summary: 'Ongoing medication support by secure video.',
        body: 'Follow-up visits focused on medication response, side effects, and adjustments.',
        published: true,
        sort_order: 2,
      },
    ],
  },
  {
    table: 'providers',
    rows: [
      {
        slug: 'lourdie-chachoute',
        name: 'Lourdie Chachoute',
        credentials: 'FNP-C, PMHNP-BC',
        title: 'Family & Psychiatric Mental Health Nurse Practitioner',
        bio: 'Solo telehealth clinician providing psychiatric and adult primary care.',
        education: [],
        certifications: ['FNP-C', 'PMHNP-BC'],
        published: true,
        sort_order: 0,
      },
    ],
  },
  {
    table: 'faqs',
    rows: [
      {
        question: 'Do you offer telehealth only?',
        answer: 'Yes. Care is delivered by secure video appointments.',
        category: 'General',
        published: true,
        sort_order: 0,
      },
      {
        question: 'How do I book an appointment?',
        answer: 'Use the Book Appointment button on the website to open the scheduling link.',
        category: 'Appointments',
        published: true,
        sort_order: 1,
      },
    ],
  },
  {
    table: 'booking_settings',
    rows: [
      {
        label: 'Book appointment',
        booking_url:
          'https://ehr.charmtracker.com/publicCal.sas?method=getCal&digest=26a1a06adbd537c481b1d04dd4f7172a298949fe2840a1731b54d620355c17e76ee57013c1a537e61871e728dd80f5a6c2fe0580a6189219',
        provider: 'charmhealth',
        active: true,
      },
    ],
  },
  {
    table: 'site_sections',
    rows: [
      {
        page_key: 'home',
        section_key: 'hero',
        title: 'Homepage hero',
        content: {
          headline: 'Compassionate telehealth psychiatry & primary care',
          subhead: 'Secure video visits with Lourdie Chachoute, FNP-C, PMHNP-BC.',
          ctaLabel: 'Book appointment',
        },
        published: true,
      },
    ],
  },
  {
    table: 'seo_meta',
    rows: [
      {
        path: '/',
        title: 'LifeWell Family Health & Psychiatry | Telehealth Care',
        description: 'Telehealth psychiatric and adult primary care.',
        noindex: false,
      },
    ],
  },
];

for (const item of upserts) {
  const { error } = await sb.from(item.table).upsert(item.rows, {
    onConflict: item.table === 'services' || item.table === 'providers' ? 'slug'
      : item.table === 'site_sections' ? 'page_key,section_key'
      : item.table === 'seo_meta' ? 'path'
      : undefined,
    ignoreDuplicates: true,
  });
  if (error) {
    // Fallback insert-only when conflict target is unavailable.
    const ins = await sb.from(item.table).insert(item.rows);
    if (ins.error) console.error(item.table, ins.error.message);
    else console.log(item.table, 'inserted');
  } else {
    console.log(item.table, 'ok');
  }
}

console.log('SEED_CONTENT_DONE');
