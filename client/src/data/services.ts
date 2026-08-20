import type { Service } from '@/types/content';
import { generatedServices } from './generated/services';

export {
  serviceCategories,
  serviceHref,
  serviceSummaries,
  HOME_SERVICE_SLUGS,
  homeServiceSummaries,
  getServiceSummary,
  summariesByCategory,
  relatedServices,
  serviceSlugs,
} from './service-catalog';

export const services: Service[] = generatedServices;

export const getService = (slug: string): Service | undefined =>
  services.find((s) => s.slug === slug);
