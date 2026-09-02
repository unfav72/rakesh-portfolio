/**
 * Deterministic PRNG. Every organic shape on this site (torn edges, paper
 * creases, ink wobble) is generated from a seed rather than Math.random, so
 * the server and the client draw the exact same paper — no hydration flicker,
 * and the art direction is reproducible.
 */
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return function random() {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
