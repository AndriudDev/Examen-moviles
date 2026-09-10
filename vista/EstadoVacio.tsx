import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { color, estilo, tamano, tipografia } from './tema';

/**
 * Estado vacío del listado (RF-03 + style.md §4.5): hero con avatar de
 * iniciales (sin asset ilustrativo: avatar grande, nunca emoji), título y
 * cuerpo centrados y CTA primario con icono +.
 */
export function EstadoVacio() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[estilo.avatarHero, { backgroundColor: color.primarioOscuro }]}>
        <Text style={estilo.avatarHeroTexto}>AV</Text>
      </View>
      <Text style={[tipografia.seccion, { textAlign: 'center', marginTop: tamano.espacioGrande }]}>
        Todavía no hay avistamientos
      </Text>
      <Text
        style={[
          tipografia.cuerpo,
          { color: color.textoSuave, textAlign: 'center', marginTop: tamano.espacioFino },
        ]}
      >
        Sal a observar y registra tu primera ave con foto, ubicación y clima.
      </Text>
      <Pressable
        accessibilityLabel="Registrar avistamiento"
        onPress={() => router.push('/registrar')}
        style={[estilo.botonPrimario, { marginTop: tamano.contenedor }]}
      >
        <View style={estilo.filaIcono}>
          <View style={[estilo.iconoCirculo, { backgroundColor: color.primarioOscuro }]}>
            <Text style={estilo.iconoGlifo}>+</Text>
          </View>
          <Text style={estilo.botonPrimarioTexto}>Registrar avistamiento</Text>
        </View>
      </Pressable>
    </View>
  );
}