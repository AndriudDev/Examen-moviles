# Style — Guía de estilo y sistema de diseño

Bitácora visual de **AvistAves**. Aplica igual a Android y a la compilación web (mismo stack React Native + Expo); la verificación se hace con `npm run web`.

Este documento es la especificación: define cómo debe **verse** cada pieza. La implementación se hace sobre `vista/tema.ts` (tokens) y los componentes en `app/` y `vista/`.

---

## 1. Diagnóstico: por qué se ve simplona hoy

Estado actual (antes de aplicar este documento):

| Problema | Evidencia en el código |
|---|---|
| Todo plano, sin elevación | no hay un solo `boxShadow` en `vista/tema.ts` |
| Aspecto de "wireframe" | `borderWidth: 2` en campo, tarjeta y botón secundario; los bordes hacen el trabajo que debería hacer la sombra |
| Sin jerarquía tipográfica | un solo tamaño de título (26px) para pantalla, sección y tarjetas |
| Sin personalidad | el único elemento gráfico es un emoji `🐦` de 56px en el estado vacío; botón «+» cuadrado sin iconografía |
| Tarjetas mudas | `tarjeta` solo cambia fondo y borde; no separa visualmente el contenido |
| Estados pobres | `EstadoCarga` es un spinner pequeño suelto; `EstadoError` es texto rojo sobre cartón blanco |

Principio que guía la corrección: la app es una **bitácora de campo**, no un formulario quirúrgico. Debe sentirse hecha a mano, cálida y legible a contraluz — no plana ni generada por plantilla. Corre sobre **tema oscuro inspirado en Bootstrap dark (v5.3)**: fondo gris oscuro `#212529`, tarjetas `#2B3035` con borde fino, botones redondeados y badges píldora; un fondo oscuro deslumbra menos con sol en pantalla que uno claro (requisito de terreno).

---

## 2. Fundamentos

1. **Elevación en vez de bordes.** Las superficies flotan sobre el fondo con sombra; el borde es un detalle, nunca el contorno principal.
2. **Jerarquía tipográfica real.** Tres niveles de texto como mínimo en cada pantalla (título / sección / cuerpo), más una micro-estilo para chips y metadatos.
3. **Alto contraste para terreno** (requisito del dominio): todo texto sobre todo fondo cumple WCAG AA (≥ 4.5:1); los objetivos táctiles miden ≥ 44px.
4. **Un acento por acción.** Verde bosque = acción principal; ámbar = acción secundaria/destacado; rojo = peligro/error. Nunca dos acentos compitiendo en la misma vista.
5. **Microdetalles antes que decoración.** Sombra suave, icono en el botón, avatar con iniciales, estado de presión. Son estos detalles los que eliminan lo "simplona".

---

## 3. Tokens (extensión de `vista/tema.ts`)

### 3.1 Color

Tema **oscuro** con sistema de diseño **inspirado en Bootstrap dark (v5.3)**
(decisión de diseño: fondo oscuro deslumbra menos a contraluz). Paleta
implementada en `vista/tema.ts`:

```ts
export const color = {
  fondo: '#212529',        // --bs-body-bg: cuerpo de la app
  superficie: '#2B3035',   // --bs-secondary-bg: tarjetas, campos y paneles
  texto: '#DEE2E6',        // --bs-body-color: tinta principal
  textoSuave: '#ADB5BD',   // --bs-secondary-color: metadatos y subtítulos
  borde: '#495057',        // --bs-border-color: separación estilo Bootstrap
  primario: '#2F6B3A',     // marca AvistAves: verde bosque (acción principal)
  primarioTexto: '#FFFFFF',
  verdeClaro: '#9FC39F',   // verde texto/borde sobre superficies oscuras
  acento: '#D9A441',       // ámbar nocturno: acción secundaria/destacado
  peligro: '#EF857A',      // rojo claro AA: error sobre cualquier superficie
} as const;
```

Tokens de la fase de componentes (aún no en código; valores para tema oscuro):

```ts
superficieElevada: '#343A40', // --bs-tertiary-bg: paneles sobre superficie
primarioOscuro:   '#24522B', // cabeceras, fondo de badges (texto blanco encima)
exito:            '#2E8B6E', // verde: clima OK, guardado
fondoAcento:      '#3A2F1C', // tinte ámbar para destacados suaves
```

Reglas:

- **Fondo gris oscuro** `#212529` (Bootstrap body-bg) es el cuerpo; `superficie` `#2B3035` eleva tarjetas, campos y paneles sobre él.
- La separación la hacen **bordes finos de 1px `#495057`** (el token `borde` de Bootstrap), no sombras ni bordes gruesos.
- **Verde bosque** `#2F6B3A` es la marca y va en **fondos** (botones, FAB) con texto blanco encima (6.4:1). Como texto o borde sobre superficies oscuras se usa `verdeClaro` `#9FC39F` (≥ 6.8:1).
- Contraste mínimo garantizado: `textoSuave` sobre `fondo` = 7.4:1 ✅ AA; `peligro` (`#EF857A`) sobre `superficie` = 5.3:1 ✅ AA; `acento` (`D9A441`) solo para texto ≥ 14px bold o como fondo con texto `#1F1F1F`.

### 3.2 Tipografía

Familia del sistema por defecto (`Platform.sansSerif`). Variante con personalidad (opcional, requiere `expo-google-fonts`): **Fraunces** para títulos + **Spline Sans** para cuerpo — estética de libro de campo. No bloquear el desarrollo en esto: la jerarquía se resuelve con pesos y tamaños.

Escala:

```ts
export const tipografia = {
  pantalla:   { fontSize: 32, fontWeight: '800', letterSpacing: -0.5, color: color.tintaAve },
  seccion:    { fontSize: 24, fontWeight: '700', letterSpacing: -0.2 },
  tarjeta:    { fontSize: 20, fontWeight: '700' },
  cuerpo:     { fontSize: 16, fontWeight: '400', lineHeight: 22 },
  detalle:    { fontSize: 14, fontWeight: '400', color: color.textoSuave },
  micro:      { fontSize: 12, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase' }, // chips, metadatos
} as const;
```

**Regla de oro:** en un mismo bloque visual nunca coexisten dos textos del mismo tamaño y peso — o difieren en tamaño, o en peso, o en color. El "todo es igual" es lo que aplanaba la pantalla.

### 3.3 Espaciado y radio

Escala en múltiplos de 8, con la mitad para detalles finos:

```ts
export const tamano = {
  // …existentes: toque 48, radio 12, radioTarjeta 16, espacio 16,
  // espacioCompacto 8, espacioGrande 24
  radioPildora: 999,
  radioHero: 24,
  minimo: 4,
  espacioFino: 12,   // entre etiqueta y campo
  contenedor: 32,    // máximo útil entre bloques de sección
} as const;
```

Ritmo: `8` dentro de chips, `16` dentro de tarjetas, `24` entre secciones, `32` entre bloques mayores.

### 3.4 Elevación (sombra nativa, RN ≥ 0.76)

React Native 0.86 soporta `boxShadow`. Tokenizar una altura por pieza; jamás inventar sombras ad-hoc. La API real de RN 0.86 usa `offsetX`/`offsetY`/`blurRadius`/`spreadDistance`; `TextStyle` (campos) solo acepta el glow como string CSS:

```ts
export const sombra = {
  nivel1: { // botones, chips interactivos
    boxShadow: [{ offsetX: 0, offsetY: 2, blurRadius: 8, spreadDistance: 0, color: 'rgba(0,0,0,0.35)' }] as const,
  },
  nivel2: { // tarjetas de contenido
    boxShadow: [{ offsetX: 0, offsetY: 4, blurRadius: 12, spreadDistance: 1, color: 'rgba(0,0,0,0.42)' }] as const,
  },
  nivel3: { // FAB, modales, menús flotantes
    boxShadow: [{ offsetX: 0, offsetY: 6, blurRadius: 16, spreadDistance: 0, color: 'rgba(0,0,0,0.50)' }] as const,
  },
} as const;
```

Umbral de uso: si una pieza no amerita sombra, tampoco amerita borde de 2px. El borde queda reservado para campos de formulario y chips (donde hay que **delimitar un área sobre fondo blanco**).

> Sobre fondo oscuro las sombras negras casi no se perciben: al implementar elevación se sube la opacidad (p. ej. 0.30–0.40) o se acompaña con un borde superior sutil de `borde`.

---

## 4. Componentes

### 4.1 Cabecera de pantalla

Fondo `superficieElevada` con tira de acento (`acento`, 3px) en el borde inferior, título `tipografia.pantalla`, subtítulo `tipografia.detalle` debajo. El botón de nueva acción **no** vive aquí: vive como FAB (ver 4.7).

### 4.2 Tarjeta de avistamiento (la pieza central del listado)

```ts
tarjetaAvistamiento: {
  backgroundColor: color.superficie,
  borderRadius: tamano.radioTarjeta,
  padding: tamano.espacio,
  ...sombra.nivel2,
},
```

Contenido, de arriba hacia abajo:

1. **Avatar del ave** — círculo 56px; iniciales del nombre común, texto 22px `peso 800` sobre fondo derivado deterministicamente del nombre (rotar entre 6 tintes de la paleta: primario, acento, exito, azul `#2F5D7A`, lila `#6A4E7A`, terracota `#A85D3A`). Sustituye al emoji como identidad visual.
2. **Fila de título** — nombre del ave `tipografia.tarjeta` + cantidad como badge (`primarioOscuro`, texto blanco, `radioPildora`).
3. **Metadatos** — fila de chips: fecha, hora, lugar. Estilo chip:
   ```ts
   chip: {
     backgroundColor: color.fondo,        // tinte del fondo, no superficie pura
     borderRadius: tamano.radioPildora,
     paddingVertical: 4, paddingHorizontal: 10,
   },
   chipTexto: { ...tipografia.micro, color: color.textoSuave },
   ```
4. **Clima** — fila propia, derecha: temperatura en `28px / 700` + unidad `detalle`, icono de clima a la izquierda; fondo `exito` al 12% (tinte verde) si hay dato, `textoSuave` si "sin clima" (RF-02 permite guardar sin clima).

La tarjeta se toca → estado presionado: `transform: scale(0.98)` y sombra `nivel1`, 120ms. Retroalimentación táctil sin animaciones largas.

### 4.3 Botones

- **Primario**: `primario`, texto blanco 17px 600, `radioPildora`, paddingVertical 14/horizontal 24, sombra `nivel1`, **con icono** (ver 4.6) antes del texto. Presionado: `scale(0.98)`.
- **Secundario**: `superficie`, borde 2px `primario`, texto `primario` 16px 600, sin sombra (el borde sí cumple aquí).
- **Fantasma** (en tarjetas): sin fondo, texto `primario` 15px 700, área táctil entera ≥ 44px.
- Deshabilitado: `opacity: 0.4`, sin sombra; nunca cambiar solo el color de texto.

Icono + texto es obligatorio en el CTA principal de cada pantalla — un botón desnudo es el sello de lo genérico.

### 4.4 Campos de formulario

```ts
campo: {
  backgroundColor: color.superficie,
  borderWidth: 1,
  borderColor: color.borde,
  borderRadius: tamano.radioBoton,  // 6: radio Bootstrap (0.375rem)
  padding: 12,
  fontSize: 16,
  color: color.texto,
},
campoEnFoco: {
  ...sombra.nivel1,
  borderColor: color.primario,      // borde verde en foco
},
```

Etiqueta `tipografia.detalle` (600) arriba, separada `espacioFino`. El foco usa **borde + sombra** (doble señal): borde **`verdeClaro`** (no `primario`: 2.6:1 sobre `superficie`, fallaría AA) y glow sutil — visible en campo abierto.

### 4.5 Estados

- **Vacío** (RF-03): bloque hero — ilustración (asset PNG/SVG de pájaro en rama, reemplaza el emoji) 120px, título `tipografia.seccion` centrado, cuerpo `tipografia.cuerpo` centrado, CTA primario con icono `+`. La ilustración hace el 80% del trabajo emocional de esta pantalla; sin asset, al menos avatar con iniciales grandes, nunca emoji.
- **Carga**: tarjeta `nivel1` con spinner grande (`size="large"`) + mensaje `cuerpo`, alineados en fila, 16px de gap.
- **Error**: tarjeta `nivel1`, icono ⚠ (no emoji) en círculo tinte `peligro`, mensaje `cuerpo` bold en `peligro`, botón `Reintentar` secundario. Margen 12 entre mensaje y botón.

### 4.6 Iconografía

Sin librería nueva por ahora: usar glifos del set estándar (‹ › + ✓ ⚠) dentro de un **círculo de 44px** con fondo tinte del color de acción — el contenedor, no el glifo desnudo, es lo que da acabado. Cuando llegue la fase de cámara/foto, evaluar `@expo/vector-icons` (solo si el set cubre clima y GPS).

### 4.7 FAB (acción "nuevo")

Sustituye al botón `+` cuadrado del `index.tsx`:

```ts
fab: {
  position: 'absolute',
  right: tamano.espacioGrande, bottom: tamano.espacioGrande,
  width: 64, height: 64,
  borderRadius: 32,
  backgroundColor: color.primario,
  ...sombra.nivel3,
  // "+" 32px blanco, centrado
},
```

Un solo FAB por pantalla, siempre la misma esquina (abajo-derecha), y solo donde la acción principal es "crear". Debajo de él, margen seguro de 96px al contenido scrolleable.

---

## 5. Checklist anti-simplona (para cada pantalla nueva)

- [ ] ¿Cada superficie elevada tiene sombra de su nivel, no borde de 2px?
- [ ] ¿Hay jerarquía de al menos 3 tamaños/estilos de texto distintos?
- [ ] ¿El CTA principal tiene icono + texto?
- [ ] ¿El estado vacío tiene ilustración o avatar, no emoji desnudo?
- [ ] ¿Los chips usan el fondo del tema y `micro` en mayúsculas con letter-spacing?
- [ ] ¿El foco de los campos se ve con borde verde + sombra?
- [ ] ¿El botón responde a presión (scale 0.98, 120ms)?
- [ ] ¿Ningún acento compite (un verde, un ámbar, un rojo máximo por vista)?
- [ ] ¿Contraste AA verificado (≥ 4.5:1) en todo texto?
- [ ] ¿Áreas táctiles ≥ 44px?

---

## 6. Implementación (orden sugerido)

| # | Cambio | Archivos |
|---|---|---|
| 1 | Ampliar tokens: `tipografia`, `sombra`, 10 colores, `radioPildora/hero`, `espacioFino/12` | `vista/tema.ts` |
| 2 | Cabecera compartida + FAB; quitar botón `+` del header | `app/_layout.tsx`, `app/index.tsx` |
| 3 | Tarjeta de avistamiento (`tarjetaAvistamiento`, avatar, chips, clima) | `vista/` (nuevo `TarjetaAvistamiento.tsx`), `app/index.tsx` |
| 4 | Hero del estado vacío con ilustración/avatar | `vista/EstadoVacio.tsx` |
| 5 | Estados carga/error con sombra e iconografía | `vista/EstadoCarga.tsx`, `vista/EstadoError.tsx` |
| 6 | Estilos de formulario (foco, etiquetas) | `app/registrar.tsx` |
| 7 | Verificación visual + contraste | `npm run web` (screenshots Android y web) |

Los pasos 1–5 son independientes del backend y pueden hacerse en la fase actual de scaffold; el paso 6 solo cuando el formulario esté completo.

---

## 7. Verificación

- **Visual**: `npm run web` + dispositivo Android. Comparar pantalla contra este documento pieza por pieza.
- **Contraste**: medir cada par fondo/texto en WebAIM Contrast Checker o `npx color-contrast-checker`; registrar el ratio junto a la pieza.
- **Táctil**: tocar cada objetivo en dispositivo real — nada menor a 44px efectivos.
- **Regresión**: si algo "se ve raro", primero volver a este documento: el problema es una pieza que no cumple su token, no una excepción que justifique.