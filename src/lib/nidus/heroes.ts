import type { GameState } from "./types";

export type EdictKind = "ore" | "parts" | "build" | "lab" | "spark" | "credits" | "all" | "offline" | "raid" | "print";

export type Sovereign = {
  id: string;
  name: string;
  title: string;
  archetype: string;
  edict: EdictKind;
  value: number;
  power: string;
  line: string;
  look: string;
  accent: string;
  portrait: string;
  art: string;
};

export const HERO_PRICE = "$0.99";
export const BUNDLE_PRICE = "$9.99";
export const BUNDLE_SKU = "sovereign_all";
export const TRIAL_MS = 10 * 60 * 1000;

const S = (h: Omit<Sovereign, "art">): Sovereign => ({ ...h, art: `/nidus/heroes/${h.id}.webp` });

export const SOVEREIGNS: Sovereign[] = [
  S({ id: "vesper", name: "VESPER", title: "Saint of the Ice Ring", archetype: "Void Valkyrie", edict: "ore", value: 0.6, power: "+60% ORE", line: "The ring kneels. So will you.", look: "winged plate, frost gilt, halberd", accent: "#c4a574", portrait: "/nidus/warden3.jpg" }),
  S({ id: "mora", name: "MORA", title: "Furnace Abbess", archetype: "Forge Priestess", edict: "parts", value: 0.6, power: "+60% PARTS", line: "Heat is scripture.", look: "blackened apron-plate, ember sigils, hammer", accent: "#c45a4a", portrait: "/nidus/kiln2.jpg" }),
  S({ id: "ashlar", name: "ASHLAR", title: "Architect of Ribs", archetype: "Siege Engineer", edict: "build", value: 0.7, power: "+70% BUILD", line: "Every rib is a promise.", look: "exo-frame, rivet gauntlets, plumb-line", accent: "#e8dcc8", portrait: "/nidus/rook2.jpg" }),
  S({ id: "narthex", name: "NARTHEX", title: "Oracle of the Dead Hive", archetype: "Blind Seer", edict: "lab", value: 0.7, power: "+70% RITES", line: "I read the wreck's last dream.", look: "veiled helm, stained-glass visor, censer", accent: "#1faf5b", portrait: "/nidus/oracle3.jpg" }),
  S({ id: "pyre", name: "PYRE", title: "Solar Marquise", archetype: "Sun-Bearer", edict: "spark", value: 0.55, power: "+55% SPARK", line: "Kneel closer to the light.", look: "radiant halo-plate, sunburst cuirass", accent: "#c4a574", portrait: "/nidus/herald2.jpg" }),
  S({ id: "sable", name: "SABLE", title: "Queen of Tithes", archetype: "Mercenary Duchess", edict: "credits", value: 0.6, power: "+60% CUT", line: "Everything has a price. I set it.", look: "fur-trimmed pauldrons, coin chains, rapier", accent: "#c4a574", portrait: "/nidus/wretch2.jpg" }),
  S({ id: "dirge", name: "DIRGE", title: "Lancer of the Black Choir", archetype: "Dragoon", edict: "raid", value: 0.5, power: "+50% RAID CUT", line: "Point. Pierce. Pray.", look: "lance, crested helm, dried-blood plate", accent: "#7a1f2b", portrait: "/nidus/lancer3.jpg" }),
  S({ id: "reliquary", name: "RELIQUARY", title: "Keeper of Long Nights", archetype: "Sleepwarden", edict: "offline", value: 8, power: "+8h OFFLINE", line: "Sleep. I keep the hive.", look: "sarcophagus armor, candle crown", accent: "#e8dcc8", portrait: "/nidus/oracle2.jpg" }),
  S({ id: "briar", name: "BRIAR", title: "Rose of the Stamp", archetype: "Thorn Matriarch", edict: "print", value: 0.25, power: "-25% PRINT COST", line: "Bloom cheap. Bleed rich.", look: "thorned plate, rose-glass visor, whip-chain", accent: "#c45a4a", portrait: "/nidus/wretch.jpg" }),
  S({ id: "nyxara", name: "NYXARA", title: "Crown of the Nave", archetype: "Hive Empress", edict: "all", value: 0.2, power: "+20% EVERYTHING", line: "The nave was always mine.", look: "cathedral crown, cape of banners, scepter", accent: "#c4a574", portrait: "/nidus/herald.jpg" }),
  S({ id: "cinder", name: "CINDER", title: "Deep Vein Breaker", archetype: "Pit Brawler", edict: "ore", value: 0.45, power: "+45% ORE", line: "The rock gives. Or it breaks.", look: "mining gauntlets, soot tattoos, bandana", accent: "#c45a4a", portrait: "/nidus/warden4.jpg" }),
  S({ id: "brazier", name: "BRAZIER", title: "Kiln Sister", archetype: "Flame Gunner", edict: "parts", value: 0.45, power: "+45% PARTS", line: "Keep the mouth fed.", look: "heat-scarred plate, flamer, visor", accent: "#c45a4a", portrait: "/nidus/kiln.jpg" }),
  S({ id: "spire", name: "SPIRE", title: "Warden of Scaffolds", archetype: "Iron Bastion", edict: "build", value: 0.5, power: "+50% BUILD", line: "Up. Always up.", look: "tower shield, scaffold spikes, heavy greaves", accent: "#e8dcc8", portrait: "/nidus/rook.jpg" }),
  S({ id: "veil", name: "VEIL", title: "Glass Mind", archetype: "Techno-Mystic", edict: "lab", value: 0.5, power: "+50% RITES", line: "I think in stained glass.", look: "crystal circuitry, lace-steel hood", accent: "#1faf5b", portrait: "/nidus/oracle.jpg" }),
  S({ id: "halo", name: "HALO", title: "Choir Conductor", archetype: "War Cantor", edict: "spark", value: 0.4, power: "+40% SPARK", line: "Sing, and the spine lights.", look: "choir collar, tuning-fork glaive", accent: "#c4a574", portrait: "/nidus/warden2.jpg" }),
  S({ id: "tithe", name: "TITHE", title: "Collector of the Ring", archetype: "Bounty Queen", edict: "credits", value: 0.45, power: "+45% CUT", line: "Pay the queen.", look: "longcoat plate, ledger-chain, twin pistols", accent: "#c4a574", portrait: "/nidus/warden.jpg" }),
  S({ id: "thorn", name: "THORN", title: "Wreck Reaver", archetype: "Boarding Blade", edict: "raid", value: 0.4, power: "+40% RAID CUT", line: "Their hull is my door.", look: "boarding axe, grapple, hazard gilt", accent: "#7a1f2b", portrait: "/nidus/lancer.jpg" }),
  S({ id: "matins", name: "MATINS", title: "Dawn Sentinel", archetype: "Night Watch", edict: "offline", value: 5, power: "+5h OFFLINE", line: "I was awake before you.", look: "lantern pauldron, long rifle, hooded plate", accent: "#e8dcc8", portrait: "/nidus/lancer2.jpg" }),
  S({ id: "ossuary", name: "OSSUARY", title: "Bone Printer", archetype: "Necro-Smith", edict: "print", value: 0.18, power: "-18% PRINT COST", line: "The dead still work.", look: "bone filigree armor, skull-press gauntlet", accent: "#e8dcc8", portrait: "/nidus/oracle2.jpg" }),
  S({ id: "abbess", name: "ABBESS", title: "Mother of the Molt", archetype: "Iron Saint", edict: "all", value: 0.14, power: "+14% EVERYTHING", line: "Shed. Rise. Again.", look: "wimple-helm, reliquary chest, mace", accent: "#c4a574", portrait: "/nidus/herald2.jpg" }),
];

export const heroSku = (id: string) => `hero_${id}`;

export function sovereignSeats(s: Pick<GameState, "moltLayer">): number {
  return Math.min(3, 1 + Math.max(0, s.moltLayer ?? 0));
}

export function activeSovereigns(s: Pick<GameState, "sovereigns" | "trial">, now: number): Sovereign[] {
  const ids = new Set(s.sovereigns ?? []);
  if (s.trial && now < s.trial.until) ids.add(s.trial.id);
  return SOVEREIGNS.filter((h) => ids.has(h.id));
}

export function edict(s: Pick<GameState, "sovereigns" | "trial">, kind: EdictKind, now: number): number {
  let m = 1;
  for (const h of activeSovereigns(s, now)) {
    if (h.edict === kind) m *= 1 + h.value;
    else if (h.edict === "all" && kind !== "offline" && kind !== "print") m *= 1 + h.value;
  }
  return m;
}

export function edictHours(s: Pick<GameState, "sovereigns" | "trial">, now: number): number {
  return activeSovereigns(s, now)
    .filter((h) => h.edict === "offline")
    .reduce((n, h) => n + h.value, 0);
}

export function printDiscount(s: Pick<GameState, "sovereigns" | "trial">, now: number): number {
  return activeSovereigns(s, now)
    .filter((h) => h.edict === "print")
    .reduce((m, h) => m * (1 - h.value), 1);
}

type Crownable = Pick<GameState, "sovereigns" | "trial" | "trialsUsed" | "moltLayer">;

export function enthrone<T extends Crownable>(s: T, id: string, owned: ReadonlySet<string>): T {
  if (!owned.has(id) || !SOVEREIGNS.some((h) => h.id === id)) return s;
  const seated = (s.sovereigns ?? []).filter((x) => x !== id);
  if (seated.length >= sovereignSeats(s)) seated.shift();
  return { ...s, sovereigns: [...seated, id] };
}

export function unthrone<T extends Crownable>(s: T, id: string): T {
  if (!(s.sovereigns ?? []).includes(id)) return s;
  return { ...s, sovereigns: s.sovereigns.filter((x) => x !== id) };
}

export function startTrial<T extends Crownable>(s: T, id: string, now: number): T {
  if (!SOVEREIGNS.some((h) => h.id === id) || (s.trialsUsed ?? []).includes(id)) return s;
  if (s.trial && now < s.trial.until) return s;
  return { ...s, trial: { id, until: now + TRIAL_MS }, trialsUsed: [...(s.trialsUsed ?? []), id] };
}

// Drops heroes that are no longer owned (refund, other device) from the throne.
export function keepOwned<T extends Crownable>(s: T, owned: ReadonlySet<string>): T {
  const kept = (s.sovereigns ?? []).filter((id) => owned.has(id));
  return kept.length === (s.sovereigns ?? []).length ? s : { ...s, sovereigns: kept };
}
