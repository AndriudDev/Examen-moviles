import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { color, estilo, tamano } from '../../vista/tema';

/**
 * Pantalla de detalle (RF-04).
 * Fase actual (scaffold): navegación con id desde la ruta; el contenido
 * completo (foto grande, clima y ubicación legibles) se implementa en
 * la fase de periféricos y API.
 */
export default function PantallaDetalle() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <View style={estilo.pantalla}>
      <Text style={estilo.tituloPantalla}>Detalle del avistamiento</Text>
      {typeof id === 'string' && (
        <Text style={[estilo.subtitulo, { marginTop: tamano.espacio }]}>ID: {id}</Text>
      )}

      <View style={{ marginTop: tamano.espacio, backgroundColor: color.superficie, borderRadius: tamano.radio, padding: tamano.espacio }}>
        <Text style={{ fontSize: 15, color: color.texto }}>
          Foto grande, clima y lugar legibles se muestran aquí.
        </Text>
      </View>

      <Pressable
        accessibilityLabel="Volver al listado"
        onPress={() => (router.canGoBack() ? router.back() : router.push('/'))}
        style={[estilo.botonSecundario, { marginTop: tamano.espacioGrande }]}
      >
        <Text style={estilo.botonSecundarioTexto}>Volver</Text>
      </Pressable>
    </View>
  );
}