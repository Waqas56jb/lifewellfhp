import type { Request, Response } from 'express';
import { getSupabase } from '../lib/supabase.js';
import { badRequest } from '../utils/errors.js';
import { writeAuditLog } from '../lib/audit.js';
import { DEFAULT_SITE_SETTINGS } from '../validation/adminSchemas.js';
import type { AuthedRequest } from '../middleware/adminAuth.js';

const SERVICES = [
  ['psychiatric-evaluations', 'Psychiatric Evaluations', 'I provide thorough psychiatric evaluations through secure telehealth services to assess your symptoms, understand your mental health history, and develop a personalized treatment plan that supports your long-term emotional and psychological well-being.'],
  ['medication-management', 'Medication Management', 'I provide ongoing psychiatric medication management through secure telehealth services to ensure your treatment is safe, effective, and tailored to your individual mental health needs.'],
  ['treatment-for-depression-anxiety-adhd-bipolar-disorder-ptsd', 'Treatment for Depression, Anxiety, ADHD, Bipolar Disorder & PTSD', 'I provide personalized, evidence-based treatment through secure telehealth services to help you manage symptoms, restore emotional balance, and achieve long-term mental wellness.'],
  ['psychiatric-follow-up-visits-telehealth', 'Follow-Up Visits for Ongoing Mental Health Care', 'Mental health treatment is an ongoing process that requires consistent monitoring, communication, and adjustments over time — delivered through secure telehealth follow-up visits.'],
  ['annual-physical-exam-telehealth', 'Annual Physicals & Preventive Screenings', 'I provide annual physical exams and preventive screenings through secure telehealth visits to help you stay ahead of health risks and maintain your long-term wellbeing.'],
  ['chronic-disease-management-telehealth', 'Chronic Disease Management', 'I provide ongoing chronic disease management through secure telehealth visits for conditions such as hypertension, diabetes, hyperlipidemia, and thyroid disorders.'],
  ['preventive-care-telehealth', 'Preventive Care', 'I provide comprehensive preventive care through secure telehealth visits to help identify health risks early, support healthy lifestyle habits, and protect your long-term physical and mental well-being.'],
  ['telehealth-sick-visits-primary-care', 'Sick Visits (Acute Primary Care – Adults 18+)', 'I provide telehealth sick visits for adults to evaluate and treat common acute medical concerns such as cold symptoms, sinus infections, UTIs, allergies, and minor health issues—helping you receive timely care without leaving your home.'],
  ['weight-management-telehealth', 'Weight Management', 'I provide comprehensive weight management through secure telehealth visits, including metabolic evaluation, personalized treatment plans, and medication-assisted weight loss when appropriate to support your long-term health.'],
  ['wellness-and-lifestyle-counseling-telehealth', 'Wellness and Lifestyle Counseling', 'I provide personalized wellness and lifestyle counseling through secure telehealth visits to help you improve nutrition, sleep, stress management, and daily habits that support long-term physical and mental health.'],
  ['lab-testing-coordination-telehealth', 'Lab Testing Coordination', 'I provide lab testing coordination through secure telehealth visits, including ordering appropriate laboratory tests, reviewing results, and explaining findings to help guide your treatment and protect your long-term health.'],
] as const;

const FAQS = [
  ['What is telehealth mental health care?', 'Telehealth mental health care allows you to receive therapy, psychiatric evaluation, and medication management through secure video appointments instead of in-person visits.'],
  ['How do I schedule an appointment?', 'You can schedule an appointment using the online booking system. After scheduling, you will receive confirmation and instructions for your telehealth session.'],
  ['Do you accept insurance?', 'We accept select insurance plans. Please contact us or visit the Fees & Insurance page to verify coverage and payment options.'],
  ['Are telehealth sessions confidential?', 'Yes. All telehealth sessions are conducted through secure, HIPAA-compliant platforms to protect your privacy and confidentiality.'],
  ['What do I need for a telehealth appointment?', 'You will need a stable internet connection, a computer, tablet, or smartphone, and a private location for your session.'],
  ['Can I reschedule or cancel my appointment?', 'Yes. Appointments can be rescheduled or canceled according to the cancellation policy. Please contact us in advance to make changes.'],
] as const;

const INSURANCE = [
  ['Medicare', '/images/insurance/Medicare.png'],
  ['Medicaid', '/images/insurance/Medicaid.png'],
  ['Cigna', '/images/insurance/Cigna.png'],
  ['Aetna', '/images/insurance/Aetna.png'],
  ['UnitedHealthcare', '/images/insurance/UnitedHealthcare.png'],
  ['Beacon', '/images/insurance/Beacon.png'],
  ['Humana', '/images/insurance/Humana.png'],
  ['Oxford', '/images/insurance/Oxford.png'],
  ['Oscar Health', '/images/insurance/Oscar-Health.png'],
  ['AvMed', '/images/insurance/AvMed.png'],
  ['Carelon', '/images/insurance/Carelon.png'],
  ['Optum', '/images/insurance/Optum.png'],
  ['Magellan', '/images/insurance/Magellan.png'],
  ['Blue Cross Blue Shield of Florida', '/images/insurance/Blue-Cross-Blue-Shield-of-Florida.png'],
] as const;

const REVIEWS = [
  ['Mary Mayers', 'Extremely present and responsive team of providers. You can feel they are here to help you improve your quality of life, whether that is working to find a medication with them or continuing therapy and alternative life changes outside of this practice.'],
  ['Elisa Smith', 'Working with my therapist has completely changed how I handle stress and anxiety. For the first time in years, I feel like I have practical tools that genuinely help me stay grounded. Every session gives me clarity and a sense of calm I didn’t think was possible.'],
  ['Sofia Taylor', 'I came to therapy feeling lost and unsure of how to move forward after a difficult period in my life. My therapist created such a safe space where I could express myself without fear or judgment. Over time, I gained confidence, learned new coping skills, and began to see possibilities again.'],
  ['Marco Davies', 'At first, I wasn’t sure if therapy would help me. But each session opened my eyes to patterns I didn’t even realize were affecting my life. I’ve learned to set healthier boundaries, manage my thoughts better, and treat myself with more compassion.'],
] as const;

async function missingThenInsert(
  table: string,
  existingKey: string,
  existingValues: string[],
  rows: Record<string, unknown>[]
): Promise<number> {
  const sb = getSupabase();
  const toInsert = rows.filter((row) => !existingValues.includes(String(row[existingKey] || '')));
  if (!toInsert.length) return 0;
  const { error } = await sb.from(table).insert(toInsert);
  if (error) throw badRequest(`${table}: ${error.message}`);
  return toInsert.length;
}

export async function importLiveWebsiteContent(req: Request, res: Response): Promise<void> {
  const sb = getSupabase();
  const counts: Record<string, number> = {};

  const { data: serviceRows, error: serviceErr } = await sb.from('services').select('slug');
  if (serviceErr) throw badRequest(serviceErr.message);
  counts.services = await missingThenInsert(
    'services',
    'slug',
    (serviceRows || []).map((r) => String(r.slug)),
    SERVICES.map(([slug, title, summary], i) => ({
      slug,
      title,
      summary,
      published: true,
      sort_order: i,
    }))
  );

  const { data: faqRows, error: faqErr } = await sb.from('faqs').select('question');
  if (faqErr) throw badRequest(faqErr.message);
  counts.faqs = await missingThenInsert(
    'faqs',
    'question',
    (faqRows || []).map((r) => String(r.question)),
    FAQS.map(([question, answer], i) => ({
      question,
      answer,
      category: 'General',
      published: true,
      sort_order: i,
    }))
  );

  const { data: planRows, error: planErr } = await sb.from('insurance_plans').select('name');
  if (planErr) throw badRequest(planErr.message);
  counts.insurance = await missingThenInsert(
    'insurance_plans',
    'name',
    (planRows || []).map((r) => String(r.name)),
    INSURANCE.map(([name, logo_url], i) => ({
      name,
      logo_url,
      published: true,
      self_pay: false,
      sort_order: i,
    }))
  );

  const { data: reviewRows, error: reviewErr } = await sb.from('testimonials').select('author_name');
  if (reviewErr) throw badRequest(reviewErr.message);
  counts.reviews = await missingThenInsert(
    'testimonials',
    'author_name',
    (reviewRows || []).map((r) => String(r.author_name)),
    REVIEWS.map(([author_name, quote], i) => ({
      author_name,
      quote,
      rating: 5,
      published: true,
      consent_confirmed: true,
      sort_order: i,
    }))
  );

  const { error: sectionErr } = await sb.from('site_sections').upsert(
    [
      {
        page_key: 'home',
        section_key: 'hero',
        title: 'Homepage hero',
        published: true,
        content: {
          badge: 'Now accepting new patients | Secure & confidential virtual visits',
          headline: 'Compassionate Telehealth Mental Care You Can Trust',
          subhead: 'Personalized psychiatric support from a dedicated PMHNP — all from the comfort of your home.',
        },
      },
      {
        page_key: 'home',
        section_key: 'welcome',
        title: 'Welcome',
        published: true,
        content: {
          heading: 'Welcome to LifeWell Family Health & Psychiatry',
          body: [
            'At LifeWell Family Health & Psychiatry, I provide professional, compassionate, and confidential telehealth mental health care through secure and convenient virtual services. I am Lourdie Chachoute, NP, APRN, PMHNP-BC, a dual-certified Family Nurse Practitioner and Psychiatric-Mental Health Nurse Practitioner with over 15 years of diverse clinical experience.',
            'My approach focuses on personalized treatment, thoughtful medication management, and holistic care that supports both emotional and physical well-being. I specialize in treating anxiety, depression, ADHD, trauma-related conditions, sleep disorders, and mood concerns, while also integrating women’s health and chronic disease support.',
          ],
        },
      },
    ],
    { onConflict: 'page_key,section_key' }
  );
  if (sectionErr) throw badRequest(sectionErr.message);
  counts.sections = 2;

  const { error: providerErr } = await sb.from('providers').upsert(
    {
      slug: 'lourdie-chachoute',
      name: 'Lourdie Chachoute',
      credentials: 'FNP-C, PMHNP-BC, RRT, CCRN',
      title: 'Psychiatric-Mental Health Nurse Practitioner',
      bio: [
        'I am a dual-certified Family Nurse Practitioner and Psychiatric-Mental Health Nurse Practitioner dedicated to providing compassionate, holistic, and evidence-based care. My philosophy is simple: mental health is health.',
        'With over 15 years of diverse clinical experience in critical care, primary care, respiratory therapy, and mental health, I bring a well-rounded perspective to patient care.',
      ].join('\n\n'),
      education: [
        'Bachelor of Science in Nursing (BSN) — University of Central Florida',
        'Master of Science in Nursing (MSN) — South University',
        'Post-Master’s Certificate, Psychiatric-Mental Health Nurse Practitioner — Walden University',
      ],
      certifications: [
        'FNP-C — Family Nurse Practitioner, Certified',
        'PMHNP-BC — Psychiatric-Mental Health Nurse Practitioner, Board Certified',
      ],
      photo_url: '/images/team/Lourdie-Chachoute.jpeg',
      published: true,
      sort_order: 0,
    },
    { onConflict: 'slug' }
  );
  if (providerErr) throw badRequest(providerErr.message);
  counts.providers = 1;

  const { data: locations } = await sb.from('locations').select('name');
  const hasLocation = (locations || []).some((r) => r.name === 'LifeWell Family Health & Psychiatry');
  if (!hasLocation) {
    const { error } = await sb.from('locations').insert({
      name: 'LifeWell Family Health & Psychiatry',
      address_line1: '3564 Avalon Park E Blvd Ste. 1-A837',
      city: 'Orlando',
      state: 'FL',
      postal_code: '32828',
      phone: '(407) 603-1717',
      email: 'contact@lifewellfhp.com',
      hours: { weekday: 'Monday – Friday 8:00 AM – 10:00 PM EST', weekend: 'Saturday – Sunday 7:00 AM – 10:00 PM EST' },
      is_primary: true,
      published: true,
    });
    if (error) throw badRequest(error.message);
    counts.locations = 1;
  } else {
    counts.locations = 0;
  }

  const { data: booking } = await sb.from('booking_settings').select('id').limit(1);
  if (!booking?.length) {
    const { error } = await sb.from('booking_settings').insert({
      label: 'Book a Session',
      booking_url:
        'https://ehr.charmtracker.com/publicCal.sas?method=getCal&digest=26a1a06adbd537c481b1d04dd4f7172a9e13b95e979de3c2ffd67310b926494cef59d40e1bb127af1871e728dd80f5a6c2fe0580a6189219',
      provider: 'charmhealth',
      active: true,
    });
    if (error) throw badRequest(error.message);
    counts.booking = 1;
  } else {
    counts.booking = 0;
  }

  const { error: mediaErr } = await sb.from('media_assets').upsert(
    {
      title: 'LifeWell logo',
      url: '/images/brand/logo.avif',
      alt_text: 'LifeWell Family Health & Psychiatry',
      mime_type: 'image/avif',
      folder: 'brand',
    },
    { onConflict: 'url' }
  );
  if (mediaErr && !/on conflict|unique/i.test(mediaErr.message)) {
    const { data: existingLogo } = await sb.from('media_assets').select('id').eq('url', '/images/brand/logo.avif').maybeSingle();
    if (!existingLogo) {
      const { error } = await sb.from('media_assets').insert({
        title: 'LifeWell logo',
        url: '/images/brand/logo.avif',
        alt_text: 'LifeWell Family Health & Psychiatry',
        mime_type: 'image/avif',
        folder: 'brand',
      });
      if (error) throw badRequest(error.message);
    }
  }
  counts.media = 1;

  await sb.from('site_settings').upsert({
    ...DEFAULT_SITE_SETTINGS,
    logo_url: '/images/brand/logo.avif',
    practice_phone: '(407) 603-1717',
    practice_email: 'contact@lifewellfhp.com',
    updated_at: new Date().toISOString(),
  });
  counts.settings = 1;

  const actor = (req as AuthedRequest).admin;
  await writeAuditLog({
    actor,
    action: 'create',
    resource: 'settings',
    summary: 'Imported current public website content into the admin panel',
  });

  res.json({
    success: true,
    message: 'Live website content is now in the admin panel. You can edit or delete any item.',
    data: counts,
  });
}
