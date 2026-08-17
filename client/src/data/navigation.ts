import type { NavItem, NavLink } from '@/types/content';
import { serviceCategories, summariesByCategory } from './services';

/**
 * Header navigation, mirroring the source site's structure.
 *
 * The source labelled the bio link "Psychiatric Mental Health Nurse
 * Practitioner" — 43 characters, which forced awkward wrapping. Shortened to
 * "Meet Your Provider" for the menu; the full credential remains the page H1.
 */
export const headerNav: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Services',
    href: '/our-services',
    groups: [
      {
        label: serviceCategories.psychiatric.label,
        links: summariesByCategory('psychiatric').map((s) => ({ label: s.title, href: s.href })),
      },
      {
        label: serviceCategories['primary-care'].label,
        links: summariesByCategory('primary-care').map((s) => ({ label: s.title, href: s.href })),
      },
    ],
  },
  { label: 'Meet Your Provider', href: '/bio' },
  { label: 'Fees & Insurance', href: '/fees-insurance' },
  { label: 'Contact Us', href: '/contact-telehealth-mental-health-provider' },
];

export const headerCta: NavLink = {
  label: 'Get Started',
  href: '/book-telehealth-mental-health-appointment',
};

/** Footer columns, matching the source site's four-column layout. */
export const footerColumns: { heading: string; links: NavLink[] }[] = [
  {
    heading: serviceCategories.psychiatric.shortLabel,
    links: summariesByCategory('psychiatric').map((s) => ({ label: s.title, href: s.href })),
  },
  {
    heading: 'Primary Care Services',
    links: summariesByCategory('primary-care').map((s) => ({ label: s.title, href: s.href })),
  },
  {
    heading: 'Important Links',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Meet Your Provider', href: '/bio' },
      { label: 'Our Services', href: '/our-services' },
      { label: 'Fees & Insurance', href: '/fees-insurance' },
      { label: 'Testimonials', href: '/telehealth-mental-health-testimonials' },
      { label: 'FAQs', href: '/faqs' },
      { label: 'Blog', href: '/blog' },
      { label: 'Book Appointment', href: '/book-telehealth-mental-health-appointment' },
      { label: 'Contact Us', href: '/contact-telehealth-mental-health-provider' },
    ],
  },
];

export const legalLinks: NavLink[] = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms-conditions' },
  { label: 'Accessibility Statement', href: '/accessibility-statement' },
  { label: 'SMS Consent / Communication Policy', href: '/sms-consent-communication-policy' },
];
