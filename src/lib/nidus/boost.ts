import type { GameState } from "./types";

export const BOOST_SKU = "boost_x2";
export const BOOST_PRICE = "$2.99";

// Permanent purchase: doubles ore, parts, spark, and cut income (offline included).
export function boostMul(s: Pick<GameState, "boost2x">): number {
  return s.boost2x ? 2 : 1;
}
