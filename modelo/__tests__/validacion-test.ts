import type { BorradorAvistamiento } from '../Avistamiento';
import { validarAvistamiento } from '../validacion';

/**
 * Reglas de negocio del registro (RF-01): cada campo obligatorio produce
 * su propio mensaje, y un borrador completo no produce ningún error.
 */
function borradorValido(): BorradorAvistamiento {
  return {
    nombre: 'Chincol',
    cantidad: '3',
    fecha: '2026-09-10T12:00:00.000Z',
    notas: 'En el poste del patio',
    fotoUri: 'file:///avistaves-fotos/abc.jpg',
    coordenadas: { lat: -33.4489, lng: -70.6693 },
  };
}

describe('validarAvistamiento', () => {
  test('un borrador completo no produce errores', () => {
    expect(validarAvistamiento(borradorValido())).toEqual({});
  });

  test('«no identificada» es un nombre válido (RF-01)', () => {
    const borrador = { ...borradorValido(), nombre: 'no identificada' };
    expect(validarAvistamiento(borrador).nombre).toBeUndefined();
  });

  test('sin foto el error dice que falta la fotografía', () => {
    const errores = validarAvistamiento({ ...borradorValido(), fotoUri: undefined });
    expect(errores.foto).toContain('Falta la fotografía');
  });

  test('sin coordenadas el error dice que falta la ubicación', () => {
    const errores = validarAvistamiento({ ...borradorValido(), coordenadas: undefined });
    expect(errores.ubicacion).toContain('Falta la ubicación');
  });

  test('sin foto y sin ubicación reporta ambos campos (RF-01: no se guarda sin ellos)', () => {
    const errores = validarAvistamiento({ ...borradorValido(), fotoUri: undefined, coordenadas: undefined });
    expect(errores.foto).toBeDefined();
    expect(errores.ubicacion).toBeDefined();
  });

  test('nombre vacío queda marcado', () => {
    const errores = validarAvistamiento({ ...borradorValido(), nombre: '' });
    expect(errores.nombre).toContain('nombre');
  });

  test('nombre de solo espacios cuenta como vacío', () => {
    const errores = validarAvistamiento({ ...borradorValido(), nombre: '   ' });
    expect(errores.nombre).toBeDefined();
  });

  test('nombre de más de 120 caracteres queda marcado', () => {
    const errores = validarAvistamiento({ ...borradorValido(), nombre: 'A'.repeat(121) });
    expect(errores.nombre).toContain('120');
  });

  test('nombre de exactamente 120 caracteres es válido', () => {
    const errores = validarAvistamiento({ ...borradorValido(), nombre: 'A'.repeat(120) });
    expect(errores.nombre).toBeUndefined();
  });

  test('cantidad no numérica queda marcada', () => {
    const errores = validarAvistamiento({ ...borradorValido(), cantidad: 'muchos' });
    expect(errores.cantidad).toContain('entero');
  });

  test('cantidad decimal queda marcada (debe ser entera)', () => {
    const errores = validarAvistamiento({ ...borradorValido(), cantidad: '2.5' });
    expect(errores.cantidad).toContain('entero');
  });

  test('cantidad 0 o negativa queda marcada (mínimo 1)', () => {
    const cero = validarAvistamiento({ ...borradorValido(), cantidad: '0' });
    const negativa = validarAvistamiento({ ...borradorValido(), cantidad: '-4' });
    expect(cero.cantidad).toBeDefined();
    expect(negativa.cantidad).toBeDefined();
  });

  test('cantidad entera mayor o igual a 1 es válida', () => {
    const errores = validarAvistamiento({ ...borradorValido(), cantidad: '1' });
    expect(errores.cantidad).toBeUndefined();
  });
});