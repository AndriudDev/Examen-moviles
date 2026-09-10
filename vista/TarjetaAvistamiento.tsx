import { useRouter } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';

import type { Avistamiento } from '../modelo/Avistamiento';
import { color, estilo, tamano } from './tema';
import { formatearFechaLegible } from './formato';

const MINIATURA = 72;

/**
 * Tarjeta del listado (RF-03): miniatura, nombre, cantidad, fecha y
 * temperatura. Si el clima no se pudo obtener (RF-02), se muestra un
 * indicador en vez del dato faltante. Al tocarla navega al detalle (RF-06).
 */
export function TarjetaAvistamiento({ avistamiento }: { avistamiento: Avistamiento }) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityLabel={`Ver detalle de ${avistamiento.nombre}`}
      onPress={() => router.push(`/detalle/${avistamiento.id}`)}
      style={estilo.tarjeta}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tamano.espacio }}>
        <Image
          accessibilityLabel={`Foto de ${avistamiento.nombre}`}
          source={{ uri: avistamiento.fotoUri }}
          style={{
            width: MINIATURA,
            height: MINIATURA,
            borderRadius: tamano.radio,
            backgroundColor: color.superficie,
          }}
          resizeMode="cover"
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: color.texto }} numberOfLines={1}>
            {avistamiento.nombre}
          </Text>
          <Text style={{ fontSize: 14, color: color.textoSuave }} numberOfLines={1}>
            {formatearFechaLegible(avistamiento.fecha)} · Cantidad {avistamiento.cantidad}
          </Text>
          {avistamiento.clima ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: tamano.espacioCompacto, marginTop: tamano.espacioCompacto }}>
              <Text style={{ fontSize: 16 }}>{avistamiento.clima.icono}</Text>
              <Text style={{ fontSize: 14, color: color.texto }}>
                {avistamiento.clima.temperaturaC.toFixed(1)} °C
              </Text>
              <Text style={[estilo.subtitulo, { flexShrink: 1 }]} numberOfLines={1}>
                {avistamiento.clima.condicion}
              </Text>
            </View>
          ) : (
            <Text style={[estilo.subtitulo, { marginTop: tamano.espacioCompacto }]}>
              Clima no disponible
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}