import type { FrameId, GameState, Job, Mind, RoomId, Tab } from "./types";
import { FRAMES, RAIDS, berthCap, raidNeed, raidUnlocked, totalSwarm } from "./content";
import { hiveStage, postBoostPct, roomUnlocked, wakeNeed } from "./progress";

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
      { id: "save", label: "LOCAL", line: "This device only. No cloud. EXPORT before you switch glass." },
      { id: "song", label: "SONG", line: "Rules of Engagement — Nytheria Nyx." },
    ],
  },
  hull: {
    id: "hull",
    title: "HULL",
    blurb: "The cathedral. Rooms grow as nodes on the nave.",
    verbs: [
      { id: "goal", label: "GOLD CHIP", line: "The one next verb." },
      { id: "rooms", label: "NODES", line: "Tap a dark room to raise it. Tap a lit room to RANK it." },
      { id: "surge", label: "SURGE", line: "Spends 6 SPIRIT. Swarm sprints ~30s." },
      { id: "slag", label: "SLAG", line: "Tap ore + spark. Overflow cooks to parts." },
      { id: "hive", label: "HIVE", line: "Mind stamps, builds, raids for you." },
      { id: "set", label: "SETTINGS", line: "Opens nested rails. SIZE, SOUND, SAVE." },
      { id: "size", label: "SIZE", line: "In SETTINGS. TIGHT / ROOMY / WATCH." },
      { id: "hide", label: "EYE", line: "Folds chrome. Station stays." },
    ],
  },
  forge: {
    id: "forge",
    title: "FORGE",
    blurb: "Stamp drones. Open berths. Mark hulls.",
    verbs: [
      { id: "caste", label: "CASTE", line: "Pick who the next stamp is. Same caste stacks FOCUS." },
      { id: "print", label: "PRINT", line: "Packed stamp still feeds SPARK." },
      { id: "auto", label: "AUTO", line: "Stamps while gone. Holds two berths until EXPAND." },
      { id: "expand", label: "EXPAND", line: "Buys pop cap. Packed swarm idles." },
      { id: "mark", label: "MARK", line: "Ranks that caste. Strikers hit harder." },
    ],
  },
  lab: {
    id: "lab",
    title: "LAB",
    blurb: "Rites inlay bonuses. Lab room first.",
    verbs: [
      { id: "rite", label: "RITE", line: "Spend parts. One rite cooks at a time." },
      { id: "lock", label: "LOCKED", line: "Needs the Lab module, or a prior rite." },
      { id: "done", label: "DONE", line: "Permanent. Hive keeps it on molt." },
    ],
  },
  raid: {
    id: "raid",
    title: "RAID",
    blurb: "Send strikers. The well fights without you.",
    verbs: [
      { id: "send", label: "SEND", line: "Tap an open wreck. Hulls leave." },
      { id: "watch", label: "WATCH", line: "18% faster cut. Leave — it still fights." },
      { id: "boost", label: "BOOST", line: "Spends 5 SPIRIT. Twenty seconds of command." },
      { id: "farm", label: "FARM", line: "Cleared wrecks pay again. Nested stay locked." },
      { id: "lock", label: "LOCKED", line: "Needs a prior wreck or room." },
    ],
  },
  minds: {
    id: "minds",
    title: "COMMANDERS",
    blurb: "A commander multiplies one post. SPARK waits for the spine. You SEAT her.",
    verbs: [
      { id: "pick", label: "WAKE", line: "Three bodies. One commander stays. She starts PACING." },
      { id: "post", label: "POST", line: "MINE ore. MAKE parts. BUILD rooms. LAB spark. RAID hulls." },
      { id: "seat", label: "SEAT", line: "Full boost. Number is the live % on that rate." },
      { id: "heal", label: "HEAL", line: "Spends SPIRIT. Wounded cut her boost." },
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
      { id: "size", label: "SIZE", line: "TIGHT chrome. ROOMY chrome. WATCH the nave." },
      { id: "spin", label: "SPIN", line: "Idle orbit. HOLD freezes it." },
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

export function mindPostLine(mind: Pick<Mind, "job" | "seated" | "wounded" | "level" | "stats">): string {
  const p = POSTS[mind.job];
  const pct = postBoostPct(mind);
  const wound = mind.wounded ? " · WOUND" : "";
  if (mind.seated) return `SEATED · +${pct}% ${p.label}${wound}`;
  return `PACING · +${pct}% · SEAT FOR FULL${wound}`;
}

const GLOSS: Record<string, string> = {
  ORE: "Mined ice. Fabs eat it. Sell extra for CUT.",
  PARTS: "Forged bits. Rooms and rites spend these.",
  SPIRIT: "Hive will. SURGE, BOOST, HEAL, PRINT sip it. Empty = swarm crawls.",
  CHARGE: "Hive will. SURGE, BOOST, HEAL, PRINT sip it. Empty = swarm crawls.",
  SPARK: "Banks until Solar. Then CALL one officer.",
  ECHO: "Fallen minds. Spend to molt.",
  RANK: "Hive layer. Rooms, rites, wrecks, molt.",
  ICE: "Melt two ice for ore.",
  PLATE: "Stamp two plate for parts.",
  BONE: "Burn two bone for SPIRIT.",
  ROSE: "Drink a rose for SPARK.",
  CORE: "Crack a core for Echo.",
  SIZE: "TIGHT packs chrome. ROOMY breathes. WATCH hides it.",
  LOCAL: "Three local snapshots. Oldest burns. No cloud.",
  CUT: "Credits. Sell ore and parts. Ranks and expand spend CUT.",
  SONG: "One bed. ANTHEM is Nyx. VOID is space.",
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
  return s.spark / Math.max(1, wakeNeed(s)) >= 0.8;
}

export function sparkBanked(s: GameState): boolean {
  return !s.waking && s.minds.filter((m) => m.alive).length === 0 && s.spark >= s.sparkNeed && !s.rooms.solar.built;
}

export function chargeStarve(s: GameState): boolean {
  return s.charge < 4;
}

/** Quiet first-look line. One shot. Not a tutorial tree. */
export function firstWhisper(id: GuideId): string {
  if (id === "wake") return "WAKE opens the nave.";
  if (id === "hull") return "Gold chip is the next verb. SIZE packs chrome.";
  if (id === "forge") return "PRINT stamps. Same caste stacks FOCUS.";
  if (id === "lab") return "Rites live here. Not in SETTINGS.";
  if (id === "raid") return "First ice is a short cut. WATCH pays.";
  if (id === "minds") return "SEAT her. The % is the live post.";
  return "Pinch empty glass. EYE hides chrome.";
}
