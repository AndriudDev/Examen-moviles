import * as Location from 'expo-location';

/**
 * Adaptador de ubicación (stack.md §9: patrón Adapter).
 * Aísla «expo-location»: permiso, GPS con timeout y formato de coordenadas.
 * La captura es automática al abrir el formulario y manual con
 * «Actualizar ubicación»; el usuario nunca escribe coordenadas (RF-01).
 * El reverse geocoding (lugar legible) lo usa la pantalla de detalle (RF-04).
 */

export type Coordenadas = { lat: number; lng: number };

/** Sin respuesta del GPS en 10 s, se avisa al usuario en vez de colgar la pantalla. */
const TIEMPO_MAXIMO_GPS_MS = 10_000;
/** Sin respuesta del geocoder en 8 s, el detalle muestra «Lugar no disponible». */
const TIEMPO_MAXIMO_GEOCODING_MS = 8_000;

/**
 * Captura la posición actual del dispositivo (RF-01).
 * Pide el permiso de ubicación explicando el uso; si se rechaza, lanza
 * para que la vista muestre el aviso con opción a reintentar.
 */
export async function capturarCoordenadas(): Promise<Coordenadas> {
  const permisoActual = await Location.getForegroundPermissionsAsync();
  if (!permisoActual.granted) {
    const respuesta = await Location.requestForegroundPermissionsAsync();
    if (!respuesta.granted) {
      throw new Error(
        'La app usa la ubicación para registrar dónde viste el ave. ' +
          'Sin acceso al GPS no se puede guardar el avistamiento.',
      );
    }
  }

  const posicion = await conTiempoMaximo(
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
    TIEMPO_MAXIMO_GPS_MS,
  );
  return { lat: posicion.coords.latitude, lng: posicion.coords.longitude };
}

/**
 * Rechaza la promesa si tarda más de `milisegundos`: límite de espera para
 * operaciones sin API de cancelación (GPS). El clima usa AbortController en
 * `modelo/ClimaApi.ts`, que sí aborta la petición HTTP en curso.
 */
export async function conTiempoMaximo<T>(promesa: Promise<T>, milisegundos: number): Promise<T> {
  return Promise.race([
    promesa,
    new Promise<never>((_, rechazar) => {
      setTimeout(() => rechazar(new Error('La operación tardó demasiado.')), milisegundos);
    }),
  ]);
}

/**
 * Lugar legible de unas coordenadas (RF-04): reverse geocoding con
 * `reverseGeocodeAsync` de expo-location. Mostrar «-33.4489, -70.6693» no
 * cumple el requisito; el resultado se presenta como dirección entendible.
 * Devuelve `undefined` si no se puede resolver (permiso denegado, sin red o
 * sin resultado) y nunca lanza: la pantalla de detalle degrada con un aviso.
 * No pide permiso aquí: el flujo de registro (RF-01) ya lo solicitó; si se
 * rechazó, simplemente no hay lugar legible.
 */
export async function obtenerLugarLegible(lat: number, lng: number): Promise<string | undefined> {
  try {
    const permisoActual = await Location.getForegroundPermissionsAsync();
    if (!permisoActual.granted) {
      return undefined;
    }
    const direcciones = await conTiempoMaximo(
      Location.reverseGeocodeAsync({ latitude: lat, longitude: lng }),
      TIEMPO_MAXIMO_GEOCODING_MS,
    );
    return formatearDireccion(direcciones[0]);
  } catch {
    return undefined;
  }
}

/**
 * Compone una dirección legible desde el resultado del geocoder.
 * `formattedAddress` solo existe en Android (ej. «Av. Providencia 123, …»);
 * en iOS se arma con los componentes más específicos disponibles.
 */
function formatearDireccion(direccion?: Location.LocationGeocodedAddress): string | undefined {
  if (!direccion) {
    return undefined;
  }
  if (direccion.formattedAddress) {
    return direccion.formattedAddress;
  }
  const calle = [direccion.streetNumber, direccion.street].filter(Boolean).join(' ');
  const partes = [
    direccion.name,
    calle,
    direccion.district,
    direccion.city,
    direccion.region,
    direccion.country,
  ].filter((parte): parte is string => Boolean(parte));
  return partes.length > 0 ? partes.join(', ') : undefined;
}