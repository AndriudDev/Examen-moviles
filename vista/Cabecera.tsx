import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { estilo, tamano, tipografia } from './tema';

/**
 * Cabecera compartida de pantalla (style.md §4.1): superficie elevada con
 * tira de acento en el borde inferior, título `pantalla` y subtítulo
 * `detalle` debajo. Respeta la zona segura superior (estado/notch).
 */
export function Cabecera({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[estilo.cabecera, { paddingTop: insets.top + tamano.espacio }]}>
      <Text style={tipografia.pantalla}>{titulo}</Text>
      {subtitulo ? <Text style={[tipografia.detalle, estilo.cabeceraSubtitulo]}>{subtitulo}</Text> : null}
    </View>
  );
}