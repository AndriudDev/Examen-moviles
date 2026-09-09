import { Camera, CameraView } from 'expo-camera';
import type { CameraCapturedPicture } from 'expo-camera';

/**
 * Adaptador de cámara (stack.md §9: patrón Adapter).
 * Aísla «expo-camera» del resto de la app: permisos y captura.
 * La foto que devuelve la cámara vive en la caché temporal del dispositivo
 * (o es un data URI en web); la copia persistente la hace el repositorio.
 */

const MENSAJE_SIN_PERMISO =
  'Para registrar la evidencia necesitamos acceso a la cámara. ' +
  'Otorga el permiso o presiona «Tomar foto» para intentarlo de nuevo.';

/**
 * Pide el permiso de cámara la primera vez (RF-01, brief §6.1).
 * No se rompe si el usuario rechaza: lanza para que la vista muestre el aviso.
 */
export async function garantizarAccesoCamara(): Promise<void> {
  const actual = await Camera.getCameraPermissionsAsync();
  if (actual.granted) {
    return;
  }
  const respuesta = await Camera.requestCameraPermissionsAsync();
  if (!respuesta.granted) {
    throw new Error(MENSAJE_SIN_PERMISO);
  }
}

/**
 * Captura la foto del momento con la cámara del dispositivo (RF-01).
 * Comprime a calidad 0.7: miniaturas ligeras para el listado (stack.md §8.3).
 */
export async function tomarFoto(vista: CameraView): Promise<CameraCapturedPicture> {
  return vista.takePictureAsync({ quality: 0.7 });
}