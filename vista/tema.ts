import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';

/**
 * Tema de UI para uso en terreno (OSCURO) con sistema de diseño inspirado
 * en **Bootstrap dark (v5.3)**: superficies grises oscuras, bordes finos
 * de 1px (#495057), botones redondeados y badges píldora. La marca de
 * AvistAves (verde bosque) se conserva como color de acción.
 * Todos los pares texto/fondo cumplen WCAG AA (≥ 4.5:1).
 */
export const color = {
  // Neutros Bootstrap dark (v5.3)
  fondo: '#212529',        // --bs-body-bg: cuerpo de la app
  superficie: '#2B3035',   // --bs-secondary-bg: tarjetas, campos y paneles
  texto: '#DEE2E6',        // --bs-body-color: tinta principal
  textoSuave: '#ADB5BD',   // --bs-secondary-color: metadatos y subtítulos
  borde: '#495057',        // --bs-border-color: separación estilo Bootstrap
  // Marca AvistAves: verde bosque para la acción principal
  primario: '#2F6B3A',     // botones, FAB (texto blanco encima 6.4:1)
  primarioTexto: '#FFFFFF',
  verdeClaro: '#9FC39F',   // verde texto/borde sobre superficies oscuras (6.8:1)
  acento: '#D9A441',       // ámbar nocturno: acción secundaria/destacado
  peligro: '#EF857A',      // rojo claro AA: error sobre cualquier superficie (≥ 4.5:1)
  // Fase de componentes (style.md §3.1)
  superficieElevada: '#343A40', // --bs-tertiary-bg: cabecera, paneles sobre superficie
  primarioOscuro: '#24522B',    // badges, tintes de la marca (texto blanco encima)
  exito: '#2E8B6E',             // verde: clima OK, guardado
  fondoAcento: '#3A2F1C',       // tinte ámbar para destacados suaves
  // Tintes de avatar (style.md §4.2): rotan según el nombre del ave
  azul: '#2F5D7A',
  lila: '#6A4E7A',
  terracota: '#A85D3A',
} as const;

/** Tintes para el avatar de iniciales: derivados deterministicamente del nombre. */
export const tintesAvatar = [
  color.primario,
  color.acento,
  color.exito,
  color.azul,
  color.lila,
  color.terracota,
] as const;

/**
 * Escala tipográfica (style.md §3.2): tres niveles de texto por pantalla
 * como mínimo (título / sección / cuerpo) + micro para chips y metadatos.
 * Regla de oro: en un mismo bloque nunca coexisten dos textos del mismo
 * tamaño y peso.
 */
export const tipografia = {
  pantalla: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5, color: color.texto },
  seccion: { fontSize: 24, fontWeight: '700', letterSpacing: -0.2, color: color.texto },
  tarjeta: { fontSize: 20, fontWeight: '700', color: color.texto },
  cuerpo: { fontSize: 16, fontWeight: '400', lineHeight: 22, color: color.texto },
  detalle: { fontSize: 14, fontWeight: '400', color: color.textoSuave },
  micro: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: color.textoSuave,
  },
} as const;

export const tamano = {
  toque: 48,               // objetivo táctil mínimo
  radioBoton: 6,           // --bs-border-radius (0.375rem): botones y campos
  radio: 12,               // contenido general
  radioTarjeta: 16,        // tarjetas (style.md §3.3)
  radioPildora: 999,       // badges y chips
  radioHero: 24,           // ilustraciones/avatar del hero
  espacio: 16,
  espacioCompacto: 8,
  espacioGrande: 24,
  minimo: 4,               // detalles finos
  espacioFino: 12,         // entre etiqueta y campo
  contenedor: 32,          // máximo útil entre bloques de sección
} as const;

/**
 * Elevación por sombra nativa (`boxShadow`, RN ≥ 0.76, API instalada 0.86:
 * offsetX/offsetY/spreadDistance). Nunca sombras ad-hoc.
 * Sobre fondo oscuro las sombras negras casi no se perciben: se sube la
 * opacidad (0.35–0.50) y las tarjetas se acompañan con borde fino (style.md §3.4).
 */
export const sombra: Record<string, ViewStyle> = {
  nivel1: {
    // botones, chips interactivos, tarjetas de estado
    boxShadow: [
      { offsetX: 0, offsetY: 2, blurRadius: 8, spreadDistance: 0, color: 'rgba(0,0,0,0.35)' },
    ],
  },
  nivel2: {
    // tarjetas de contenido
    boxShadow: [
      { offsetX: 0, offsetY: 4, blurRadius: 12, spreadDistance: 1, color: 'rgba(0,0,0,0.42)' },
    ],
  },
  nivel3: {
    // FAB, modales, menús flotantes
    boxShadow: [
      { offsetX: 0, offsetY: 6, blurRadius: 16, spreadDistance: 0, color: 'rgba(0,0,0,0.50)' },
    ],
  },
} as const;

export const estilo = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: color.fondo,
    padding: tamano.espacioGrande,
  },
  /** Cabecera compartida (style.md §4.1): superficie elevada + tira de acento. */
  cabecera: {
    backgroundColor: color.superficieElevada,
    paddingHorizontal: tamano.espacioGrande,
    paddingBottom: tamano.espacio,
    borderBottomWidth: 3,
    borderBottomColor: color.acento,
  },
  cabeceraSubtitulo: {
    marginTop: tamano.espacioCompacto,
  },
  /** Botón sólido (acción principal): fondo verde, píldora, sombra nivel 1. */
  botonPrimario: {
    backgroundColor: color.primario,
    borderRadius: tamano.radioPildora,
    paddingVertical: 12,
    paddingHorizontal: tamano.espacioGrande,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: tamano.toque,
    ...sombra.nivel1,
  },
  botonPrimarioTexto: ({
    color: color.primarioTexto,
    fontSize: 17,
    fontWeight: '600',
    // Sin lineHeight fija: el alto de línea lo calcula la fuente, de modo que
    // los descendentes (g, j, p) no queden recortados por debajo en Android.
    // Nunca partir el rótulo en dos líneas (las métricas de fuente móviles
    // son más anchas que las de web): el botón crece con su texto.
    // En runtime RN ≥ 0.71 y RNW soportan whiteSpace; los tipos del SDK 57 no lo declaran.
    whiteSpace: 'nowrap',
  } as unknown as TextStyle),
  /** Botón contorno (`.btn-outline-*`): borde 2px + texto verde claro (AA 6.8:1 sobre oscuro). */
  botonSecundario: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: color.verdeClaro,
    borderRadius: tamano.radioPildora,
    paddingVertical: 12,
    paddingHorizontal: tamano.espacio,
    alignItems: 'center',
    minHeight: tamano.toque,
  },
  botonSecundarioTexto: ({
    color: color.verdeClaro,
    fontSize: 16,
    fontWeight: '600',
    whiteSpace: 'nowrap',
  } as unknown as TextStyle),
  /** Fila icono + texto del CTA (style.md §4.3): el icono vive en un círculo. */
  filaIcono: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tamano.espacioFino,
  },
  /** Círculo contenedor de glifos (‹ › + ✓ ⚠): el contenedor da el acabado. */
  iconoCirculo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoGlifo: {
    color: color.primarioTexto,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
    textAlign: 'center',
  },
  /** Etiqueta de campo: tipografia.detalle en 600, separada espacioFino (style.md §4.4). */
  etiqueta: {
    fontSize: 14,
    fontWeight: '600',
    color: color.textoSuave,
    marginBottom: tamano.espacioFino,
  },
  /** Campo de formulario (`.form-control`): superficie + borde fino. */
  campo: {
    backgroundColor: color.superficie,
    borderWidth: 1,
    borderColor: color.borde,
    borderRadius: tamano.radioBoton,
    padding: 12,
    fontSize: 16,
    color: color.texto,
  },
  /** Campo enfocado: borde verde claro + glow (doble señal, style.md §4.4).
   *  boxShadow como string: `TextStyle` (campo de TextInput) no acepta el array. */
  campoEnFoco: {
    borderColor: color.verdeClaro,
    boxShadow: '0 1px 8px rgba(159,195,159,0.45)',
  },
  /** Tarjeta estilo Bootstrap (.card): borde 1px + superficie elevada + sombra. */
  tarjeta: {
    backgroundColor: color.superficie,
    borderRadius: tamano.radioTarjeta,
    borderWidth: 1,
    borderColor: color.borde,
    padding: tamano.espacio,
    ...sombra.nivel2,
  },
  /** Tarjeta de avistamiento del listado (style.md §4.2): pieza central. */
  tarjetaAvistamiento: {
    backgroundColor: color.superficie,
    borderRadius: tamano.radioTarjeta,
    borderWidth: 1,
    borderColor: color.borde,
    padding: tamano.espacio,
    ...sombra.nivel2,
  },
  /** Chip de metadatos (fecha, hora, lugar): tinte del fondo + píldora (style.md §4.2). */
  chip: {
    backgroundColor: color.fondo,
    borderRadius: tamano.radioPildora,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  /** Badge de cantidad en la tarjeta: primarioOscuro + texto blanco (style.md §4.2). */
  badge: {
    backgroundColor: color.primarioOscuro,
    borderRadius: tamano.radioPildora,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  badgeTexto: {
    color: color.primarioTexto,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  /** FAB «nuevo avistamiento» (style.md §4.7): única acción por esquina, siempre abajo-derecha. */
  fab: {
    position: 'absolute',
    right: tamano.espacioGrande,
    bottom: tamano.espacioGrande,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: color.primario,
    alignItems: 'center',
    justifyContent: 'center',
    ...sombra.nivel3,
  },
  fabIcono: {
    color: color.primarioTexto,
    fontSize: 34,
    fontWeight: '600',
    lineHeight: 60,
    textAlign: 'center',
  },
  /** Avatar del hero del estado vacío (style.md §4.5): ilustración/iniciales, nunca emoji. */
  avatarHero: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    ...sombra.nivel2,
  },
  avatarHeroTexto: {
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: 2,
    color: color.primarioTexto,
  },
  /** Botón deshabilitado: opacidad, nunca solo cambio de color (style.md §4.3). */
  deshabilitado: {
    opacity: 0.4,
  },
});