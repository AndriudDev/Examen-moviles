import type { BorradorAvistamiento } from './Avistamiento';

/**
 * Reglas de negocio del registro (RF-01).
 * Devuelve map: nombre del campo → mensaje claro de qué falta.
 * Un campo ausente del map significa que está correcto.
 */
export type ErroresValidacion = Partial<Record<'foto' | 'ubicacion' | 'nombre' | 'cantidad', string>>;

export function validarAvistamiento(borrador: BorradorAvistamiento): ErroresValidacion {
  const errores: ErroresValidacion = {};

  if (!borrador.fotoUri) {
    errores.foto = 'Falta la fotografía: tómala con la cámara.';
  }

  if (!borrador.coordenadas) {
    errores.ubicacion = 'Falta la ubicación: espera la captura del GPS o presiona "Actualizar ubicación".';
  }

  const nombre = borrador.nombre.trim();
  if (nombre.length === 0) {
    errores.nombre = 'Escribe el nombre del ave (o «no identificada»).';
  } else if (nombre.length > 120) {
    errores.nombre = 'El nombre no puede superar 120 caracteres.';
  }

  const cantidad = Number(borrador.cantidad.trim());
  const cantidadEntera = Math.floor(cantidad);
  if (Number.isNaN(cantidad) || cantidad !== cantidadEntera || cantidad < 1) {
    errores.cantidad = 'La cantidad debe ser un número entero mayor o igual a 1.';
  }

  return errores;
}