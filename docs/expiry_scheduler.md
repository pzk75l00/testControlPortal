# Scheduler para expirados

Este documento describe dos formas recomendadas para asegurarse de que los enlaces "expira" sean marcados como `Caducado` incluso cuando no hay usuarios navegando la app.

## Opción A — SQL (pg_cron / Scheduled Job)

Resumen
- Ejecuta un `UPDATE` periódico en la tabla `public.enlaces` que marca `estado = 'Caducado'` para filas vencidas.
- Es la opción más simple y confiable si no necesitas enviar emails desde el servidor.

Pasos
1. Abre el SQL editor en Supabase (o tu acceso psql) y ejecuta `scripts/mark_expired.sql`.
2. Para automatizarlo, crea una tarea programada:
   - Si tu proyecto tiene `pg_cron` (comprueba con el admin PG), añade:

```
SELECT cron.schedule('mark_expired_every_minute', '*/1 * * * *', $$
-- contenido del UPDATE (usa scripts/mark_expired.sql)
$$);
```

   - En Supabase, usa la UI "Scheduled Jobs" (si está disponible) y pega el SQL `scripts/mark_expired.sql` y programa cada 1-5 minutos según tu tolerancia.

Consideraciones
- No envía emails. Para notificaciones, combina con una función que lea las filas marcadas y envíe correos (Edge Function).
- Asegúrate de índices sobre `expiracion` y `estado` para eficiencia.

## Opción B — Scheduled Edge Function (recomendada si necesitas emails)

Resumen
- Implementa una función que se ejecute periódicamente (ej: cada 1-5 minutos). La función debe usar la Service Role key de Supabase (guárdala como secreto) para actualizar filas y puede integrar proveedores de email (SendGrid).

Archivos provistos
- `functions/markExpired.js` — ejemplo de handler que:
  - Consulta filas `tipo='expira' AND estado='Activo' AND expiracion < now()`
  - Actualiza cada fila a `estado='Caducado'` y `adminAvisado=true`
  - (Opcional) envia emails usando `SENDGRID_API_KEY` y `FROM_EMAIL`

Despliegue (Supabase)
1. Crea una nueva Function (Edge Function) en la UI o CLI de Supabase.
2. Pega el contenido de `functions/markExpired.js`.
3. En Settings > Environment variables, añade:
   - `SUPABASE_URL` = tu url (ej: `https://xxxxx.supabase.co`)
   - `SUPABASE_SERVICE_KEY` = Service Role key (no compartir)
   - `SENDGRID_API_KEY` = (opcional) tu clave SendGrid
   - `FROM_EMAIL` = (opcional) correo desde el que se envían notificaciones
4. Programar la función en "Scheduled" cada 1 minuto o según prefieras.

Seguridad
- Usa la Service Role key solo en funciones server-side; nunca la expongas al cliente.

## Qué elegir
- Si solo quieres marcar expirados: opción A.
- Si quieres enviar emails y lógica adicional: opción B.

IMPORTANTE: el scheduler NO debe crear entornos automáticamente al marcar un enlace como caducado.
El comportamiento correcto es:
- Marcar el enlace como `Caducado` (y opcionalmente `adminAvisado = true`).
- Notificar al administrador y/o al cliente para que confirmen si desean el entorno.
- Si el cliente confirma y realiza el pago, entonces ejecutar la creación del entorno (esto debe ser una acción separada, iniciada por el admin o por un flujo seguro que verifique el pago).

Crear entornos automáticamente sin la confirmación y pago puede generar costos y accesos no deseados. Más detalles del flujo recomendado en `docs/expired_workflow.md`.

## Comprobaciones post-despliegue
- Ejecuta manualmente el SQL o función para verificar que registros cambian a `Caducado`.
- Revisa la tabla y añade índices:

```
CREATE INDEX IF NOT EXISTS idx_enlaces_expiracion ON public.enlaces (expiracion);
CREATE INDEX IF NOT EXISTS idx_enlaces_estado ON public.enlaces (estado);
```

## Notas finales
- Prueba primero en un entorno staging con pocos datos.
- Mantén logs de ejecuciones y reintentos en caso de fallos de red/servicio de emails.
