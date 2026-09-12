import type {
  Caste,
  Candidate,
  FrameId,
  GameState,
  Job,
  Order,
  Rarity,
  RaidId,
  RoomId,
  RoomSpec,
  SalvageId,
  TechId,
  TechSpec,
  ZoneId,
} from "./types";
import { idFrom, pick, rand } from "./rng";

export const CASTES: { id: Caste; label: string; verb: string }[] = [
  { id: "miner", label: "MINE", verb: "Chip" },
  { id: "fab", label: "MAKE", verb: "Forge" },
  { id: "builder", label: "BUILD", verb: "Raise" },
  { id: "lab", label: "LAB", verb: "Seek" },
  { id: "striker", label: "RAID", verb: "Send" },
];

export const JOBS: { id: Job; label: string }[] = [
  { id: "mine", label: "MINE" },
  { id: "forge", label: "MAKE" },
  { id: "build", label: "BUILD" },
  { id: "lab", label: "LAB" },
  { id: "raid", label: "RAID" },
];

export const FRAMES: Record<
  FrameId,
  {
    label: string;
    caste: Caste;
    rarity: Rarity;
    portraits: string[];
    job: Job;
    fracture: string[];
    lines: string[];
    names: string[];
  }
> = {
  warden: {
    label: "WARDEN",
    caste: "miner",
    rarity: "iron",
    portraits: ["/nidus/warden.jpg", "/nidus/warden2.jpg", "/nidus/warden3.jpg", "/nidus/warden4.jpg"],
    job: "mine",
    fracture: ["Hoards the ice.", "Will not share ore."],
    lines: ["The ice belongs to us.", "I keep what I take.", "Ore first. Always."],
    names: ["Husk-7", "Vesper", "Nave", "Mora", "Cinder"],
  },
  rook: {
    label: "ROOK",
    caste: "builder",
    rarity: "iron",
    portraits: ["/nidus/rook.jpg", "/nidus/rook2.jpg"],
    job: "build",
    fracture: ["Rebuilds finished rooms.", "Spends extra parts."],
    lines: ["The hull is wrong.", "I will correct it.", "One more rib."],
    names: ["Rib", "Joist", "Spire", "Ashlar"],
  },
  kiln: {
    label: "KILN",
    caste: "fab",
    rarity: "iron",
    portraits: ["/nidus/kiln.jpg", "/nidus/kiln2.jpg"],
    job: "forge",
    fracture: ["Overprints one caste.", "Burns charge greedy."],
    lines: ["Feed the fire.", "I print until I stop.", "Heat is law."],
    names: ["Cinder", "Slag", "Brazier", "Pyre"],
  },
  oracle: {
    label: "ORACLE",
    caste: "lab",
    rarity: "bone",
    portraits: ["/nidus/oracle.jpg", "/nidus/oracle2.jpg", "/nidus/oracle3.jpg"],
    job: "lab",
    fracture: ["Research veers.", "Speaks in riddles."],
    lines: ["I remember Ring 7.", "The dead hive still talks.", "Do not molt without me."],
    names: ["Wight", "Gilt", "Narthex", "Veil"],
  },
  lancer: {
    label: "LANCER",
    caste: "striker",
    rarity: "bone",
    portraits: ["/nidus/lancer.jpg", "/nidus/lancer2.jpg", "/nidus/lancer3.jpg"],
    job: "raid",
    fracture: ["Wants war.", "Spends drones like ammo."],
    lines: ["Point me at a wreck.", "I do not wait.", "Crown is taken."],
    names: ["Ash", "Pike", "Thorn", "Dirge"],
  },
  wretch: {
    label: "WRETCH",
    caste: "miner",
    rarity: "gold",
    portraits: ["/nidus/wretch.jpg", "/nidus/wretch2.jpg"],
    job: "lab",
    fracture: ["Huge gift. Ugly cost.", "Opens doors you did not want."],
    lines: ["I think I was the enemy.", "The roses remember.", "Bloom or burn."],
    names: ["Bloom", "Briar", "Rookery", "Sable"],
  },
  herald: {
    label: "HERALD",
    caste: "lab",
    rarity: "relic",
    portraits: ["/nidus/herald.jpg", "/nidus/herald2.jpg"],
    job: "raid",
    fracture: ["Demands the sister-wreck.", "Will not sit idle."],
    lines: ["I carry my own crown.", "I am the standard.", "The twin hull calls."],
    names: ["Abbess", "Reliquary", "Vesper-Prime", "Nyx"],
  },
};

export const ZONES: { id: ZoneId; label: string; hint: string }[] = [
  { id: "spine", label: "SPINE", hint: "Charge and stamp." },
  { id: "hold", label: "HOLD", hint: "Ore in. Cut out." },
  { id: "nave", label: "NAVE", hint: "Berths and pews." },
  { id: "fleet", label: "FLEET", hint: "Mouth and teeth." },
  { id: "crypt", label: "CRYPT", hint: "Molt and echo." },
];

export const ROOMS: RoomSpec[] = [
  { id: "foundry", label: "FOUNDRY", parts: 0, work: 0, blurb: "The stamp.", bonus: "Prints drones.", tier: 0, zone: "spine" },
  { id: "solar", label: "SOLAR SPINE", parts: 14, work: 28, blurb: "Feeds SPARK.", bonus: "+spark /s", tier: 0, zone: "spine" },
  { id: "orebay", label: "ORE BAY", parts: 22, work: 42, requires: "solar", blurb: "Ice hold.", bonus: "+ore cap", tier: 1, zone: "hold" },
  { id: "barracks", label: "BARRACKS", parts: 26, work: 52, requires: "solar", blurb: "Berths.", bonus: "+18 pop", tier: 1, zone: "nave" },
  { id: "silo", label: "SILO", parts: 38, work: 70, requires: "orebay", blurb: "Idle vault.", bonus: "+offline hrs", tier: 2, zone: "hold" },
  { id: "nerve", label: "NERVE", parts: 48, work: 86, requires: "barracks", blurb: "Pews for minds.", bonus: "+thrones +pop", tier: 2, zone: "nave" },
  { id: "lab", label: "LAB", parts: 40, work: 72, requires: "solar", blurb: "Glass rites.", bonus: "unlocks rites", tier: 1, zone: "nave" },
  { id: "hangar", label: "HANGAR", parts: 54, work: 100, requires: "barracks", blurb: "Fleet mouth.", bonus: "+raid +pop", tier: 2, zone: "fleet" },
  { id: "railgun", label: "RAILGUN", parts: 28, work: 52, requires: "hangar", blurb: "Long tooth. Rank = pierce.", bonus: "pierce HP", tier: 2, zone: "fleet" },
  { id: "cannon", label: "AUTOCANNON", parts: 24, work: 46, requires: "hangar", blurb: "Close tooth. Rank = volume.", bonus: "volume fire", tier: 2, zone: "fleet" },
  { id: "gundeck", label: "GUN DECK", parts: 62, work: 118, requires: "railgun", also: "cannon", blurb: "Fire control for both teeth.", bonus: "both roles", tier: 3, zone: "fleet" },
  { id: "reliquary", label: "RELIQUARY", parts: 88, work: 155, requires: "nerve", blurb: "Molt cradle.", bonus: "molt +pop", tier: 3, zone: "crypt" },
  { id: "crucible", label: "CRUCIBLE", parts: 36, work: 64, requires: "orebay", needRank: { id: "solar", rank: 2 }, blurb: "Blood kiln.", bonus: "+parts rate", tier: 2, zone: "spine" },
  { id: "cloister", label: "CLOISTER", parts: 44, work: 80, requires: "lab", blurb: "Quiet glass.", bonus: "+spark /s", tier: 2, zone: "nave" },
  { id: "choir", label: "CHOIR", parts: 58, work: 96, requires: "nerve", blurb: "Pews sing.", bonus: "minds XP faster", tier: 3, zone: "nave" },
  { id: "vault", label: "VAULT", parts: 70, work: 120, requires: "silo", blurb: "Deep hold.", bonus: "fat caps", tier: 3, zone: "hold" },
  { id: "crypt", label: "CRYPT", parts: 66, work: 110, requires: "hangar", also: "lab", blurb: "Echo cellar.", bonus: "+echo on death", tier: 3, zone: "crypt" },
  { id: "spire", label: "SPIRE", parts: 78, work: 140, requires: "gundeck", blurb: "Lancet tower.", bonus: "+fleet +spark", tier: 4, zone: "fleet" },
  { id: "apse", label: "APSE", parts: 96, work: 170, requires: "reliquary", needMolt: 1, blurb: "Molt mouth.", bonus: "cheaper molt", tier: 4, zone: "crypt" },
  { id: "mill", label: "STAMP MILL", parts: 32, work: 58, requires: "orebay", blurb: "Parts to CUT.", bonus: "sells robotics", tier: 1, zone: "spine" },
  { id: "refinery", label: "REFINERY", parts: 48, work: 84, requires: "mill", blurb: "Cut the slag.", bonus: "+CUT /s", tier: 2, zone: "hold" },
  { id: "sensor", label: "SENSOR", parts: 40, work: 76, requires: "hangar", blurb: "See the well.", bonus: "watch bonus", tier: 2, zone: "fleet" },
  { id: "armory", label: "ARMORY", parts: 70, work: 126, requires: "gundeck", blurb: "Teeth for hulls.", bonus: "+fleet", tier: 3, zone: "fleet" },
  { id: "dock", label: "DOCK", parts: 60, work: 108, requires: "hangar", blurb: "Second mouth.", bonus: "+raid +pop", tier: 3, zone: "fleet" },
  { id: "gallery", label: "GALLERY", parts: 64, work: 112, requires: "choir", blurb: "Pews for gold.", bonus: "minds XP", tier: 3, zone: "nave" },
];

export const RAIDS: {
  id: RaidId;
  label: string;
  image: string;
  seconds: number;
  need: number;
  salvage: SalvageId;
  blurb: string;
  requires?: RoomId | "herald" | "molt" | RaidId;
}[] = [
  { id: "ice", label: "CUTTER", image: "/nidus/raid-ice.jpg", seconds: 36, need: 2, salvage: "ice", blurb: "Pirate cutter. First duel." },
  { id: "belt", label: "CORSAIR", image: "/nidus/raid-ice.jpg", seconds: 80, need: 3, salvage: "ice", blurb: "A corsair slides into the glass.", requires: "ice" },
  { id: "shard", label: "RAIDER PAIR", image: "/nidus/raid-ice.jpg", seconds: 120, need: 4, salvage: "ice", blurb: "Two hulls. One stays.", requires: "belt" },
  { id: "freighter", label: "ARMED HAULER", image: "/nidus/raid-freighter.jpg", seconds: 180, need: 4, salvage: "plate", blurb: "Guns on a fat hull. Take it.", requires: "hangar" },
  { id: "yard", label: "ESCORT WING", image: "/nidus/raid-freighter.jpg", seconds: 240, need: 5, salvage: "plate", blurb: "Hauler plus teeth.", requires: "freighter" },
  { id: "gun", label: "GUN-KETCH", image: "/nidus/raid-gun.jpg", seconds: 360, need: 6, salvage: "bone", blurb: "A ketch that shoots back.", requires: "gundeck" },
  { id: "ossuary", label: "OSSUARY", image: "/nidus/raid-gun.jpg", seconds: 420, need: 7, salvage: "bone", blurb: "Bones stacked as ammo.", requires: "gun" },
  { id: "thorn", label: "THORN NEST", image: "/nidus/raid-gun.jpg", seconds: 480, need: 8, salvage: "bone", blurb: "Lancer wrecks stacked.", requires: "ossuary" },
  { id: "sister", label: "SISTER-WRECK", image: "/nidus/raid-sister.jpg", seconds: 680, need: 8, salvage: "rose", blurb: "The twin hull. Herald wants it.", requires: "herald" },
  { id: "bloom", label: "ROSE BLOOM", image: "/nidus/raid-sister.jpg", seconds: 540, need: 8, salvage: "rose", blurb: "The roses remember.", requires: "sister" },
  { id: "gate", label: "THE GATE", image: "/nidus/raid-gate.jpg", seconds: 980, need: 10, salvage: "core", blurb: "Molt-locked door.", requires: "molt" },
  { id: "chapel", label: "VOID CHAPEL", image: "/nidus/raid-gate.jpg", seconds: 820, need: 10, salvage: "core", blurb: "Pulpit in the dark.", requires: "gate" },
  { id: "pulpit", label: "PULPIT", image: "/nidus/raid-gate.jpg", seconds: 900, need: 12, salvage: "core", blurb: "The last pew.", requires: "chapel" },
];

export const TECH: TechSpec[] = [
  { id: "cheapprint", label: "CHEAP PRINT", work: 60, parts: 16, blurb: "Stamps cost less.", tier: 0 },
  { id: "teeth", label: "MINER TEETH", work: 78, parts: 18, blurb: "Ore rate +25%.", tier: 0 },
  { id: "heat", label: "FAB HEAT", work: 78, parts: 18, blurb: "Parts rate +25%.", tier: 0 },
  { id: "hands", label: "BUILDER HANDS", work: 86, parts: 22, blurb: "Build rate +25%.", tier: 0 },
  { id: "wick", label: "LAB WICK", work: 94, parts: 24, blurb: "Rite rate +25%.", tier: 0 },
  { id: "claws", label: "RAID CLAWS", work: 110, parts: 28, blurb: "Fleet hits harder.", needRoom: "hangar", tier: 1 },
  { id: "caps", label: "FAT CAPS", work: 124, parts: 32, blurb: "Bigger ore/parts holds.", tier: 1 },
  { id: "queue", label: "SECOND QUEUE", work: 140, parts: 40, blurb: "Builders split work.", requires: "hands", tier: 1 },
  { id: "surgeplus", label: "LONG SURGE", work: 108, parts: 26, blurb: "Surge lasts longer.", tier: 1 },
  { id: "longsilo", label: "LONG SILO", work: 155, parts: 42, blurb: "12h idle vault.", needRoom: "silo", tier: 2 },
  { id: "framexp", label: "FRAME XP", work: 124, parts: 32, blurb: "Minds level faster.", tier: 1 },
  { id: "moltlock", label: "MOLT RITE", work: 180, parts: 52, blurb: "Opens molt.", needRoom: "reliquary", tier: 2 },
  { id: "berthplus", label: "DEEP BERTHS", work: 140, parts: 36, blurb: "+16 pop cap.", needRoom: "barracks", tier: 1 },
  { id: "solarfeed", label: "SOLAR FEED", work: 118, parts: 28, blurb: "Spine drinks faster.", needRoom: "solar", tier: 1 },
  { id: "slagplus", label: "SLAG TEETH", work: 70, parts: 16, blurb: "Slag pays more.", tier: 0 },
  { id: "salvage", label: "SALVAGE EYE", work: 124, parts: 32, blurb: "Raids drop extra salvage.", needRoom: "hangar", tier: 1 },
  { id: "patrol", label: "PATROL RITE", work: 108, parts: 26, blurb: "Cleared wrecks stay farmable.", requires: "salvage", tier: 2 },
  { id: "mindheal", label: "FLESH WICK", work: 94, parts: 24, blurb: "Heal minds cheaper.", tier: 1 },
  { id: "echoyield", label: "ECHO CATCH", work: 132, parts: 34, blurb: "Deaths yield more Echo.", needRoom: "crypt", tier: 2 },
  { id: "raidreturn", label: "SAFE RETURN", work: 155, parts: 40, blurb: "Fewer striker losses.", requires: "claws", tier: 2 },
  { id: "printfocus", label: "FOCUS STAMP", work: 100, parts: 24, blurb: "Selected caste prints +1.", requires: "cheapprint", tier: 1 },
  { id: "pulsar", label: "PULSAR FEED", work: 164, parts: 44, blurb: "Events hit more often.", tier: 2 },
  { id: "huskbeds", label: "HUSK BEDS", work: 148, parts: 40, blurb: "+14 pop cap.", requires: "berthplus", tier: 2 },
  { id: "nervegrow", label: "NERVE GROW", work: 170, parts: 46, blurb: "+2 thrones.", needRoom: "nerve", tier: 2 },
  { id: "orevein", label: "ORE VEIN", work: 130, parts: 30, blurb: "Miners bite deeper.", requires: "teeth", tier: 1 },
  { id: "partmill", label: "PART MILL", work: 130, parts: 30, blurb: "Fabs chew faster.", requires: "heat", tier: 1 },
  { id: "ribcage", label: "RIB CAGE", work: 145, parts: 34, blurb: "Builders raise denser.", requires: "hands", tier: 1 },
  { id: "glassmind", label: "GLASS MIND", work: 150, parts: 36, blurb: "Lab drinks SPARK.", requires: "wick", needRoom: "cloister", tier: 2 },
  { id: "stingplus", label: "STING PLUS", work: 160, parts: 40, blurb: "Marks hit harder.", requires: "claws", tier: 2 },
  { id: "vaultcaps", label: "VAULT CAPS", work: 175, parts: 48, blurb: "Holds double again.", requires: "caps", needRoom: "vault", tier: 3 },
  { id: "thirdqueue", label: "THIRD QUEUE", work: 190, parts: 52, blurb: "Three rooms at once.", requires: "queue", tier: 3 },
  { id: "longsurge", label: "BLOOD SURGE", work: 150, parts: 36, blurb: "Surge screams longer.", requires: "surgeplus", tier: 2 },
  { id: "daysilo", label: "DAY SILO", work: 200, parts: 55, blurb: "24h idle vault.", requires: "longsilo", tier: 3 },
  { id: "mindxp2", label: "DEEP FRAME", work: 165, parts: 42, blurb: "Commanders rank faster.", requires: "framexp", needRoom: "choir", tier: 3 },
  { id: "moltcheap", label: "SOFT MOLT", work: 180, parts: 48, blurb: "Molt costs less Echo.", requires: "moltlock", tier: 3 },
  { id: "berthdeep", label: "BONE BERTHS", work: 170, parts: 44, blurb: "+22 pop cap.", requires: "huskbeds", tier: 3 },
  { id: "solar2", label: "TWIN SPINE", work: 155, parts: 38, blurb: "Second spark vein.", requires: "solarfeed", tier: 2 },
  { id: "slagvein", label: "SLAG VEIN", work: 100, parts: 22, blurb: "Slag rains ore.", requires: "slagplus", tier: 1 },
  { id: "salvage2", label: "GREED EYE", work: 170, parts: 44, blurb: "Salvage cooks richer.", requires: "salvage", tier: 2 },
  { id: "flesh2", label: "DEEP WICK", work: 140, parts: 34, blurb: "Heal almost free.", requires: "mindheal", tier: 2 },
  { id: "echogold", label: "GOLD ECHO", work: 185, parts: 50, blurb: "Deaths pour Echo.", requires: "echoyield", tier: 3 },
  { id: "raidkeep", label: "KEEP HULLS", work: 190, parts: 52, blurb: "Almost no striker loss.", requires: "raidreturn", tier: 3 },
  { id: "stamp2", label: "DOUBLE STAMP", work: 145, parts: 36, blurb: "Focus stamp +1 more.", requires: "printfocus", tier: 2 },
  { id: "nervecore", label: "NERVE CORE", work: 200, parts: 56, blurb: "+3 thrones.", requires: "nervegrow", needRoom: "choir", tier: 3 },
  { id: "rosekey", label: "ROSE KEY", work: 210, parts: 60, blurb: "Sister-wreck opens.", requires: "moltlock", needMolt: 1, tier: 3 },
  { id: "millcut", label: "MILL CUT", work: 90, parts: 22, blurb: "Parts sell richer.", needRoom: "mill", tier: 1 },
  { id: "creditfeed", label: "CUT FEED", work: 140, parts: 34, blurb: "Refinery drips CUT.", requires: "millcut", needRoom: "refinery", tier: 2 },
  { id: "sensorwatch", label: "CLEAR EYE", work: 120, parts: 30, blurb: "Watching hits harder.", needRoom: "sensor", tier: 2 },
  { id: "armorteeth", label: "ARMOR TEETH", work: 165, parts: 42, blurb: "Hulls bite deeper.", needRoom: "armory", requires: "claws", tier: 3 },
  { id: "dockberth", label: "DOCK BERTHS", work: 150, parts: 38, blurb: "+12 pop cap.", needRoom: "dock", tier: 3 },
  { id: "galleryxp", label: "GOLD PEWS", work: 155, parts: 40, blurb: "Minds drink faster.", needRoom: "gallery", requires: "framexp", tier: 3 },
];

export function defaultState(now = Date.now()): GameState {
  const rooms = Object.fromEntries(
    ROOMS.map((r) => [r.id, { built: r.id === "foundry", progress: r.id === "foundry" ? r.work : 0, rank: r.id === "foundry" ? 1 : 0, rankWork: 0 }]),
  ) as GameState["rooms"];
  const tech = Object.fromEntries(TECH.map((t) => [t.id, { done: false, progress: 0 }])) as GameState["tech"];
  return {
    version: 1,
    started: false,
    lastTick: now,
    hiveAge: 0,
    hiveRank: 0,
    ore: 72,
    parts: 36,
    credits: 18,
    autoSell: true,
    charge: 10,
    spark: 0,
    sparkNeed: 12,
    echo: 0,
    swarm: { miner: 10, fab: 3, builder: 3, lab: 0, striker: 3 },
    casteLevel: { miner: 0, fab: 0, builder: 0, lab: 0, striker: 0 },
    casteXp: { miner: 0, fab: 0, builder: 0, lab: 0, striker: 0 },
    printCaste: "miner",
    autoPrint: true,
    autoBuild: false,
    autoRaid: false,
    autoRite: false,
    kilnOn: true,
    scripts: false,
    hullMark: { miner: 0, fab: 0, builder: 0, lab: 0, striker: 0 },
    hiveName: "NAVE-1",
    printed: 16,
    rooms,
    queuedRoom: null,
    rankingRoom: null,
    tech,
    activeTech: null,
    minds: [],
    waking: null,
    selectedMind: null,
    raid: null,
    raidCleared: [],
    raidCount: {},
    salvage: { ice: 0, plate: 0, rose: 0, bone: 0, core: 0 },
    orders: [],
    berthExtra: 0,
    eventUntil: 0,
    eventKind: "",
    log: [],
    moltLayer: 0,
    surgeUntil: 0,
    briefing: [],
    showBrief: false,
    rng: 0xc0ffee ^ (now % 1_000_000),
    tab: "hull",
    lastSaveAt: 0,
    lastSnapAt: 0,
    snapIndex: 0,
    slagAt: 0,
    pendingGift: null,
    mercySurge: false,
    returnStreak: 0,
    lastReturnAt: 0,
    printFocus: { caste: "miner", n: 0 },
    zoneRank: { spine: 0, hold: 0, nave: 0, fleet: 0, crypt: 0 },
    callPaid: 0,
  };
}

export function berthCap(s: GameState): number {
  const barracks = s.rooms.barracks?.built ? 18 + (s.rooms.barracks.rank ?? 0) * 5 : 0;
  const nerve = s.rooms.nerve?.built ? 8 + (s.rooms.nerve.rank ?? 0) * 4 : 0;
  const hangar = s.rooms.hangar?.built ? 6 + (s.rooms.hangar.rank ?? 0) * 2 : 0;
  const rel = s.rooms.reliquary?.built ? 8 : 0;
  const choir = s.rooms.choir?.built ? 6 : 0;
  const rites =
    (s.tech.berthplus?.done ? 16 : 0) +
    (s.tech.huskbeds?.done ? 14 : 0) +
    (s.tech.berthdeep?.done ? 22 : 0) +
    (s.tech.dockberth?.done ? 12 : 0);
  return 22 + barracks + nerve + hangar + rel + choir + rites + s.moltLayer * 8 + (s.berthExtra ?? 0) + (s.rooms.dock?.built ? 8 : 0);
}

export function expandCost(s: GameState): { credits: number; add: number } {
  const n = s.berthExtra ?? 0;
  return { credits: 24 + n * 10, add: 2 };
}

export const ORE_CUT = 0.42;
export const PARTS_CUT = 1.12;
/** Ore the kiln drinks per part stamped. */
export const ORE_PER_PART = 1.65;

export function sellYield(kind: "ore" | "parts", n: number, s: GameState): number {
  const mill = s.rooms.mill?.built ? 1.18 : 1;
  const ref = s.rooms.refinery?.built ? 1.22 : 1;
  const rite = s.tech.millcut?.done ? 1.16 : 1;
  const z = 1 + (s.zoneRank?.hold ?? 0) * 0.05;
  const rate = kind === "ore" ? ORE_CUT : PARTS_CUT;
  return n * rate * mill * ref * rite * z;
}

export function zoneCost(s: GameState, id: ZoneId): number {
  const n = (s.zoneRank?.[id] ?? 0) + 1;
  return Math.ceil(36 * n * (1 + n * 0.12));
}

export function oreCap(s: GameState): number {
  const bay = s.rooms.orebay?.built ? 1800 + (s.rooms.orebay.rank ?? 0) * 280 : 0;
  const vault = s.rooms.vault?.built ? 2200 : 0;
  const rites = (s.tech.caps?.done ? 1400 : 0) + (s.tech.vaultcaps?.done ? 1800 : 0);
  return (520 + bay + vault + rites) * (1 + s.moltLayer * 0.45);
}

export function partsCap(s: GameState): number {
  const foundry = s.rooms.foundry?.built ? 220 + (s.rooms.foundry.rank ?? 0) * 80 : 0;
  const cruc = s.rooms.crucible?.built ? 260 : 0;
  const vault = s.rooms.vault?.built ? 400 : 0;
  const rites = (s.tech.caps?.done ? 480 : 0) + (s.tech.vaultcaps?.done ? 700 : 0);
  return (280 + foundry + cruc + vault + rites) * (1 + s.moltLayer * 0.45);
}

export function sparkCap(s: GameState): number {
  return (
    18 +
    (s.rooms.solar?.built ? 8 : 0) +
    (s.rooms.solar?.rank ?? 0) * 2 +
    (s.rooms.lab?.built ? 4 : 0) +
    (s.rooms.cloister?.built ? 6 : 0) +
    (s.tech.glassmind?.done ? 4 : 0)
  );
}

export function chargeCap(s: GameState): number {
  return (
    16 +
    (s.rooms.solar?.built ? 10 : 0) +
    (s.rooms.solar?.rank ?? 0) * 4 +
    (s.rooms.silo?.built ? 6 : 0) +
    (s.rooms.spire?.built ? 5 : 0) +
    (s.tech.solar2?.done ? 6 : 0)
  );
}

export function offlineCapSec(s: GameState): number {
  const h = s.tech.daysilo?.done ? 24 : s.rooms.silo?.built || s.tech.longsilo?.done ? 14 : 10;
  const rank = s.rooms.silo?.rank ?? 0;
  return (h + rank) * 3600;
}

export function totalSwarm(s: GameState): number {
  return s.swarm.miner + s.swarm.fab + s.swarm.builder + s.swarm.lab + s.swarm.striker;
}

export function printCost(s: GameState): { ore: number; parts: number } {
  const base = Math.pow(1.08, Math.max(0, s.printed - 16));
  const cheap = s.tech.cheapprint?.done ? 0.74 : 1;
  const foundry = 1 - Math.min(0.18, (s.rooms.foundry.rank ?? 0) * 0.04);
  return { ore: Math.ceil(4 * base * cheap * foundry), parts: Math.ceil(2 * base * cheap * foundry) };
}

export function throneCap(s: GameState): number {
  return (
    1 +
    (s.rooms.nerve?.built ? 2 : 0) +
    (s.rooms.choir?.built ? 1 : 0) +
    s.moltLayer +
    (s.tech.nervegrow?.done ? 2 : 0) +
    (s.tech.nervecore?.done ? 3 : 0) +
    (s.rooms.nerve.rank ?? 0)
  );
}

function jobBonus(s: GameState, job: Job): number {
  let m = 1;
  for (const mind of s.minds) {
    if (!mind.alive || mind.job !== job) continue;
    const seated = mind.seated;
    const w = seated ? 1 : 0.55;
    const talent = (mind.level >= 3 && seated ? 1.12 : 1) * (mind.level >= 8 ? 1.18 : 1);
    const wound = mind.wounded ? (mind.level >= 5 ? 0.82 : 0.6) : 1;
    const stat =
      job === "mine"
        ? mind.stats.mine
        : job === "forge"
          ? mind.stats.forge
          : job === "build"
            ? mind.stats.build
            : job === "lab"
              ? mind.stats.lab
              : mind.stats.raid;
    m *= 1 + 0.24 * w * stat * wound * talent;
    if (mind.fracture.includes("Hoards") && job === "build") m *= 0.88;
    if (mind.fracture.includes("Spends extra") && job === "build") m *= 0.9;
    if (mind.fracture.includes("Burns charge") && job === "forge") m *= 1.12;
  }
  return m;
}

export function rates(s: GameState, now: number) {
  const surge = now < s.surgeUntil ? (s.tech.longsurge?.done ? 7.2 : s.tech.surgeplus?.done ? 6.2 : 5.2) : 1;
  const molt = 1 + s.moltLayer * 0.28;
  const chargeFactor = s.rooms.solar?.built ? Math.min(1, 0.62 + (s.rooms.solar.rank ?? 0) * 0.07) : 0.7;
  const hum = 1.12 + Math.min(0.5, s.hiveAge / 720);
  const idle = 1.28;
  const lvl = (c: Caste) => Math.pow(1.12, s.casteLevel?.[c] ?? 0);
  const mark = (c: Caste) => 1 + (s.hullMark[c] ?? 0) * 0.09;
  const rr = (id: RoomId, per = 0.08) => 1 + (s.rooms[id]?.rank ?? 0) * per;
  const orePerSec =
    s.swarm.miner *
    (2.55 / 60) *
    lvl("miner") *
    mark("miner") *
    molt *
    surge *
    chargeFactor *
    hum *
    idle *
    jobBonus(s, "mine") *
    rr("orebay", 0.07) *
    (s.tech.teeth?.done ? 1.22 : 1) *
    (s.tech.orevein?.done ? 1.18 : 1);
  const partsPerSec =
    Math.min(s.ore > 0.5 ? s.swarm.fab : 0, s.swarm.fab) *
    (3.4 / 60) *
    lvl("fab") *
    mark("fab") *
    molt *
    surge *
    chargeFactor *
    hum *
    idle *
    jobBonus(s, "forge") *
    rr("foundry", 0.08) *
    (s.rooms.crucible?.built ? 1.16 : 1) *
    (s.tech.heat?.done ? 1.22 : 1) *
    (s.tech.partmill?.done ? 1.18 : 1);
  const buildPerSec =
    s.swarm.builder *
    (2.55 / 60) *
    lvl("builder") *
    mark("builder") *
    molt *
    surge *
    chargeFactor *
    hum *
    idle *
    jobBonus(s, "build") *
    rr("barracks", 0.06) *
    (s.tech.hands?.done ? 1.25 : 1) *
    (s.tech.ribcage?.done ? 1.2 : 1) *
    (s.tech.queue?.done ? 1.15 : 1) *
    (s.tech.thirdqueue?.done ? 1.18 : 1);
  const labPerSec =
    s.swarm.lab *
    (2.6 / 60) *
    lvl("lab") *
    mark("lab") *
    molt *
    surge *
    chargeFactor *
    hum *
    idle *
    jobBonus(s, "lab") *
    rr("lab", 0.1) *
    (s.rooms.cloister?.built ? 1.14 : 1) *
    (s.tech.wick?.done ? 1.25 : 1) *
    (s.tech.glassmind?.done ? 1.2 : 1);
  const sparkPerSec =
    (0.012 +
      (s.rooms.solar?.built ? 0.018 : 0) +
      (s.rooms.solar?.rank ?? 0) * 0.004 +
      totalSwarm(s) * 0.008) *
    (s.tech.wick?.done ? 1.12 : 1) *
    (s.tech.glassmind?.done ? 1.1 : 1) *
    (s.rooms.cloister?.built ? 1.12 : 1) *
    mark("lab") *
    jobBonus(s, "lab") *
    (1 + s.minds.filter((m) => m.alive && m.seated && m.job === "lab").length * 0.08);
  const slow = 0.5;
  const sparkDrain =
    (0.0018 * Math.max(1, totalSwarm(s)) + (now < s.surgeUntil ? 0.02 : 0)) * slow;
  const chargeGen =
    0.026 +
    (s.rooms.solar?.built ? 0.048 : 0) +
    (s.rooms.solar?.rank ?? 0) * 0.01 +
    (s.rooms.spire?.built ? 0.014 : 0) +
    (s.tech.solarfeed?.done ? 0.012 : 0) +
    (s.tech.solar2?.done ? 0.016 : 0);
  const chargeDrain =
    0.016 +
    0.0055 * totalSwarm(s) +
    (now < s.surgeUntil ? 0.04 : 0) +
    (s.minds.some((m) => m.fracture.includes("Burns charge")) ? 0.02 : 0);
  const zHold = 1 + (s.zoneRank?.hold ?? 0) * 0.04;
  const zSpine = 1 + (s.zoneRank?.spine ?? 0) * 0.04;
  const zNave = 1 + (s.zoneRank?.nave ?? 0) * 0.04;
  const creditsPerSec =
    (0.04 +
      (s.rooms.mill?.built ? 0.12 : 0) +
      (s.rooms.refinery?.built ? 0.18 : 0) +
      (s.tech.creditfeed?.done ? 0.05 : 0) +
      (s.rooms.refinery?.rank ?? 0) * 0.03 +
      (s.rooms.foundry?.rank ?? 0) * 0.012) *
    zHold *
    slow;
  const oreOut = orePerSec * zHold * slow;
  const partsOut = partsPerSec * zSpine * slow;
  return {
    orePerSec: oreOut,
    partsPerSec: partsOut,
    oreSpendPerSec: partsOut * ORE_PER_PART,
    buildPerSec: buildPerSec * zNave * slow,
    labPerSec: labPerSec * zNave * slow,
    sparkPerSec: sparkPerSec * slow,
    sparkDrain,
    chargeGen,
    chargeDrain,
    creditsPerSec,
  };
}

export function nextGoal(s: GameState): string {
  if (!s.rooms.solar?.built) return "RAISE SOLAR";
  if (s.waking) return "PICK A MIND";
  if (s.pendingGift) return "CLAIM THE CUT";
  if (s.minds.some((m) => m.alive) && !s.minds.some((m) => m.alive && m.seated)) return "SEAT YOUR COMMANDER";
  if (s.mercySurge) return "MERCY SURGE";
  if (s.raid) return s.raid.watching ? "COMMAND THE WELL" : "WATCH OR LEAVE — FLEET FIGHTS";
  if (totalSwarm(s) >= berthCap(s) - 1) return "OPEN BERTHS — SWARM IS PACKED";
  if (s.minds.filter((m) => m.alive).length === 0) {
    if (!s.rooms.solar?.built) return "SPINE FIRST — SPARK BANKS";
    return "CALL AN OFFICER";
  }
  if (!s.rooms.lab?.built) return "RAISE THE LAB";
  if (!s.autoPrint) return "FLIP AUTO PRINT";
  if (!s.rooms.hangar?.built) return "RAISE THE HANGAR";
  if (!s.rooms.railgun?.built) return "MOUNT THE RAILGUN";
  if (!s.rooms.cannon?.built) return "MOUNT THE AUTOCANNON";
  if (s.swarm.striker >= 2 && !s.raid && !s.raidCleared.includes("ice")) return "DUEL THE CUTTER";
  if (!s.rooms.nerve?.built) return "RAISE THE NERVE";
  if (s.rooms.lab?.built && !s.tech.cheapprint?.done && !s.activeTech) return "START CHEAP PRINT";
  if (s.rooms.reliquary?.built && s.tech.moltlock?.done && s.moltLayer < 1) return "MOLT THE NAVE";
  return "GROW THE SWARM";
}

export function raidUnlocked(s: GameState, id: RaidId): boolean {
  const node = RAIDS.find((r) => r.id === id);
  if (!node) return false;
  if (!s.rooms.hangar?.built || !s.rooms.railgun?.built || !s.rooms.cannon?.built) return false;
  if (!node.requires) return true;
  if (node.requires === "herald")
    return (
      s.minds.some((m) => m.alive && m.frame === "herald") ||
      s.minds.some((m) => m.line.includes("twin")) ||
      Boolean(s.tech.rosekey?.done)
    );
  if (node.requires === "molt") return s.moltLayer >= 1 && s.minds.filter((m) => m.alive).length >= 2;
  if (s.rooms[node.requires as RoomId]) return s.rooms[node.requires as RoomId]?.built ?? false;
  return s.raidCleared.includes(node.requires as RaidId);
}

export function raidNeed(s: GameState, id: RaidId): number {
  const node = RAIDS.find((r) => r.id === id);
  if (!node) return 99;
  const times = s.raidCount?.[id] ?? 0;
  return node.need + Math.floor(times * 0.35);
}

export function rankCost(s: GameState, id: RoomId): { credits: number; work: number } | null {
  const spec = ROOMS.find((r) => r.id === id);
  const room = s.rooms[id];
  if (!spec || !room?.built || (room.rank ?? 0) >= 5) return null;
  const n = (room.rank ?? 0) + 1;
  return { credits: Math.ceil(18 * n * (1 + spec.tier * 0.12)), work: Math.ceil(spec.work * 0.42 * n) };
}

export function rollCandidates(s: GameState): { waking: Candidate[]; rng: number } {
  let seed = s.rng;
  const bias = (Object.entries(s.swarm) as [Caste, number][]).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "miner";
  const pool: FrameId[] = ["warden", "rook", "kiln", "oracle", "lancer"];
  if (rand(seed).n > 0.72) {
    const r = rand(seed);
    seed = r.seed;
    pool.push("wretch");
  }
  if (s.moltLayer > 0 || s.raidCleared.includes("sister")) pool.push("herald");
  const preferred = (Object.values(FRAMES).find((f) => f.caste === bias)?.label ?? "WARDEN").toLowerCase() as FrameId;
  const frames: FrameId[] = [];
  for (let i = 0; i < 3; i++) {
    let f: FrameId;
    if (i === 0 && pool.includes(preferred)) f = preferred;
    else {
      const p = pick(seed, pool.filter((x) => !frames.includes(x)).length ? pool.filter((x) => !frames.includes(x)) : pool);
      seed = p.seed;
      f = p.item;
    }
    frames.push(f);
  }
  const waking: Candidate[] = [];
  for (const frame of frames) {
    const spec = FRAMES[frame];
    if (!spec) continue;
    let r = pick(seed, spec.portraits);
    seed = r.seed;
    const portrait = r.item ?? spec.portraits[0] ?? "/nidus/warden.jpg";
    r = pick(seed, spec.names);
    seed = r.seed;
    const name = r.item ?? spec.names[0] ?? "WAKER";
    r = pick(seed, spec.lines);
    seed = r.seed;
    const line = r.item ?? spec.lines[0] ?? "The spine holds.";
    r = pick(seed, spec.fracture);
    seed = r.seed;
    const fracture = r.item ?? spec.fracture[0] ?? "";
    const st = rand(seed);
    seed = st.seed;
    const pip = () => 1 + Math.floor(rand(seed).n * 3);
    let s1 = rand(seed);
    seed = s1.seed;
    const mine = pip();
    s1 = rand(seed);
    seed = s1.seed;
    const forge = pip();
    s1 = rand(seed);
    seed = s1.seed;
    const build = pip();
    s1 = rand(seed);
    seed = s1.seed;
    const raid = pip();
    s1 = rand(seed);
    seed = s1.seed;
    const lab = pip();
    void mine;
    waking.push({
      name,
      frame,
      portrait,
      line,
      rarity: spec.rarity,
      stats: {
        mine: frame === "warden" ? 3 : mine,
        forge: frame === "kiln" ? 3 : forge,
        build: frame === "rook" ? 3 : build,
        raid: frame === "lancer" || frame === "herald" ? 3 : raid,
        lab: frame === "oracle" || frame === "wretch" ? 3 : lab,
      },
      fracture,
    });
  }
  const idr = idFrom(seed, "wake");
  return { waking, rng: idr.seed };
}

export function candidateToMind(c: Candidate, seed: number): { mind: import("./types").Mind; seed: number } {
  const idr = idFrom(seed, "mind");
  return {
    mind: {
      ...c,
      id: idr.id,
      job: FRAMES[c.frame]?.job ?? "mine",
      seated: true,
      xp: 0,
      level: 1,
      wounded: false,
      alive: true,
    },
    seed: idr.seed,
  };
}

const ORDER_HINTS: { kind: Order["kind"]; label: string; hint: string; target: string; need: number }[] = [
  { kind: "print", label: "STAMP MINERS", hint: "Fill the ice line.", target: "miner", need: 4 },
  { kind: "print", label: "STAMP FABS", hint: "The fire wants hands.", target: "fab", need: 3 },
  { kind: "print", label: "STAMP BUILDERS", hint: "Raise more ribs.", target: "builder", need: 3 },
  { kind: "print", label: "STAMP STRIKERS", hint: "The well is hungry.", target: "striker", need: 3 },
  { kind: "build", label: "RAISE A NODE", hint: "Snap the next room.", target: "any", need: 1 },
  { kind: "raid", label: "TAKE A WRECK", hint: "Send the fleet.", target: "any", need: 1 },
  { kind: "surge", label: "SCREAM ONCE", hint: "Tap SURGE.", target: "surge", need: 1 },
  { kind: "slag", label: "TAP THE HULL", hint: "SLAG three times.", target: "slag", need: 3 },
  { kind: "mark", label: "MARK A HULL", hint: "Rank a caste.", target: "any", need: 1 },
  { kind: "expand", label: "OPEN BERTHS", hint: "Buy pop cap.", target: "berth", need: 1 },
];

export function rollOrders(s: GameState): { orders: Order[]; rng: number } {
  let seed = s.rng;
  const have = s.orders ?? [];
  const next = [...have];
  const used = new Set(next.map((o) => o.label));
  let guard = 0;
  while (next.length < 3 && guard++ < 12) {
    const pool = ORDER_HINTS.filter((h) => !used.has(h.label));
    if (!pool.length) break;
    const p = pick(seed, pool);
    seed = p.seed;
    used.add(p.item.label);
    const id = idFrom(seed, "ord");
    seed = id.seed;
    const n = p.item.need;
    next.push({
      id: id.id,
      kind: p.item.kind,
      label: p.item.label,
      hint: p.item.hint,
      target: p.item.target,
      need: n,
      have: 0,
      reward: { ore: 8 + n * 4, parts: 5 + n * 3, spark: 2 + n, echo: p.item.kind === "raid" ? 1 : 0 },
    });
  }
  return { orders: next.slice(0, 3), rng: seed };
}

