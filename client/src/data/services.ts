import type { Service, ServiceSummary, ServiceCategory } from '@/types/content';
import { generatedServices } from './generated/services';

export const services: Service[] = generatedServices;

export const serviceCategories: Record<ServiceCategory, { label: string; shortLabel: string }> = {
  psychiatric: {
    label: 'Psychiatric & Mental Health Services',
    shortLabel: 'Psychiatric & Mental Health',
  },
  'primary-care': {
    label: 'Family Health (Primary Care Services)',
    shortLabel: 'Family Health',
  },
};

/**
 * Card descriptions as published on the source /our-services/ page.
 *
 * One correction: the source card for "psychiatric-follow-up-visits-telehealth"
 * carried teen-therapy copy pasted from another service ("Compassionate,
 * structured teen therapy through secure telehealth sessions…"), which does not
 * describe follow-up visits. It has been replaced with the opening sentence of
 * that service's own page — the practice's own words for that service — rather
 * than newly written copy. Flagged in the README.
 */
const SUMMARY: Record<string, string> = {
  'psychiatric-evaluations':
    'I provide thorough psychiatric evaluations through secure telehealth services to assess your symptoms, understand your mental health history, and develop a personalized treatment plan that supports your long-term emotional and psychological well-being.',
  'medication-management':
    'I provide ongoing psychiatric medication management through secure telehealth services to ensure your treatment is safe, effective, and tailored to your individual mental health needs.',
  'treatment-for-depression-anxiety-adhd-bipolar-disorder-ptsd':
    'I provide personalized, evidence-based treatment through secure telehealth services to help you manage symptoms, restore emotional balance, and achieve long-term mental wellness.',
  'psychiatric-follow-up-visits-telehealth':
    'Mental health treatment is an ongoing process that requires consistent monitoring, communication, and adjustments over time — delivered through secure telehealth follow-up visits.',
  'annual-physical-exam-telehealth':
    'I provide annual physical exams and preventive screenings through secure telehealth visits to help you stay ahead of health risks and maintain your long-term wellbeing.',
  'chronic-disease-management-telehealth':
    'I provide ongoing chronic disease management through secure telehealth visits for conditions such as hypertension, diabetes, hyperlipidemia, and thyroid disorders.',
  'preventive-care-telehealth':
    'I provide comprehensive preventive care through secure telehealth visits to help identify health risks early, support healthy lifestyle habits, and protect your long-term physical and mental well-being.',
  'telehealth-sick-visits-primary-care':
    'I provide telehealth sick visits for adults to evaluate and treat common acute medical concerns such as cold symptoms, sinus infections, UTIs, allergies, and minor health issues—helping you receive timely care without leaving your home.',
  'weight-management-telehealth':
    'I provide comprehensive weight management through secure telehealth visits, including metabolic evaluation, personalized treatment plans, and medication-assisted weight loss when appropriate to support your long-term health.',
  'wellness-and-lifestyle-counseling-telehealth':
    'I provide personalized wellness and lifestyle counseling through secure telehealth visits to help you improve nutrition, sleep, stress management, and daily habits that support long-term physical and mental health.',
  'lab-testing-coordination-telehealth':
    'I provide lab testing coordination through secure telehealth visits, including ordering appropriate laboratory tests, reviewing results, and explaining findings to help guide your treatment and protect your long-term health.',
};

/** Short menu labels — the full page titles are too long for navigation. */
const MENU_LABEL: Record<string, string> = {
  'psychiatric-evaluations': 'Psychiatric Evaluations',
  'medication-management': 'Medication Management',
  'treatment-for-depression-anxiety-adhd-bipolar-disorder-ptsd':
    'Treatment for Depression, Anxiety, ADHD, Bipolar Disorder & PTSD',
  'psychiatric-follow-up-visits-telehealth': 'Follow-Up Visits for Ongoing Mental Health Care',
  'annual-physical-exam-telehealth': 'Annual Physicals & Preventive Screenings',
  'chronic-disease-management-telehealth': 'Chronic Disease Management',
  'preventive-care-telehealth': 'Preventive Care',
  'telehealth-sick-visits-primary-care': 'Sick Visits (Acute Primary Care – Adults 18+)',
  'weight-management-telehealth': 'Weight Management',
  'wellness-and-lifestyle-counseling-telehealth': 'Wellness and Lifestyle Counseling',
  'lab-testing-coordination-telehealth': 'Lab Testing Coordination',
};

export const serviceHref = (slug: string) => `/services/${slug}`;

/** Featured-image files scraped from the live WordPress media library. */
const SERVICE_IMAGE: Record<string, { file: string; alt: string }> = {
  'psychiatric-evaluations': {
    file: 'Psychiatric-Evaluation-Telehealth.avif',
    alt: 'Psychiatric evaluation telehealth visit',
  },
  'medication-management': {
    file: 'Psychiatric-Medication-Management-Telehealth.avif',
    alt: 'Psychiatric medication management telehealth visit',
  },
  'psychiatric-follow-up-visits-telehealth': {
    file: 'Psychiatric-Follow-Up-Visits-Telehealth.avif',
    alt: 'Psychiatric follow-up visit by telehealth',
  },
  'treatment-for-depression-anxiety-adhd-bipolar-disorder-ptsd': {
    file: 'Telehealth-Treatment-for-Depression-Anxiety-ADHD-PTSD.avif',
    alt: 'Telehealth treatment for depression, anxiety, ADHD, bipolar disorder and PTSD',
  },
  'annual-physical-exam-telehealth': {
    file: 'Annual-Physical-Exam-Telehealth.avif',
    alt: 'Annual physical exam by telehealth',
  },
  'chronic-disease-management-telehealth': {
    file: 'Chronic-Disease-Management-Telehealth.avif',
    alt: 'Chronic disease management by telehealth',
  },
  'preventive-care-telehealth': {
    file: 'Preventive-Care-Telehealth.avif',
    alt: 'Preventive care by telehealth',
  },
  'telehealth-sick-visits-primary-care': {
    file: 'Telehealth-Sick-Visits-Primary-Care.avif',
    alt: 'Telehealth sick visit for primary care',
  },
  'weight-management-telehealth': {
    file: 'Weight-Management-Telehealth.avif',
    alt: 'Weight management by telehealth',
  },
  'wellness-and-lifestyle-counseling-telehealth': {
    file: 'Wellness-and-Lifestyle-Counseling-Telehealth.avif',
    alt: 'Wellness and lifestyle counseling by telehealth',
  },
  'lab-testing-coordination-telehealth': {
    file: 'Lab-Testing-Coordination-Telehealth.avif',
    alt: 'Lab testing coordination by telehealth',
  },
};

export const serviceSummaries: ServiceSummary[] = services.map((s) => {
  const image = SERVICE_IMAGE[s.slug];
  return {
    slug: s.slug,
    title: MENU_LABEL[s.slug] ?? s.title,
    category: s.category,
    description: SUMMARY[s.slug] ?? s.intro[0] ?? '',
    href: serviceHref(s.slug),
    image: {
      src: `/images/services/${image?.file ?? 'Psychiatric-Evaluation-Telehealth.avif'}`,
      alt: image?.alt ?? s.title,
      width: 1180,
      height: 990,
    },
  };
});

/** Homepage “How I Help” order, matching the live 4-column services grid. */
export const HOME_SERVICE_SLUGS = [
  'psychiatric-evaluations',
  'medication-management',
  'psychiatric-follow-up-visits-telehealth',
  'treatment-for-depression-anxiety-adhd-bipolar-disorder-ptsd',
] as const;

export const homeServiceSummaries: ServiceSummary[] = HOME_SERVICE_SLUGS.map(
  (slug) => serviceSummaries.find((s) => s.slug === slug)!
);

export const getService = (slug: string): Service | undefined =>
  services.find((s) => s.slug === slug);

export const getServiceSummary = (slug: string): ServiceSummary | undefined =>
  serviceSummaries.find((s) => s.slug === slug);

export const summariesByCategory = (category: ServiceCategory): ServiceSummary[] =>
  serviceSummaries.filter((s) => s.category === category);

/** Related services: same category, excluding the current one. */
export const relatedServices = (slug: string, limit = 3): ServiceSummary[] => {
  const current = getServiceSummary(slug);
  if (!current) return serviceSummaries.slice(0, limit);
  const sameCategory = serviceSummaries.filter(
    (s) => s.category === current.category && s.slug !== slug
  );
  const others = serviceSummaries.filter((s) => s.category !== current.category);
  return [...sameCategory, ...others].slice(0, limit);
};

export const serviceSlugs = services.map((s) => s.slug);
