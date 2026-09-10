import type { Avistamiento } from '../modelo/Avistamiento';
import { leerAvistamientos as leerDelRepositorio } from '../modelo/RepositoryAvistamientos';

/**
 * Controlador del listado (RF-03): carga desde el repositorio, ordena por
 * fecha desc y filtra por nombre del ave. No conoce pantallas ni periféricos.
 */

/** Carga todos los avistamientos del dispositivo, del más reciente al más antiguo. */
export async function cargarAvistamientos(): Promise<Avistamiento[]> {
  const lista = await leerDelRepositorio();
  lista.sort((a, b) => fechaEnMilisegundos(b.fecha) - fechaEnMilisegundos(a.fecha));
  return lista;
}

/**
 * Filtro del listado por nombre del ave, insensible a mayúsculas (RF-03).
 * Texto vacío → se devuelve la lista tal cual.
 */
export function filtrarPorNombre(lista: Avistamiento[], texto: string): Avistamiento[] {
  const busqueda = texto.trim().toLocaleLowerCase();
  if (busqueda.length === 0) {
    return lista;
  }
  return lista.filter((avistamiento) => avistamiento.nombre.toLocaleLowerCase().includes(busqueda));
}

/** Fecha ISO inválida (p. ej. editable a mano) se ordena como la más antigua. */
function fechaEnMilisegundos(iso: string): number {
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? 0 : ms;
}