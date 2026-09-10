import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { cargarAvistamientos, filtrarPorNombre } from '../controlador/ControladorListado';
import type { Avistamiento } from '../modelo/Avistamiento';
import { EstadoCarga } from '../vista/EstadoCarga';
import { EstadoError } from '../vista/EstadoError';
import { EstadoVacio } from '../vista/EstadoVacio';
import { TarjetaAvistamiento } from '../vista/TarjetaAvistamiento';
import { color, estilo, tamano } from '../vista/tema';

/**
 * Pantalla principal: listado de avistamientos (RF-03).
 * Carga real desde el repositorio (orden fecha desc), filtro por nombre,
 * estado vacío diseñado cuando no hay registros y acceso directo al registro.
 * Cada operación asíncrona muestra su estado (carga/error con reintento).
 */
export default function PantallaListado() {
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | undefined>(undefined);
  const [avistamientos, setAvistamientos] = useState<Avistamiento[]>([]);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    void recargar();
  }, []);

  async function recargar(): Promise<void> {
    setCargando(true);
    setErrorCarga(undefined);
    try {
      setAvistamientos(await cargarAvistamientos());
    } catch {
      setErrorCarga('No se pudieron cargar los avistamientos guardados en el dispositivo.');
    } finally {
      setCargando(false);
    }
  }

  const visibles = filtrarPorNombre(avistamientos, filtro);

  return (
    <View style={[estilo.pantalla, { flex: 1 }]}>
      <Stack.Title>AvistAves</Stack.Title>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={estilo.tituloPantalla}>AvistAves</Text>
          <Text style={estilo.subtitulo}>Bitácora de avistamiento de aves</Text>
        </View>
        <Pressable
          accessibilityLabel="Nuevo avistamiento"
          onPress={() => router.push('/registrar')}
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
      </View>

      {cargando ? (
        <View style={{ marginTop: tamano.espacioGrande }}>
          <EstadoCarga mensaje="Cargando avistamientos…" />
        </View>
      ) : errorCarga ? (
        <View style={{ marginTop: tamano.espacioGrande }}>
          <EstadoError mensaje={errorCarga} alReintentar={() => void recargar()} />
        </View>
      ) : avistamientos.length === 0 ? (
        <View style={{ marginTop: tamano.espacioGrande }}>
          <EstadoVacio />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1, marginTop: tamano.espacioGrande }}
          contentContainerStyle={{ gap: tamano.espacio }}
        >
          <TextInput
            accessibilityLabel="Filtrar avistamientos por nombre"
            value={filtro}
            onChangeText={setFiltro}
            placeholder="Filtrar por nombre del ave…"
            placeholderTextColor={color.textoSuave}
            style={estilo.campo}
          />
          {visibles.length === 0 ? (
            <View style={estilo.tarjeta}>
              <Text style={{ fontSize: 15, color: color.texto }} numberOfLines={2}>
                No hay avistamientos que coincidan con «{filtro.trim()}».
              </Text>
            </View>
          ) : (
            visibles.map((avistamiento) => (
              <TarjetaAvistamiento key={avistamiento.id} avistamiento={avistamiento} />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}