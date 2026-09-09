# AvistAves — Stack y arquitectura

Documento técnico de decisión y diseño. El brief (idea, alcance, requisitos) está en `docs/brief.md`.

---

## 1. Decisión de stack

| Capa | Elección | Justificación |
|---|---|---|
| Framework | **React Native + Expo** | Framework del enunciado; ecosistema React; `expo-camera` y `expo-location` cubren cámara y GPS; Expo Go corre en el teléfono sin build local de Android |
| Router | **Expo Router** | Router oficial del ecosistema Expo, basado en archivos; cumple «router propio del framework» |
| Cámara | `expo-camera` | Foto tomada en el momento con la cámara del dispositivo (RF‑01) |
| GPS | `expo-location` | Captura automática desde el dispositivo; incluye `reverseGeocodeAsync` (RF‑01, RF‑04) |
| Persistencia | `AsyncStorage` + archivos de fotos | Storage local que sobrevive al cierre; alcanza para el alcance (RF‑05, ver §5) |
| Clima | **Open-Meteo** (`api.open-meteo.com`) | Gratuita, sin API key, sin registro (RF‑02) |
| Ubicación legible | `reverseGeocodeAsync` (plan B) | RF‑04; ver §6.4 |
| Backend | **Ninguno — todo local** | Sin servidor ni base de datos; el storage del dispositivo cubre el alcance |

---

## 2. Cómo funciona el framework por dentro (base del informe)

- **React Native:** framework sobre React que ejecuta la lógica en un runtime de JavaScript dentro de la app nativa (Android/iOS). Los componentes de React se renderizan como **vistas nativas** (no HTML), a través de un puente entre el hilo de UI nativa y el runtime de JS. Por eso no hay que «reinventar» la UI para cada plataforma: un solo código fuente produce controles nativos.
- **Expo:** toolchain y SDK sobre React Native.
  - **SDK de Expo:** bundle de módulos probados juntos (`expo-*`), versionados como unidad.
  - **Expo Go:** app de teléfono que recibe el proyecto por QR (vía `npx expo start`) y lo ejecuta en el dispositivo real, sin instalar toolchain de Android — justo lo que pide la rúbrica para correr en el teléfono.
  - **Expo Router:** router oficial basado en el sistema de archivos: cada archivo en `app/` es una ruta.
  - **Config plugins / permisos:** la configuración del proyecto (declarar por ejemplo el permiso de cámara en la config de Expo según la versión de SDK fijada en el scaffold).

> En el informe: explicar estos roles con la terminología correcta (runtime nativo, puente/bridge, SDK, router, config plugins) y señalar qué pieza de Expo se usó para qué.

---

## 3. Estructura del repositorio (MVC)

Arquitectura **Modelo‑Vista‑Controlador**:

- **Modelo** (`modelo/`) — datos, reglas de negocio y persistencia. No sabe de pantallas.
- **Vista** (`app/` + `vista/`) — pantallas (rutas de Expo Router) y componentes visuales. No contiene lógica de negocio.
- **Controlador** (`controlador/`) — orquesta: recibe la acción del usuario desde la vista, usa el modelo y los periféricos (cámara, GPS), y devuelve a la vista qué mostrar.

```
avistaves/
├── app/                        # VISTA — rutas de Expo Router
│   ├── index.tsx               # RF-03 Pantalla de listado (principal)
│   ├── registrar.tsx           # RF-01 + RF-02 Pantalla de registro
│   └── detalle/[id].tsx        # RF-04 Pantalla de detalle
├── modelo/                     # MODELO — datos, reglas, persistencia
│   ├── Avistamiento.ts         # Entidad y tipos (Avistamiento, Clima)
│   ├── validacion.ts           # Reglas RF-01 (mensajes por campo)
│   ├── RepositoryAvistamientos.ts  # AsyncStorage + fotos (RF-05)
│   ├── clima.ts                # WMO → texto + ícono (presentación de datos)
│   └── ClimaApi.ts             # Open-Meteo: fetch, timeout, caché (RF-02)
├── controlador/                # CONTROLADOR — orquesta vista ↔ modelo
│   ├── ControladorRegistro.ts  # Cámara + GPS + clima + guardado (RF-01/02)
│   ├── ControladorListado.ts   # Carga, orden por fecha, filtro (RF-03)
│   ├── ControladorDetalle.ts   # Carga detalle + clima/ubicación legibles (RF-04)
│   ├── camara.ts               # expo-camera: permisos, captura (adaptador)
│   └── ubicacion.ts            # expo-location: GPS + reverse geocode (adaptador)
├── vista/                      # VISTA — componentes compartidos
│   ├── TarjetaAvistamiento.tsx # Tarjeta del listado (RF-03)
│   ├── EstadoVacio.tsx         # Estado sin avistamientos (RF-03)
│   ├── EstadoCarga.tsx         # Indicador «cargando» (toda operación async)
│   └── EstadoError.tsx         # Error con acción de reintento
├── assets/                     # Estilos/tema (contraste para terreno)
├── docs/                       # brief.md, stack.md (este documento)
└── app.json / package.json
```

---

## 4. Modelo de datos

```ts
type Clima = {
  temperaturaC: number;        // current.temperature_2m
  condicion: string;           // weather_code traducido: "Lluvia ligera"
  icono: string;               // ícono asociado a la condición
  humedadPct: number;          // tercer dato: current.relative_humidity_2m
  weatherCode: number;         // crudo, se guarda como dato histórico
  consultadoEn: string;        // ISO
};

type Avistamiento = {
  id: string;                  // UUID o timestamp
  nombre: string;              // texto libre; "no identificada" es válido
  cantidad: number;            // entero >= 1
  fecha: string;               // ISO, automática y editable (RF-01)
  notas?: string;
  lat: number;                 // GPS del dispositivo
  lng: number;
  lugar?: string;              // resultado del reverse geocoding (RF-04)
  clima?: Clima;               // ausente si la API falló (RF-02)
  fotoUri: string;             // archivo de foto persistente (RF-05)
  creadoEn: string;
};
```

- **Fecha/hora:** se guarda como ISO 8601 con zona horaria local; la interface la muestra formato legible local.
- **Tercer dato climático:** humedad relativa (%); es el dato más útil para observación de aves después de temperatura y condición.

---

## 5. Persistencia (RF‑05)

**Decisión: metadatos en `AsyncStorage` + fotos como archivos persistentes.**

- `AsyncStorage` guarda el JSON de los avistamientos (una fila maestra o una por registro). Es síncrono de cara a la lógica, sobrevive al cierre y está listo al reabrir.
- **Las fotos NO van en base64 dentro de AsyncStorage.** Los valores de AsyncStorage tienen límites prácticos de tamaño (del orden de MB por valor); varias fotos base64 lo agotarían y ralentizarían la lectura. En su lugar:
  1. `expo-camera` captura a un archivo temporal (URI de caché).
  2. Se copia el archivo al almacenamiento persistente de la app (directorio de documentos, con las APIs de archivos del SDK de Expo) y se guarda esa URI en el registro.
  3. El listado y el detalle cargan la foto desde la URI local.
- **Sin base de datos ni servidor.** La persistencia es 100% local en el dispositivo: `AsyncStorage` para los datos estructurados y el sistema de archivos para las fotos. El storage del dispositivo alcanza para el alcance del examen.
- Justificación en el informe: AsyncStorage para datos pequeños estructurados + sistema de archivos para binarios grandes; las fotos nunca van en base64.

---

## 6. Servicios, flujos y permisos

### 6.1 Cámara (RF‑01)

- Permiso declarado en la configuración del proyecto (permisos Android de Expo para `expo-camera`, según la versión de SDK que se fije en el scaffold) **y** pedido en runtime: la primera vez que se abre la cámara, el sistema operativo pide autorización.
- Flujo: abrir cámara → el usuario dispara → `takePictureAsync` devuelve URI → **preview** → al guardar, copiar a almacenamiento persistente (§5).
- Si el permiso se rechaza: mensaje claro («Para registrar la evidencia necesitamos acceso a la cámara») y la app no se rompe; el formulario lo bloquea en el guardado, porque la foto es obligatoria (RF‑01).

### 6.2 GPS (RF‑01)

- Al abrir el formulario se intenta captura automática; además hay **botón dedicado** para recapturar («Actualizar ubicación») y el usuario nunca escribe coordenadas.
- `expo-location`: `requestPermissionsAsync()` (explica el uso) → `getCurrentPositionAsync({ accuracy: 1 })` con timeout (ej. 10 s) y opción de reintento.
- Si no hay señal o se rechaza el permiso: estado de error visible con opción a reintentar; el guardado queda bloqueado mostrando «falta la ubicación» porque es obligatoria.

### 6.3 Clima — Open-Meteo (RF‑02, RF‑04)

```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={lat}&longitude={lng}
  &current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code
```

- Se consulta **después** de capturar la ubicación, con timeout (AbortController) y **1 reintento**. Si falla → el avistamiento se guarda sin `clima` (RF‑02).
- Mapeo de `weather_code` (WMO) a texto + ícono — vive en `modelo/clima.ts`:

| Códigos WMO | Condición | Ícono |
|---|---|---|
| 0 | Despejado | ☀️ |
| 1, 2 | Mayormente despejado | 🌤️ |
| 3 | Nublado | ☁️ |
| 45, 48 | Niebla | 🌫️ |
| 51–57 | Llovizna | 🌦️ |
| 61–67 | Lluvia | 🌧️ |
| 71–77 | Nieve | ❄️ |
| 80–82 | Chubascos | 🌦️ |
| 85, 86 | Chubascos de nieve | 🌨️ |
| 95–99 | Tormenta | ⛈️ |

- En el detalle (RF‑04) se muestra: ícono + condición + temperatura (°C) + humedad (%), y si no hay clima, un indicador «Clima no disponible» (la app igual guardó el registro).

### 6.4 Ubicación legible (RF‑04)

- **Principal:** `reverseGeocodeAsync(latitude, longitude)` de `expo-location` (implica configurar una API key en el proyecto; sin key no responde). Resultado (`formattedAddress`) se muestra en el detalle como «lugar».
- **Plan B (si no se puede usar la key):** las opciones que da el propio enunciado — el endpoint de geocoding de Open-Meteo, otra API gratuita, o guardar una referencia escrita por el usuario. Se implementa en el mismo adaptador `controlador/ubicacion.ts`. La decisión final y su motivo se documentan en el informe, como pide la rúbrica.

---

## 7. Navegación (RF‑06)

- **Expo Router**: rutas por archivos en `app/` — `index` (listado), `registrar`, `detalle/[id]`.
- Transiciones: listado → detalle con `Link`/`router.push`; «volver atrás» con `router.back()`; tras guardar (RF‑01), redirección explícita al listado.
- No hay rutas que atrapen al usuario: cada pantalla ofrece vuelta al listado o atrás.

---

## 8. Optimización del consumo de la API (≥ 2 medidas + informe)

1. **Caché por ubicación (con TTL).** Las coordenadas se redondean a ~2 decimales (~1 km) como clave; el resultado del clima se reutiliza si es de hace menos de un TTL (ej. 15–30 min). Un voluntario registra varios avistamientos en el mismo lugar → **una sola llamada**.
2. **Timeout + reintento.** `AbortController` con timeout (ej. 8 s) y 1 reintento; si ambos fallan, se guarda sin clima. Evita pantallas colgadas y genera el estado de error correcto (RF‑02).
3. **Renderizado eficiente del listado (bonus).** Lista virtualizada/flat list + miniaturas con resolución limitada para no cargar ni decodificar fotos de tamaño completo en la lista.

En el informe: explicar medidas 1 y 2 (y 3 si entra), señalando dónde está el código.

---

## 9. Patrones de diseño (mapeo a código — para el informe, 12 pts)

| Patrón | Dónde aparece en el framework | Dónde en nuestro código |
|---|---|---|
| **Adapter** | Expo/React Native envuelven APIs nativas (cámara, GPS) para exponerlas a JS | `controlador/camara.ts`, `controlador/ubicacion.ts` aíslan `expo-camera`/`expo-location` del resto de la app |
| **Repository** | Separar acceso a datos del dominio | `modelo/RepositoryAvistamientos.ts` encapsula AsyncStorage + archivos de fotos |
| **Factory** | Crear instancias según un código/condición | `modelo/clima.ts`: `weather_code` (número) → objeto `Clima` (texto, ícono, color) |
| **Observer** | Modelo de React/React Native: el estado cambia → se re-renderizan los suscriptores (componentes) | Cada pantalla reacciona al estado de su controlador (carga, error, datos nuevos) |
| **Singleton** | Módulos nativos y servicios importados son instancia única compartida | `controlador/camara.ts` y `controlador/ubicacion.ts` importados como módulos únicos |

En el informe: elegir **tres**, y para cada uno mostrar el fragmento concreto del código del repo (sin ejemplo del propio código no hay puntaje completo).

---

## 10. Diseño de UI para terreno (RF‑01 a RF‑04, 12 pts)

- **Jerarquía:** tarjeta de avistamiento con foto como elemento dominante; nombre del ave y fecha en segundo plano.
- **Contraste alto** (fondo claro/tema oscuro, texto 4.5:1 mínimo) para lecturas con sol.
- **Objetivos táctiles ≥ 48 px**, botones primarios grandes al alcance del pulgar; flujo de registro lineal de arriba a abajo.
- **Estados siempre visibles**: skeleton/«Obteniendo ubicación…», «Consultando clima…», error con acción (reintentar), estado vacío ilustrado en el listado.
- **Espaciados consistentes** y un único tema de colores (valores en `assets/`).

---

## 11. Plan de implementación

| Fase | Qué | Verificación |
|---|---|---|
| 0 Scaffold | `create-expo-app` + Expo Router + tema base | La app abre en Expo Go |
| 1 Modelo | `modelo/`: entidad, validación, `RepositoryAvistamientos` (AsyncStorage + fotos) | Guardar/cargar JSON y archivos en el dispositivo |
| 2 Periféricos | `controlador/camara.ts` (`expo-camera`) y `controlador/ubicacion.ts` (`expo-location`) | Foto del momento y coordenadas reales capturadas |
| 3 Clima | `modelo/ClimaApi.ts`: Open-Meteo con caché, timeout, reintento; `modelo/clima.ts` (WMO) | Clima legible guardado; falla de red → registro sin clima |
| 4 Vista listado | `app/index.tsx` + `vista/`: orden por fecha desc, miniatura, temperatura, filtro, estado vacío | Lista correcta con y sin datos |
| 5 Vista registro + detalle | `app/registrar.tsx` y `app/detalle/[id].tsx` con sus controladores | Validación RF-01; detalle con clima y ubicación legibles |
| 6 Informe + demo + repo | Las explicaciones, capturas/video, README, commits | Rúbrica 100 pts: evidencia por indicador (§12) |

---

## 12. Estrategia de verificación (rúbrica → evidencia)

| Indicador (máx) | Dónde se demuestra | Evidencia |
|---|---|---|
| Conceptos del framework (10) | §2 de este doc → informe | Explicación con terminología correcta |
| Patrones de diseño (12) | §9 | 3 patrones con fragmentos del repo |
| Principios de diseño UI (12) | §10 | Capturas de las 3 pantallas |
| Componentes de UI (12) | RF‑01, RF‑03, RF‑06 | Formulario validado, tarjetas de lista, navegación |
| Interfaces intuitivas (12) | Estados, permisos, validaciones | Video/capturas de carga, error, vacío, rechazo de permisos |
| Periféricos (10) | RF‑01 | Demo en teléfono: cámara y GPS reales en vivo |
| Integración con API (10) | RF‑02, RF‑04 | Clima legible + ubicación legible en detalle |
| Optimización de API (10) | §8 | Medidas 1 y 2 explicadas con código |

**Prueba de humo final (en teléfono con Expo Go):** registrar un avistamiento real (foto + GPS en vivo + clima) → aparece en el listado → reabrir app → sigue todo, incluidas las fotos → detalle con clima y lugar legibles → probar rechazando permisos y con red apagada (registro sin clima, sin bloqueo).

---

## 13. Riesgos técnicos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| `reverseGeocodeAsync` puede exigir una API key | Plan B documentado (§6.4); se decide en la fase 5 |
| AsyncStorage lleno / fotos pesadas | Fotos como archivos (§5); miniaturas limitadas en el listado (§8.3) |
| Emulador sin cámara ni GPS confiable | Demo siempre en teléfono real con Expo Go (así lo pide la entrega) |
| Permisos rechazados por el usuario | Estados de error + explicación; la app no se rompe (§6.1–6.2) |
| SDK/versionado de Expo cambiante (config de permisos) | Fijar versión en el scaffold y documentar la config exacta usada |