import type { GameState, RoomId, Tab } from "./types";
import { ROOMS, rates } from "./content";
import { callNeed } from "./progress";

// The Queen's welcome. Edit these lines freely; they show once, on a brand-new hive.
export const WELCOME = {
  title: "WELCOME TO THE NAVE",
  lines: [
    "Thank you for waking the hive.",
    "I built this nave by hand, one bone at a time, for everyone who keeps going in the dark.",
    "Leave whenever you need to. The swarm keeps working, and it will be here when you return.",
  ],
  sign: "NYTHERIA NYX",
};

export type Meter = { have: number; need: number; eta: number | null; unit: string };

export type Beat = {
  id: string;
  numeral: string;
  title: string;
  line: string;
  task: string;
  tab: Tab;
  /** Beats that end on a tap instead of a game event. */
  ack?: boolean;
  done?: (s: GameState, now: number) => boolean;
  reward?: (s: GameState) => GameState;
  rewardLabel?: string;
  meter?: (s: GameState, now: number) => Meter | null;
};

const alive = (s: GameState) => s.minds.filter((m) => m.alive).length;
const work = (id: RoomId) => ROOMS.find((r) => r.id === id)?.work ?? 1;

// Your first order moves the swarm: builders throw themselves at the room.
function rush(s: GameState, id: RoomId, share: number): GameState {
  const room = s.rooms[id];
  if (!room || room.built) return s;
  return { ...s, rooms: { ...s.rooms, [id]: { ...room, progress: Math.max(room.progress, work(id) * share) } } };
}

function roomMeter(s: GameState, id: RoomId, now: number): Meter | null {
  const room = s.rooms[id];
  if (!room || room.built) return null;
  const need = work(id);
  const rate = rates(s, now).buildPerSec;
  return { have: room.progress, need, eta: rate > 0 ? (need - room.progress) / rate : null, unit: "%" };
}

export const STORY: Beat[] = [
  { id: "welcome", numeral: "", title: WELCOME.title, line: "", task: "BEGIN", tab: "hull", ack: true },
  {
    id: "husk",
    numeral: "I",
    title: "THE HUSK WAKES",
    line: "The nave is cold. Twenty drones hang in the dark, waiting for a will. Give them one.",
    task: "RAISE SOLAR · tap its tile in the SPINE",
    tab: "hull",
    done: (s) => s.queuedRoom === "solar" || s.rooms.solar.built,
    reward: (s) => rush(s, "solar", 0.9),
    rewardLabel: "THE SWARM RUSHES THE SPINE",
  },
  {
    id: "light",
    numeral: "II",
    title: "FIRST LIGHT",
    line: "The spine drinks the star. Its light becomes SPARK, the will of the hive.",
    task: "WATCH THE SPINE LIGHT",
    tab: "hull",
    done: (s) => s.rooms.solar.built,
    reward: (s) => ({ ...s, spark: s.spark + 12 }),
    rewardLabel: "+12 SPARK",
    meter: (s, now) => roomMeter(s, "solar", now),
  },
  {
    id: "mind",
    numeral: "III",
    title: "A MIND ANSWERS",
    line: "Something in the dark hears the spine. Spend SPARK and call it. TAKE the officer you want.",
    task: "CALL AN OFFICER in MINDS",
    tab: "minds",
    done: (s) => alive(s) > 0,
    reward: (s) => ({ ...s, ore: s.ore + 30, parts: s.parts + 12 }),
    rewardLabel: "+30 ORE · +12 PARTS",
    meter: (s, now) => {
      if (s.waking) return null;
      const need = callNeed(s);
      const rate = rates(s, now).sparkPerSec;
      return { have: Math.min(s.spark, need), need, eta: s.spark >= need ? 0 : rate > 0 ? (need - s.spark) / rate : null, unit: "SPARK" };
    },
  },
  {
    id: "throne",
    numeral: "IV",
    title: "THE THRONE",
    line: "An officer standing is half an officer. Seat her, and her post runs at full pace.",
    task: "SEAT YOUR OFFICER in MINDS",
    tab: "minds",
    done: (s) => s.minds.some((m) => m.alive && m.seated),
    reward: (s) => ({ ...s, spark: s.spark + 8 }),
    rewardLabel: "+8 SPARK · ENOUGH TO SCREAM",
  },
  {
    id: "scream",
    numeral: "V",
    title: "THE SCREAM",
    line: "Spend SPARK and the hive screams. Every rate spikes while the echo lasts.",
    task: "SURGE on the HULL",
    tab: "hull",
    done: (s, now) => s.surgeUntil > now,
  },
  {
    id: "glass",
    numeral: "VI",
    title: "THE GLASS",
    line: "Rites are written behind glass. Raise the LAB and the hive learns to cheat its own limits.",
    task: "RAISE THE LAB · tap its tile on the HULL",
    tab: "hull",
    done: (s) => s.queuedRoom === "lab" || Boolean(s.rooms.lab?.built),
    reward: (s) => rush({ ...s, parts: s.parts + 20 }, "lab", 0.6),
    rewardLabel: "+20 PARTS · THE SWARM RUSHES THE GLASS",
  },
  {
    id: "sleep",
    numeral: "VII",
    title: "THE HIVE NEVER SLEEPS",
    line: "Close the glass whenever you must. The swarm keeps working, and the cut waits for your return.",
    task: "THE NAVE IS YOURS",
    tab: "hull",
    ack: true,
  },
];

export const STORY_DONE = STORY.length;

export function storyBeat(s: Pick<GameState, "storyStep">): Beat | null {
  return STORY[s.storyStep] ?? null;
}

/** Pure: move past every beat the hive has already satisfied, paying its reward. */
export function advanceStory(s: GameState, now: number): GameState {
  let next = s;
  for (let guard = 0; guard < STORY.length; guard++) {
    const beat = STORY[next.storyStep];
    if (!beat) break;
    if (beat.ack) {
      if (!next.storyQuiet) break;
    } else if (!beat.done?.(next, now)) break;
    next = { ...(beat.reward ? beat.reward(next) : next), storyStep: next.storyStep + 1 };
  }
  return next;
}

/** A tap on BEGIN or THE NAVE IS YOURS. */
export function ackStory(s: GameState): GameState {
  const beat = STORY[s.storyStep];
  return beat?.ack ? { ...s, storyStep: s.storyStep + 1 } : s;
}

/** Hide the story; beats and rewards still run quietly. */
export function quietStory(s: GameState, now: number): GameState {
  return advanceStory({ ...s, storyQuiet: true }, now);
}
