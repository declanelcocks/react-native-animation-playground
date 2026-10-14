import type { SharedValue } from 'react-native-reanimated';

/**
 * A stand-in for a reanimated shared value. The reanimated jest mock stubs
 * most of the shared value API, so tests build their own with the `value`,
 * `get` and `set` accessors the components use.
 */
export const createSharedValue = <T>(initial: T): SharedValue<T> => {
  const shared = {
    get: () => shared.value,
    set: (next: ((current: T) => T) | T) => {
      shared.value =
        typeof next === 'function'
          ? (next as (current: T) => T)(shared.value)
          : next;
    },
    value: initial,
  };

  return shared as unknown as SharedValue<T>;
};
