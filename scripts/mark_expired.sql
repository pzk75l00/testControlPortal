-- scripts/mark_expired.sql
-- Marca como 'Caducado' los enlaces cuya expiración pasó y siguen en estado 'Activo'.
-- Ejecutar esto manualmente en el SQL editor de Supabase o mediante pg_cron / Scheduled Jobs.

BEGIN;

UPDATE public.enlaces
SET estado = 'Caducado', adminAvisado = COALESCE(adminAvisado, false)
WHERE tipo = 'expira'
  AND estado = 'Activo'
  AND expiracion IS NOT NULL
  AND expiracion < now();

COMMIT;

-- Devuelve las filas afectadas para verificación (opcional)
-- SELECT * FROM public.enlaces WHERE tipo='expira' AND estado='Caducado' ORDER BY expiracion DESC LIMIT 50;
