import { useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { color, estilo } from './tema';

/**
 * Campo de formulario con foco estilizado (style.md §4.4): borde verde
 * claro + glow cuando está enfocado. Reemplaza al `TextInput` pelado en
 * listado y registro para que todos los campos compartan el mismo foco.
 */
export function CampoTexto({ style, onFocus, onBlur, ...props }: TextInputProps) {
  const [enfocado, setEnfocado] = useState(false);
  return (
    <TextInput
      {...props}
      placeholderTextColor={color.textoSuave}
      onFocus={(evento) => {
        setEnfocado(true);
        onFocus?.(evento);
      }}
      onBlur={(evento) => {
        setEnfocado(false);
        onBlur?.(evento);
      }}
      style={[estilo.campo, enfocado && estilo.campoEnFoco, style]}
    />
  );
}