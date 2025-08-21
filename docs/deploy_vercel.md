Guía mínima: Despliegue y secretos para Vercel

Objetivo
- Documentar las variables de entorno y pasos mínimos para que las funciones server-side (Edge Functions) y el adapter de Vercel funcionen correctamente.

Variables de entorno necesarias (en Vercel Secrets / Environment Variables)
- SUPABASE_URL: URL de tu proyecto Supabase (p.ej. https://xyz.supabase.co)
- SUPABASE_SERVICE_KEY: Service Role Key de Supabase (server-side ONLY)
- SENDGRID_API_KEY: (opcional) API key de SendGrid para enviar emails
- FROM_EMAIL: dirección de origen para los emails (opcional)
- VERCEL_TOKEN: (opcional pero recomendado) Token de la API de Vercel si quieres usar la API en lugar de deploy hooks
- VERCEL_PROJECT_ID: (opcional) ID del proyecto en Vercel
- VERCEL_TEAM_ID: (opcional) Team ID en Vercel
- VERCEL_DEPLOY_HOOK_URL_READONLY: (opcional) URL de deploy hook para redeploy que deja la app en modo "solo lectura"
- VERCEL_DEPLOY_HOOK_URL_EDITABLE: (opcional) URL de deploy hook para redeploy que deja la app en modo editable

Notas de seguridad
- Nunca subir o exponer SUPABASE_SERVICE_KEY ni VERCEL_TOKEN en el frontend. Sólo en secrets del hosting (Vercel, Supabase, GitHub Actions).
- Usar variables de entorno de Vercel para las funciones y no incluir claves en el repositorio.

Cómo crear deploy hooks en Vercel (rápido)
1. Entra a tu proyecto en Vercel.
2. Ve a Settings -> Git -> Deploy Hooks.
3. Crea un hook nuevo y asigna un nombre claro, p.ej. "read-only-deploy" o "editable-deploy".
4. Copia la URL generada y pégala en la variable `VERCEL_DEPLOY_HOOK_URL_READONLY` o `VERCEL_DEPLOY_HOOK_URL_EDITABLE` en los secrets.

Estrategias disponibles
- Deploy hooks (recomendado, simple): el adapter enviará POST a la URL del hook con { context: { linkId } }.
  - Pros: simple, no requiere token con permisos de escritura en Vercel.
  - Contras: debes implementar el mecanismo en la app para leer env vars y cambiar comportamiento (p.ej. app_config.app_readonly) durante build/run.

- API de Vercel (avanzado): usar `VERCEL_TOKEN` y la API v13 para crear deployments, copiar env vars, o cambiar settings.
  - Pros: control total para clonar proyectos y copiar variables de entorno.
  - Contras: más complejidad y requiere token con permisos.

Notas de despliegue de funciones
- Las funciones (por ejemplo, `functions/markExpired.js`) importan el adapter local `./vercelAdapter.js`. Asegúrate de que el bundler de la plataforma incluya `functions/` y sus dependencias.
- Si tu plataforma no permite importar fuera de `functions/`, utiliza la copia que ya exista en `functions/vercelAdapter.js`.

Siguientes pasos recomendados
1. (Corto) Configurar las deploy hooks en Vercel y ajustar las variables en el entorno.
2. (Medio) Mejorar `functions/vercelAdapter.js` para usar la API de Vercel cuando `VERCEL_TOKEN` esté presente: copiar env vars del template, crear deployment y devolver `url`.
3. (Opcional) Implementar protección en las funciones (autenticación/HMAC) antes de exponer endpoints públicos.

Ejemplo mínimo de pruebas locales
- Para probar las funciones localmente puedes exportar las variables en tu shell y ejecutar un pequeño script node que invoque la función. No olvides no usar keys reales en entornos públicos.

Contacto
- Registro de cambios: `functions/vercelAdapter.js` (copia) y actualizaciones en `functions/*` para importar el adapter local.
