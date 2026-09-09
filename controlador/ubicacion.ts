import * as Location from 'expo-location';

/**
 * Adaptador de ubicación (stack.md §9: patrón Adapter).
 * Aísla «expo-location»: permiso, GPS con timeout y formato de coordenadas.
 * La captura es automática al abrir el formulario y manual con
 * «Actualizar ubicación»; el usuario nunca escribe coordenadas (RF-01).
 * El reverse geocoding (lugar legible) llega en la fase de detalle (RF-04).
 */

export type Coordenadas = { lat: number; lng: number };

/** Sin respuesta del GPS en 10 s, se avisa al usuario en vez de colgar la pantalla. */
const TIEMPO_MAXIMO_GPS_MS = 10_000;

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
 * Rechaza la promesa si tarda más de `milisegundos`: toda operación asíncrona
 * (GPS hoy, clima en la fase RF-02) debe tener límite de espera.
 */
export async function conTiempoMaximo<T>(promesa: Promise<T>, milisegundos: number): Promise<T> {
  return Promise.race([
    promesa,
    new Promise<never>((_, rechazar) => {
      setTimeout(() => rechazar(new Error('La operación tardó demasiado.')), milisegundos);
    }),
  ]);
}