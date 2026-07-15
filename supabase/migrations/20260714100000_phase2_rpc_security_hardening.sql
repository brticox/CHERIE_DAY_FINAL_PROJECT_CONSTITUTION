-- Phase 2 admin RPCs are the audited mutation boundary. Run them with the
-- migration owner so their explicit staff-role checks do not conflict with
-- narrower table RLS policies. Keep every search_path fixed and remove all
-- anonymous/default execution before granting the authenticated API role.

alter function public.admin_publish_product(uuid)
  security definer set search_path = public, pg_temp;
alter function public.admin_archive_product(uuid)
  security definer set search_path = public, pg_temp;
alter function public.admin_restore_product(uuid)
  security definer set search_path = public, pg_temp;
alter function public.admin_publish_legal_version(uuid,jsonb)
  security definer set search_path = public, pg_temp;
alter function public.admin_archive_media(uuid)
  security definer set search_path = public, pg_temp;
alter function public.admin_set_product_media(uuid,uuid[])
  security definer set search_path = public, pg_temp;
alter function public.admin_save_page(uuid,text,text,jsonb)
  security definer set search_path = public, pg_temp;
alter function public.admin_publish_page(uuid)
  security definer set search_path = public, pg_temp;
alter function public.admin_rollback_page(uuid,uuid)
  security definer set search_path = public, pg_temp;
alter function public.admin_update_order_operations(uuid,uuid,text,text)
  security definer set search_path = public, pg_temp;
alter function public.admin_complete_quality_check(uuid,jsonb,text)
  security definer set search_path = public, pg_temp;
alter function public.admin_create_shipment(uuid,text,text,int,text)
  security definer set search_path = public, pg_temp;
alter function public.admin_update_lead(uuid,public.lead_status,text,uuid,timestamptz,text,text)
  security definer set search_path = public, pg_temp;
alter function public.admin_convert_lead(uuid,text)
  security definer set search_path = public, pg_temp;
alter function public.admin_retry_notification(uuid)
  security definer set search_path = public, pg_temp;
alter function public.admin_update_staff(uuid,public.staff_role,boolean)
  security definer set search_path = public, pg_temp;

revoke all on function
  public.admin_publish_product(uuid),
  public.admin_archive_product(uuid),
  public.admin_restore_product(uuid),
  public.admin_publish_legal_version(uuid,jsonb),
  public.admin_archive_media(uuid),
  public.admin_set_product_media(uuid,uuid[]),
  public.admin_save_page(uuid,text,text,jsonb),
  public.admin_publish_page(uuid),
  public.admin_rollback_page(uuid,uuid),
  public.admin_update_order_operations(uuid,uuid,text,text),
  public.admin_complete_quality_check(uuid,jsonb,text),
  public.admin_create_shipment(uuid,text,text,int,text),
  public.admin_update_lead(uuid,public.lead_status,text,uuid,timestamptz,text,text),
  public.admin_convert_lead(uuid,text),
  public.admin_retry_notification(uuid),
  public.admin_update_staff(uuid,public.staff_role,boolean)
from public, anon, authenticated;

grant execute on function
  public.admin_publish_product(uuid),
  public.admin_archive_product(uuid),
  public.admin_restore_product(uuid),
  public.admin_publish_legal_version(uuid,jsonb),
  public.admin_archive_media(uuid),
  public.admin_set_product_media(uuid,uuid[]),
  public.admin_save_page(uuid,text,text,jsonb),
  public.admin_publish_page(uuid),
  public.admin_rollback_page(uuid,uuid),
  public.admin_update_order_operations(uuid,uuid,text,text),
  public.admin_complete_quality_check(uuid,jsonb,text),
  public.admin_create_shipment(uuid,text,text,int,text),
  public.admin_update_lead(uuid,public.lead_status,text,uuid,timestamptz,text,text),
  public.admin_convert_lead(uuid,text),
  public.admin_retry_notification(uuid),
  public.admin_update_staff(uuid,public.staff_role,boolean)
to authenticated;
