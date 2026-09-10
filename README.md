# AvistAves

Bitácora de avistamiento de aves en terreno. Proyecto de la asignatura **Desarrollo de Aplicaciones Móviles** (Instituto Profesional San Sebastián): los voluntarios de la Red de Observadores de Aves registran qué vieron, dónde, con qué evidencia (foto) y bajo qué clima.

- **Framework:** React Native + Expo (SDK 57)
- **Plataforma:** Android (iOS, mediante Expo Go) y web para desarrollo
- **Sin backend:** toda la información vive en el dispositivo

---

## Estado actual

El proyecto tiene implementadas las **fases 1 y 2 del roadmap**: el formulario real con foto del momento y GPS, el clima del momento con Open-Meteo (con caché, timeout y reintento), y el guardado en el dispositivo. Las fases de listado y detalle siguen en construcción.

**Funciona hoy:**

- Navegación con Expo Router (stack nativo): listado, registro y detalle con id dinámico.
- Pantalla de listado con estado vacío diseñado y acceso directo al registro.
- Tema de UI para uso en terreno: **oscuro estilo Bootstrap dark** (fondo `#212529`, tarjetas con borde fino, botones redondeados, verde de marca como acción), alto contraste, objetivos táctiles grandes.
- Modelo de dominio: entidad `Avistamiento`/`Clima`, validación del formulario (RF-01) y traducción del `weather_code` WMO a texto + ícono (`modelo/clima.ts`).
- Registro completo (RF-01): foto tomada en el momento con `expo-camera`, GPS automático con botón «Actualizar ubicación» (`expo-location`, timeout 10 s), fecha editable, cantidad mínima 1 y notas; valida por campo y confirma al guardar.
- Clima del momento (RF-02): al capturar la ubicación se consulta **Open-Meteo** (`modelo/ClimaApi.ts`) con timeout real (AbortController 8 s) + 1 reintento y **caché por ubicación con TTL 15 min**; si la API falla o no hay red, el avistamiento se guarda igual, **sin clima**, y la pantalla avisa con opción a reintentar.
- Persistencia del guardado (RF-05, save path): metadatos en `AsyncStorage`, foto copiada de la caché a un archivo persistente con `expo-file-system`.

**En construcción (próximas fases):**

- Lectura del repositorio y listado con datos reales: miniatura, fecha, temperatura, filtro (RF-03).
- Detalle completo: foto grande, clima y ubicación legibles con reverse geocoding (RF-04).

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
  camara.ts             Adaptador expo-camera (foto del momento)
  ubicacion.ts          Adaptador expo-location (GPS con timeout)
vista/        VISTA: componentes visuales compartidos
  tema.ts           Colores y estilos (contraste para terreno)
  Estado*.tsx       Estados de carga, error y vacío
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
| `npm start -- --tunnel` | Expone el dev server por túnel (útil cuando el teléfono no está en el mismo Wi-Fi) |