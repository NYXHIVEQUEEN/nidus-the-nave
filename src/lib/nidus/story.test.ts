import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultState } from "./content.ts";
import { applyTick, chooseWake, queueRoom, startCall, startSurge, toggleSeat } from "./sim.ts";
import { callNeed } from "./progress.ts";
import { importSave } from "./save.ts";
import { STORY, STORY_DONE, ackStory, advanceStory, quietStory, storyBeat } from "./story.ts";
import type { GameState } from "./types.ts";

const T0 = 1_800_000_000_000;

// A new player who does what each beat asks, one second at a time.
function play(seconds: number, quiet = false) {
  let s: GameState = { ...defaultState(T0), started: true };
  s = quiet ? quietStory(s, T0) : ackStory(s);
  const at: Record<string, number> = {};
  for (let sec = 1; sec <= seconds; sec++) {
    const now = T0 + sec * 1000;
    const before = s.storyStep;
    s = advanceStory(applyTick(s, now), now);
    for (let i = before; i < s.storyStep; i++) at[STORY[i].id] ??= sec;
    const beat = storyBeat(s);
    if (!s.rooms.solar.built && !s.queuedRoom) s = queueRoom(s, "solar");
    if (s.rooms.solar.built && !s.waking && s.minds.every((m) => !m.alive) && s.spark >= callNeed(s)) s = startCall(s);
    if (s.waking) s = chooseWake(s, 0);
    const standing = s.minds.find((m) => m.alive && !m.seated);
    if (standing) s = toggleSeat(s, standing.id);
    if (beat?.id === "scream" && s.spark >= 8) s = startSurge(s, now);
    if (s.rooms.solar.built && !s.rooms.lab.built && !s.queuedRoom) s = queueRoom(s, "lab");
    if (beat?.ack && !quiet) s = ackStory(s);
  }
  const now = T0 + (seconds + 1) * 1000;
  const before = s.storyStep;
  s = advanceStory(applyTick(s, now), now);
  for (let i = before; i < s.storyStep; i++) at[STORY[i].id] ??= seconds + 1;
  return { s, at };
}

test("a new hive hears the story from the welcome", () => {
  assert.equal(defaultState(T0).storyStep, 0);
  assert.equal(storyBeat(defaultState(T0))?.id, "welcome");
  assert.equal(advanceStory(defaultState(T0), T0).storyStep, 0, "the welcome waits for a tap");
  assert.equal(ackStory(defaultState(T0)).storyStep, 1);
});

test("the story gets a new player to the first officer in under two minutes", () => {
  const { s, at } = play(900);
  assert.equal(s.storyStep, STORY_DONE, "every beat completes");
  assert.ok(at.light !== undefined && at.light <= 60, `solar lit by ${at.light}s`);
  assert.ok(at.mind !== undefined && at.mind <= 120, `first officer by ${at.mind}s`);
  assert.ok(s.rooms.lab.built, "the lab is raised inside fifteen minutes");
});

test("skipping the story keeps the rewards and never waits on a tap", () => {
  const { s, at } = play(900, true);
  assert.equal(s.storyStep, STORY_DONE);
  assert.ok(at.mind !== undefined && at.mind <= 120, `first officer by ${at.mind}s`);
});

test("hives from before the story skip it; hostile steps are clamped", () => {
  const old = importSave(JSON.stringify({ version: 3, started: true, ore: 5, printed: 3 }));
  assert.equal(old?.storyStep, STORY_DONE, "veterans are not taught again");
  const fresh = importSave(JSON.stringify({ version: 3, started: false, ore: 5, printed: 3 }));
  assert.equal(fresh?.storyStep, 0);
  const evil = importSave(JSON.stringify({ version: 3, started: true, ore: 5, printed: 3, storyStep: 1e9, storyQuiet: "yes" }));
  assert.equal(evil?.storyStep, STORY_DONE);
  assert.equal(evil?.storyQuiet, false);
});

test("story beats are complete and rewards never go backwards", () => {
  for (const beat of STORY) {
    assert.ok(beat.ack || beat.done, `${beat.id} can finish`);
    assert.ok(beat.title.length > 0 && beat.task.length > 0);
  }
  const s = { ...defaultState(T0), started: true, storyStep: 2 };
  const built = { ...s, rooms: { ...s.rooms, solar: { ...s.rooms.solar, built: true, progress: 28 } } };
  const paid = advanceStory(built, T0);
  assert.equal(paid.spark, built.spark + 12);
  assert.equal(paid.storyStep, 3);
});
