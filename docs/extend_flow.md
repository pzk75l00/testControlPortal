# Flujo para conceder tiempo extra y mantener la app editable

Objetivo: cuando se concede "tiempo extra" para un enlace, la app debe volver a estar editable (o permanecer editable) hasta la nueva expiración, sin perder datos.

Componentes claves
- Campo en `enlaces`: `tiempoExtraSolicitado` (boolean).
- Acción de cliente: "Solicitar tiempo extra" — pone `tiempoExtraSolicitado=true` (desde UI o DB).
- Revisión de admin: el administrador revisa solicitudes y, si aprueba, llama a un endpoint seguro para extender la expiración.
- Endpoint/Function: `functions/extendExpiration.js` (ejemplo) — parámetros:
  - `id`: id del enlace
  - `newExpirationISO` (opcional) o `extendMinutes` (opcional)

Qué hace la función `extendExpiration`
1. Valida petición y calcula la nueva expiración.
2. Actualiza la fila en `enlaces`:
   - `expiracion = <nueva fecha>`
   - `estado = 'Activo'`
   - `adminAvisado = false`
   - `tiempoExtraSolicitado = false`
3. Opcionalmente dispara un Deploy Hook en Vercel (`VERCEL_DEPLOY_HOOK_URL_EDITABLE`) para desplegar la rama o build que habilita edición.
4. Opcionalmente actualiza una tabla `app_config` (key `app_readonly=false`) para que la app entre en modo editable sin desplegar.

Opciones para implementar la re-habilitación de edición
- A) Deploy Hook a rama `main` / `editable`: sencillo, hace deploy de la UI con botones habilitados.
- B) Feature flag (recomendado): usar `app_config` o un servicio de flags; la app consulta el flag y habilita edición inmediatamente.

Recomendaciones
- Usar feature flag para cambios rápidos y menos despliegues.
- Registrar la acción en logs y notificar al cliente/admin.
- Proteger el endpoint con autenticación (token HMAC o usar Supabase auth + policies).

Ejemplo de uso (admin)
POST /extendExpiration
{
  "id": "uuid-del-enlace",
  "extendMinutes": 60
}

Respuesta esperada
200 OK
{ "ok": true, "id": "uuid-del-enlace", "newExpiration": "2025-08-20T...Z" }

Notas
- Si no usás `app_config`, la función intenta actualizarla pero no falla si la tabla no existe.
- Asegurate de reiniciar o invalidar caches si la app usa datos en caché para la lógica de read-only.
