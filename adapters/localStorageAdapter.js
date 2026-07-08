const clone = (value) => {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

export const createLocalStorageAdapter = ({ storageKey, seed }) => ({
  name: "localStorage",

  load() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey));
      if (stored?.patients?.length) return stored;
    } catch {
      // Fall back to seed data if local storage is unavailable or corrupted.
    }

    return clone(seed);
  },

  save(state) {
    localStorage.setItem(storageKey, JSON.stringify(state));
  },

  reset() {
    const freshState = clone(seed);
    localStorage.setItem(storageKey, JSON.stringify(freshState));
    return freshState;
  },

  exportSnapshot(state) {
    return JSON.stringify(state, null, 2);
  },
});
