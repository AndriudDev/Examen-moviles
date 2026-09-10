import type { Avistamiento, BorradorAvistamiento, Clima } from '../../modelo/Avistamiento';
import { guardarAvistamiento } from '../../modelo/RepositoryAvistamientos';
import { guardarRegistro } from '../ControladorRegistro';

/**
 * Controlador de registro (RF-01): valida contra el modelo y persiste vía el
 * repositorio. El repositorio se mockea: aquí se prueba el contrato del
 * controlador (normalización, errores y fallo de persistencia), no el disco.
 */
jest.mock('../../modelo/RepositoryAvistamientos', () => ({
  guardarAvistamiento: jest.fn(),
}));

const mockGuardar = jest.mocked(guardarAvistamiento);

function borradorValido(sobreescribe: Partial<BorradorAvistamiento> = {}): BorradorAvistamiento {
  return {
    nombre: '  Chincol  ',
    cantidad: '3',
    fecha: '2026-09-10T12:00:00.000Z',
    notas: '  En el poste del patio  ',
    fotoUri: 'file:///caché/camara/abc.jpg',
    coordenadas: { lat: -33.4489, lng: -70.6693 },
    ...sobreescribe,
  };
}

const clima: Clima = {
  temperaturaC: 18.4,
  condicion: 'Lluvia',
  icono: '🌧️',
  humedadPct: 62,
  weatherCode: 61,
  consultadoEn: '2026-09-10T12:05:00.000Z',
};

afterEach(() => {
  mockGuardar.mockReset();
});

describe('guardarRegistro', () => {
  test('borrador incompleto: errores por campo y no se guarda (RF-01)', async () => {
    const resultado = await guardarRegistro(borradorValido({ fotoUri: undefined, coordenadas: undefined }));

    expect(resultado).toEqual({
      ok: false,
      errores: expect.objectContaining({ foto: expect.any(String), ubicacion: expect.any(String) }),
    });
    expect(mockGuardar).not.toHaveBeenCalled();
  });

  test('borrador válido: normaliza y guarda con id y fecha de creación', async () => {
    const resultado = await guardarRegistro(borradorValido({ clima }));

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) {
      return;
    }
    const avistamiento: Avistamiento = resultado.avistamiento;
    expect(avistamiento.nombre).toBe('Chincol');
    expect(avistamiento.cantidad).toBe(3);
    expect(avistamiento.fecha).toBe('2026-09-10T12:00:00.000Z');
    expect(avistamiento.lat).toBe(-33.4489);
    expect(avistamiento.lng).toBe(-70.6693);
    expect(avistamiento.fotoUri).toBe('file:///caché/camara/abc.jpg');
    expect(avistamiento.notas).toBe('En el poste del patio');
    expect(avistamiento.clima).toEqual(clima);
    expect(avistamiento.id).toMatch(/^[a-z0-9]+$/);
    expect(Date.parse(avistamiento.creadoEn)).not.toBeNaN();
    expect(mockGuardar).toHaveBeenCalledTimes(1);
  });

  test('notas en blanco se omiten del registro', async () => {
    const resultado = await guardarRegistro(borradorValido({ notas: '   ' }));

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.avistamiento.notas).toBeUndefined();
    }
  });

  test('sin clima (RF-02): se guarda igual, sin el campo clima', async () => {
    const resultado = await guardarRegistro(borradorValido({ clima: undefined }));

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.avistamiento.clima).toBeUndefined();
    }
  });

  test('fallo de persistencia: error general, nunca bloquea la pantalla', async () => {
    mockGuardar.mockRejectedValue(new Error('disco lleno'));

    const resultado = await guardarRegistro(borradorValido());

    expect(resultado).toEqual({
      ok: false,
      error: expect.stringContaining('No se pudo guardar'),
    });
  });
});