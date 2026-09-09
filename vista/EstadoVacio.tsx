import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { estilo, tamano } from './tema';

/**
 * Estado vacío del listado (RF-03): nada de pantalla en blanco,
 * guía al usuario a registrar su primer avistamiento.
 */
export function EstadoVacio() {
  return (
    <View style={[estilo.pantalla, { alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={{ fontSize: 56, marginBottom: tamano.espacio }}>🐦</Text>
      <Text style={[estilo.tituloPantalla, { textAlign: 'center' }]}>
        Todavía no hay avistamientos
      </Text>
      <Text style={[estilo.subtitulo, { textAlign: 'center', marginTop: tamano.espacioCompacto }]}>
        Sal a observar y registra tu primera ave con foto, ubicación y clima.
      </Text>
      <View style={{ marginTop: tamano.espacioGrande }}>
        <Link href="/registrar" asChild>
          <Pressable style={estilo.botonPrimario}>
            <Text style={estilo.botonPrimarioTexto}>Registrar avistamiento</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}