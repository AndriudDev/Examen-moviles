import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Clima } from './Avistamiento';
import { traducirCodigoWmo } from './clima';

/**
 * Servicio HTTP a Open-Meteo (RF-02, stack.md §6.3).
 * Capa Modelo: consulta el clima actual (lat/lng → `Clima`) sin API key.
 *
 * Optimización del consumo de la API (stack.md §8, para el informe):
 *  1. Caché por ubicación con TTL: las coordenadas se redondean a ~2 decimales
 *     (≈1 km) como clave; un resultado de menos de 15 min se reutiliza.
 *  2. Timeout con AbortController (8 s) + 1 reintento.
 *
 * Nunca lanza: si la red falla, hay timeout o la respuesta es inválida,
 * devuelve `null` para que el avistamiento se guarde igual, sin clima (RF-02).
 */

const URL_API = 'https://api.open-meteo.com/v1/forecast';
const TIEMPO_MAXIMO_MS = 8_000;
const REINTENTOS = 1;
const TTL_CACHE_MS = 15 * 60_000;
const PREFIJO_CLAVE = 'avistaves.clima';

type RespuestaOpenMeteo = {
  current?: {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    weather_code?: number;
  };
};

/** Redondeo a ~2 decimales (≈1 km): clave de la caché por ubicación. */
function claveUbicacion(lat: number, lng: number): string {
  return `${PREFIJO_CLAVE}.${lat.toFixed(2)}.${lng.toFixed(2)}`;
}

/** Lee la caché si el resultado guardado todavía está dentro del TTL (15 min). */
async function leerCache(clave: string): Promise<Clima | null> {
  try {
    const contenido = await AsyncStorage.getItem(clave);
    if (!contenido) {
      return null;
    }
    const clima: Clima = JSON.parse(contenido);
    const expirado = Date.now() - Date.parse(clima.consultadoEn) > TTL_CACHE_MS;
    return expirado ? null : clima;
  } catch {
    return null;
  }
}

/**
 * Construye el `Clima` desde el payload de Open-Meteo.
 * `null` si falta algún campo obligatorio (respuesta inválida).
 * Separada del fetch para poder probarla sin red.
 */
export function construirClima(datos: RespuestaOpenMeteo): Clima | null {
  const actual = datos?.current;
  if (
    !actual ||
    typeof actual.temperature_2m !== 'number' ||
    typeof actual.relative_humidity_2m !== 'number' ||
    typeof actual.weather_code !== 'number'
  ) {
    return null;
  }
  const { condicion, icono } = traducirCodigoWmo(actual.weather_code);
  return {
    temperaturaC: actual.temperature_2m,
    condicion,
    icono,
    humedadPct: actual.relative_humidity_2m,
    weatherCode: actual.weather_code,
    consultadoEn: new Date().toISOString(),
  };
}

/**
 * Una llamada a Open-Meteo con timeout real: AbortController aborta la
 * petición (no solo la espera) a los 8 s y libera la conexión.
 * Devuelve `null` ante timeout, error de red o respuesta inválida.
 */
async function pedirALaApi(lat: number, lng: number): Promise<Clima | null> {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAXIMO_MS);
  const url =
    `${URL_API}?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,relative_humidity_2m,weather_code`;
  try {
    const respuesta = await fetch(url, { signal: controlador.signal });
    if (!respuesta.ok) {
      return null;
    }
    const datos = (await respuesta.json()) as RespuestaOpenMeteo;
    return construirClima(datos);
  } catch {
    return null;
  } finally {
    clearTimeout(temporizador);
  }
}

/**
 * Consulta el clima para unas coordenadas (RF-02). Prioriza la caché por
 * ubicación; si no hay caché válida hace el timeout + reintento. Al agotar
 * los intentos devuelve `null`: el registro sigue, sin clima (RF-02).
 */
export async function consultarClima(coordenadas: { lat: number; lng: number }): Promise<Clima | null> {
  const clave = claveUbicacion(coordenadas.lat, coordenadas.lng);

  const enCache = await leerCache(clave);
  if (enCache) {
    return enCache;
  }

  for (let intento = 0; intento <= REINTENTOS; intento += 1) {
    const clima = await pedirALaApi(coordenadas.lat, coordenadas.lng);
    if (clima) {
      try {
        await AsyncStorage.setItem(clave, JSON.stringify(clima));
      } catch {
        // La caché es una optimización: su fallo no debe tumbar el clima obtenido.
      }
      return clima;
    }
  }
  return null;
}