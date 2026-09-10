import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { cargarAvistamientos, filtrarPorNombre } from '../controlador/ControladorListado';
import type { Avistamiento } from '../modelo/Avistamiento';
import { Cabecera } from '../vista/Cabecera';
import { CampoTexto } from '../vista/CampoTexto';
import { EstadoCarga } from '../vista/EstadoCarga';
import { EstadoError } from '../vista/EstadoError';
import { EstadoVacio } from '../vista/EstadoVacio';
import { TarjetaAvistamiento } from '../vista/TarjetaAvistamiento';
import { color, estilo, tamano, tipografia } from '../vista/tema';

/**
 * Pantalla principal: listado de avistamientos (RF-03).
 * Cabecera compartida + FAB (style.md §4.1/§4.7), carga real desde el
 * repositorio (orden fecha desc), filtro por nombre con foco estilizado,
 * estado vacío con avatar y error con reintento. El FAB flota sobre el
 * contenido: el scroll deja 96px libres debajo (style.md §4.7).
 */
export default function PantallaListado() {
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | undefined>(undefined);
  const [avistamientos, setAvistamientos] = useState<Avistamiento[]>([]);
  const [filtro, setFiltro] = useState('');

  /** Carga los avistamientos desde el repositorio del dispositivo (RF-05). */
  const recargar = useCallback(async (): Promise<void> => {
    setCargando(true);
    setErrorCarga(undefined);
    try {
      setAvistamientos(await cargarAvistamientos());
    } catch {
      setErrorCarga('No se pudieron cargar los avistamientos guardados en el dispositivo.');
    } finally {
      setCargando(false);
    }
  }, []);

  // Carga al montar y recarga cada vez que la pantalla recupera el foco: el
  // Stack mantiene esta ruta montada bajo registrar/detalle, así que volver
  // tras un guardado debe refrescar la lista desde el repositorio (RF-05/RF-06).
  useFocusEffect(
    useCallback(() => {
      void recargar();
    }, [recargar]),
  );

  const visibles = filtrarPorNombre(avistamientos, filtro);

  return (
    <View style={{ flex: 1, backgroundColor: color.fondo }}>
      <Cabecera titulo="AvistAves" subtitulo="Bitácora de avistamiento de aves" />

      <View style={{ flex: 1, padding: tamano.espacioGrande }}>
        {cargando ? (
          <EstadoCarga mensaje="Cargando avistamientos…" />
        ) : errorCarga ? (
          <EstadoError mensaje={errorCarga} alReintentar={() => void recargar()} />
        ) : avistamientos.length === 0 ? (
          <EstadoVacio />
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ gap: tamano.espacio, paddingBottom: tamano.espacioGrande * 4 }}
          >
            <CampoTexto
              accessibilityLabel="Filtrar avistamientos por nombre"
              value={filtro}
              onChangeText={setFiltro}
              placeholder="Filtrar por nombre del ave…"
            />
            {visibles.length === 0 ? (
              <View style={estilo.tarjeta}>
                <Text style={tipografia.cuerpo} numberOfLines={2}>
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

      <Pressable
        accessibilityLabel="Nuevo avistamiento"
        onPress={() => router.push('/registrar')}
        style={estilo.fab}
      >
        <Text style={estilo.fabIcono}>+</Text>
      </Pressable>
    </View>
  );
}