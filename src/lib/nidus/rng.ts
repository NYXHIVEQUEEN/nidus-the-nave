export function nextSeed(seed: number): number {
  return (Math.imul(seed ^ (seed >>> 15), 1 | seed) + 0x6d2b79f5) >>> 0;
}

export function rand(seed: number): { n: number; seed: number } {
  const seed2 = nextSeed(seed);
  return { n: seed2 / 4294967296, seed: seed2 };
}

export function pick<T>(seed: number, list: readonly T[]): { item: T; seed: number } {
  const r = rand(seed);
  return { item: list[Math.floor(r.n * list.length)] ?? list[0], seed: r.seed };
}

export function idFrom(seed: number, prefix: string): { id: string; seed: number } {
  const r = rand(seed);
  return { id: `${prefix}-${r.seed.toString(36)}`, seed: r.seed };
}
