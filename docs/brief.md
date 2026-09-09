# AvistAves — Brief del proyecto

**Bitácora de avistamiento de aves · Examen Desarrollo de Aplicaciones Móviles**
Asignatura: Desarrollo de Aplicaciones Móviles · Docente: Boris Belmar
Puntaje: 100 pts · Exigencia: 60% · Entrega: jueves 17 de septiembre de 2026, 23:59

---

## 1. Resumen ejecutivo

La **Red de Observadores de Aves** necesita una app para que sus voluntarios registren avistamientos en terreno. Cuando alguien ve un ave, debe poder dejar constancia de **qué vio, dónde, con qué evidencia (foto) y bajo qué clima**.

- **Plataforma:** Android (y iOS) con **React Native + Expo** — framework elegido.
- **Sin backend:** toda la información vive en el dispositivo (persistencia local).
- **APIs gratuitas:** Open-Meteo para clima (sin API key, sin registro).
- **Entregables:** repositorio GitHub público + informe con demostración (ver §10).

---

## 2. El problema

Un voluntario en terreno:

- Ve un ave y necesita dejar constancia **antes de que pase algo más**.
- No siempre sabe qué ave es (a veces solo «no identificada»).
- Tiene una mano ocupada (binoculares, libreta) y sol en la pantalla.
- Puede estar sin red o con GPS lento.
- No quiere escribir coordenadas a mano ni recordar el clima después.

La app debe resolver el registro **en el momento**, con el mínimo esfuerzo, y conservar los datos hasta que se pueda usar.

---

## 3. Usuario y contexto de uso

| Factor | Implicación de diseño |
|---|---|
| Una mano ocupada | Botones grandes, flujo lineal, mínimos pasos |
| Sol en la pantalla | Alto contraste, jerarquía visual clara |
| Red inestable / sin red | El registro nunca debe bloquearse por problemas de red |
| No identifica el ave | «no identificada» debe ser un nombre válido |
| No escribe coordenadas | GPS automático al abrir el formulario o con botón dedicado |
| Foto como evidencia | Cámara del dispositivo en el momento (no galería) |

---

## 4. La solución en una frase

Tres pantallas: **registrar** un avistamiento con foto, GPS y clima; **listar** los avistamientos más recientes; y **ver el detalle** completo de cada uno.

---

## 5. Requerimientos funcionales

### RF‑01 — Registrar un avistamiento

| Campo | Origen | Obligatorio |
|---|---|---|
| Fotografía | Cámara del dispositivo (en el momento) | Sí |
| Latitud y longitud | GPS del dispositivo (automático) | Sí |
| Clima del momento | API (ver RF‑02) | No |
| Nombre del ave | Texto libre («no identificada» es válido) | Sí |
| Fecha y hora | Automática, editable | Sí |
| Cantidad de ejemplares | Numérico, mínimo 1 | Sí |
| Notas | Texto libre | No |

Reglas de negocio:

- La foto se toma con la cámara **en el momento**; seleccionar de la galería no cumple.
- La ubicación se captura automáticamente (al abrir el formulario o con botón dedicado); el usuario nunca escribe coordenadas a mano.
- Se valida antes de guardar con un mensaje claro que indique **qué campo falta**.
- **No se guarda un avistamiento sin foto ni sin ubicación.**
- Al guardar con éxito: confirmación y vuelta al listado.

### RF‑02 — Obtener el clima del avistamiento

- Una vez capturada la ubicación, se consulta la API de Open-Meteo con esas coordenadas y las condiciones se guardan junto al avistamiento como **dato histórico del momento del registro**.
- Se guarda y muestra como mínimo: **temperatura**, **condición climática** y un **tercer dato** (humedad relativa).
- El `weather_code` llega como número (0 = despejado, 61 = lluvia…): traducirlo a texto e ícono es parte del trabajo.
- **Si la API falla o no hay red, el avistamiento se guarda igual, sin clima.** La app jamás bloquea un registro por un problema de conexión.

### RF‑03 — Listar los avistamientos

Pantalla principal, del **más reciente al más antiguo**. Cada elemento muestra:

- Miniatura de la fotografía
- Nombre del ave
- Fecha del avistamiento
- Temperatura registrada, o un indicador de que no se pudo obtener

Además:

- **Filtro u ordenamiento** a elección: por fecha, por nombre del ave o por cantidad.
- **Estado vacío diseñado** cuando no hay avistamientos todavía (no una pantalla en blanco).
- **Acceso directo** al formulario de registro (RF‑01).

### RF‑04 — Ver el detalle de un avistamiento

- Fotografía en tamaño grande
- Todos los datos del avistamiento
- Clima presentado de forma legible (nunca el `weather_code` crudo)
- Ubicación en **formato entendible para una persona**: mostrar «-33.4489, -70.6693» no cumple. En React Native se usa `reverseGeocodeAsync` de `expo-location` (ver stack.md §6). Se documenta la decisión en el informe.

### RF‑05 — Persistencia de los datos

- Los avistamientos sobreviven al cierre de la app: al reabrirla la lista sigue completa, **incluidas las fotografías**.
- Solución base: `AsyncStorage` (metadatos) + fotos como archivos persistentes de la app (decisión y justificación en stack.md §5).

### RF‑06 — Navegación

- Navegación coherente entre las tres pantallas con el router del ecosistema elegido (**Expo Router**).
- El usuario siempre puede volver atrás sin quedar atrapado en una vista.

---

## 6. Requerimientos no funcionales (también se evalúa)

1. **Estados de carga, error y vacío.** Toda operación asíncrona (cámara, GPS, clima) le dice al usuario qué está pasando. Nunca una pantalla congelada.
2. **Permisos.** Pedir los permisos de cámara y ubicación, explicar para qué se necesitan, y la app no se rompe si el usuario los rechaza.
3. **Optimización del consumo de la API.** Al menos dos medidas implementadas y explicadas en el informe: caché por ubicación, timeout, reintento o renderizado eficiente del listado.
4. **Diseño para terreno.** Jerarquía visual, contraste y espaciados consistentes para uso al aire libre, con una mano y con sol en la pantalla.

---

## 7. Criterios de aceptación

- [ ] La app corre en el teléfono (Expo Go) con cámara y GPS **en vivo y reales**.
- [ ] Se puede registrar un avistamiento completo: foto del momento + ubicación automática + clima.
- [ ] Sin foto o sin ubicación → no se guarda y el mensaje dice qué falta.
- [ ] Con API de clima caída → se guarda igual, sin clima.
- [ ] Al cerrar y reabrir la app, la lista y las fotos siguen ahí.
- [ ] Toda operación asíncrona muestra su estado; rechazar permisos no rompe la app.
- [ ] Informe con las tres explicaciones + demostración + declaración de uso de IA.

---

## 8. Alcance

**Dentro (MVP del examen):** registro, listado, detalle, clima, persistencia local, permisos, estados, optimización de API.

**Fuera de alcance (posibles mejoras futuras, no pedidas):** login, cuenta de usuario, sincronización con servidor, compartir avistamientos, editar/borrar registros (solo la fecha/hora es editable), identificación automática de especies, modo offline con cola de envío.

---

## 9. Riesgos iniciales

| Riesgo | Impacto | Mitigación |
|---|---|---|
| GPS lento o sin señal en terreno | No se puede guardar (requisito) | Estados de carga + reintento + mensaje claro |
| API de clima sin red | Falta un dato opcional | Guardar igual, sin clima |
| Fotos grandes / listado pesado | Rendimiento | Miniaturas comprimidas, renderizado eficiente |
| `reverseGeocodeAsync` requiere una API key | Sin key no responde | Plan B documentado (opciones del enunciado) — ver stack.md |
| Límites de almacenamiento local | Pérdida de datos | Fotos como archivos, no base64 en AsyncStorage |

---

## 10. Entregables

1. **Repositorio en GitHub** — público, con `README.md`.
2. **Informe con demostración** — video (máx. 3 minutos) o PDF/Markdown (con capturas o enlace a la demo). Debe contener:
   - Las explicaciones evaluadas: arquitectura del framework y tres patrones de diseño con ejemplos del propio código.
   - Demo en teléfono o emulador: registrar un avistamiento real, con cámara y GPS en vivo.
   - Declaración de uso de IA: qué se usó y para qué.

---

## 11. Decisiones preliminares

- **Framework:** React Native + Expo.
- **Router:** Expo Router.
- **Cámara:** `expo-camera`. **GPS:** `expo-location`.
- **Clima + ubicación:** Open-Meteo (clima) y `reverseGeocodeAsync` de `expo-location`.
- **Persistencia:** `AsyncStorage` + archivos de fotos en el almacenamiento de la app. Sin base de datos ni servidor.
- **Ejecución en teléfono:** Expo Go.