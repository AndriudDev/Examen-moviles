# Roadmap — AvistAves

Bitácora de avistamiento de aves (React Native + Expo SDK 57). Estado de avance y plan de trabajo, fase por fase, referenciado a los archivos reales.

---

## Lo que ya existe

| Pieza | Detalle |
|---|---|
| Navegación | 3 rutas (`app/index.tsx`, `app/registrar.tsx`, `app/detalle/[id].tsx`) + `_layout.tsx` con Stack (RF-06 base) |
| Modelo | Tipos `Avistamiento`/`Clima`, `nuevaId()`, `nuevaFechaLocal()` en `modelo/Avistamiento.ts` |
| Validación | RF-01 completa en `modelo/validacion.ts` (foto, ubicación, nombre, cantidad) |
| Estados | `EstadoVacio`/`EstadoCarga`/`EstadoError` en `vista/` (aún sin consumir) |
| Dependencias | `expo-camera`, `expo-location`, `expo-file-system`, `AsyncStorage` instaladas, sin uso |

---

## Pendientes por fase

### 1. RF-01 Registro — `app/registrar.tsx` (hoy es placeholder)

- [ ] Formulario real: nombre, cantidad, fecha editable, notas (la validación ya existe)
- [ ] Captura de foto con `expo-camera` → `BorradorAvistamiento.fotoUri`
- [ ] GPS con `expo-location` → `coordenadas`
- [ ] Guardado del avistamiento en el repositorio (ver RF-05)

### 2. RF-02 Clima Open-Meteo — no existe nada

- [ ] Servicio HTTP a Open-Meteo (lat/lng → `Clima`), con timeout y reintento
- [ ] Caché por ubicación (el README lo promete; sin código)
- [ ] Flujo "guardar sin clima si falla"

### 3. RF-03 Listado — `app/index.tsx` (siempre muestra el estado vacío)

- [ ] Repositorio de datos (AsyncStorage) para leer avistamientos
- [ ] Carga real desde el repositorio, ordenado por fecha desc
- [ ] Tarjeta por avistamiento (miniatura, nombre, cantidad, fecha, temperatura)
- [ ] Filtro (el README lo lista; no existe)
- [ ] Transición vacío → listado con datos

### 4. RF-04 Detalle — `app/detalle/[id].tsx` (hoy es placeholder)

- [ ] Buscar avistamiento por id en el repositorio
- [ ] Foto grande persistente
- [ ] Clima y lugar legibles (reverse geocoding con `expo-location`)

### 5. RF-05 Persistencia — no existe nada

- [ ] Repositorio sobre `AsyncStorage` (CRUD de `Avistamiento`)
- [ ] Mover la foto capturada de caché a archivo persistente vía `expo-file-system`
- [ ] Cargar el listado al arrancar; sobrevive al cierre

### 6. RF-06 Navegación — casi completo

- [ ] Enlazar tarjetas del listado real → detalle
- [ ] Volver desde cada pantalla al origen correcto

### 7. Estilo — spec lista en docs/style.md, nada implementado

- [ ] Paso 1: tokens en `vista/tema.ts` (`tipografia`, `sombra`, +7 colores)
- [ ] Paso 2: cabecera compartida + FAB (quitar `+` del header en `index.tsx`)
- [ ] Paso 3: `TarjetaAvistamiento.tsx` nuevo (avatar iniciales, chips, clima)
- [ ] Paso 4: hero del estado vacío (ilustración/avatar, no emoji)
- [ ] Paso 5: `EstadoCarga`/`EstadoError` con sombra e iconografía
- [ ] Paso 6: formulario estilizado (foco verde + glow)
- [ ] Paso 7: verificación visual

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