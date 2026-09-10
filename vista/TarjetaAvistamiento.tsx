import { useRouter } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';

import type { Avistamiento } from '../modelo/Avistamiento';
import { formatearFecha, formatearHora } from './formato';
import { color, estilo, sombra, tamano, tipografia } from './tema';

const MINIATURA = 72;
/** Tinte verde para la píldora de clima con dato: `exito` al 12%. */
const TINTE_EXITO = `${color.exito}1F`;

/**
 * Tarjeta del listado (RF-03 + style.md §4.2): miniatura de la foto
 * (requisito RF-03), nombre + badge de cantidad, chips de fecha/hora/lugar
 * y clima a la derecha (temperatura grande + ícono, o «Sin clima» si la
 * API falló, RF-02). Al tocarla navega al detalle (RF-06), con estado
 * presionado (scale 0.98 + sombra nivel 1).
 */
export function TarjetaAvistamiento({ avistamiento }: { avistamiento: Avistamiento }) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityLabel={`Ver detalle de ${avistamiento.nombre}`}
      onPress={() => router.push(`/detalle/${avistamiento.id}`)}
      style={({ pressed }) => [
        estilo.tarjetaAvistamiento,
        pressed && [{ transform: [{ scale: 0.98 }] }, sombra.nivel1],
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tamano.espacio }}>
        <Image
          accessibilityLabel={`Foto de ${avistamiento.nombre}`}
          source={{ uri: avistamiento.fotoUri }}
          style={{
            width: MINIATURA,
            height: MINIATURA,
            borderRadius: tamano.radioTarjeta,
            backgroundColor: color.superficie,
          }}
          resizeMode="cover"
        />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: tamano.espacioCompacto }}>
            <Text style={[tipografia.tarjeta, { flexShrink: 1 }]} numberOfLines={1}>
              {avistamiento.nombre}
            </Text>
            <View style={estilo.badge}>
              <Text style={estilo.badgeTexto}>×{avistamiento.cantidad}</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: tamano.espacioCompacto,
              marginTop: tamano.espacioCompacto,
            }}
          >
            <View style={estilo.chip}>
              <Text style={tipografia.micro}>{formatearFecha(avistamiento.fecha)}</Text>
            </View>
            <View style={estilo.chip}>
              <Text style={tipografia.micro}>{formatearHora(avistamiento.fecha)}</Text>
            </View>
            {avistamiento.lugar ? (
              <View style={estilo.chip}>
                <Text style={tipografia.micro} numberOfLines={1}>
                  {avistamiento.lugar}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View style={{ alignItems: 'flex-end', marginTop: tamano.espacioFino }}>
        {avistamiento.clima ? (
          <View
            style={[
              estilo.chip,
              {
                backgroundColor: TINTE_EXITO,
                flexDirection: 'row',
                alignItems: 'center',
                gap: tamano.espacioCompacto,
                paddingVertical: 6,
                paddingHorizontal: tamano.espacioFino,
              },
            ]}
          >
            <Text style={{ fontSize: 18 }}>{avistamiento.clima.icono}</Text>
            <Text style={{ fontSize: 28, fontWeight: '700', lineHeight: 30, color: color.texto }}>
              {avistamiento.clima.temperaturaC.toFixed(0)}
            </Text>
            <Text style={tipografia.detalle}>°C</Text>
          </View>
        ) : (
          <View style={[estilo.chip, { flexDirection: 'row', alignItems: 'center' }]}>
            <Text style={tipografia.micro}>Sin clima</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}