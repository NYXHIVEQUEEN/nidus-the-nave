export type Caste = "miner" | "fab" | "builder" | "lab" | "striker";
export type Job = "mine" | "forge" | "build" | "lab" | "raid";
export type Tab = "hull" | "forge" | "raid" | "minds";
export type FrameId = "warden" | "rook" | "kiln" | "oracle" | "lancer" | "wretch" | "herald";
export type Rarity = "iron" | "bone" | "gold" | "relic";
export type RoomId =
  | "foundry"
  | "solar"
  | "orebay"
  | "barracks"
  | "silo"
  | "nerve"
  | "lab"
  | "hangar"
  | "gundeck"
  | "reliquary"
  | "cloister"
  | "choir"
  | "vault"
  | "crypt"
  | "apse"
  | "spire"
  | "crucible"
  | "mill"
  | "refinery"
  | "sensor"
  | "armory"
  | "dock"
  | "gallery";
export type ZoneId = "spine" | "hold" | "nave" | "fleet" | "crypt";
export type RaidId =
  | "ice"
  | "freighter"
  | "gun"
  | "sister"
  | "gate"
  | "belt"
  | "ossuary"
  | "chapel"
  | "yard"
  | "bloom"
  | "shard"
  | "thorn"
  | "pulpit";
export type TechId =
  | "cheapprint"
  | "teeth"
  | "heat"
  | "hands"
  | "wick"
  | "claws"
  | "caps"
  | "queue"
  | "surgeplus"
  | "longsilo"
  | "framexp"
  | "moltlock"
  | "berthplus"
  | "solarfeed"
  | "slagplus"
  | "salvage"
  | "patrol"
  | "mindheal"
  | "echoyield"
  | "raidreturn"
  | "printfocus"
  | "pulsar"
  | "huskbeds"
  | "nervegrow"
  | "orevein"
  | "partmill"
  | "ribcage"
  | "glassmind"
  | "stingplus"
  | "vaultcaps"
  | "thirdqueue"
  | "longsurge"
  | "daysilo"
  | "mindxp2"
  | "moltcheap"
  | "berthdeep"
  | "solar2"
  | "slagvein"
  | "salvage2"
  | "flesh2"
  | "echogold"
  | "raidkeep"
  | "stamp2"
  | "nervecore"
  | "rosekey"
  | "millcut"
  | "creditfeed"
  | "sensorwatch"
  | "armorteeth"
  | "dockberth"
  | "galleryxp";
export type SalvageId = "ice" | "plate" | "rose" | "bone" | "core";
export type OrderKind = "print" | "build" | "raid" | "surge" | "slag" | "wake" | "mark" | "expand";

export type Mind = {
  id: string;
  name: string;
  frame: FrameId;
  portrait: string;
  line: string;
  rarity: Rarity;
  job: Job;
  seated: boolean;
  xp: number;
  level: number;
  stats: { mine: number; forge: number; build: number; raid: number; lab: number };
  fracture: string;
  wounded: boolean;
  alive: boolean;
};

export type Candidate = Omit<Mind, "id" | "job" | "seated" | "xp" | "level" | "wounded" | "alive">;

export type RoomState = { built: boolean; progress: number; rank: number; rankWork: number };

export type RaidRun = {
  node: RaidId;
  startedAt: number;
  endsAt: number;
  strikers: number;
  mindId: string | null;
  hp: number;
  hpMax: number;
  hull: number;
  hullMax: number;
  watching: boolean;
  boostUntil: number;
  beat: string;
};

export type BriefCard = {
  id: string;
  kind: "loot" | "build" | "raid" | "wake" | "death" | "molt" | "order" | "event";
  headline: string;
  line: string;
  portrait?: string;
  stamp?: string;
};

export type Order = {
  id: string;
  kind: OrderKind;
  label: string;
  hint: string;
  target: string;
  need: number;
  have: number;
  reward: { ore: number; parts: number; spark: number; echo?: number };
};

export type RoomSpec = {
  id: RoomId;
  label: string;
  parts: number;
  work: number;
  requires?: RoomId;
  also?: RoomId;
  needRank?: { id: RoomId; rank: number };
  needMolt?: number;
  needRaid?: RaidId;
  blurb: string;
  bonus: string;
  tier: number;
  zone: ZoneId;
};

export type TechSpec = {
  id: TechId;
  label: string;
  work: number;
  parts: number;
  blurb: string;
  requires?: TechId;
  needRoom?: RoomId;
  needMolt?: number;
  tier: number;
};

export type GameState = {
  version: number;
  started: boolean;
  lastTick: number;
  hiveAge: number;
  hiveRank: number;
  ore: number;
  parts: number;
  credits: number;
  autoSell: boolean;
  charge: number;
  spark: number;
  sparkNeed: number;
  echo: number;
  swarm: Record<Caste, number>;
  casteLevel: Record<Caste, number>;
  casteXp: Record<Caste, number>;
  printCaste: Caste;
  autoPrint: boolean;
  autoBuild: boolean;
  autoRaid: boolean;
  autoRite: boolean;
  scripts: boolean;
  hullMark: Record<Caste, number>;
  hiveName: string;
  printed: number;
  rooms: Record<RoomId, RoomState>;
  queuedRoom: RoomId | null;
  rankingRoom: RoomId | null;
  tech: Record<TechId, { done: boolean; progress: number }>;
  activeTech: TechId | null;
  minds: Mind[];
  waking: Candidate[] | null;
  selectedMind: string | null;
  raid: RaidRun | null;
  raidCleared: RaidId[];
  raidCount: Partial<Record<RaidId, number>>;
  salvage: Record<SalvageId, number>;
  orders: Order[];
  berthExtra: number;
  eventUntil: number;
  eventKind: string;
  log: { t: number; line: string }[];
  moltLayer: number;
  surgeUntil: number;
  briefing: BriefCard[];
  showBrief: boolean;
  rng: number;
  tab: Tab;
  lastSaveAt: number;
  lastSnapAt: number;
  snapIndex: number;
  slagAt: number;
  pendingGift: { ore: number; parts: number; spark: number; seconds: number; credits?: number } | null;
  mercySurge: boolean;
  returnStreak: number;
  lastReturnAt: number;
  printFocus: { caste: Caste; n: number };
  zoneRank: Record<ZoneId, number>;
};
