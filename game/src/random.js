// Seeded random numbers for Rush Hour Kitchen.
// One tiny job: a deterministic RNG so every shift deals the same
// order sequence from the same seed, and runs stay reproducible.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRng(seed) {
  const next = mulberry32(seed);
  return {
    // Float in [0, 1).
    float() {
      return next();
    },
    // Integer in [min, max).
    int(min, max) {
      return min + Math.floor(next() * (max - min));
    },
    // One element of a non-empty array.
    pick(list) {
      return list[Math.floor(next() * list.length)];
    },
    // A weighted pick: entries are [value, weight].
    weighted(entries) {
      let total = 0;
      for (const [, w] of entries) total += w;
      let roll = next() * total;
      for (const [value, w] of entries) {
        roll -= w;
        if (roll <= 0) return value;
      }
      return entries[entries.length - 1][0];
    },
  };
}
