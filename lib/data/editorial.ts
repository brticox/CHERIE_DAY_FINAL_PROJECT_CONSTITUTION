import {
  experiences as seedExperiences,
  articles as seedArticles,
  faqs as seedFaqs,
  testimonials as seedTestimonials,
  portfolio as seedPortfolio,
} from '@/content/seed/editorial';
import { readPublic } from './source';
import type { Article, Experience, Faq, PortfolioProject, Testimonial } from './types';

export async function getExperiences(): Promise<Experience[]> {
  return readPublic<Experience>('experiences_public', seedExperiences);
}

export async function getExperienceBySlug(slug: string): Promise<Experience | null> {
  const all = await getExperiences();
  return all.find((e) => e.slug === slug) ?? null;
}

export async function getArticles(): Promise<Article[]> {
  return readPublic<Article>('articles_public', seedArticles, {
    order: 'published_at',
    ascending: false,
  });
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const all = await getArticles();
  return all.find((a) => a.slug === slug) ?? null;
}

export async function getFaqs(): Promise<Faq[]> {
  return readPublic<Faq>('faqs_public', seedFaqs, { order: 'sort_order' });
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return readPublic<Testimonial>('testimonials_public', seedTestimonials);
}

export async function getPortfolio(): Promise<PortfolioProject[]> {
  return readPublic<PortfolioProject>('portfolio_projects_public', seedPortfolio);
}
