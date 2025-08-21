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

   10) Envío de notificaciones por email cuando un enlace caduca (Prioridad: Alta)
      - Estado: Pendiente (funciones de ejemplo añadidas en `functions/markExpired.js`)
      - Responsable: Yo (implementación) / Tú (configuración de SendGrid)
      - Requisitos: `SENDGRID_API_KEY`, `FROM_EMAIL` en secretos de funciones/servicio.
      - Paso inmediato: configurar SendGrid (o provider equivalente), probar envío con un enlace de prueba.

   11) Soporte de read-only / editable en Vercel (Prioridad: Alta)
      - Estado: Pendiente
      - Objetivo: que al caducar un enlace el proyecto deployado pase a modo read-only y al extender expiración vuelva a editable.
      - Opciones técnicas:
        - Deploy hooks: crear dos deploy hooks en Vercel (read-only / editable) y llamarlos desde `markExpired` y `extendExpiration`.
        - Feature flag: usar una tabla `app_config` en Supabase con `app_readonly=true/false`; la app frontend consulta este flag y deshabilita acciones de escritura. (más simple)
      - Requisitos: `VERCEL_DEPLOY_HOOK_URL_READONLY`, `VERCEL_DEPLOY_HOOK_URL_EDITABLE` o `app_config` en DB.

   12) Provisión / clonado de entornos en Vercel / Firebase usando datos del usuario (Prioridad: Alta)
      - Estado: Pendiente (ejemplo `functions/createEnvironment.js` en repo)
      - Objetivo: crear un entorno de prueba para el cliente basado en plantilla/clonando variables de entorno y configuraciones, usando los datos del usuario (email/nombre/cliente).
      - En Vercel: flujo recomendado
        1. Tener un proyecto plantilla con variables env en Team/Project.
        2. Crear un nuevo deployment o duplicar configuración usando Vercel API (requiere `VERCEL_TOKEN` y `VERCEL_PROJECT_ID`) o crear un git branch y disparar deploy.
        3. Guardar la URL resultante en `enlaces.url` y marcar `entornoClienteCreado=true`.
      - En Firebase: usar Firebase Hosting APIs o `firebase deploy --project` con variables configuradas; requiere `FIREBASE_TOKEN`.
      - Requisitos: `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `FIREBASE_TOKEN` (según provider).

   13) Flujo de entrega al cliente y transferencia a su repo (Prioridad: Media)
      - Estado: Pendiente
      - Objetivo: entregar el proyecto de Vercel al cliente para que pruebe y, si aprueba, transferir el código/infra a su repositorio/organización.
      - Pasos sugeridos:
        1. Proveer al cliente el enlace del deployment en Vercel para pruebas (entorno temporal).
        2. Si el cliente aprueba, crear un proceso de transferencia:
           - Opción A: Transferir el repositorio (GitHub transfer ownership) y actualizar variables/Secrets en Vercel con credenciales del cliente.
           - Opción B: Exportar configuración (README con variables/envs) y abrir PR en el repo del cliente con los cambios/instrucciones de deploy.
        3. Documentar pasos para el cliente (README con variables necesarias, instrucciones de deploy y cómo regenerar entornos de prueba).
      - Requisitos: coordinación con el cliente, permisos en GitHub/Vercel para transferir repositorio o crear PR.

   ## Requisitos operativos para estos flujos
   - Secrets / env vars que debes añadir en el entorno de funciones / Vercel / Supabase:
     - `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `REACT_APP_SUPABASE_KEY`
     - `SENDGRID_API_KEY`, `FROM_EMAIL`
     - `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_DEPLOY_HOOK_URL_READONLY`, `VERCEL_DEPLOY_HOOK_URL_EDITABLE`
     - `FIREBASE_TOKEN` (opcional)

   - Seguridad: nunca exponer `SUPABASE_SERVICE_KEY` ni `VERCEL_TOKEN` en el frontend; deben residir en secretos de funciones/CI.

   ## Paso inmediato recomendado
   - Priorizar: 1) configurar SendGrid y probar `markExpired` en staging; 2) decidir deploy-hook vs feature-flag; 3) implementar `createEnvironment` para Vercel (o Firebase) y probar con un deployment template.


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
