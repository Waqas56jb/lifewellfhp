import type { Benefit, Step, Testimonial, Faq, Stat, InsuranceCarrier } from '@/types/content';

/* --------------------------------------------------------------- hero --- */

export const hero = {
  badge: 'Now accepting new patients | Secure & confidential virtual visits',
  heading: 'Compassionate Telehealth Mental Care You Can Trust',
  subheading:
    'Personalized psychiatric support from a dedicated PMHNP — all from the comfort of your home.',
  image: {
    src: '/images/sections/lifewell.avif',
    width: 1180,
    height: 1000,
    alt: 'Telehealth mental health care session with a board-certified psychiatric nurse practitioner',
  },
};

/* -------------------------------------------------------------- about --- */

export const welcome = {
  heading: 'Welcome to LifeWell Family Health & Psychiatry',
  body: [
    "At LifeWell Family Health & Psychiatry, we believe that true wellness is a harmonious balance of emotional resilience and physical vitality. Located in Orlando's Avalon Park area, our practice is dedicated to delivering bespoke, evidence-based care tailored to the distinct needs of every individual and family we serve. We understand that modern life demands flexibility without ever compromising on quality. That is why we proudly offer a seamless blend of in-person clinical visits and secure, confidential telehealth sessions, ensuring exceptional psychiatric and family healthcare is always accessible on your terms.",
    'Our comprehensive clinical expertise encompasses: Advanced management for anxiety, depression, and ADHD Targeted support for trauma recovery and sleep disorders Psychiatric evaluations and thoughtful medication management Chronic disease support and integrated women’s health care Every treatment pathway is thoughtfully curated to provide a safe, sanctuary-like environment where you feel deeply heard, profoundly supported, and empowered to achieve lifelong wellness.',
  ],
  cta: { label: 'Learn More About the Provider', href: '/bio' },
  image: {
    src: '/images/sections/lifewell.avif',
    width: 1000,
    height: 667,
    alt: 'Telehealth mental health care',
  },
};

/* ----------------------------------------------------------- services --- */

export const servicesSection = {
  eyebrow: 'My Services',
  heading: 'How I Help',
  /* Source typo "View All Serices" corrected. */
  body: 'Specialized telehealth services tailored to meet your unique mental health needs.',
  cta: { label: 'View All Services', href: '/our-services' },
};

/* ----------------------------------------------------------- benefits --- */

export const benefitsSection = {
  heading: 'Why Patients Choose My Telehealth Clinic',
};

export const benefits: Benefit[] = [
  {
    title: 'Personalized One-on-One Care',
    description:
      'Every patient receives individual attention and a treatment plan tailored to their unique needs, goals, and mental health journey.',
    image: { src: '/images/benefits/Personalized-One-on-One-Care.avif', width: 1180, height: 1180 },
  },
  {
    title: 'Private & Secure Telehealth Sessions',
    description:
      'All appointments are conducted through secure, HIPAA-compliant platforms to ensure your privacy and confidentiality at every step.',
    image: {
      src: '/images/benefits/Private-Secure-Telehealth-Sessions.avif',
      width: 1180,
      height: 1180,
    },
  },
  {
    title: 'Flexible & Convenient Scheduling',
    description:
      'Book appointments that fit your lifestyle with easy online scheduling and virtual access from the comfort of your home.',
    image: {
      src: '/images/benefits/Flexible-Convenient-Scheduling.avif',
      width: 1180,
      height: 1180,
    },
  },
  {
    title: 'Compassionate, Judgment-Free Support',
    description:
      'I provide a safe and supportive environment where you can openly discuss your concerns without fear of stigma or judgment.',
    image: {
      src: '/images/benefits/Compassionate-Judgment-Free-Support.avif',
      width: 1180,
      height: 1180,
    },
  },
  {
    title: 'Evidence-Based Treatment Approach',
    description:
      'My care is guided by my clinical experience and evidence-based treatment methods, allowing me to provide effective, compassionate, and personalized mental health support.',
    image: {
      src: '/images/benefits/Evidence-Based-Treatment-Approach.avif',
      width: 1180,
      height: 1180,
    },
  },
];

/* -------------------------------------------------------- how it works -- */

export const howItWorks = {
  eyebrow: 'How It Works',
  heading: 'How My Simple Telehealth Process Works',
  body: 'Getting started is simple. Follow these three easy steps to begin your mental wellness journey.',
  cta: { label: 'Start Your Journey' },
  image: { src: '/images/sections/How-It-Works.avif', width: 633, height: 570 },
};

export const steps: Step[] = [
  {
    title: 'Book Your Appointment',
    description:
      'Schedule your appointment online through my secure booking system and choose a date and time that works best for you.',
  },
  {
    title: 'Attend Your Virtual Session',
    description:
      'You will meet with me through a secure telehealth platform, allowing you to receive care from the comfort and privacy of your home.',
  },
  {
    title: 'Begin Your Personalized Care Plan',
    description:
      'Receive a tailored treatment plan, medication management (if needed), and ongoing support to help you move forward with confidence.',
  },
];

/** Booking-page wording differs slightly from the homepage; both preserved. */
export const bookingSteps: Step[] = [
  {
    title: 'Book Your Appointment',
    description:
      'Schedule your visit online using our secure booking system. Choose a date and time that works best for you.',
  },
  {
    title: 'Attend Your Virtual Session',
    description:
      'Meet with your provider through a secure telehealth platform from the comfort and privacy of your home.',
  },
  {
    title: 'Begin Your Personalized Care Plan',
    description:
      'Receive a tailored treatment plan, medication management (if needed), and ongoing support to help you move forward with confidence.',
  },
];

/* ---------------------------------------------------------- insurance --- */

export const insuranceSection = {
  heading: 'Insurance & Self-Pay Options',
  body: 'We believe in transparent and accessible care. I accept select insurance plans and also offer self-pay options.',
  /**
   * The source site displays these carrier marks without qualifying which are
   * in-network. Copy retains the "select insurance plans" wording. Flagged for
   * client verification before launch — see README.
   */
  disclaimer:
    'Logos shown indicate plans that may be accepted. Coverage varies by plan and state — please contact us to verify your benefits before scheduling.',
};

export const insuranceCarriers: InsuranceCarrier[] = [
  { name: 'Medicare', logo: '/images/insurance/Medicare.png', width: 290, height: 114 },
  { name: 'Medicaid', logo: '/images/insurance/Medicaid.png', width: 291, height: 103 },
  { name: 'Cigna', logo: '/images/insurance/Cigna.png', width: 187, height: 114 },
  { name: 'Aetna', logo: '/images/insurance/Aetna.png', width: 204, height: 103 },
  {
    name: 'UnitedHealthcare',
    logo: '/images/insurance/UnitedHealthcare.png',
    width: 538,
    height: 114,
  },
  { name: 'Beacon', logo: '/images/insurance/Beacon.png', width: 234, height: 103 },
  { name: 'Humana', logo: '/images/insurance/Humana.png', width: 266, height: 114 },
  { name: 'Oxford', logo: '/images/insurance/Oxford.png', width: 234, height: 103 },
  { name: 'Oscar Health', logo: '/images/insurance/Oscar-Health.png', width: 416, height: 114 },
  { name: 'AvMed', logo: '/images/insurance/AvMed.png', width: 219, height: 103 },
  { name: 'Carelon', logo: '/images/insurance/Carelon.png', width: 266, height: 114 },
  { name: 'Optum', logo: '/images/insurance/Optum.png', width: 219, height: 103 },
  { name: 'Magellan', logo: '/images/insurance/Magellan.png', width: 302, height: 114 },
  {
    name: 'Blue Cross Blue Shield of Florida',
    logo: '/images/insurance/Blue-Cross-Blue-Shield-of-Florida.png',
    width: 1002,
    height: 103,
  },
];

/* -------------------------------------------------------------- stats --- */

/**
 * Values read from the source markup's `data-to-value` attributes — the
 * counters were configured but never fired, which is why the live site renders
 * every figure as 0.
 *
 * "15 Years of Experience" and "1 Licensed Provider" corroborate the bio copy.
 * The 5,000-session and 98%-satisfaction figures are marketing claims that
 * cannot be verified from any public source; they are carried over from the
 * client's own configuration and flagged for confirmation — see README.
 *
 * The source labelled the provider count "Licensed Therapists".
 */
export const stats: Stat[] = [
  { value: 5000, suffix: '+', label: 'Online Sessions Completed', requiresVerification: true },
  { value: 1, suffix: '+', label: 'Licensed Therapists', requiresVerification: false },
  { value: 15, suffix: '+', label: 'Years of Experience', requiresVerification: false },
  { value: 98, suffix: '%', label: 'Client Satisfaction Rate', requiresVerification: true },
  { value: 24, suffix: '/7', label: 'Secure Online Access', requiresVerification: false },
];

/* ------------------------------------------------------- testimonials --- */

export const testimonialsSection = {
  eyebrow: 'Testimonials',
  heading: 'What Patients Are Saying',
  body: 'Real experiences from individuals who have trusted us with their mental health care.',
  image: { src: '/images/sections/TESTIMONIALS.avif', width: 633, height: 740 },
};

/**
 * Only testimonials with real content are included. The source site also
 * published four Lorem-ipsum placeholders ("This is item #01…" attributed to
 * "Jon Doe" / "Jane Doe") across the homepage and testimonials page; those are
 * omitted rather than reproduced.
 *
 * Attribution is used only where the source supplies it. The homepage credits
 * full names; the testimonials page credits the same quotes with initials
 * (Elisa M., Sofia R., Marco D.). The fuller homepage attribution is used, and
 * no names are invented for the unattributed first quote.
 */
export const testimonials: Testimonial[] = [
  {
    quote:
      'Extremely present and responsive team of providers. You can feel they are here to help you improve your quality of life, whether that is working to find a medication with them or continuing therapy and alternative life changes outside of this practice.',
    author: 'Mary Mayers',
    rating: 5,
  },
  {
    quote:
      'Working with my therapist has completely changed how I handle stress and anxiety. For the first time in years, I feel like I have practical tools that genuinely help me stay grounded. Every session gives me clarity and a sense of calm I didn’t think was possible.',
    author: 'Elisa Smith',
    rating: 5,
  },
  {
    quote:
      'I came to therapy feeling lost and unsure of how to move forward after a difficult period in my life. My therapist created such a safe space where I could express myself without fear or judgment. Over time, I gained confidence, learned new coping skills, and began to see possibilities again.',
    author: 'Sofia Taylor',
    rating: 5,
  },
  {
    quote:
      'At first, I wasn’t sure if therapy would help me. But each session opened my eyes to patterns I didn’t even realize were affecting my life. I’ve learned to set healthier boundaries, manage my thoughts better, and treat myself with more compassion.',
    author: 'Marco Davies',
    rating: 5,
  },
];

/* ---------------------------------------------------------------- faq --- */

export const faqs: Faq[] = [
  {
    question: 'What is telehealth mental health care?',
    answer:
      'Telehealth mental health care allows you to receive therapy, psychiatric evaluation, and medication management through secure video appointments instead of in-person visits.',
  },
  {
    question: 'How do I schedule an appointment?',
    answer:
      'You can schedule an appointment using the online booking system. After scheduling, you will receive confirmation and instructions for your telehealth session.',
  },
  {
    question: 'Do you accept insurance?',
    answer:
      'We accept select insurance plans. Please contact us or visit the Fees & Insurance page to verify coverage and payment options.',
  },
  {
    question: 'Are telehealth sessions confidential?',
    answer:
      'Yes. All telehealth sessions are conducted through secure, HIPAA-compliant platforms to protect your privacy and confidentiality.',
  },
  {
    question: 'What do I need for a telehealth appointment?',
    answer:
      'You will need a stable internet connection, a computer, tablet, or smartphone, and a private location for your session.',
  },
  {
    question: 'Can I reschedule or cancel my appointment?',
    answer:
      'Yes. Appointments can be rescheduled or canceled according to the cancellation policy. Please contact us in advance to make changes.',
  },
];

/* -------------------------------------------------------- cta / news ---- */

export const primaryCta = {
  heading: 'Start Your Mental Wellness Journey Today',
  body: 'Getting help shouldn’t be complicated. Book your secure online appointment in just a few clicks.',
};

export const contactCta = {
  heading: 'Reach Out and Take the First Step',
  image: { src: '/images/sections/CONTACT-US-IMG.avif', width: 633, height: 520 },
};

/**
 * Closing CTA on the testimonials page. The source held this copy in an
 * Elementor `testimonial-content` div rather than a paragraph, so it needs
 * carrying across explicitly.
 */
export const testimonialsCta = {
  heading: 'Begin Your Own Journey Toward Emotional Wellness',
  body: 'Your experience matters. If you are ready to receive compassionate, professional telehealth mental health care, support is available.',
};

export const newsletter = {
  heading: 'Stay Updated on Mental Health & Wellness',
  body: 'Occasional guidance and practice updates. No spam, and you can unsubscribe at any time.',
  cta: 'Sign Up',
};
