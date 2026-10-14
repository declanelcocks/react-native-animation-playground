jest.mock('react-native-reanimated', () =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  require('react-native-reanimated/mock'),
);

// react-native-mmkv returns an in-memory mock under jest, but still imports
// NitroModules, which throws without the native binary.
jest.mock('react-native-nitro-modules', () => ({ NitroModules: {} }));
