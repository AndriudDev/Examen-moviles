import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';

import { color } from '../vista/tema';

/**
 * Tema del navegador de pila (expo-router): sin él, el header web se
 * pinta con el tema claro por defecto (fondo gris, borde #D8D8D8).
 * Se define con los mismos colores de `vista/tema.ts` para que el
 * chrome del Stack se funda con el cuerpo de la app.
 */
const temaOscuro = {
  dark: true,
  colors: {
    primary: color.verdeClaro,
    background: color.fondo,
    card: color.superficie,
    text: color.texto,
    border: color.borde,
    notification: color.peligro,
  } as const,
  fonts: DefaultTheme.fonts,
};

/**
 * Layout raíz: navegación tipo pila nativa (RF-06).
 * El header de la pila (flecha atrás + título) se pinta del color del
 * fondo del tema: así la barra de navegación se funde con el cuerpo
 * en vez de mostrar un recuadro de color distinto.
 */
export default function LayoutRaiz() {
  return (
    <ThemeProvider value={temaOscuro}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: color.fondo },
          headerTintColor: color.texto,
          headerShadowVisible: false,
        }}
      />
    </ThemeProvider>
  );
}