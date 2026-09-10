import { ActivityIndicator, Text, View } from 'react-native';

import { color, estilo, sombra, tamano, tipografia } from './tema';

/**
 * Estado de carga (style.md §4.5): tarjeta nivel 1 con spinner grande y
 * mensaje en fila. Toda operación asíncrona (cámara, GPS, clima) le dice
 * al usuario qué está pasando; nunca una pantalla congelada.
 */
export function EstadoCarga({ mensaje }: { mensaje: string }) {
  return (
    <View
      style={[
        estilo.tarjeta,
        sombra.nivel1,
        { flexDirection: 'row', alignItems: 'center', gap: tamano.espacio },
      ]}
    >
      <ActivityIndicator size="large" color={color.verdeClaro} />
      <Text style={[tipografia.cuerpo, { flexShrink: 1 }]}>{mensaje}</Text>
    </View>
  );
}