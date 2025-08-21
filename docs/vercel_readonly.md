# Poner la app en Vercel como Read-Only cuando un enlace caduca

El objetivo: cuando un enlace pase a `Caducado`, desplegar una versión de la app que muestre los entornos en modo solo lectura y no permita crear nuevos recursos, preservando los datos para migración posterior.

Estrategia recomendada

1) Preparar una rama o build que soporte "modo solo lectura"
- Crea en tu repo una rama `readonly` con una build que deshabilite botones de creación y muestre un banner informando el estado.
- Idealmente, la app debe poder leer una variable de entorno `REACT_APP_READ_ONLY` para activar el modo.

2) Configurar un Deploy Hook en Vercel
- En tu proyecto Vercel > Settings > Git > Deploy Hooks, crea un deploy hook apuntando a la rama `readonly`.
- Copia la URL y guárdala como variable de entorno en la función scheduler `VERCEL_DEPLOY_HOOK_URL_READONLY`.

3) Uso desde el scheduler
- El scheduler (`functions/markExpired.js`) ahora invoca ese deploy hook cuando marca enlaces como `Caducado`.
- El hook despliega la app en modo read-only.

4) Preservación de datos
- El deploy read-only no debe borrar datos. Asegúrate que las operaciones destructivas (delete/migrate) estén protegidas y solo accesibles a admins.

5) Alternativa: feature flag dinámico
- En lugar de desplegar, puedes usar un feature flag (LaunchDarkly, Flagsmith, etc.) o una configuración en la DB que la app consulte para entrar en modo read-only.
- Esto evita despliegues y es más rápido. El scheduler podía setear `app_readonly = true` en una tabla `config` y la app consultarla.

6) Revertir modo read-only
- Implementa un endpoint o job para revertir (por ejemplo, cuando el admin confirme migración o reactivación).

Notas de seguridad
- Protege el deploy hook: no incluirlo en el frontend; guárdalo como secreto en la función.
- Auditar despliegues y registrar el `linkId` que provocó el cambio.

Ejemplo de uso
- `functions/markExpired.js` dispara el deploy hook con payload `{ linkId: 'uuid' }`.
- Vercel recibe el hook y hace deploy de la rama `readonly`.

Recomendación final
- Prefiero 2 pasos: usar feature flag para toggles operacionales (rápido) y un deploy read-only como fallback si necesitás un UI distinto.
