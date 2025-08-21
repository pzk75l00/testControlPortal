# Tareas pendientes y plan de seguimiento

Este documento centraliza las tareas operativas y de desarrollo pendientes para el proyecto "test-control-portal". Está escrito en español y pensado para que cualquiera del equipo pueda seguir los pasos.

## Resumen rápido
- Build actual: OK (producción generada en `build/`).
- Vulnerabilidades npm: sí (9 encontradas). Requiere revisión.
- Jobs server-side: pendientes (scripts y ejemplos incluidos en `scripts/` y `functions/`).

## Tareas priorizadas

1) Corregir vulnerabilidades npm (Prioridad: Alta)
   - Estado: Pendiente
   - Responsable: Tú o el equipo de devops; puedo ejecutar el análisis y aplicar fixes no forzados.
   - Comandos recomendados (PowerShell):
     ```powershell
     npm audit
     npm audit fix
     # solo si aceptas riesgo de breaking:
     npm audit fix --force
     ```

2) Ejecutar linters y tests, y corregir advertencias (Prioridad: Alta)
   - Estado: Pendiente
   - Responsable: Yo puedo ejecutar y proponer fixes; tú apruebas cambios.
   - Comandos:
     ```powershell
     npm test
     npm run lint
     ```

3) Programar job server-side que marque enlaces expirados (Prioridad: Alta)
   - Estado: Pendiente (hay `scripts/mark_expired.sql` y `functions/markExpired.js` en el repo)
   - Opciones:
     - Usar pg_cron / SQL schedule en la DB (ejecuta `scripts/mark_expired.sql`).
     - Desplegar `functions/markExpired.js` como Scheduled Edge Function y pasar `SUPABASE_SERVICE_KEY` como secret.
   - Responsable: Admin de Supabase (necesita permisos para programar jobs) o yo si me das acceso para desplegar.

4) Provisión / endpoints de control (createEnvironment / extendExpiration) (Prioridad: Media)
   - Estado: Pendiente (ejemplos `functions/createEnvironment.js`, `functions/extendExpiration.js` añadidos)
   - Requiere: secrets, endpoint deployment (Vercel/Netlify/Cloud Run)
   - Responsable: Tú o yo con permisos de despliegue.

5) Configurar secretos y protección (Prioridad: Alta)
   - Variables a añadir en GitHub/Supabase/Functions:
     - `SUPABASE_SERVICE_KEY` (solo en backend, nunca en frontend)
     - `SUPABASE_URL`
     - `REACT_APP_SUPABASE_KEY` (frontend, anon key)
     - `SENDGRID_API_KEY` (si usas notificaciones por email)
     - `VERCEL_DEPLOY_HOOK_URL_READONLY` / `VERCEL_DEPLOY_HOOK_URL_EDITABLE` (opcional)
   - Responsable: Tú (owner de cuenta) o persona con permisos en GitHub/Supabase.

6) Tests unitarios mínimos para la lógica crítica (Prioridad: Media)
   - Estado: Pendiente
   - Objetivo: añadir tests para CRUD y la rutina de expiración (happy path + 1-2 edge cases).
   - Responsable: Yo (puedo implementarlos) o el equipo de QA.

7) CI/CD: completar workflow (build, lint, test) (Prioridad: Media)
   - Estado: Parcial (stub en `.github/workflows/ci.yml`)
   - Responsable: Yo o tú.

8) Índices y paginación en la tabla `enlaces` (Prioridad: Baja→Media según crecimiento)
   - Recomendación: añadir índices sobre columnas `expiracion`, `estado`, `url` y paginar en las consultas.
   - Responsable: DBA/Dev.

9) Decidir mecanismo para toggling read-only on expiry (Prioridad: Alta)
   - Opciones:
     - Deploy hooks (desplegar una versión read-only que se activa al caducar): requiere deploy hooks y proceso de CI.
     - Feature flag en DB (`app_readonly`): más simple y rápido (solo actualizar una fila en la DB y el frontend consulta el flag).
   - Responsable: Tú (decisión); yo implemento la opción elegida.

## Contrato de trabajo mínimo
- Inputs: acceso al repo (ya), secrets en GitHub/Supabase, URL de Supabase.
- Outputs: build limpio, tests mínimos, job programado para expirados, endpoints desplegados.
- Costes/risks: `npm audit fix --force` puede introducir breaking changes; preferir fixes selectivos.

## Comandos útiles (PowerShell)
```powershell
# instalar dependencias limpias
npm ci

# ejecutar build de producción
npm run build

# tests y lint
npm test
npm run lint

# revisar vulnerabilidades
npm audit
npm audit fix

# servir build localmente
npx serve -s build
```

## Próximos pasos sugeridos (elige uno)
- Opción A: Yo ejecuto `npm audit` + `npm run lint` y envío un PR con fixes menores.
- Opción B: Tú configuras secrets en GitHub/Supabase y me autorizas a desplegar la función programada.
- Opción C: Implemento tests unitarios mínimos y un workflow CI que corra build/lint/test.

Indica la opción que prefieres (A/B/C) o pide que haga una tarea específica y la ejecuto.

---
Archivo creado automáticamente para centralizar pendientes — mantén este documento actualizado cuando completes tareas.
