# AvistAves

Bitácora de avistamiento de aves en terreno. Proyecto de la asignatura **Desarrollo de Aplicaciones Móviles** (Instituto Profesional San Sebastián): los voluntarios de la Red de Observadores de Aves registran qué vieron, dónde, con qué evidencia (foto) y bajo qué clima.

- **Framework:** React Native + Expo (SDK 57)
- **Plataforma:** Android (iOS, mediante Expo Go) y web para desarrollo
- **Sin backend:** toda la información vive en el dispositivo

---

## Estado actual

El proyecto está en fase de **scaffold**: la arquitectura y la navegación están montadas; las pantallas de periféricos y datos están en construcción.

**Funciona hoy:**

- Navegación con Expo Router (stack nativo): listado, registro y detalle con id dinámico.
- Pantalla de listado con estado vacío diseñado y acceso directo al registro.
- Tema de UI para uso en terreno: alto contraste, objetivos táctiles grandes.
- Modelo de dominio: entidad `Avistamiento`/`Clima` y validación del formulario (RF-01).

**En construcción (próximas fases):**

- Captura de foto con la cámara del dispositivo (`expo-camera`).
- Ubicación GPS automática + lugar legible (`expo-location`).
- Clima del momento con Open-Meteo (caché por ubicación, timeout, reintento).
- Persistencia local: `AsyncStorage` para los datos y sistema de archivos para las fotos.
- Listado con datos reales (miniatura, fecha, temperatura, filtro).
- Detalle completo: foto grande, clima y ubicación legibles.

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