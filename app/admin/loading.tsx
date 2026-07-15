import { AdminSkeleton } from '@/components/admin/admin-workspace';
export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-[1680px] space-y-7 p-4 md:p-7 xl:p-9">
      <header aria-hidden="true" className="space-y-3 border-b border-cherie-lace pb-7">
        <div className="h-3 w-28 animate-pulse rounded-control bg-cherie-paper" />
        <div className="h-14 w-full max-w-xl animate-pulse rounded-card bg-cherie-paper" />
        <div className="h-5 w-full max-w-2xl animate-pulse rounded-control bg-cherie-paper/80" />
      </header>
      <AdminSkeleton rows={6} />
    </div>
  );
}
