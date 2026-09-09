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

Principio que guía la corrección: la app es una **bitácora de campo**, no un formulario quirúrgico. Debe sentirse hecha a mano, cálida y legible a contraluz — no plana ni generada por plantilla.

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

Paleta actual conservada como base; se agregan 7 tokens:

```ts
export const color = {
  // …existentes: fondo #F6F2E9, superficie #FFFFFF, texto #1F1F1F,
  // textoSuave #5A5A5A, primario #2F6B3A, primarioTexto #FFFFFF,
  // acento #C7791E, peligro #B3261E, borde #D9D3C6

  superficieElevada: '#FFFDF9', // tarjetas y paneles sobre superficie blanca
  primarioOscuro:   '#1E4A26', // cabeceras, fondo de badges principales
  exito:            '#1B6B5A', // verde petróleo: clima OK, guardado
  fondoAcento:      '#FBF3E4', // tinte ámbar para destacados suaves
  tintaAve:         '#3E3A33', // marrón tinta: títulos sobre claro
  sombraNivel1:     '#1F1F1F', // + opacidad 0.06, ver §3.4
  sombraFuerte:     '#000000', // + opacidad 0.14, para FAB y modales
} as const;
```

Reglas:

- **Fondo crema** `#F6F2E9` es la "hoja de bitácora": todo el contenido vive sobre él.
- **Verde bosque** `#2F6B3A` es la marca; `primarioOscuro` `#1E4A26` solo para cabeceras y sellos, nunca para botones.
- **Texto**: `tintaAve` para títulos grandes, `texto` para cuerpo, `textoSuave` para metadatos. Nunca gris sobre gris.
- Contraste mínimo garantizado: `textoSuave` (5A5A5A) sobre fondo (F6F2E9) = 6.3:1 ✅ AA; `acento` (C7791E) solo para texto ≥ 14px bold o como fondo con texto `#1F1F1F`.

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

React Native 0.86 soporta `boxShadow`. Tokenizar una altura por pieza; jamás inventar sombras ad-hoc:

```ts
export const sombra = {
  nivel1: { // botones, chips interactivos
    boxShadow: { color: 'rgba(31,31,31,0.06)', offsetWidth: 0, offsetHeight: 2, blurRadius: 8, spreadRadius: 0 } as const,
  },
  nivel2: { // tarjetas de contenido
    boxShadow: { color: 'rgba(31,31,31,0.12)', offsetWidth: 0, offsetHeight: 4, blurRadius: 12, spreadRadius: 1 } as const,
  },
  nivel3: { // FAB, modales, menús flotantes
    boxShadow: { color: 'rgba(0,0,0,0.14)', offsetWidth: 0, offsetHeight: 6, blurRadius: 16, spreadRadius: 0 } as const,
  },
} as const;
```

Umbral de uso: si una pieza no amerita sombra, tampoco amerita borde de 2px. El borde queda reservado para campos de formulario y chips (donde hay que **delimitar un área sobre fondo blanco**).

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
     backgroundColor: color.fondo,        // tinte crema, no blanco puro
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
  borderWidth: 1.5,
  borderColor: color.borde,
  borderRadius: tamano.radio,       // 12: contenido, no píldora
  padding: 12,
  fontSize: 16,
  color: color.texto,
},
campoEnFoco: {
  ...sombra.nivel1,
  borderColor: color.primario,      // borde verde en foco
},
```

Etiqueta `tipografia.detalle` (600) arriba, separada `espacioFino`. El foco usa **borde + sombra** (doble señal): borde `primario` y glow sutil — visible en campo abierto.

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
- [ ] ¿Los chips usan fondo crema y `micro` en mayúsculas con letter-spacing?
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