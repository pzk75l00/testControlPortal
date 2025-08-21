# Flujo recomendado para enlaces expirados

Objetivo: asegurar que cuando un enlace caduca, no se creen recursos automáticamente sin confirmación y pago.

1) Scheduler / Marking
- El scheduler (SQL/Edge Function) solo marca filas como `Caducado` y, opcionalmente, pone `adminAvisado = true` cuando corresponda.

2) Notificación y confirmación
- Tras marcar caducado, envía notificación al administrador (y opcionalmente al cliente) con opciones:
  - "Deseo mantener el entorno" (el cliente acepta conservar el entorno)
  - "Solicitar migración" (el cliente solicita mover datos a otro entorno)
  - "Eliminar entorno" (decisión de eliminar)

3) Pago y validación
- Si la acción requiere pago (por ejemplo, mantener el entorno más tiempo), el sistema debe:
  - Generar una orden de pago asociada al `enlace.id` (tabla `pagos` o campos como `pagoPendiente` y `monto` en `enlaces`).
  - Una vez confirmado el pago (webhook o polling del proveedor de pagos), cambiar estado y ejecutar la creación o extensión del entorno.

4) Creación del entorno
- La creación del entorno debe ser una acción explícita, invocada por:
  - Un admin desde el panel (botón `Crear entorno` que ya existe en la UI), o
  - Un backend seguro (Edge Function) que verifique la orden de pago, o
  - Un botón en la UI que invoque una función server-side que valide el pago y luego haga la provisión.

5) Flags y campos útiles en la tabla `enlaces`
- `pagoPendiente` (boolean)
- `montoPendiente` (numeric)
- `adminAvisado` (boolean)
- `entornoClienteCreado` (boolean)
- `tiempoExtraSolicitado` (boolean)
- `migracionSolicitada` (boolean)

6) Ejemplo de secuencia segura
- Scheduler marca enlace como `Caducado`.
- Edge Function envía email al cliente con un link seguro para "Reactivar".
- Cliente paga (Stripe/PayPal) y el proveedor envía webhook a una Edge Function.
- La Edge Function valida pago, actualiza `enlaces` y ejecuta la creación del entorno.

7) Seguridad y costos
- Usa la Service Role key sólo en funciones server-side.
- Registra cada creación de recurso y limita la frecuencia para evitar costos inesperados.

8) Siguiente pasos para implementación
- Decidir el proveedor de pagos (Stripe recomendado).
- Añadir tabla `pagos` o campos de pago en `enlaces`.
- Implementar webhooks/Edge Function que valide pagos y desencadene provisión.
