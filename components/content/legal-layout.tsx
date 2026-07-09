import type { LegalDocument } from '@/lib/data/types';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { ROUTES } from '@/lib/data/routes';

/** Legal document layout (docs/24). Flags placeholder text awaiting lawyer review. */
export function LegalLayout({ document }: { document: LegalDocument }) {
  return (
    <article className="cherie-container max-w-3xl py-16">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Kurumsal', path: ROUTES.kurumsal },
          { name: document.title_tr, path: `${ROUTES.kurumsal}/${document.slug}` },
        ]}
      />

      <h1 className="text-h2 text-cherie-ink">{document.title_tr}</h1>

      {document.needs_lawyer_review && (
        <p className="mt-4 rounded-card border border-cherie-warning/40 bg-cherie-warning/10 px-4 py-3 text-sm text-cherie-soft-ink">
          Bu metin yer tutucudur ve yürürlüğe girmeden önce hukuk danışmanı onayından geçecektir.
        </p>
      )}

      <div className="prose-cherie mt-8 space-y-4 text-cherie-soft-ink">
        {document.body_tr.split('\n\n').map((para, i) => (
          <p key={i} className="leading-relaxed">{para}</p>
        ))}
      </div>
    </article>
  );
}
