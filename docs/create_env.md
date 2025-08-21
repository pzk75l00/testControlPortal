# Creación de entornos desde la UI

Se ha implementado un flujo para que el botón "Crear entorno" invoque un endpoint server-side si está configurado.

Cómo funciona
- `LinkManager` llamará al endpoint configurado en la variable de entorno `REACT_APP_CREATE_ENV_URL`.
- Si no está configurado, usará un fallback que actualiza la fila en Supabase marcando `entornoClienteCreado=true` (simulación).

Recomendado: desplegar la función server-side `functions/createEnvironment.js` y configurar `REACT_APP_CREATE_ENV_URL` con la URL pública protegida.

Pasos para desplegar en Supabase Edge Functions
1. Crear la función con el contenido de `functions/createEnvironment.js`.
2. En Settings > Environment variables, añadir `SUPABASE_URL` y `SUPABASE_SERVICE_KEY`.
3. Publicar la función y copiar la URL pública.
4. En el proyecto frontend, en `.env` añadir:
   - `REACT_APP_CREATE_ENV_URL=https://<tu-funcion>.supabase.co` (o la URL del endpoint desplegado)
5. Reiniciar el dev server para que lea la variable de entorno.

Seguridad
- Proteger la función con autenticación o tokens, y validar que la solicitud viene de fuentes autorizadas.
- Nunca exponer `SUPABASE_SERVICE_KEY` en el frontend.

Ejemplo de petición (POST)
```
POST /createEnvironment
Content-Type: application/json

{"id": "uuid-del-enlace"}
```

Respuesta esperada

200 OK
{
  "link": { "entornoClienteCreado": true, "url": "https://envs.example.com/uuid" }
}
