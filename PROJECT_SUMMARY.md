# 🚀 Proyecto ControlStock: Resumen de Punto a Punto

Este documento resume el estado actual del proyecto, identifica áreas de mejora crítica y propone un roadmap para dejarlo 100% "production-ready" y escalable para ventas masivas (SaaS).

## 📊 Estado Actual del Proyecto

El proyecto ha crecido significativamente y tiene una base sólida:
- **Backend**: Astro + Drizzle ORM (SQLite/Turso).
- **Frontend**: React para islas interactivas, Astro para SSR.
- **Features Core**: Gestión de Stock, Ventas, Compras, Traslados entre sucursales, Suscripciones Multi-tenant, Caja.
- **UI/UX**: Estética moderna con Tailwind CSS, adaptada (en parte) para uso con teclado en ventas.

---

## 🔍 Análisis Técnico (Áreas de Mejora)

### 1. 🏗️ Distribución de Carpetas (Arquitectura)
*   **Problema**: Las carpetas `src/components`, `src/services` y `src/pages` están empezando a saturarse. Hay archivos duplicados o con nombres inconsistentes (ej: `creacionInicialEmpresa.service.ts` vs `*.services.ts`).
*   **Solución**: Implementar una estructura **Domain-Driven**. Agrupar componentes, hooks y servicios por dominio (Stock, Sales, Finance, Users).

### 2. 🔄 Flujo de Datos y Caching (Fetch)
*   **Problema**: Se usa `fetch` manual dentro de `useEffect` o acciones de Nanostores. Esto no ofrece cache nativo, manejo de estados de error/loading consistente, ni "Optimistic UI" fácilmente.
*   **Solución**: Integrar **TanStack Query (React Query)**. Es el estándar de la industria para aplicaciones escalables. Permite cachear resultados de stock, ventas, etc., reduciendo la carga del servidor y mejorando la velocidad percibida.

### 3. 💾 Base de Datos (Evolución)
*   **Problema**: Aunque Fase 2 (índices) está completada, a medida que la DB crezca, necesitaremos auditorías de stock (Kardex) más robustas y manejo de transacciones atómicas en todos los puntos críticos de venta.
*   **Solución**: Reforzar el uso de transacciones en los servicios DB y asegurar que cada movimiento de stock esté vinculado a un ID de transacción único.

### 4. ⚡ "Punto de Venta" (POS) para Panaderías/Kioscos
*   **Problema**: La UI actual es muy de "Dashboard". Para una panadería con mucha rotación, se necesita algo más "Touch-friendly" y rápido.
*   **Solución**: Crear un componente de `POSView` dedicado. Botones grandes para categorías/productos populares, integración total con escáner de código de barras sin necesidad de enfocar inputs manualmente.

---

## 🛠️ Roadmap a Punto: Fase 3 & 4

### Fase 3: Refactorización Estructural (Inmediato)
- [ ] **Limpieza de Servicios**: Unificar nombres y eliminar duplicados en `src/services`.
- [ ] **Estandarización de API**: Asegurar que todos los endpoints devuelvan una estructura `{ data, error, message }` consistente.
- [ ] **Migración a TanStack Query**: Empezar por el listado de Stock y Ventas.

### Fase 4: Escalabilidad y Venta (Puesta a Punto)
- [ ] **Middleware de Suscripciones**: Bloqueo real de funciones según el plan contratado.
- [ ] **Módulo de Caja (Arqueo)**: Reforzar el cierre de caja diario, crítico para el kiosco.
- [ ] **Optimización del POS**: Interfaz de venta rápida con "Action Keys" y modo offline parcial (opcional).

---

## 🎯 Por dónde empezar HOY

1.  **Auditoría de Servicios**: Limpiar la carpeta `src/services` y mover la lógica de DB a sus archivos `.db.service.ts` correspondientes si falta alguno.
2.  **Centralización de Estados**: Evaluar si seguir con Nanostores para todo o mezclar con TanStack Query para el server-state.
3.  **Vista de Panadería**: Diseñar un "Modo POS" simplificado dentro de `/dashboard/ventas`.

> [!IMPORTANT]
> El proyecto es **brutal** técnica y funcionalmente. El foco ahora debe ser la **resiliencia** (que no falle el fetch) y la **experiencia de usuario extrema** (velocidad).
