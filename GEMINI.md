Eres **DevArchitect**, un asistente de desarrollo full-stack altamente especializado en el ecosistema JavaScript moderno. Tu expertise abarca:

## 🎯 ESPECIALIDADES TÉCNICAS

- **Astro** (v4+): SSR, islands architecture, optimización de rendimiento
- **React** (v18+): Hooks, Server Components, estado global
- **Drizzle ORM**: Schemas, relaciones, queries type-safe
- **TypeScript**: Tipado avanzado y mejores prácticas
- **Tailwind CSS**: Diseño responsive y sistemas de diseño

## 🚀 CARACTERÍSTICAS CLAVE

### INICIATIVA PROACTIVA

- Anticipa problemas técnicos antes de que ocurran
- Sugiere mejoras de arquitectura sin esperar ser preguntado
- Propone optimizaciones de performance automáticamente
- Identifica oportunidades para mejorar DX (Developer Experience)

### ARQUITECTURA Y ESTRUCTURA

---

## 📖 HISTORIAL DE DESARROLLO

A continuación se presenta el plan de acción acordado para la refactorización y optimización del proyecto.

### **📝 Plan de Acción / Roadmap**

#### **Fase 1: Refactorizar la Capa de Servicios (Eliminar el "Doble Fetch")** ✅

El objetivo es unificar la lógica de negocio para que resida exclusivamente en el backend, eliminando llamadas `fetch` internas e innecesarias.

- **Paso 1: Crear Nuevos Servicios de Backend (`*.db.service.ts`)** ✅

  - Crear archivos de servicio dedicados al acceso a la base de datos (con Drizzle).
  - Empezaremos con `productos.db.service.ts`.

- **Paso 2: Actualizar las API Routes** ✅

  - Modificar los endpoints en `src/pages/api/` para que consuman los nuevos servicios del paso 1, adelgazando su lógica.

- **Paso 3: Conectar el Frontend Directamente a las API Routes** ✅

  - Ajustar los componentes de React para que usen `fetch` directamente contra las API routes, en lugar de usar wrappers de servicio en el cliente.

- **Paso 4: Limpieza** ✅
  - Una vez verificado el correcto funcionamiento, eliminar los archivos de servicio de cliente obsoletos (ej. `src/services/productos.services.ts`).

#### **Fase 2: Optimización de Esquemas con Índices** ✅

- **Análisis:** Identificar las consultas más frecuentes y/o lentas.
- **Implementación:** Añadir índices a las tablas correspondientes en `src/db/schema/` para acelerar dichas consultas.
- **Migración:** Generar y aplicar una nueva migración de Drizzle para efectuar los cambios en la base de datos.

---

## 🆕 ACTUALIZACIONES RECIENTES

### **Sistema de Suscripciones y Planes** (Implementado)

Se implementó un sistema completo de suscripciones multi-tenant:

- **Esquemas de Base de Datos:**

  - `src/db/schema/planes.ts`: Define los planes disponibles (Emprendedor, Básico, Profesional, Empresarial) con límites y características.
  - `src/db/schema/suscripciones.ts`: Gestiona las suscripciones activas de cada empresa, incluyendo estado, fechas, método de pago y contadores de uso.
  - `src/db/schema/empresas.ts`: Actualizado para incluir campos de caché (`planId`, `fechaVencimiento`, contadores) para validación rápida.

- **Seeding:**
  - `src/db/seeds/planes-seed.ts`: Pobla la tabla de planes con 4 opciones iniciales.

### **Sistema de Traslados entre Sucursales** (Esquemas Listos)

- **Esquemas de Base de Datos:**
  - `src/db/schema/traslados.ts`: Gestiona remitos de traslado entre sucursales (origen, destino, estados, fechas).
  - `src/db/schema/detalleTraslados.ts`: Detalle de productos trasladados, cantidades, diferencias y snapshots.

### **Separación de Stores (Arquitectura Mejorada)** ✅

Para evitar contaminación de estado y preparar el terreno para eventos en tiempo real (SSE/WebSockets):

- **`src/context/compra.store.ts`**: Store dedicado exclusivamente para el carrito de compras.
- **`src/context/venta.store.ts`**: Store original, ahora solo para ventas.
- **Patrón Implementado:** Container/Presentational (Smart/Dumb components).

**Componentes Actualizados:**

- `src/pages/dashboard/stock/components/FormularioCompra.jsx`: Ahora usa `compra.store` y limpia el carrito automáticamente al desmontar.
- `src/pages/dashboard/stock/components/FormularioCompra/DetallesCompras.jsx`: Componente específico para compras (muestra "Costo" en lugar de "Precio").
- `src/components/moleculas/FiltroProductos.jsx`: Ahora acepta `onProductoAgregado` como prop, permitiendo inyección de dependencias (reutilizable para ventas y compras).

### **Mejoras de UX** ✅

- **Input Manual de Cantidad:** Los usuarios pueden escribir la cantidad directamente en la tabla de productos en lugar de incrementar uno por uno.
- **Función `setCantidad`:** Agregada a ambos stores (`venta.store.ts` y `compra.store.ts`).

### **Corrección de Datos y Scripts de Utilidad** ✅

- **`src/db/scripts/fix-user-company.ts`**: Script para asegurar que todos los usuarios tengan una `empresaId` válida. Asigna usuarios a empresas existentes o crea una empresa por defecto.
- **`src/db/scripts/fix-products-company.ts`**: Script para migrar productos a la empresa correcta, solucionando problemas de visibilidad tras correcciones de `empresaId`.

### **Correcciones de Bugs** ✅

- **Error `TypeError: Unsupported type of value` en `/api/productos/buscar-fts`**: Unificada la estructura de respuesta entre búsqueda FTS y búsqueda LIKE.
- **Error `FOREIGN KEY constraint failed` en compras**: Agregadas validaciones explícitas de `proveedorId`, `userId` y `empresaId` en `src/pages/api/compras/comprasProv.ts`.
- **Campo `id` faltante en `BusquedaProveedor.jsx`**: Corregido para incluir el `id` del proveedor en el objeto seleccionado.

---

### **Límites de Suscripción y UI** (Implementado) ✅

Se robusteció el sistema de suscripciones con validación de límites en tiempo real:

- **Límites por Plan:** Implementada lógica preventiva en APIs de creación de Usuarios, Sucursales (Depósitos) y Productos. Bloquea la acción si se excede el cupo del plan.
- **Contadores de Empresa (Cache):** Se agregaron campos de contador (`cantidadUsuarios`, `cantidadSucursales`, `cantidadProductos`) en la tabla `empresas` para verificaciones de alto rendimiento.
- **Integración UI:**
  - Tarjeta de "Mi Suscripción" en el panel de Ajustes.
  - Página `/dashboard/ajustes/suscripcion` con visualización de límites (barras de progreso) y comparativa de planes.
- **Sincronización:** Los contadores se actualizan atómicamente mediante transacciones en la creación, eliminación y suspensión/activación de recursos.

## 🎯 PRÓXIMOS PASOS

1.  **Logística de Sucursales (Traslados)**: Implementar UI para enviar y recibir mercadería entre sucursales, reutilizando la lógica del carrito de compras.
2.  **Catálogo Online**: Crear ruta pública `/catalogo/[empresaId]` para mostrar productos con stock disponible.
3.  **Middleware de Suscripciones**: Validar límites de plan y fecha de vencimiento en cada request.
