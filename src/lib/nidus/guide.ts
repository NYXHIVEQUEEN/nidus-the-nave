import type { FrameId, GameState, Job, Mind, RoomId, Tab } from "./types";
import { FRAMES, RAIDS, berthCap, raidNeed, raidUnlocked, totalSwarm } from "./content";
import { hiveStage, roomUnlocked } from "./progress";

export type { Stage } from "./progress";
export { hiveStage };

export type GuideId = Tab | "wake" | "view";

export type GuideVerb = { id: string; label: string; line: string };

export type ScreenGuide = {
  id: GuideId;
  title: string;
  blurb: string;
  verbs: GuideVerb[];
};

/** Per-screen ? copy. Five words of function, never a lecture. */
export const GUIDES: Record<GuideId, ScreenGuide> = {
  wake: {
    id: "wake",
    title: "WAKE",
    blurb: "You are the hive. The nave is the body.",
    verbs: [
      { id: "wake", label: "WAKE", line: "Opens the live hive." },
      { id: "boot", label: "BAR", line: "Loads faces and hull plates." },
      { id: "save", label: "SAVE", line: "Your hive is already bound." },
      { id: "song", label: "SONG", line: "Rules of Engagement — Nytheria Nyx." },
    ],
  },
  hull: {
    id: "hull",
    title: "HULL",
    blurb: "The cathedral. Rooms grow as nodes on the nave.",
    verbs: [
      { id: "goal", label: "GOLD CHIP", line: "The one next verb." },
      { id: "rooms", label: "NODES", line: "Tap a dark room to raise it." },
      { id: "surge", label: "SURGE", line: "Short scream. All rates spike." },
      { id: "slag", label: "SLAG", line: "Tap ore + spark. Seven second cool." },
      { id: "hive", label: "HIVE", line: "Mind stamps, builds, raids for you." },
      { id: "hide", label: "EYE", line: "Folds chrome. Station stays." },
    ],
  },
  forge: {
    id: "forge",
    title: "FORGE",
    blurb: "Stamp drones. Open berths. Mark hulls.",
    verbs: [
      { id: "caste", label: "CASTE", line: "Pick who the next stamp is." },
      { id: "print", label: "PRINT", line: "Spends ore + parts. Fills a berth." },
      { id: "auto", label: "AUTO", line: "Keeps stamping while you are gone." },
      { id: "expand", label: "EXPAND", line: "Buys pop cap. Packed swarm idles." },
      { id: "mark", label: "MARK", line: "Ranks that caste. Strikers hit harder." },
    ],
  },
  raid: {
    id: "raid",
    title: "RAID",
    blurb: "Send strikers. The well fights without you.",
    verbs: [
      { id: "send", label: "SEND", line: "Tap an open wreck. Hulls leave." },
      { id: "watch", label: "WATCH", line: "See the well. Leave — it still fights." },
      { id: "boost", label: "BOOST", line: "Spends charge. Command bonus." },
      { id: "mark", label: "MARK", line: "Bigger strikers. Harder wrecks." },
      { id: "lock", label: "LOCKED", line: "Needs a prior wreck or room." },
    ],
  },
  minds: {
    id: "minds",
    title: "COMMANDERS",
    blurb: "A commander is a woke mind. Seat her on a post. That rate climbs.",
    verbs: [
      { id: "pick", label: "WAKE", line: "Three bodies. One commander stays." },
      { id: "post", label: "POST", line: "MINE ore. MAKE parts. BUILD rooms. LAB spark. RAID hulls." },
      { id: "seat", label: "SEAT", line: "Seated = full boost. Pacing = half." },
      { id: "heal", label: "HEAL", line: "Wounded commanders cut the boost." },
      { id: "mark", label: "MARK", line: "Echo ranks her. UNMAKE if she sours." },
    ],
  },
  view: {
    id: "view",
    title: "VIEW",
    blurb: "The camera lives here. The hull does not yaw.",
    verbs: [
      { id: "shot", label: "SHOTS", line: "CLOSE inspects. VOID is sky." },
      { id: "dist", label: "DISTANCE", line: "Pulls the lens off the nave." },
      { id: "pinch", label: "PINCH", line: "Two fingers on empty glass." },
      { id: "spin", label: "SPIN", line: "Idle orbit. HOLD freezes it." },
      { id: "hide", label: "EYE", line: "Chrome folds so you can watch." },
    ],
  },
};

export const POSTS: Record<Job, { label: string; does: string }> = {
  mine: { label: "MINE", does: "Multiplies ore." },
  forge: { label: "MAKE", does: "Multiplies parts." },
  build: { label: "BUILD", does: "Raises rooms faster." },
  lab: { label: "LAB", does: "Fills SPARK and rites." },
  raid: { label: "RAID", does: "Hardens the fleet." },
};

export function framePost(frame: FrameId) {
  return POSTS[FRAMES[frame].job];
}

export function mindPostLine(mind: Pick<Mind, "job" | "seated" | "wounded">): string {
  const p = POSTS[mind.job];
  const seat = mind.seated ? "SEATED" : "PACING · HALF";
  const wound = mind.wounded ? " · WOUNDED" : "";
  return `${seat} · ${p.does}${wound}`;
}

const GLOSS: Record<string, string> = {
  ORE: "Ice and wreck-slag. Caps without Ore Bay.",
  PARTS: "Fabs chew ore. Rooms eat parts.",
  CHARGE: "Spine blood. Low charge starves every rate.",
  SPARK: "Full bar. Three bodies. One stays.",
  ECHO: "Fallen minds. Fuel for molt.",
  RANK: "Hive layer. Rooms, rites, wrecks, molt.",
  ICE: "Melt two ice for ore.",
  PLATE: "Stamp two plate for parts.",
  BONE: "Burn two bone for charge.",
  ROSE: "Drink a rose for SPARK.",
  CORE: "Crack a core for Echo.",
};

export function gloss(label: string): string {
  return GLOSS[label] ?? "";
}

export function roomLockWhy(s: GameState, id: RoomId): string {
  if (s.rooms[id]?.built) return "";
  return roomUnlocked(s, id).why;
}

export function raidLockWhy(s: GameState, id: (typeof RAIDS)[number]["id"]): string {
  const node = RAIDS.find((r) => r.id === id);
  if (!node) return "LOCKED";
  if (raidUnlocked(s, id)) {
    const need = raidNeed(s, id);
    if (s.swarm.striker < need) return `NEED ${need} HULLS`;
    return "";
  }
  if (node.requires === "herald") return s.tech.rosekey?.done ? "" : "NEED A HERALD";
  if (node.requires === "molt") return "NEED MOLT";
  if (node.requires) return `NEED ${node.requires.toUpperCase()}`;
  return "LOCKED";
}

export function packed(s: GameState): boolean {
  return totalSwarm(s) >= berthCap(s) - 1;
}

export function sparkHot(s: GameState): boolean {
  return s.spark / Math.max(1, s.sparkNeed) >= 0.8;
}

export function chargeStarve(s: GameState): boolean {
  return s.charge < 8;
}

/** Quiet first-look line. One shot. Not a tutorial tree. */
export function firstWhisper(id: GuideId): string {
  if (id === "wake") return "WAKE opens the nave.";
  if (id === "hull") return "Gold chip is the next verb. ? is this screen.";
  if (id === "forge") return "PRINT stamps. AUTO keeps going.";
  if (id === "raid") return "Send. Leave. It still fights.";
  if (id === "minds") return "A commander multiplies one post. Seat her.";
  return "Pinch empty glass. EYE hides chrome.";
}
