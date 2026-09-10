import { StyleSheet, type TextStyle } from 'react-native';

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
} as const;

export const tamano = {
  toque: 48,               // objetivo táctil mínimo
  radioBoton: 6,           // --bs-border-radius (0.375rem): botones y campos
  radio: 12,               // contenido general
  radioTarjeta: 12,        // tarjetas estilo Bootstrap (borde 1px)
  radioPildora: 999,       // badges y chips
  espacio: 16,
  espacioCompacto: 8,
  espacioGrande: 24,
  minimo: 4,               // detalles finos
  espacioFino: 12,         // entre etiqueta y campo
  contenedor: 32,          // máximo útil entre bloques de sección
} as const;

export const estilo = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: color.fondo,
    padding: tamano.espacioGrande,
  },
  tituloPantalla: {
    fontSize: 26,
    fontWeight: '700',
    color: color.texto,
  },
  subtitulo: {
    fontSize: 15,
    color: color.textoSuave,
  },
  /** Botón sólido (acción principal): fondo verde, sin borde (Bootstrap `.btn` sin outline) */
  botonPrimario: {
    backgroundColor: color.primario,
    borderRadius: tamano.radioBoton,
    paddingVertical: 10,
    paddingHorizontal: tamano.espacio,
    alignItems: 'center',
    minHeight: tamano.toque,
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
  /** Botón contorno (`.btn-outline-*`): borde verde + texto verde, fondo transparente */
  botonSecundario: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: color.verdeClaro,
    borderRadius: tamano.radioBoton,
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
  etiqueta: {
    fontSize: 14,
    fontWeight: '600',
    color: color.texto,
    marginBottom: 6,
  },
  /** Campo de formulario (`.form-control`): superficie + borde fino */
  campo: {
    backgroundColor: color.superficie,
    borderWidth: 1,
    borderColor: color.borde,
    borderRadius: tamano.radioBoton,
    padding: 12,
    fontSize: 16,
    color: color.texto,
  },
  /** Tarjeta estilo Bootstrap (.card): borde 1px + superficie elevada */
  tarjeta: {
    backgroundColor: color.superficie,
    borderRadius: tamano.radioTarjeta,
    borderWidth: 1,
    borderColor: color.borde,
    padding: tamano.espacio,
  },
});