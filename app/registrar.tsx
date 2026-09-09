import { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { garantizarAccesoCamara, tomarFoto } from '../controlador/camara';
import { guardarRegistro } from '../controlador/ControladorRegistro';
import { capturarCoordenadas, type Coordenadas } from '../controlador/ubicacion';
import type { BorradorAvistamiento } from '../modelo/Avistamiento';
import { nuevaFechaLocal } from '../modelo/Avistamiento';
import type { ErroresValidacion } from '../modelo/validacion';
import { EstadoCarga } from '../vista/EstadoCarga';
import { EstadoError } from '../vista/EstadoError';
import { color, estilo, tamano } from '../vista/tema';

/**
 * Pantalla de registro (RF-01): formulario real con foto tomada en el
 * momento, GPS automático (con botón «Actualizar ubicación») y guardado
 * en el repositorio local. Cada operación asíncrona muestra su estado
 * (carga/error) y rechazar permisos no rompe la app.
 */
type EstadoFoto = 'inactivo' | 'pidiendo' | 'listo' | 'capturando' | 'error';
type EstadoUbicacion = 'obteniendo' | 'ok' | 'error';

const ALTO_VISTA_CAMARA = 260;

function textoDeError(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Ocurrió un error inesperado.';
}

export default function PantallaRegistro() {
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [fecha, setFecha] = useState(nuevaFechaLocal());
  const [notas, setNotas] = useState('');

  const [fotoUri, setFotoUri] = useState<string | undefined>(undefined);
  const [estadoFoto, setEstadoFoto] = useState<EstadoFoto>('inactivo');
  const [camaraLista, setCamaraLista] = useState(false);
  const [errorFoto, setErrorFoto] = useState<string | undefined>(undefined);
  const refCamara = useRef<CameraView | null>(null);

  const [coordenadas, setCoordenadas] = useState<Coordenadas | undefined>(undefined);
  const [estadoUbicacion, setEstadoUbicacion] = useState<EstadoUbicacion>('obteniendo');
  const [errorUbicacion, setErrorUbicacion] = useState<string | undefined>(undefined);

  const [erroresFormulario, setErroresFormulario] = useState<ErroresValidacion>({});
  const [guardando, setGuardando] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | undefined>(undefined);

  useEffect(() => {
    void actualizarUbicacion();
  }, []);

  async function actualizarUbicacion(): Promise<void> {
    setEstadoUbicacion('obteniendo');
    setErrorUbicacion(undefined);
    try {
      setCoordenadas(await capturarCoordenadas());
      setEstadoUbicacion('ok');
    } catch (error) {
      setErrorUbicacion(textoDeError(error));
      setEstadoUbicacion('error');
    }
  }

  async function abrirCamara(): Promise<void> {
    setEstadoFoto('pidiendo');
    setErrorFoto(undefined);
    try {
      await garantizarAccesoCamara();
      setCamaraLista(false);
      setEstadoFoto('listo');
    } catch (error) {
      setErrorFoto(textoDeError(error));
      setEstadoFoto('error');
    }
  }

  async function capturarFoto(): Promise<void> {
    if (!refCamara.current) {
      return;
    }
    setEstadoFoto('capturando');
    setErrorFoto(undefined);
    try {
      const foto = await tomarFoto(refCamara.current);
      setFotoUri(foto.uri);
      setEstadoFoto('inactivo'); // desmonta la cámara: solo un preview activo a la vez
    } catch (error) {
      setErrorFoto(textoDeError(error));
      setEstadoFoto('listo');
    }
  }

  async function guardar(): Promise<void> {
    setGuardando(true);
    setErroresFormulario({});
    setErrorGuardado(undefined);

    const borrador: BorradorAvistamiento = {
      nombre,
      cantidad,
      fecha,
      notas,
      fotoUri,
      coordenadas,
    };
    const resultado = await guardarRegistro(borrador);
    if (resultado.ok) {
      setGuardadoOk(true);
    } else if (resultado.error) {
      setErrorGuardado(resultado.error);
    } else {
      setErroresFormulario(resultado.errores || {});
    }
    setGuardando(false);
  }

  return (
    <ScrollView style={[estilo.pantalla, { flex: 1 }]} contentContainerStyle={{ padding: tamano.espacioGrande }}>
      {guardadoOk ? renderConfirmacion(() => router.back()) : (
        <>
          <Text style={estilo.tituloPantalla}>Nuevo avistamiento</Text>
          <Text style={[estilo.subtitulo, { marginTop: tamano.espacioCompacto }]}>
            Foto y ubicación se capturan en el momento; guarda con la cámara del dispositivo.
          </Text>

          <Pressable
            accessibilityLabel="Volver al listado"
            onPress={() => (router.canGoBack() ? router.back() : router.push('/'))}
            style={[estilo.botonSecundario, { marginTop: tamano.espacio }]}
          >
            <Text style={estilo.botonSecundarioTexto}>Volver</Text>
          </Pressable>

          {/* FOTO (RF-01: tomada con la cámara, no desde la galería) */}
          <View style={{ marginTop: tamano.espacioGrande }}>
            <Text style={estilo.etiqueta}>Fotografía (obligatoria)</Text>
            {avisoDeError(erroresFormulario.foto)}
            {fotoUri ? (
              <View>
                <Image
                  source={{ uri: fotoUri }}
                  style={{
                    height: ALTO_VISTA_CAMARA,
                    borderRadius: tamano.radioTarjeta,
                    backgroundColor: color.superficie,
                  }}
                  resizeMode="cover"
                />
                <Pressable
                  accessibilityLabel="Repetir la foto"
                  onPress={() => {
                    setFotoUri(undefined);
                    setCamaraLista(false);
                    setEstadoFoto('listo');
                  }}
                  style={[estilo.botonSecundario, { marginTop: tamano.espacio }]}
                >
                  <Text style={estilo.botonSecundarioTexto}>Repetir foto</Text>
                </Pressable>
              </View>
            ) : estadoFoto === 'listo' || estadoFoto === 'capturando' ? (
              <View>
                <CameraView
                  ref={(vista: CameraView | null) => {
                    refCamara.current = vista;
                  }}
                  facing="back"
                  style={{
                    height: ALTO_VISTA_CAMARA,
                    borderRadius: tamano.radioTarjeta,
                  }}
                  onCameraReady={() => setCamaraLista(true)}
                />
                {estadoFoto === 'capturando' ? (
                  <View style={{ marginTop: tamano.espacio }}>
                    <EstadoCarga mensaje="Guardando la foto…" />
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', gap: tamano.espacio, marginTop: tamano.espacio }}>
                    <Pressable
                      accessibilityLabel="Capturar la foto"
                      disabled={!camaraLista}
                      onPress={() => void capturarFoto()}
                      style={estilo.botonPrimario}
                    >
                      <Text style={estilo.botonPrimarioTexto}>
                        {camaraLista ? 'Capturar foto' : 'Esperando la cámara…'}
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityLabel="Cancelar la cámara"
                      onPress={() => setEstadoFoto('inactivo')}
                      style={estilo.botonSecundario}
                    >
                      <Text style={estilo.botonSecundarioTexto}>Cancelar</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ) : estadoFoto === 'pidiendo' ? (
              <View style={{ marginTop: tamano.espacio }}>
                <EstadoCarga mensaje="Solicitando acceso a la cámara…" />
              </View>
            ) : (
              <View>
                <Pressable
                  accessibilityLabel="Tomar foto con la cámara"
                  onPress={() => void abrirCamara()}
                  style={estilo.botonPrimario}
                >
                  <Text style={estilo.botonPrimarioTexto}>Tomar foto</Text>
                </Pressable>
                {errorFoto ? (
                  <View style={{ marginTop: tamano.espacio }}>
                    <EstadoError mensaje={errorFoto} alReintentar={() => void abrirCamara()} />
                  </View>
                ) : null}
              </View>
            )}
          </View>

          {/* UBICACIÓN (RF-01: GPS automático, nunca escrita a mano) */}
          <View style={{ marginTop: tamano.espacioGrande }}>
            <Text style={estilo.etiqueta}>Ubicación (obligatoria)</Text>
            {avisoDeError(erroresFormulario.ubicacion)}
            {estadoUbicacion === 'obteniendo' ? (
              <EstadoCarga mensaje="Obteniendo ubicación…" />
            ) : estadoUbicacion === 'error' ? (
              <EstadoError mensaje={errorUbicacion || 'No se pudo obtener la ubicación.'} alReintentar={() => void actualizarUbicacion()} />
            ) : (
              <View>
                <Text style={{ fontSize: 15, color: color.texto }}>
                  Ubicación capturada: {coordenadas!.lat.toFixed(4)}, {coordenadas!.lng.toFixed(4)}
                </Text>
                <Pressable
                  accessibilityLabel="Actualizar la ubicación"
                  onPress={() => void actualizarUbicacion()}
                  style={[estilo.botonSecundario, { marginTop: tamano.espacio }]}
                >
                  <Text style={estilo.botonSecundarioTexto}>Actualizar ubicación</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* CAMPOS DEL FORMULARIO */}
          <View style={{ marginTop: tamano.espacioGrande }}>
            <Text style={estilo.etiqueta}>Nombre del ave</Text>
            <TextInput
              accessibilityLabel="Nombre del ave"
              value={nombre}
              onChangeText={setNombre}
              placeholder={'"no identificada" es válido'}
              placeholderTextColor={color.textoSuave}
              style={estilo.campo}
            />
            {avisoDeError(erroresFormulario.nombre)}

            <Text style={[estilo.etiqueta, { marginTop: tamano.espacio }]}>Cantidad de ejemplares</Text>
            <TextInput
              accessibilityLabel="Cantidad de ejemplares"
              value={cantidad}
              onChangeText={setCantidad}
              inputMode="numeric"
              placeholder="1"
              placeholderTextColor={color.textoSuave}
              style={estilo.campo}
            />
            {avisoDeError(erroresFormulario.cantidad)}

            <Text style={[estilo.etiqueta, { marginTop: tamano.espacio }]}>Fecha y hora</Text>
            <TextInput
              accessibilityLabel="Fecha y hora del avistamiento"
              value={fecha}
              onChangeText={setFecha}
              style={estilo.campo}
            />
            <Pressable
              accessibilityLabel="Usar la fecha y hora de ahora"
              onPress={() => setFecha(nuevaFechaLocal())}
              style={[estilo.botonSecundario, { marginTop: tamano.espacioCompacto }]}
            >
              <Text style={estilo.botonSecundarioTexto}>Usar fecha de ahora</Text>
            </Pressable>

            <Text style={[estilo.etiqueta, { marginTop: tamano.espacio }]}>Notas (opcional)</Text>
            <TextInput
              accessibilityLabel="Notas"
              value={notas}
              onChangeText={setNotas}
              multiline
              placeholder="Comportamiento, plumaje, etc."
              placeholderTextColor={color.textoSuave}
              style={[estilo.campo, { height: 96, textAlignVertical: 'top' }]}
            />
          </View>

          {errorGuardado ? (
            <View style={{ marginTop: tamano.espacioGrande }}>
              <EstadoError mensaje={errorGuardado} alReintentar={() => void guardar()} />
            </View>
          ) : null}

          <Pressable
            accessibilityLabel="Guardar avistamiento"
            disabled={guardando}
            onPress={() => void guardar()}
            style={[estilo.botonPrimario, { marginTop: tamano.espacioGrande }]}
          >
            <Text style={estilo.botonPrimarioTexto}>{guardando ? 'Guardando…' : 'Guardar avistamiento'}</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

function avisoDeError(mensaje?: string) {
  if (!mensaje) {
    return null;
  }
  return <Text style={{ fontSize: 14, color: color.peligro, marginTop: 6 }}>{mensaje}</Text>;
}

function renderConfirmacion(volverAlListado: () => void) {
  return (
    <View>
      <Text style={estilo.tituloPantalla}>Avistamiento guardado</Text>
      <Text style={[estilo.subtitulo, { marginTop: tamano.espacio }]}>
        La foto y los datos quedaron guardados en el dispositivo.
      </Text>
      <Pressable
        accessibilityLabel="Volver al listado"
        onPress={volverAlListado}
        style={[estilo.botonPrimario, { marginTop: tamano.espacioGrande }]}
      >
        <Text style={estilo.botonPrimarioTexto}>Volver al listado</Text>
      </Pressable>
    </View>
  );
}