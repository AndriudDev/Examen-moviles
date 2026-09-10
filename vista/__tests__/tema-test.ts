import { color, estilo, sombra, tamano, tipografia, tintesAvatar } from '../tema';

/**
 * Sistema de diseño (docs/style.md §4): los tokens del tema cumplen el
 * contrato de la guía — paleta de Bootstrap dark, escalas definidas y pares
 * texto/fondo con contraste WCAG AA (≥ 4.5:1) en modo oscuro.
 */
function luminancia(hex: string): number {
  const canales = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lineal = canales.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lineal[0] + 0.7152 * lineal[1] + 0.0722 * lineal[2];
}

function contraste(a: string, b: string): number {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

describe('tema (style.md §4)', () => {
  test('paleta base de Bootstrap dark con la marca verde bosque', () => {
    expect(color).toMatchObject({
      fondo: '#212529',
      superficie: '#2B3035',
      borde: '#495057',
      texto: '#DEE2E6',
      primario: '#2F6B3A',
      acento: '#D9A441',
      peligro: '#EF857A',
    });
  });

  test.each([
    ['texto sobre fondo', color.texto, color.fondo],
    ['texto suave sobre superficie', color.textoSuave, color.superficie],
    ['blanco sobre primario', color.primarioTexto, color.primario],
    ['blanco sobre primario oscuro', color.primarioTexto, color.primarioOscuro],
    ['verde claro sobre fondo', color.verdeClaro, color.fondo],
    ['peligro sobre fondo', color.peligro, color.fondo],
  ])('%s cumple WCAG AA (≥ 4.5:1)', (_nombre, frente, fondo) => {
    expect(contraste(frente, fondo)).toBeGreaterThanOrEqual(4.5);
  });

  test('escala tipográfica con jerarquía (pantalla > sección > cuerpo)', () => {
    expect(tipografia.pantalla.fontSize).toBeGreaterThan(tipografia.seccion.fontSize);
    expect(tipografia.seccion.fontSize).toBeGreaterThan(tipografia.cuerpo.fontSize);
    expect(tipografia.cuerpo.fontSize).toBeGreaterThan(tipografia.detalle.fontSize);
  });

  test('tamaños táctiles y radios definidos por la guía', () => {
    expect(tamano.toque).toBeGreaterThanOrEqual(48);
    expect(tamano.radioBoton).toBe(6);
    expect(tamano.radioPildora).toBe(999);
  });

  test('sombra nativa de tres niveles con boxShadow de RN ≥ 0.76', () => {
    expect(Object.keys(sombra)).toEqual(['nivel1', 'nivel2', 'nivel3']);
    for (const nivel of Object.values(sombra)) {
      expect(nivel.boxShadow).toHaveLength(1);
      expect(nivel.boxShadow[0]).toEqual(
        expect.objectContaining({ offsetX: expect.any(Number), offsetY: expect.any(Number) }),
      );
    }
  });

  test('estilos generados con StyleSheet para todas las piezas clave', () => {
    expect(estilo.pantalla).toBeDefined();
    expect(estilo.cabecera).toBeDefined();
    expect(estilo.botonPrimario).toBeDefined();
    expect(estilo.tarjetaAvistamiento).toBeDefined();
    expect(estilo.campoEnFoco).toBeDefined();
    expect(estilo.fab).toBeDefined();
  });

  test('tintes de avatar únicos, derivados de la paleta', () => {
    expect(new Set(tintesAvatar).size).toBe(tintesAvatar.length);
  });
});