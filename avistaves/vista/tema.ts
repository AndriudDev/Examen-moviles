import { StyleSheet } from 'react-native';

/**
 * Tema de UI para uso en terreno: alto contraste (sol en pantalla),
 * objetivos táctiles grandes (una mano) y espaciados consistentes.
 */
export const color = {
  fondo: '#F6F2E9',        // crema claro: menos deslumbramiento que blanco puro
  superficie: '#FFFFFF',
  texto: '#1F1F1F',        // contraste fuerte sobre fondo
  textoSuave: '#5A5A5A',
  primario: '#2F6B3A',     // verde bosque
  primarioTexto: '#FFFFFF',
  acento: '#C7791E',       // ámbar: acción secundaria
  peligro: '#B3261E',
  borde: '#D9D3C6',
  humedoSuelo: '#8C7A5B',  // reservado
} as const;

export const tamano = {
  toque: 48,               // objetivo táctil mínimo
  radio: 12,
  radioTarjeta: 16,
  espacio: 16,
  espacioCompacto: 8,
  espacioGrande: 24,
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
  botonPrimario: {
    backgroundColor: color.primario,
    borderRadius: tamano.radio,
    paddingVertical: 14,
    paddingHorizontal: tamano.espacio,
    alignItems: 'center',
    minHeight: tamano.toque,
  },
  botonPrimarioTexto: {
    color: color.primarioTexto,
    fontSize: 17,
    fontWeight: '600',
  },
  botonSecundario: {
    backgroundColor: color.superficie,
    borderWidth: 2,
    borderColor: color.primario,
    borderRadius: tamano.radio,
    paddingVertical: 12,
    paddingHorizontal: tamano.espacio,
    alignItems: 'center',
    minHeight: tamano.toque,
  },
  botonSecundarioTexto: {
    color: color.primario,
    fontSize: 16,
    fontWeight: '600',
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: '600',
    color: color.texto,
    marginBottom: 6,
  },
  campo: {
    backgroundColor: color.superficie,
    borderWidth: 2,
    borderColor: color.borde,
    borderRadius: tamano.radio,
    padding: 12,
    fontSize: 16,
    color: color.texto,
  },
  tarjeta: {
    backgroundColor: color.superficie,
    borderRadius: tamano.radioTarjeta,
    borderWidth: 2,
    borderColor: color.borde,
    padding: tamano.espacio,
  },
});