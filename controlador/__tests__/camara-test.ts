import { Camera, CameraView } from 'expo-camera';

import { garantizarAccesoCamara, tomarFoto } from '../camara';

/**
 * Adaptador de cámara (stack.md §9, patrón Adapter): expo-camera se mockea
 * para probar permisos y captura sin periférico real (RF-01).
 */
jest.mock('expo-camera', () => ({
  Camera: {
    getCameraPermissionsAsync: jest.fn(),
    requestCameraPermissionsAsync: jest.fn(),
  },
  CameraView: class {},
}));

const mockPermisoActual = jest.mocked(Camera.getCameraPermissionsAsync);
const mockPedirPermiso = jest.mocked(Camera.requestCameraPermissionsAsync);

afterEach(() => {
  jest.clearAllMocks();
});

describe('garantizarAccesoCamara (RF-01, brief §6.1)', () => {
  test('permiso ya concedido: no pide nada', async () => {
    mockPermisoActual.mockResolvedValue({ granted: true } as never);

    await expect(garantizarAccesoCamara()).resolves.toBeUndefined();
    expect(mockPedirPermiso).not.toHaveBeenCalled();
  });

  test('sin permiso: lo pide y, si lo concede, continúa', async () => {
    mockPermisoActual.mockResolvedValue({ granted: false } as never);
    mockPedirPermiso.mockResolvedValue({ granted: true } as never);

    await expect(garantizarAccesoCamara()).resolves.toBeUndefined();
    expect(mockPedirPermiso).toHaveBeenCalledTimes(1);
  });

  test('permiso rechazado: lanza el aviso para que la vista lo muestre', async () => {
    mockPermisoActual.mockResolvedValue({ granted: false } as never);
    mockPedirPermiso.mockResolvedValue({ granted: false } as never);

    await expect(garantizarAccesoCamara()).rejects.toThrow('cámara');
  });
});

describe('tomarFoto', () => {
  test('captura con calidad 0.7 (miniaturas ligeras) y devuelve la foto', async () => {
    const foto = { uri: 'file:///caché/camara/foto.jpg' };
    const vista = { takePictureAsync: jest.fn().mockResolvedValue(foto) } as unknown as CameraView;

    await expect(tomarFoto(vista)).resolves.toEqual(foto);
    expect(vista.takePictureAsync).toHaveBeenCalledWith({ quality: 0.7 });
  });
});