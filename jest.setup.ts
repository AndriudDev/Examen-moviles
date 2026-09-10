/**
 * Setup de Jest (fase 8, Ingeniería).
 *
 * El mock oficial de `@react-native-async-storage/async-storage` es necesario
 * aunque los tests de ahora solo ejerciten lógica pura: `modelo/ClimaApi.ts`
 * importa AsyncStorage en el módulo, y sin el mock el import rompe bajo
 * jest-expo.
 */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);