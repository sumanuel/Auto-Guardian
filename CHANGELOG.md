# Changelog - Auto Guardian

## [v1.1.0] - Mejora de Próximos Mantenimientos

### ✨ Nuevas Funcionalidades

#### 🗓️ Programación por Fecha

- **Próximo servicio por fecha**: Ahora puedes programar mantenimientos tanto por kilometraje como por fecha
- **Alertas inteligentes**: El sistema te alertará cuando se acerque cualquiera de los dos criterios (el que ocurra primero)
- **Casos de uso**:
  - Cambio de aceite: cada 10,000 km **o cada 6 meses**
  - Batería: revisar cada **2-3 años** independiente del km
  - Anticongelante: cambiar cada **2 años** o cierto kilometraje
  - Llantas: revisar cada **6 meses** aunque no se haya rodado mucho

### 🎨 Mejoras Visuales

#### Pantalla de Detalle de Vehículo

- Indicadores mejorados mostrando **ambos criterios** (km y fecha) cuando están disponibles
- Iconos específicos para cada tipo:
  - 🏎️ Icono de velocímetro para kilometraje
  - 📅 Icono de calendario para fechas
- Estados visuales:
  - ✅ **Verde**: Mantenimiento al día
  - ⚠️ **Amarillo**: Próximamente (< 30 días o < 2,000 km)
  - 🔴 **Rojo**: Urgente o vencido

#### Historial de Mantenimientos

- Tarjetas rediseñadas mostrando información completa de próximos servicios
- Formato amigable:
  - "En X km" o "Vencido (X km)"
  - "En X días" / "En X semanas" / "En X meses"
  - "Hoy" / "Mañana" para fechas inmediatas

#### Formulario de Agregar Mantenimiento

- Campo **"Próximo servicio (fecha)"** agregado en la sección de opciones desplegables
- Texto de ayuda: _"Útil para servicios por tiempo (ej: cambio de aceite cada 6 meses)"_
- Validación de fecha mínima (no permite fechas pasadas)

### 🛠️ Mejoras Técnicas

#### Base de Datos

- Campo `nextServiceDate` agregado a la tabla `maintenances`
- Compatibilidad con registros existentes (campo opcional)

#### Utilidades Nuevas

- `formatDaysRemaining()`: Formatea días restantes de forma inteligente
  - "Vencido hace X días"
  - "Hoy" / "Mañana"
  - "En X días" / "En X semanas" / "En X meses"
- `formatKmRemaining()`: Formatea kilometraje restante
  - "En X km"
  - "Vencido (X km)"

#### Lógica de Urgencia

- Algoritmo mejorado que evalúa **ambos criterios** simultáneamente
- Prioriza el criterio más urgente automáticamente
- Criterios de urgencia:
  - **Alta**: ≤ 7 días O ≤ 1,000 km O vencido
  - **Media**: ≤ 30 días O ≤ 2,000 km
  - **Baja**: Todo lo demás

### 📱 Experiencia de Usuario

#### Beneficios

1. **Mayor flexibilidad**: Programa mantenimientos como mejor te convenga
2. **No olvides servicios**: Recordatorios por tiempo para quienes usan poco el auto
3. **Información clara**: Visualiza fácilmente cuándo toca el próximo servicio
4. **Alertas inteligentes**: El sistema te avisa con el criterio que se cumpla primero

#### Flujo de Trabajo

1. Al agregar un mantenimiento, expande "Mostrar opciones"
2. Ingresa el próximo servicio por km (si aplica)
3. Ingresa la próxima fecha de servicio (si aplica)
4. El sistema mostrará **ambos** indicadores en las pantallas
5. Recibirás alertas cuando se acerque **cualquiera** de los dos

---

## [v1.0.0] - Lanzamiento Inicial

### Características Base

- ✅ Gestión de múltiples vehículos
- ✅ Registro de mantenimientos
- ✅ Historial completo de servicios
- ✅ Control de gastos
- ✅ Adjuntar fotos de recibos
- ✅ Estadísticas básicas
- ✅ 15 tipos de mantenimiento predefinidos
- ✅ Base de datos SQLite local
- ✅ Navegación fluida con React Navigation
- ✅ Búsqueda de vehículos
- ✅ Tarjetas de vehículos con acciones rápidas
- ✅ Botones de mantenimiento rápido
