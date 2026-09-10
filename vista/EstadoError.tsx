import { Pressable, Text, View } from 'react-native';

import { color, estilo, sombra, tamano, tipografia } from './tema';

/** Tinte del círculo del ícono de error: `peligro` al 15%. */
const TINTE_PELIGRO = `${color.peligro}26`;

/**
 * Estado de error con acción de reintento (style.md §4.5): tarjeta nivel 1,
 * ícono ⚠ (glifo, no emoji) en círculo tinte peligro, mensaje bold en
 * peligro y botón secundario «Reintentar» a 12px del mensaje.
 */
export function EstadoError({
  mensaje,
  alReintentar,
}: {
  mensaje: string;
  alReintentar?: () => void;
}) {
  return (
    <View style={[estilo.tarjeta, sombra.nivel1]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tamano.espacio }}>
        <View style={[estilo.iconoCirculo, { backgroundColor: TINTE_PELIGRO }]}>
          <Text style={{ color: color.peligro, fontSize: 22, fontWeight: '700' }}>⚠</Text>
        </View>
        <Text style={[tipografia.cuerpo, { color: color.peligro, fontWeight: '700', flexShrink: 1 }]}>
          {mensaje}
        </Text>
      </View>
      {alReintentar && (
        <Pressable
          onPress={alReintentar}
          style={[estilo.botonSecundario, { marginTop: tamano.espacioFino, alignSelf: 'flex-start' }]}
        >
          <Text style={estilo.botonSecundarioTexto}>Reintentar</Text>
        </Pressable>
      )}
    </View>
  );
}