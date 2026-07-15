import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  PRIMARY_NAV,
  UTILITY_NAV,
  FOOTER_GROUPS,
  PRIMARY_CTA,
} from '@/lib/data/navigation';
import { getHelpTopics, getHelpTopicBySlug, HELP_EMAILS } from '@/lib/data/help';

const SITE_ROOT = join(process.cwd(), 'app', '(site)');

/** Map a static, internal href to the App Router page file that must back it. */
function pageFileFor(href: string): string | null {
  if (!href.startsWith('/')) return null; // external / mailto
  const path = href.split('?')[0]!.split('#')[0]!;
  const segments = path.split('/').filter(Boolean);
  return join(SITE_ROOT, ...segments, 'page.tsx');
}

const navHrefs = [
  ...PRIMARY_NAV.map((i) => i.href),
  ...UTILITY_NAV.map((i) => i.href),
  ...FOOTER_GROUPS.flatMap((g) => g.items.map((i) => i.href)),
  PRIMARY_CTA.href,
];

describe('navigation honesty', () => {
  it('every visible nav link resolves to a real page file (no dead ends)', () => {
    const missing = navHrefs.filter((href) => {
      const file = pageFileFor(href);
      return file !== null && !existsSync(file);
    });
    expect(missing).toEqual([]);
  });

  it('exposes no legacy English top-level routes in navigation', () => {
    const english = navHrefs.filter((h) =>
      /^\/(shop|collections|experiences|digital|memory|planning|contact|faq)(\/|$)/.test(h),
    );
    expect(english).toEqual([]);
  });
});

describe('help centre content', () => {
  const topics = getHelpTopics();

  it('has unique topic slugs', () => {
    const slugs = topics.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('routes every topic to a known mailbox', () => {
    for (const topic of topics) {
      expect(HELP_EMAILS[topic.mailbox]).toMatch(/@cherieday\.eu$/);
    }
  });

  it('resolves known slugs and rejects unknown ones', () => {
    expect(getHelpTopicBySlug(topics[0]!.slug)?.slug).toBe(topics[0]!.slug);
    expect(getHelpTopicBySlug('bilinmeyen-konu')).toBeUndefined();
  });

  it('gives every topic at least one FAQ and one related link', () => {
    for (const topic of topics) {
      expect(topic.faqs.length).toBeGreaterThan(0);
      expect(topic.related.length).toBeGreaterThan(0);
    }
  });
});
