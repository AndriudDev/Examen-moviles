import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { EstadoVacio } from '../vista/EstadoVacio';
import { color, estilo, tamano } from '../vista/tema';

/**
 * Pantalla principal: listado de avistamientos (RF-03).
 * Fase actual (scaffold): muestra el estado vacío diseñado; la carga
 * desde el repositorio se conecta en la fase de persistencia.
 */
export default function PantallaListado() {
  return (
    <View style={estilo.pantalla}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={estilo.tituloPantalla}>AvistAves</Text>
          <Text style={estilo.subtitulo}>Bitácora de avistamiento de aves</Text>
        </View>
        <Link href="/registrar" asChild>
          <Pressable
            accessibilityLabel="Nuevo avistamiento"
            style={{
              width: tamano.toque,
              height: tamano.toque,
              borderRadius: tamano.radio,
              backgroundColor: color.primario,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: color.primarioTexto, fontSize: 26, lineHeight: tamano.toque }}>+</Text>
          </Pressable>
        </Link>
      </View>

      <View style={{ marginTop: tamano.espacioGrande }}>
        <EstadoVacio />
      </View>
    </View>
  );
}