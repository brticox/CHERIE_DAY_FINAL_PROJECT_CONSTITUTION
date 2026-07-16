import Link from 'next/link';
import { notFound } from 'next/navigation';
import { canWriteManagedResource, getManagedResource, type ManagedField } from '@/lib/admin/managed-resources';
import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminPageHeader } from '@/components/admin/admin-workspace';
import { deleteManagedResource, saveManagedResource } from '../../actions';

type RowResult = { data: Record<string, unknown> | null; error: { message: string } | null };

export default async function Page({ params, searchParams }: {
  params: Promise<{ resource: string; id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { resource: resourceKey, id } = await params;
  const resource = getManagedResource(resourceKey);
  if (!resource) notFound();
  const { staff } = await requireCapability(resource.readCapability, resource.listPath);
  const mayWrite = canWriteManagedResource(staff.role, resource);
  const isNew = id === 'new';
  let row: Record<string, unknown> = {};
  if (!isNew) {
    const db = createAdminClient();
    const from = db.from.bind(db) as unknown as (name: string) => {
      select(columns: '*'): { eq(column: 'id', value: string): { maybeSingle(): Promise<RowResult> } };
    };
    const result = await from(resource.table).select('*').eq('id', id).maybeSingle();
    if (result.error || !result.data) notFound();
    row = result.data;
  }
  const query = await searchParams;
  return (
    <div className="mx-auto max-w-5xl space-y-7 p-4 md:p-7 xl:p-9">
      <AdminPageHeader
        eyebrow={resource.title}
        title={isNew ? `Yeni ${resource.singular}` : `${resource.singular} ayrıntısı`}
        description="Değişiklikler sunucuda doğrulanır, yetki denetiminden geçer ve denetim günlüğüne yazılır."
      />
      <Link href={resource.listPath} className="inline-flex font-semibold text-cherie-plum underline-offset-4 hover:underline">
        ← Listeye dön
      </Link>
      {query.saved && <p role="status" className="rounded-card border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">Kayıt güvenle kaydedildi.</p>}
      {query.error && <p role="alert" className="rounded-card border border-cherie-error/30 bg-cherie-error/10 p-4 text-sm text-cherie-error">İşlem tamamlanamadı: {decodeURIComponent(query.error)}</p>}
      <form action={saveManagedResource} className="admin-surface grid gap-5 p-5 md:grid-cols-2 md:p-7">
        <input type="hidden" name="resource" value={resource.key} />
        <input type="hidden" name="id" value={isNew ? '' : id} />
        {resource.fields.map((field) => <Field key={field.key} field={field} value={row[field.key]} disabled={!mayWrite} />)}
        <div className="md:col-span-2 flex flex-wrap gap-3">
          {mayWrite ? <button className="cherie-button-primary min-h-12">{isNew ? 'Kaydı oluştur' : 'Değişiklikleri kaydet'}</button> : <p className="text-sm text-cherie-soft-ink">Bu kaydı görüntüleyebilirsiniz; düzenleme yetkiniz bulunmuyor.</p>}
          <Link href={resource.listPath} className="cherie-button-secondary inline-flex min-h-12 items-center">Vazgeç</Link>
        </div>
      </form>
      {!isNew && mayWrite && resource.deleteAllowed && (
        <section className="admin-surface border-cherie-error/30 p-5 md:p-7">
          <h2 className="font-serif text-xl">Kaydı sil</h2>
          <p className="mt-2 text-sm text-cherie-soft-ink">Kalıcı silme için SIL yazın. Yayındaki içerik önce taslağa alınmalıdır; ilişkili kayıt varsa veritabanı silmeyi reddeder.</p>
          <form action={deleteManagedResource} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input type="hidden" name="resource" value={resource.key} />
            <input type="hidden" name="id" value={id} />
            <input name="confirmation" aria-label="Silme onayı" placeholder="SIL" className="cherie-field max-w-xs" required />
            <button className="min-h-12 rounded-full border border-cherie-error px-5 font-semibold text-cherie-error">Kalıcı olarak sil</button>
          </form>
        </section>
      )}
    </div>
  );
}

function Field({ field, value, disabled }: { field: ManagedField; value: unknown; disabled: boolean }) {
  const wide = field.type === 'textarea' || field.type === 'json' || field.type === 'tags';
  const common = { name: field.key, id: field.key, required: field.required, disabled, className: 'cherie-field w-full', placeholder: field.placeholder };
  return (
    <label htmlFor={field.key} className={wide ? 'space-y-2 md:col-span-2' : 'space-y-2'}>
      <span className="block text-sm font-bold">{field.label}{field.required ? ' *' : ''}</span>
      {field.type === 'textarea' || field.type === 'json' || field.type === 'tags' ? (
        <textarea {...common} rows={field.type === 'json' ? 10 : 5} defaultValue={formatValue(field, value)} maxLength={field.maxLength} spellCheck={field.type !== 'json'} />
      ) : field.type === 'select' ? (
        <select {...common} defaultValue={formatValue(field, value)}>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
      ) : field.type === 'boolean' ? (
        <span className="flex min-h-12 items-center gap-3 rounded-card border border-cherie-lace px-4"><input name={field.key} id={field.key} type="checkbox" defaultChecked={Boolean(value)} disabled={disabled} className="size-5" /> Etkin</span>
      ) : (
        <input {...common} type={field.type === 'datetime' ? 'datetime-local' : field.type} defaultValue={formatValue(field, value)} maxLength={field.maxLength} min={field.min} max={field.max} step={field.step} />
      )}
    </label>
  );
}

function formatValue(field: ManagedField, value: unknown) {
  if (value == null) return '';
  if (field.type === 'json') return JSON.stringify(value, null, 2);
  if (field.type === 'tags' && Array.isArray(value)) return value.join('\n');
  if (field.type === 'datetime' && typeof value === 'string') return value.slice(0, 16);
  return String(value);
}
