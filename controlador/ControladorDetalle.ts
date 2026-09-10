import type { Avistamiento } from '../modelo/Avistamiento';
import { leerAvistamientoPorId as leerPorId } from '../modelo/RepositoryAvistamientos';
import { obtenerLugarLegible } from './ubicacion';

/**
 * Controlador del detalle (RF-04): carga un avistamiento por id desde el
 * repositorio y resuelve el lugar legible con reverse geocoding (adaptador
 * de ubicación). No conoce pantallas; la vista decide qué estados mostrar.
 */

/** Carga el avistamiento del id; `undefined` si no existe (o el id es inválido). */
export async function cargarAvistamientoPorId(id: string): Promise<Avistamiento | undefined> {
  return leerPorId(id);
}

/**
 * Lugar legible del avistamiento (RF-04). Usa el `lugar` guardado si existe;
 * si no, lo resuelve con reverse geocoding de las coordenadas del registro.
 * `undefined` si no se pudo resolver: la vista degrada con «Lugar no
 * disponible» en vez de mostrar coordenadas crudas (requisito RF-04).
 */
export async function resolverLugar(avistamiento: Avistamiento): Promise<string | undefined> {
  if (avistamiento.lugar) {
    return avistamiento.lugar;
  }
  return obtenerLugarLegible(avistamiento.lat, avistamiento.lng);
}