import Link from 'next/link';
import { ProductForm } from '@/components/admin/product-form';
import { requireStaff } from '@/lib/auth/guards';
import { can } from '@/lib/admin/permissions';
import { createAdminClient } from '@/lib/supabase/admin';
export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { staff } = await requireStaff('/admin/commerce/products/new');
  const supabase = createAdminClient();
  const [{ data: categories }, { data: collections }] = await Promise.all([
    supabase.from('categories').select('id,name').order('name'),
    supabase.from('collections').select('id,name').order('name'),
  ]);
  return (
    <div className="mx-auto max-w-[1380px] space-y-6 p-4 md:p-7 xl:p-9">
      <header>
        <Link
          href="/admin/commerce/products"
          className="text-sm text-cherie-burgundy hover:underline"
        >
          ← Ürünlere dön
        </Link>
        <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-cherie-brass">
          Yeni katalog kaydı
        </p>
        <h1 className="font-display text-4xl">Ürün taslağı oluştur</h1>
      </header>
      <ProductForm
        categories={(categories ?? []).map((x) => ({ id: x.id, label: x.name }))}
        collections={(collections ?? []).map((x) => ({ id: x.id, label: x.name }))}
        canPublish={can(staff.role, 'catalog.publish')}
        error={error}
      />
    </div>
  );
}
