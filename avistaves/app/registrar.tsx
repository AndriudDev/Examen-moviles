import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { color, estilo, tamano } from '../vista/tema';

/**
 * Pantalla de registro (RF-01 + RF-02).
 * Fase actual (scaffold): estructura y navegación; el formulario con
 * cámara, GPS y clima se implementa en la fase de periféricos.
 */
export default function PantallaRegistro() {
  const router = useRouter();

  return (
    <View style={estilo.pantalla}>
      <Text style={estilo.tituloPantalla}>Nuevo avistamiento</Text>

      <View style={{ marginTop: tamano.espacio, backgroundColor: color.superficie, borderRadius: tamano.radio, padding: tamano.espacio }}>
        <Text style={{ fontSize: 15, color: color.texto }}>
          Aquí se captura la foto con la cámara, la ubicación con el GPS y el clima del momento.
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