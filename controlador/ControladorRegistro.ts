import type { Avistamiento, BorradorAvistamiento } from '../modelo/Avistamiento';
import { nuevaFechaLocal, nuevaId } from '../modelo/Avistamiento';
import { guardarAvistamiento as guardarEnRepositorio } from '../modelo/RepositoryAvistamientos';
import type { ErroresValidacion } from '../modelo/validacion';
import { validarAvistamiento } from '../modelo/validacion';

/**
 * Controlador de registro (RF-01): recibe la acción del usuario desde la
 * pantalla, valida contra el modelo y persiste vía el repositorio.
 * No conoce pantallas ni periféricos; la cámara y el GPS se gestionan
 * desde la vista a través de sus adaptadores (controlador/camara, ubicacion).
 */
export type ResultadoGuardado =
  | { ok: true; avistamiento: Avistamiento }
  | { ok: false; errores?: ErroresValidacion; error?: string };

/**
 * Valida el borrador y, si está completo, lo guarda en el repositorio.
 * - Campos faltantes → `errores` con el mensaje por campo (RF-01).
 * - Fallo de persistencia → `error` general; jamás bloquea la pantalla.
 */
export async function guardarRegistro(borrador: BorradorAvistamiento): Promise<ResultadoGuardado> {
  const errores = validarAvistamiento(borrador);
  if (Object.keys(errores).length > 0) {
    return { ok: false, errores };
  }

  // La validación garantiza foto y coordenadas presentes (RF-01).
  const avistamiento: Avistamiento = {
    id: nuevaId(),
    nombre: borrador.nombre.trim(),
    cantidad: Math.floor(Number(borrador.cantidad.trim())),
    fecha: borrador.fecha,
    lat: borrador.coordenadas!.lat,
    lng: borrador.coordenadas!.lng,
    fotoUri: borrador.fotoUri!,
    creadoEn: nuevaFechaLocal(),
    ...(borrador.notas?.trim() ? { notas: borrador.notas.trim() } : {}),
  };

  try {
    await guardarEnRepositorio(avistamiento);
    return { ok: true, avistamiento };
  } catch {
    return {
      ok: false,
      error: 'No se pudo guardar el avistamiento en el dispositivo. Inténtalo de nuevo.',
    };
  }
}