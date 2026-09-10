import { ActivityIndicator, Text, View } from 'react-native';

import { color, estilo, tamano } from './tema';

/**
 * Estado de carga para operaciones asíncronas (cámara, GPS, clima):
 * el usuario siempre sabe que algo está pasando.
 */
export function EstadoCarga({ mensaje }: { mensaje: string }) {
  return (
    <View style={[estilo.tarjeta, { flexDirection: 'row', alignItems: 'center', gap: tamano.espacio }]}>
      <ActivityIndicator size="small" color={color.verdeClaro} />
      <Text style={{ fontSize: 15, color: color.texto, flexShrink: 1 }}>{mensaje}</Text>
    </View>
  );
}