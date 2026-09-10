import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Avistamiento } from '../Avistamiento';
import {
  guardarAvistamiento,
  leerAvistamientoPorId,
  leerAvistamientos,
} from '../RepositoryAvistamientos';

/**
 * Repositorio (RF-05): AsyncStorage para los metadatos + copia de la foto de
 * la caché de la cámara al almacenamiento persistente vía expo-file-system.
 * expo-file-system se mockea (no hay sistema de archivos en el runner); el
 * mock del `File` destino calcula la URI persistente como el código real.
 */
jest.mock('expo-file-system', () => {
  class File {
    uri: string;
    extension: string;
    copy: jest.Mock;
    constructor(origenOCarpeta: unknown, nombre?: unknown) {
      if (nombre !== undefined) {
        this.uri = `file:///persistente/${String(nombre)}`;
        this.extension = '.jpg';
      } else {
        this.uri = String(origenOCarpeta);
        const partes = this.uri.split('.');
        this.extension = partes.length > 1 ? `.${partes.pop()}` : '';
      }
      this.copy = jest.fn(async () => undefined);
    }
  }
  class Directory {
    create = jest.fn();
  }
  return { Paths: { document: 'file:///documentos' }, File, Directory };
});

const CLAVE_LISTA = 'avistaves.registros';

function avistamiento(sobreescribe: Partial<Avistamiento> = {}): Avistamiento {
  return {
    id: 'id-1',
    nombre: 'Chincol',
    cantidad: 2,
    fecha: '2026-09-10T12:00:00.000Z',
    lat: -33.4489,
    lng: -70.6693,
    fotoUri: 'file:///caché/camara/abc.jpg',
    creadoEn: '2026-09-10T12:00:00.000Z',
    ...sobreescribe,
  };
}

afterEach(() => {
  AsyncStorage.clear();
});

describe('leerAvistamientos', () => {
  test('sin datos guardados devuelve lista vacía', async () => {
    await expect(leerAvistamientos()).resolves.toEqual([]);
  });

  test('devuelve la lista tal cual vive en AsyncStorage', async () => {
    const esperados = [avistamiento()];
    await AsyncStorage.setItem(CLAVE_LISTA, JSON.stringify(esperados));

    await expect(leerAvistamientos()).resolves.toEqual(esperados);
  });

  test('JSON corrupto no rompe la lectura: lista vacía', async () => {
    await AsyncStorage.setItem(CLAVE_LISTA, '{"está roto"');

    await expect(leerAvistamientos()).resolves.toEqual([]);
  });

  test('JSON que no es array: lista vacía', async () => {
    await AsyncStorage.setItem(CLAVE_LISTA, '{}');

    await expect(leerAvistamientos()).resolves.toEqual([]);
  });
});

describe('leerAvistamientoPorId (RF-04)', () => {
  test('devuelve el avistamiento del id', async () => {
    const buscado = avistamiento({ id: 'abc' });
    await AsyncStorage.setItem(CLAVE_LISTA, JSON.stringify([avistamiento({ id: 'xyz' }), buscado]));

    await expect(leerAvistamientoPorId('abc')).resolves.toEqual(buscado);
  });

  test('id inexistente → undefined', async () => {
    await AsyncStorage.setItem(CLAVE_LISTA, JSON.stringify([avistamiento()]));

    await expect(leerAvistamientoPorId('no-existe')).resolves.toBeUndefined();
  });
});

describe('guardarAvistamiento (RF-05)', () => {
  test('foto de la caché: la mueve al almacenamiento persistente y persiste los metadatos', async () => {
    const registro = avistamiento();

    await guardarAvistamiento(registro);

    expect(registro.fotoUri).toBe('file:///persistente/id-1.jpg');
    const guardados = JSON.parse((await AsyncStorage.getItem(CLAVE_LISTA))!) as Avistamiento[];
    expect(guardados).toHaveLength(1);
    expect(guardados[0].fotoUri).toBe('file:///persistente/id-1.jpg');
  });

  test('foto sin extensión: usa .jpg por defecto', async () => {
    const registro = avistamiento({ id: 'id-2', fotoUri: 'file:///caché/sin-extension' });

    await guardarAvistamiento(registro);

    expect(registro.fotoUri).toBe('file:///persistente/id-2.jpg');
  });

  test('foto data URI (web): ya es autosuficiente, no se toca', async () => {
    const registro = avistamiento({ fotoUri: 'data:image/jpeg;base64,AAA' });

    await guardarAvistamiento(registro);

    expect(registro.fotoUri).toBe('data:image/jpeg;base64,AAA');
    const guardados = JSON.parse((await AsyncStorage.getItem(CLAVE_LISTA))!) as Avistamiento[];
    expect(guardados[0].fotoUri).toBe('data:image/jpeg;base64,AAA');
  });

  test('foto ya persistente: no se vuelve a copiar', async () => {
    const registro = avistamiento({ fotoUri: 'file:///documentos/avistaves-fotos/abc.jpg' });

    await guardarAvistamiento(registro);

    expect(registro.fotoUri).toBe('file:///documentos/avistaves-fotos/abc.jpg');
  });

  test('agrega el nuevo registro a los ya guardados', async () => {
    await AsyncStorage.setItem(CLAVE_LISTA, JSON.stringify([avistamiento({ id: 'viejo' })]));

    await guardarAvistamiento(avistamiento({ id: 'nuevo' }));

    const guardados = JSON.parse((await AsyncStorage.getItem(CLAVE_LISTA))!) as Avistamiento[];
    expect(guardados.map((a) => a.id)).toEqual(['viejo', 'nuevo']);
  });
});