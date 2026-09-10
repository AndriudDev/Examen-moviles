# AvistAves

Bitácora de avistamiento de aves en terreno. Proyecto de la asignatura **Desarrollo de Aplicaciones Móviles** (Instituto Profesional San Sebastián): los voluntarios de la Red de Observadores de Aves registran qué vieron, dónde, con qué evidencia (foto) y bajo qué clima.

- **Framework:** React Native + Expo (SDK 57)
- **Plataforma:** Android (iOS, mediante Expo Go) y web para desarrollo
- **Sin backend:** toda la información vive en el dispositivo

---

## Estado actual

El proyecto tiene implementadas las **fases 1 a 8 del roadmap**: el formulario real con foto del momento y GPS, el clima del momento con Open-Meteo (con caché, timeout y reintento), el guardado en el dispositivo, el **listado con los datos reales** (RF-03), el **detalle completo** (RF-04), la **persistencia local** (RF-05), la **navegación completa** (RF-06), el **sistema de diseño de `docs/style.md`** (tokens, cabecera compartida, FAB, tarjetas nuevas, estados, formulario estilizado) y la **ingeniería de calidad** (fase 8: tests de la lógica pura con jest + `jest-expo`, typecheck y `expo-doctor`).

**Funciona hoy:**

- Navegación completa con Expo Router (RF-06): stack nativo con listado, registro y detalle con id dinámico; botón «Volver al listado» desde cada pantalla con fallback si no hay historial, y vuelta al origen tras guardar.
- Pantalla principal de **listado real (RF-03)**: carga desde el repositorio ordenada por fecha (más reciente primero), cabecera compartida + FAB «nuevo», tarjetas con miniatura, nombre + badge de cantidad, chips de fecha/hora/lugar y temperatura grande (o chip «Sin clima»), **filtro por nombre del ave** con foco estilizado y estado vacío con avatar (hero) cuando no hay avistamientos; las tarjetas navegan al detalle.
- **Detalle completo (RF-04)**: foto grande persistente, todos los datos del avistamiento, clima legible (ícono + condición + temperatura + humedad, nunca el `weather_code` crudo) y **lugar legible** con reverse geocoding (`reverseGeocodeAsync` de `expo-location`); estados de carga, error con reintento y aviso «lugar/clima no disponibles» sin bloquear la vista.
- Persistencia (RF-05): metadatos en `AsyncStorage`, foto copiada de la caché a un archivo persistente con `expo-file-system`; el listado y el detalle leen el mismo repositorio al arrancar y el listado se recarga al recuperar el foco (`useFocusEffect`) — los datos y las fotos sobreviven al cierre de la app.
- Estilo (Fase 7): sistema de diseño de `docs/style.md` — tokens (`tipografia`, sombra nativa `boxShadow`, +10 colores), **cabecera compartida** con tira de acento (`vista/Cabecera.tsx`, header nativo oculto), **FAB** único abajo-derecha, tarjeta de avistamiento rediseñada (avatar de iniciales, chips, clima), hero del estado vacío, `EstadoCarga`/`EstadoError` con sombra e iconografía, campos con foco verde + glow (`vista/CampoTexto.tsx`); verificado con `npx tsc --noEmit`, `expo-doctor` (21/21) y revisión visual en `npm run web`.
- Modelo de dominio: entidad `Avistamiento`/`Clima`, validación del formulario (RF-01) y traducción del `weather_code` WMO a texto + ícono (`modelo/clima.ts`).
- Ingeniería (fase 8): suite de **53 tests con jest + `jest-expo`** sobre la lógica pura — `validacion.ts` (RF-01), `clima.ts` (WMO), `construirClima` de `ClimaApi.ts` (sin red) y `vista/formato.ts` — con el mock oficial de AsyncStorage (`jest.setup.ts`); `npx tsc --noEmit` limpio y `expo-doctor` 21/21.
- Registro completo (RF-01): foto tomada en el momento con `expo-camera`, GPS automático con botón «Actualizar ubicación» (`expo-location`, timeout 10 s), fecha editable, cantidad mínima 1 y notas; valida por campo y confirma al guardar.
- Clima del momento (RF-02): al capturar la ubicación se consulta **Open-Meteo** (`modelo/ClimaApi.ts`) con timeout real (AbortController 8 s) + 1 reintento y **caché por ubicación con TTL 15 min**; si la API falla o no hay red, el avistamiento se guarda igual, **sin clima**, y la pantalla avisa con opción a reintentar.

**Pendiente final (entrega):**

- Verificación en teléfono con Expo Go: prueba de humo con cámara, GPS y clima en vivo (registro real → listado → reabrir app → detalle con clima y lugar legibles), y el informe del examen (docs de stack.md §10–12: arquitectura, patrones, optimización de API, demo y declaración de uso de IA).

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Expo SDK 57 (React Native 0.86, TypeScript estricto) |
| Navegación | Expo Router (file-based, `Stack`) |
| Cámara | `expo-camera` |
| GPS / reverse geocoding | `expo-location` |
| Persistencia | `@react-native-async-storage/async-storage` + `expo-file-system` |
| Clima | Open-Meteo (sin API key, sin registro) |
| Almacenamiento de fotos | Sistema de archivos del dispositivo |

---

## Estructura del proyecto (MVC)

```
app/          VISTA: rutas de Expo Router (navegación)
  _layout.tsx       Layout raiz (Stack)
  index.tsx         RF-03 listado
  registrar.tsx     RF-01 + RF-02 registro
  detalle/[id].tsx  RF-04 detalle
modelo/       MODELO: datos, reglas de negocio y persistencia
  Avistamiento.ts   Entidad y tipos
  validacion.ts     Reglas del formulario (RF-01)
  clima.ts          Códigos WMO → texto + ícono (RF-02)
  ClimaApi.ts       Open-Meteo: fetch con timeout, reintento y caché (RF-02)
  RepositoryAvistamientos.ts  Persistencia: AsyncStorage + fotos (RF-05)
controlador/  CONTROLADOR: orquesta vista ↔ modelo y periféricos
  ControladorRegistro.ts  Validación + guardado (RF-01)
  ControladorListado.ts   Carga ordenada + filtro (RF-03)
  ControladorDetalle.ts   Carga por id + lugar legible (RF-04)
  camara.ts             Adaptador expo-camera (foto del momento)
  ubicacion.ts          Adaptador expo-location (GPS + reverse geocoding)
vista/        VISTA: componentes visuales compartidos
  tema.ts           Tokens: colores, tipografia, sombra, estilos (contraste para terreno)
  Cabecera.tsx      Cabecera compartida (tira de acento + zona segura)
  CampoTexto.tsx    Campo de formulario con foco verde + glow
  TarjetaAvistamiento.tsx  Tarjeta del listado (avatar, badges, chips, clima; RF-03)
  Estado*.tsx       Estados de carga, error y vacío (con sombra e iconografía)
  formato.ts        Fechas legibles (compartido listado/detalle)
modelo/__tests__/  Tests de la lógica pura (validación, WMO, ClimaApi, formato)
docs/         brief.md (idea), stack.md (arquitectura), style.md (estilo visual) y roadmap.md (plan de trabajo)
```

La arquitectura y las decisiones técnicas se explican en [docs/stack.md](docs/stack.md).

---

## Requisitos previos

- Node.js (LTS o superior; desarrollado con Node 24)
- App **Expo Go** en el teléfono (Android/iOS)

---

## Ejecución

Instalar dependencias:

```sh
npm install
```

Levantar el dev server:

```sh
npm start
```

- **En el teléfono:** escanear el QR que muestra el terminal con Expo Go (mismo Wi-Fi que la computadora).
- **En el navegador** (solo para desarrollo): presionar `w` en la terminal o `npm run web`.

---

## Requisitos del examen (referencia)

- RF-01 registrar avistamiento (foto, GPS, clima, nombre, fecha, cantidad, notas)
- RF-02 clima del momento vía Open-Meteo (guardar sin clima si la API falla)
- RF-03 listar avistamientos (más reciente primero, miniatura, temperatura, filtro, estado vacío)
- RF-04 ver detalle (foto grande, clima y ubicación legibles)
- RF-05 persistencia local (datos y fotos sobreviven al cierre)
- RF-06 navegación coherente (volver atrás siempre disponible)

El detalle funcional completo está en [docs/brief.md](docs/brief.md).

---

## Más comandos

| Comando | Qué hace |
|---|---|
| `npm run android` | Abre la app en un dispositivo Android conectado (emulador de Android Studio o teléfono con Expo Go) |
| `npm run ios` | Abre la app en el simulador de iOS (solo macOS) |
| `npm run web` | Abre la app en el navegador (solo desarrollo) |
| `npx expo-doctor` | Verifica que el entorno esté sano (versiones de Node, dependencias) |
| `npm test` | Corre la suite de tests (jest) una vez |
| `npm run test:watch` | Corre los tests en modo vigilia (re-ejecuta al cambiar archivos) |
| `npm start -- --tunnel` | Expone el dev server por túnel (útil cuando el teléfono no está en el mismo Wi-Fi) |