import { Pressable, Text, View } from 'react-native';

import { color, estilo } from './tema';

/**
 * Estado de error con acción de reintento: nunca una pantalla congelada.
 */
export function EstadoError({
  mensaje,
  alReintentar,
}: {
  mensaje: string;
  alReintentar?: () => void;
}) {
  return (
    <View style={estilo.tarjeta}>
      <Text style={{ fontSize: 15, fontWeight: '700', color: color.peligro }}>{mensaje}</Text>
      {alReintentar && (
        <Pressable onPress={alReintentar} style={[estilo.botonSecundario, { marginTop: 8 }]}>
          <Text style={estilo.botonSecundarioTexto}>Reintentar</Text>
        </Pressable>
      )}
    </View>
  );
}