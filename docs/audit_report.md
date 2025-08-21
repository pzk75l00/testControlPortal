# Informe de auditoría npm

Fecha: 2025-08-20
Repositorio: testControlPortal

## Resumen rápido
- Auditoría ejecutada: `npm audit`
- Vulnerabilidades encontradas: 9 (6 high, 3 moderate)
- Resultado de `npm audit fix`: no hay fixes no-forzados disponibles; las correcciones automáticas requieren `--force` e introducirían cambios rompedores (p. ej. una instalación propuesta de `react-scripts@0.0.0`).

## Entradas clave del `npm audit`
- Vulnerabilidad: `nth-check` (<2.0.1) — Severity: high
  - Cadena afectada: svgo -> css-select -> nth-check
  - Remedio: fix disponible via `npm audit fix --force` (haría cambios rompedores)

- Vulnerabilidad: `postcss` (<8.4.31) — Severity: moderate
  - Cadena afectada: resolve-url-loader -> postcss
  - Remedio: fix disponible via `npm audit fix --force` (haría cambios rompedores)

- Vulnerabilidad: `webpack-dev-server` (<=5.2.0) — Severity: moderate
  - Remedio: fix disponible via `npm audit fix --force` (haría cambios rompedores)

> Nota: `npm audit fix --force` propondrá instalar versiones que rompen compatibilidad con `react-scripts@5.0.1` y con otras dependencias del proyecto (por ejemplo, la salida indicó que intentaría instalar `react-scripts@0.0.0`).

## Recomendaciones y pasos siguientes (seguro / no rompedor)
1. NO ejecutar `npm audit fix --force` en `master` sin revisar el impacto. Puede introducir cambios rompedores.
2. Evaluar actualizar o reemplazar `react-scripts` (Create React App) por alternativas o versiones más recientes. Muchas vulnerabilidades provienen de transitive deps de `react-scripts`.
3. Actualizar selectivamente paquetes de herramientas de build (por ejemplo `@svgr/*`, `svgo`, `resolve-url-loader`) si no dependen críticamente de la versión de `react-scripts` usada.
4. Considerar migración a Vite / Next.js u otro bundler si se requiere mantener dependencias actualizadas a largo plazo.
5. Si decides aplicar fixes forzados, crea una rama de prueba, ejecuta `npm audit fix --force`, ejecuta `npm run build` y todos los tests, y revisa manualmente cambios en `package-lock.json` y potenciales breakages.
6. Añadir la auditoría al pipeline CI para que falle PRs con nuevas vulnerabilidades o ejecute `npm audit` periódicamente.

## Comandos útiles (PowerShell)
```powershell
# Revisar auditoría
npm audit

# Intentar fixes no-forzados (ya ejecutado, no cambió)
npm audit fix

# Aplicar fixes forzados (Riesgoso — hacer en rama de prueba)
# npm audit fix --force

# Si pruebas forzados, luego:
npm ci
npm run build
npm test -- --watchAll=false
```

## Estado actual propuesto
- Acciones realizadas: auditoría ejecutada; `npm audit fix` aplicado (ningún cambio no-forzado disponible).
- Siguiente paso recomendado: crear una rama `chore/audit-fixes` para probar `npm audit fix --force` o realizar actualizaciones manuales de dependencias de build en una rama de feature y validar la build/tests.

---
Informe generado automáticamente por el asistente; añade comentarios o pasos específicos y puedo abrir PR con este informe.
