# Roadmap — AvistAves

Bitácora de avistamiento de aves (React Native + Expo SDK 57). Estado de avance y plan de trabajo, fase por fase, referenciado a los archivos reales.

---

## Lo que ya existe

| Pieza | Detalle |
|---|---|
| Navegación | 3 rutas (`app/index.tsx`, `app/registrar.tsx`, `app/detalle/[id].tsx`) + `_layout.tsx` con Stack (RF-06 completo: vuelta al origen desde cada pantalla y listado que recarga al recuperar el foco) |
| Modelo | Tipos `Avistamiento`/`Clima`, `nuevaId()`, `nuevaFechaLocal()` en `modelo/Avistamiento.ts` |
| Validación | RF-01 completa en `modelo/validacion.ts` (foto, ubicación, nombre, cantidad) |
| Registro (RF-01) | Formulario real en `app/registrar.tsx` con foto del momento (`expo-camera`), GPS automático + botón «Actualizar ubicación» (`expo-location`), validación por campo y confirmación al guardar |
| Clima (RF-02) | `modelo/ClimaApi.ts` consulta Open-Meteo tras capturar la ubicación: timeout real (AbortController 8 s) + 1 reintento + caché por ubicación con TTL 15 min; si falla, la app guarda igual sin clima. `modelo/clima.ts` traduce el `weather_code` WMO a texto + ícono |
| Persistencia (RF-05) | `modelo/RepositoryAvistamientos.ts`: metadatos en AsyncStorage + foto copiada de caché a archivo persistente (`expo-file-system`); lectura completa (listado y detalle) desde el mismo repositorio |
| Controlador | `controlador/ControladorRegistro.ts` valida y guarda; `controlador/camara.ts` y `controlador/ubicacion.ts` aíslan `expo-camera`/`expo-location` (patrón Adapter) |
| Detalle (RF-04) | `app/detalle/[id].tsx` + `controlador/ControladorDetalle.ts`: carga por id (`leerAvistamientoPorId`), foto grande, clima y lugar legibles (reverse geocoding con timeout 8 s, degrada «no disponible»); estados carga/error/inexistente |
| Estados | `EstadoVacio`/`EstadoCarga`/`EstadoError` en `vista/` (consumidos en carga de GPS, cámara y guardado) |
| Tema | Sistema oscuro **inspirado en Bootstrap dark v5.3** en `vista/tema.ts` (`#212529`/`#2B3035`/`#495057`, botones radio 6, tarjetas borde 1px) + `userInterfaceStyle: "dark"`; header del Stack fusionado con el cuerpo |
| Dependencias | `expo-camera`, `expo-location`, `expo-file-system`, `AsyncStorage` instaladas y en uso |

---

## Pendientes por fase

### 1. RF-01 Registro — `app/registrar.tsx` ✅ (fase 1 completada)

- [x] Formulario real: nombre, cantidad, fecha editable, notas (la validación ya existía)
- [x] Captura de foto con `expo-camera` → `BorradorAvistamiento.fotoUri` (calidad 0.7 para miniaturas ligeras)
- [x] GPS con `expo-location` → `coordenadas` (automático al abrir + botón «Actualizar ubicación», timeout 10 s)
- [x] Guardado del avistamiento en el repositorio: AsyncStorage + foto persistente (`modelo/RepositoryAvistamientos.ts`)

### 2. RF-02 Clima Open-Meteo ✅ (fase 2 completada)

- [x] Servicio HTTP a Open-Meteo (`modelo/ClimaApi.ts`, lat/lng → `Clima`) con timeout real (AbortController 8 s) y 1 reintento
- [x] Caché por ubicación con TTL 15 min (clave: coordenadas redondeadas a ~2 decimales ≈ 1 km) en `AsyncStorage`
- [x] Flujo "guardar sin clima si falla": `consultarClima` en `modelo/ClimaApi.ts` nunca lanza; la vista consulta tras el GPS y guarda igual sin `clima` (RF-02)
- [x] Traducción WMO → texto + ícono en `modelo/clima.ts` (patrón Factory, stack.md §9)

### 3. RF-03 Listado — `app/index.tsx` ✅ (fase 3 completada)

- [x] Repositorio de datos (AsyncStorage) para leer avistamientos: `leerAvistamientos()` en `modelo/RepositoryAvistamientos.ts` (la lectura que faltaba desde la fase 1)
- [x] Carga real desde el repositorio, ordenado por fecha desc: `controlador/ControladorListado.ts`
- [x] Tarjeta por avistamiento (`vista/TarjetaAvistamiento.tsx`): miniatura, nombre, cantidad, fecha legible y temperatura, o «Clima no disponible» si no se obtuvo (RF-02)
- [x] Filtro por nombre del ave (insensible a mayúsculas) en `controlador/ControladorListado.ts` + campo sobre el listado
- [x] Transición vacío → listado con datos: estado carga al abrir, vacío diseñado si no hay registros, error con reintento, tarjetas con datos reales
- [x] Tarjetas enlazadas al detalle (`router.push('/detalle/<id>')`, adelanta RF-06)

### 4. RF-04 Detalle — `app/detalle/[id].tsx` ✅ (fase 4 completada)

- [x] Buscar avistamiento por id en el repositorio (`leerAvistamientoPorId` en `modelo/RepositoryAvistamientos.ts`)
- [x] Foto grande persistente (la URI guardada por el repositorio, RF-05)
- [x] Clima y lugar legibles: reverse geocoding con `expo-location` en `controlador/ubicacion.ts` (`obtenerLugarLegible`, timeout 8 s, degrada a «Lugar no disponible» sin bloquear); clima con ícono + condición + temperatura + humedad, nunca el `weather_code` crudo
- [x] Orquestación en `controlador/ControladorDetalle.ts`; estados carga/error/inexistente con reintento y vuelta al listado (RF-06)

### 5. RF-05 Persistencia — ✅ (fase 5 completada)

- [x] Repositorio sobre `AsyncStorage` (CRUD: `guardarAvistamiento`, `leerAvistamientos`, `leerAvistamientoPorId`; editar/borrar fuera de alcance, brief §8)
- [x] Mover la foto capturada de caché a archivo persistente vía `expo-file-system` (`moverFotoAArchivoPersistente`: caché de la cámara → documentos del dispositivo)
- [x] Cargar el listado al arrancar; sobrevive al cierre (recarga del repositorio al montar y al recuperar el foco)

### 6. RF-06 Navegación — ✅ (fase 6 completada)

- [x] Enlazar tarjetas del listado real → detalle (fase 3)
- [x] Volver desde cada pantalla al origen correcto: botón «Volver al listado» en detalle y registro con fallback `canGoBack()` (vuelta nativa o `push('/')` si no hay historial); **tras guardar, toast de confirmación (`vista/Toast.tsx`, raíz) y vuelta directa al listado** (sin pantalla intermedia), que recarga con `useFocusEffect` — el registro nuevo aparece sin reiniciar la app

### 7. Estilo — spec lista en docs/style.md ✅ (fase 7 completada)

- [x] Paso 1: tokens en `vista/tema.ts` (`tipografia`, `sombra` nativa `boxShadow`, +10 colores, `radioPildora/hero`, `espacioFino`); `estilo.cabecera`, `fab`, `badge`, `chip`, `tarjetaAvistamiento`, `campoEnFoco` (foco verde claro + glow, AA sobre oscuro), `iconoCirculo`, `avatarHero`, `filaIcono`, `deshabilitado`
- [x] Paso 2: cabecera compartida (`vista/Cabecera.tsx` con tira de acento + zona segura) y **FAB** de 64px abajo-derecha; el `+` del header se quitó de `index.tsx` (header nativo oculto en `_layout.tsx`, cada pantalla dibuja su cabecera)
- [x] Paso 3: `TarjetaAvistamiento.tsx` nuevo — miniatura, fila de título con badge `×cantidad`, chips micro (fecha, hora, lugar) y clima a la derecha (temperatura 28px/700 + ícono, o chip «Sin clima»); estado presionado `scale(0.98)` + sombra nivel 1
- [x] Paso 4: hero del estado vacío con **avatar de iniciales** `AV` de 120px (sin asset ilustrativo; nunca emoji), título sección + cuerpo centrados y CTA primario con icono `+`
- [x] Paso 5: `EstadoCarga` (spinner grande + mensaje, tarjeta nivel 1) y `EstadoError` (ícono ⚠ en círculo tinte peligro, mensaje bold en peligro, botón «Reintentar»)
- [x] Paso 6: formulario estilizado — `vista/CampoTexto.tsx` con foco verde + glow en todos los campos (listado y registro), etiquetas `detalle`, CTA «Guardar» con icono `✓` en círculo
- [x] Paso 7: verificación visual en web (`npm run web`): cabecera/hero/FAB/tarjetas/chips/clima/foco/error comprobados en el navegador; `npx tsc --noEmit` limpio

Notas de implementación: `boxShadow` usa la API real de RN 0.86 (`offsetX/offsetY/blurRadius/spreadDistance`, no `offsetWidth`); `TextStyle` (campo) recibe el glow como string CSS; contraste verificado: `verdeClaro` (6.8:1) en el foco en vez de `primario` (2.6:1 sobre `superficie`, fallaría AA) — style.md §4.4 actualizado.

### 8. Ingeniería

- [ ] Tests — no hay ninguno; `validacion.ts` es pura y la más fácil de cubrir primero
- [ ] Correr `expo-doctor` (entorno nunca verificado)
- [ ] `EstadoCarga`/`EstadoError` no se consumen — se verifican en fases de periféricos

---

## Dependencias entre bloques

- La UI de listado/detalle (3–4) depende del repositorio (5).
- El formulario real (1) depende de cámara/GPS y clima (2).
- El estilo (7) es independiente y puede ir ya.
- Orden recomendado de ejecución:
  - **Con backend primero:** 5 → 3 → 4 → 1 → 2 (la persistencia habilita todo).
  - **Con fachada primero:** 7 antes que todo (dejar la UI lista mientras el motor se construye).

---

## Fases completadas

- Scaffold: arquitectura MVC, navegación, modelo y validación (`first commit`).
- App movida a la raíz del repo (`refactor: mover app a la raíz del repo`).
- Guía de estilo `docs/style.md` creada.
- Fase 1 (RF-01 Registro): formulario real en `app/registrar.tsx`, adaptadores de cámara y GPS (`controlador/camara.ts`, `controlador/ubicacion.ts`), `controlador/ControladorRegistro.ts` y guardado con foto persistente (`modelo/RepositoryAvistamientos.ts`, RF-05 save path).
- Fase 2 (RF-02 Clima Open-Meteo): `modelo/ClimaApi.ts` (fetch con timeout + reintento + caché por ubicación con TTL), `modelo/clima.ts` (WMO → texto/ícono) e integración en el registro: tras capturar el GPS se consulta el clima y, si la API falla, se guarda igual sin clima.
- Fase 3 (RF-03 Listado): lectura del repositorio (`leerAvistamientos`), `controlador/ControladorListado.ts` (carga ordenada por fecha desc + filtro por nombre), `vista/TarjetaAvistamiento.tsx` (miniatura, nombre, cantidad, fecha, temperatura o «sin clima») y `app/index.tsx` con estados carga/error/vacío; las tarjetas navegan al detalle (RF-06).
- Fase 4 (RF-04 Detalle): `controlador/ControladorDetalle.ts` + `leerAvistamientoPorId` en el repositorio; pantalla `app/detalle/[id].tsx` con foto grande, todos los datos, clima legible (ícono + condición + temperatura + humedad) y lugar legible vía reverse geocoding (`obtenerLugarLegible` en `controlador/ubicacion.ts`, timeout 8 s, degrada sin bloquear); estados de carga/error/inexistente con reintento y vuelta al listado; `vista/formato.ts` compartido con la tarjeta del listado.
- Fase 5 (RF-05 Persistencia): repositorio `modelo/RepositoryAvistamientos.ts` completo — `guardarAvistamiento` (foto copiada de la caché de la cámara a documentos vía `expo-file-system`, metadatos en AsyncStorage), `leerAvistamientos` y `leerAvistamientoPorId`; el listado carga del repositorio al arrancar y recarga al recuperar el foco (`useFocusEffect` en `app/index.tsx`); datos y fotos sobreviven al cierre de la app.
- Fase 6 (RF-06 Navegación): vuelta al origen correcto desde cada pantalla — botón «Volver al listado» en el detalle y en el registro con fallback `canGoBack()` (vuelta nativa o `push('/')` sin historial); tras guardar, toast de confirmación (`vista/Toast.tsx`) que devuelve directo al listado ya refrescado.
- Fase 7 (Estilo): sistema de diseño de `docs/style.md` implementado — tokens (`tipografia`, `sombra` `boxShadow` nativa, +10 colores), cabecera compartida con tira de acento (`vista/Cabecera.tsx`, header nativo del Stack oculto), FAB único, `TarjetaAvistamiento` nueva (avatar de iniciales pendiente de asset, badge ×cantidad, chips, clima grande), hero del estado vacío con avatar `AV`, `EstadoCarga`/`EstadoError` con sombra e iconografía (glifo en círculo), campos con foco verde + glow (`vista/CampoTexto.tsx`); verificado con `npx tsc --noEmit`, `expo-doctor` (21/21) y revisión visual en `npm run web`.