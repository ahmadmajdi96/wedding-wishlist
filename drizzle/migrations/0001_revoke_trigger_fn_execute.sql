REVOKE EXECUTE ON FUNCTION public.sync_vendor_rating() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_booking_status() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;