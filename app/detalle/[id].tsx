import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import { cargarAvistamientoPorId, resolverLugar } from '../../controlador/ControladorDetalle';
import type { Avistamiento } from '../../modelo/Avistamiento';
import { Cabecera } from '../../vista/Cabecera';
import { EstadoCarga } from '../../vista/EstadoCarga';
import { EstadoError } from '../../vista/EstadoError';
import { formatearFechaLegible } from '../../vista/formato';
import { color, estilo, tamano, tipografia } from '../../vista/tema';

const FOTO_ALTO = 300;

/**
 * Pantalla de detalle (RF-04): foto grande persistente, todos los datos del
 * avistamiento, clima legible (ícono + condición + temperatura + humedad,
 * nunca el `weather_code` crudo) y ubicación en formato entendible con
 * reverse geocoding. Cada operación asíncrona muestra su estado: carga,
 * error con reintento y «lugar/clima no disponibles» sin bloquear la vista.
 * Cabecera compartida con el nombre del ave como subtítulo (style.md §4.1).
 */
export default function PantallaDetalle() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | undefined>(undefined);
  const [avistamiento, setAvistamiento] = useState<Avistamiento | undefined>(undefined);
  const [lugar, setLugar] = useState<string | undefined>(undefined);
  const [resolviendoLugar, setResolviendoLugar] = useState(false);

  useEffect(() => {
    void recargar();
  }, [id]);

  /** Recarga el avistamiento desde el repositorio (también en «Reintentar»). */
  async function recargar(): Promise<void> {
    setCargando(true);
    setErrorCarga(undefined);
    setAvistamiento(undefined);
    try {
      if (typeof id !== 'string') {
        throw new Error('id inválido');
      }
      const encontrado = await cargarAvistamientoPorId(id);
      if (!encontrado) {
        setErrorCarga('El avistamiento ya no existe en el dispositivo.');
        return;
      }
      setAvistamiento(encontrado);
    } catch {
      setErrorCarga('No se pudo cargar el avistamiento. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  // El lugar se resuelve en paralelo con la carga: la vista muestra los datos
  // al instante y avisa «Resolviendo lugar…» mientras el geocoder responde.
  useEffect(() => {
    if (!avistamiento) {
      return;
    }
    let activo = true;
    setResolviendoLugar(true);
    setLugar(undefined);
    void resolverLugar(avistamiento).then((lugarResuelto) => {
      if (activo) {
        setLugar(lugarResuelto);
        setResolviendoLugar(false);
      }
    });
    return () => {
      activo = false;
    };
  }, [avistamiento]);

  return (
    <View style={{ flex: 1, backgroundColor: color.fondo }}>
      <Cabecera titulo="Detalle" subtitulo={avistamiento?.nombre} />

      <View style={{ flex: 1, padding: tamano.espacioGrande }}>
        {cargando ? (
          <EstadoCarga mensaje="Cargando detalle…" />
        ) : errorCarga ? (
          <>
            <EstadoError mensaje={errorCarga} alReintentar={() => void recargar()} />
            <Pressable
              accessibilityLabel="Volver al listado"
              onPress={() => (router.canGoBack() ? router.back() : router.push('/'))}
              style={[estilo.botonSecundario, { marginTop: tamano.espacio }]}
            >
              <Text style={estilo.botonSecundarioTexto}>Volver al listado</Text>
            </Pressable>
          </>
        ) : (
          avistamiento && (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ gap: tamano.espacio, paddingBottom: tamano.espacioGrande }}
            >
              <Image
                accessibilityLabel={`Foto de ${avistamiento.nombre}`}
                source={{ uri: avistamiento.fotoUri }}
                style={{
                  width: '100%',
                  height: FOTO_ALTO,
                  borderRadius: tamano.radioTarjeta,
                  backgroundColor: color.superficie,
                }}
                resizeMode="cover"
              />

              <View style={estilo.tarjeta}>
                <Text style={tipografia.seccion}>{avistamiento.nombre}</Text>
                <Text style={[tipografia.detalle, { marginTop: tamano.espacioCompacto }]}>
                  {formatearFechaLegible(avistamiento.fecha)}
                </Text>
                <Text style={[tipografia.cuerpo, { marginTop: tamano.espacioFino }]}>
                  Cantidad de ejemplares: {avistamiento.cantidad}
                </Text>
                {avistamiento.notas && (
                  <Text style={[tipografia.cuerpo, { color: color.textoSuave, marginTop: tamano.espacioFino }]}>
                    {avistamiento.notas}
                  </Text>
                )}
              </View>

              <View style={estilo.tarjeta}>
                <Text style={estilo.etiqueta}>Lugar</Text>
                {resolviendoLugar ? (
                  <Text style={tipografia.detalle}>Resolviendo lugar…</Text>
                ) : lugar ? (
                  <Text style={tipografia.cuerpo}>{lugar}</Text>
                ) : (
                  <Text style={tipografia.detalle}>Lugar no disponible en este momento.</Text>
                )}
              </View>

              <View style={estilo.tarjeta}>
                <Text style={estilo.etiqueta}>Clima</Text>
                {avistamiento.clima ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: tamano.espacio }}>
                    <Text style={{ fontSize: 28 }}>{avistamiento.clima.icono}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={tipografia.tarjeta}>{avistamiento.clima.condicion}</Text>
                      <Text style={[tipografia.cuerpo, { marginTop: tamano.minimo }]}>
                        {avistamiento.clima.temperaturaC.toFixed(1)} °C · Humedad{' '}
                        {avistamiento.clima.humedadPct} %
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={tipografia.detalle}>
                    Clima no disponible: el registro se guardó igual sin datos de la API (RF-02).
                  </Text>
                )}
              </View>

              <Pressable
                accessibilityLabel="Volver al listado"
                onPress={() => (router.canGoBack() ? router.back() : router.push('/'))}
                style={estilo.botonSecundario}
              >
                <Text style={estilo.botonSecundarioTexto}>Volver al listado</Text>
              </Pressable>
            </ScrollView>
          )
        )}
      </View>
    </View>
  );
}