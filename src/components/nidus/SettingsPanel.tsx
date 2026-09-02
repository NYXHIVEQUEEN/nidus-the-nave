import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { useNidus } from "@/lib/nidus/store";
import { CASTES, FRAMES, RAIDS, ROOMS, TECH } from "@/lib/nidus/content";
import { techUnlocked } from "@/lib/nidus/progress";
import {
  applyCamPreset,
  bumpCam,
  CAM_MAX,
  CAM_MIN,
  CAM_PRESETS,
  DENSITY_LABEL,
  getPrefs,
  patchPrefs,
  subscribeSpin,
  type CamPresetId,
  type Density,
  type ViewPrefs,
} from "@/lib/nidus/view";
import { slotStamp } from "@/lib/nidus/save";
import { openNyxSpotify, setMusicBed, syncAudioGains } from "@/lib/nidus/audio";

const CODEX: { id: string; title: string; body: string }[] = [
  { id: "hive", title: "HIVE", body: "You are the lone brain. Drones are meat. Minds are rare sparks that wake and take a body." },
  { id: "scripts", title: "HIVE MIND", body: "Flip HIVE on the hull. The nave prints, builds, rites, and raids without a guide. You can still steer." },
  { id: "watch", title: "WATCH", body: "A raid orbits a wreck. WATCH to see the well. BOOST spends charge. Leave — it still fights." },
  { id: "mark", title: "MARK", body: "Striker hulls rank DART → RELIQUARY. Spend ore and parts. Bigger mark, harder well." },
  { id: "slot", title: "SLOTS", body: "Three local pews besides the live hive. STASH copies. LOAD swaps. Live save is never wiped by a slot." },
  { id: "ore", title: "ORE", body: "Mined ice and wreck-slag. Caps if you skip the Ore Bay." },
  { id: "parts", title: "PARTS", body: "Fabs chew ore into parts. Rooms and prints eat parts." },
  { id: "charge", title: "CHARGE", body: "The spine’s blood. Low charge starves every rate. Raise Solar." },
  { id: "song", title: "SONG", body: "One bed. ANTHEM is Rules of Engagement — Nytheria Nyx. VOID is a space pad until more of her cuts. The hive never stacks the anthem on itself. NYX ON SPOTIFY opens her catalog. Spotify cannot play inside the nave." },
  { id: "echo", title: "ECHO", body: "Residue of unmade or fallen minds. Fuel for Molt." },
  { id: "print", title: "PRINT", body: "Stamp a caste. AUTO keeps stamping while you are gone." },
  { id: "surge", title: "SURGE", body: "A short scream. All rates spike. Idle return mercy lasts longer." },
  { id: "slag", title: "SLAG", body: "Tap the hull. Spare ore and a lick of spark. Packed ore cooks to parts." },
  { id: "idle", title: "IDLE GIFT", body: "Leave. Come back. Claim the extra cut. Streaks stack. CLAIM banks a mercy SURGE." },
  { id: "raid", title: "RAID", body: "Send strikers. Win wrecks. Lose bodies. Ice Ring is the first door." },
  { id: "mind", title: "COMMANDERS", body: "SPARK banks until the spine lights. Three bodies. One commander stays PACING. SEAT her on MINE / MAKE / BUILD / LAB / RAID. The % is the live post. Pacing is half." },
  { id: "molt", title: "MOLT", body: "Reliquary + rite + Echo. Station stays. Nerve grows a layer." },
  { id: "view", title: "VIEW", body: "VIEW on the left rail. CLOSE inspects. VOID is sky. SIZE packs chrome: TIGHT / ROOMY / WATCH / AUTO. AUTO HIDE folds chrome after a quiet beat. EYE brings it back. HELP on each screen is that screen only." },
  { id: "size", title: "SIZE", body: "TIGHT packs menus. ROOMY breathes. WATCH hides the sheet so the nave can play. AUTO reads height and rotation. UI SCALE shrinks chrome without hiding verbs. U cycles SIZE." },
  { id: "hide", title: "HIDE", body: "EYE folds chrome so the nave can breathe. Gold chip or SHOW brings it back." },
  ...ROOMS.filter((r) => r.id !== "foundry").map((r) => ({
    id: r.id,
    title: r.label,
    body: `${r.blurb} ${r.bonus}. ${r.requires ? `Needs ${r.requires.toUpperCase()}. ` : ""}Costs ${r.parts} parts.`,
  })),
  ...CASTES.map((c) => ({ id: c.id, title: c.label, body: `${c.verb} caste. Print them in FORGE.` })),
  ...Object.values(FRAMES).map((f) => ({
    id: f.label,
    title: f.label,
    body: `${f.rarity.toUpperCase()} frame. Default job ${f.job.toUpperCase()}. ${f.lines[0]}`,
  })),
  ...RAIDS.map((r) => ({ id: r.id, title: r.label, body: `${r.blurb} ${r.need} strikers. ${Math.ceil(r.seconds / 60)} min. Drops ${r.salvage}.` })),
  ...TECH.map((t) => ({ id: t.id, title: t.label, body: t.blurb })),
  { id: "berth", title: "BERTHS", body: "Pop cap. Barracks, nerve, hangar, reliquary, molt, Deep Berths, Husk Beds, and EXPAND on FORGE." },
  { id: "orders", title: "ORDERS", body: "Three cuts on the hull. Finish them for extra ore, parts, spark." },
  { id: "rank", title: "RANK", body: "Tap a lit room to reinforce it. Rank 1–5. Barracks/nerve ranks add berths. Hive RANK climbs from rooms, rites, wrecks, molt." },
  { id: "cook", title: "COOK", body: "Salvage on RAID. Melt ice, stamp plate, burn bone, drink rose, crack core." },
  { id: "nest", title: "NESTS", body: "Rooms and rites nest. A lock is a prior node, not a wall." },
];

export function SettingsPanel({
  onClose,
  start = "view",
}: {
  onClose: () => void;
  start?: "opt" | "view" | "codex" | "save";
}) {
  const [tab, setTab] = useState(start);
  useEffect(() => {
    setTab(start);
  }, [start]);
  const prefs = useSyncExternalStore(subscribeSpin, getPrefs, getPrefs);
  const saveNow = useNidus((s) => s.saveNow);
  const download = useNidus((s) => s.download);
  const importHive = useNidus((s) => s.importHive);
  const resetHive = useNidus((s) => s.resetHive);
  const lastSaveAt = useNidus((s) => s.lastSaveAt);
  const hiveName = useNidus((s) => s.hiveName);
  const renameHive = useNidus((s) => s.renameHive);
  const stashSlot = useNidus((s) => s.stashSlot);
  const loadSlot = useNidus((s) => s.loadSlot);
  const scripts = useNidus((s) => s.scripts);
  const autoBuild = useNidus((s) => s.autoBuild);
  const autoRaid = useNidus((s) => s.autoRaid);
  const autoRite = useNidus((s) => s.autoRite);
  const autoPrint = useNidus((s) => s.autoPrint);
  const toggleScripts = useNidus((s) => s.toggleScripts);
  const toggleAutoBuild = useNidus((s) => s.toggleAutoBuild);
  const toggleAutoRaid = useNidus((s) => s.toggleAutoRaid);
  const toggleAutoRite = useNidus((s) => s.toggleAutoRite);
  const toggleAuto = useNidus((s) => s.toggleAuto);
  const research = useNidus((s) => s.research);
  const active = useNidus((s) => s.activeTech);
  const tech = useNidus((s) => s.tech);
  const lab = useNidus((s) => s.rooms.lab.built);
  const fileRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const hits = CODEX.filter((c) => !q || `${c.title} ${c.body}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="nidus-panel pointer-events-auto max-h-[70dvh] overflow-y-auto p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="grid grid-cols-4 gap-1">
          {(["view", "opt", "codex", "save"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "nidus-cut min-h-10 px-1 font-display text-[0.62rem] tracking-[0.16em]",
                tab === t ? "nidus-cut-on" : "text-muted",
              )}
            >
              {t === "view" ? "VIEW" : t === "opt" ? "LOCAL" : t === "codex" ? "CODEX" : "SAVE"}
            </button>
          ))}
        </div>
        <button type="button" className="text-xs tracking-[0.2em] text-muted" onClick={onClose}>
          CLOSE
        </button>
      </div>

      {tab === "view" && <ViewMenu prefs={prefs} />}

      {tab === "opt" && (
        <div className="flex flex-col gap-3">
          <Slider
            label="MUSIC"
            value={prefs.music}
            onChange={(v) => {
              patchPrefs({ music: v });
              syncAudioGains();
            }}
          />
          <Slider
            label="SFX"
            value={prefs.sfx}
            onChange={(v) => {
              patchPrefs({ sfx: v });
              syncAudioGains();
            }}
          />
          <p className="font-display text-xs tracking-[0.2em] text-gilt">BED</p>
          <p className="text-[0.7rem] text-muted">One song at a time. ANTHEM is Rules of Engagement. VOID is a space pad until more Nyx cuts land.</p>
          <div className="grid grid-cols-2 gap-2">
            <Toggle
              on={prefs.musicBed !== "void"}
              label="ANTHEM"
              onClick={() => setMusicBed("anthem")}
            />
            <Toggle
              on={prefs.musicBed === "void"}
              label="VOID"
              onClick={() => setMusicBed("void")}
            />
          </div>
          <button
            type="button"
            className="nidus-cut nidus-cut-gilt min-h-11 font-display text-[0.65rem] tracking-[0.16em]"
            title="Opens Nytheria Nyx on Spotify. The hive cannot stream Spotify itself."
            onClick={() => openNyxSpotify()}
          >
            NYX ON SPOTIFY
          </button>
          <p className="text-[0.65rem] text-muted">Rules of Engagement — Nytheria Nyx. Spotify is a door, not a second mix.</p>
          <Slider
            label="SPIN"
            value={Math.min(1, Math.max(0, (prefs.spinSpeed - 0.15) / 1.85))}
            onChange={(v) => patchPrefs({ spinSpeed: 0.15 + v * 1.85 })}
          />
          <p className="text-[0.7rem] text-muted">SPIN is idle orbit. HOLD freezes it. Camera lives on VIEW.</p>
          <p className="font-display text-xs tracking-[0.2em] text-gilt">HIVE MIND</p>
          <div className="grid grid-cols-2 gap-2">
            <Toggle on={scripts} label="HIVE" onClick={() => toggleScripts()} />
            <Toggle on={autoPrint} label="PRINT" onClick={() => toggleAuto()} />
            <Toggle on={autoBuild} label="BUILD" onClick={() => toggleAutoBuild()} />
            <Toggle on={autoRaid} label="RAID" onClick={() => toggleAutoRaid()} />
            <Toggle on={autoRite} label="RITE" onClick={() => toggleAutoRite()} />
            <Toggle on={prefs.hints} label="HINTS" onClick={() => patchPrefs({ hints: !prefs.hints })} />
          </div>
          <p className="text-[0.7rem] text-muted">HIVE stamps, raises, rites, and raids so you do not need a guide.</p>
          <p className="font-display text-xs tracking-[0.2em] text-gilt">RITES</p>
          {!lab && <p className="text-sm text-muted">Raise the Lab first.</p>}
          <div className="grid grid-cols-2 gap-2">
            {TECH.map((t) => {
              const st = tech[t.id];
              const lock = techUnlocked(useNidus.getState(), t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={!lab || st.done || !lock.ok}
                  onClick={() => research(t.id)}
                  className={cn(
                    "nidus-cut px-2 py-2 text-left",
                    st.done ? "nidus-cut-gilt" : active === t.id ? "text-venom" : lock.ok ? "text-bone" : "text-iron",
                  )}
                >
                  <p className="font-display text-[0.65rem] tracking-[0.16em]">{t.label}</p>
                  <p className="text-[0.65rem] text-muted">{lock.ok || st.done ? t.blurb : lock.why}</p>
                  <p className="text-[0.7rem] tabular-nums text-muted">{st.done ? "DONE" : `${Math.floor((st.progress / t.work) * 100)}% · T${t.tier}`}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {tab === "codex" && (
        <div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="SEEK…"
            className="mb-2 min-h-11 w-full border border-border bg-void px-3 text-sm text-bone outline-none"
          />
          <ul className="flex flex-col gap-2">
            {hits.map((c) => (
              <li key={`${c.title}-${c.id}`} className="nidus-card p-2">
                <p className="font-display text-xs tracking-[0.2em] text-gilt">{c.title}</p>
                <p className="text-sm text-bone">{c.body}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "save" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted">
            {lastSaveAt ? `BOUND ${new Date(lastSaveAt).toLocaleString()}` : "NOT BOUND THIS SESSION"}
          </p>
          <input
            value={hiveName}
            onChange={(e) => renameHive(e.target.value)}
            className="min-h-11 border border-border bg-void px-3 font-display tracking-[0.2em] text-bone outline-none"
            maxLength={16}
          />
          <button type="button" className="min-h-12 bg-blood font-display tracking-[0.3em] text-bone" onClick={() => saveNow()}>
            SAVE HIVE
          </button>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => {
              const name = slotStamp(i);
              return (
                <div key={i} className="nidus-card p-2">
                  <p className="font-display text-[0.6rem] tracking-[0.16em] text-gilt">{name ?? `PEW ${i + 1}`}</p>
                  <button type="button" className="mt-1 min-h-9 w-full border border-border text-[0.65rem] tracking-[0.14em]" onClick={() => stashSlot(i)}>
                    STASH
                  </button>
                  <button
                    type="button"
                    disabled={!name}
                    className="mt-1 min-h-9 w-full border border-gilt text-[0.65rem] tracking-[0.14em] text-gilt disabled:border-iron disabled:text-muted"
                    onClick={() => loadSlot(i)}
                  >
                    LOAD
                  </button>
                </div>
              );
            })}
          </div>
          <button type="button" className="min-h-11 border border-border font-display text-xs tracking-[0.2em]" onClick={download}>
            EXPORT
          </button>
          <button
            type="button"
            className="min-h-11 border border-border font-display text-xs tracking-[0.2em]"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(JSON.stringify(useNidus.getState(), (_k, v) => (typeof v === "function" ? undefined : v)));
              } catch {
                download();
              }
            }}
          >
            COPY JSON
          </button>
          <button
            type="button"
            className="min-h-11 border border-border font-display text-xs tracking-[0.2em]"
            onClick={() => fileRef.current?.click()}
          >
            IMPORT
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const text = await file.text();
              importHive(text);
            }}
          />
          <button
            type="button"
            className="min-h-11 border border-gilt font-display text-xs tracking-[0.2em] text-gilt"
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set("install", "1");
              window.location.assign(url.toString());
            }}
          >
            INSTALL HOME
          </button>
          <p className="text-[0.7rem] text-muted">Rules of Engagement — Nytheria Nyx. Local only. This hive is yours.</p>
          <button
            type="button"
            className="min-h-11 border border-blood font-display text-xs tracking-[0.2em] text-blood-bright"
            onClick={() => {
              if (window.confirm("Burn this hive? Export first if you want it.")) resetHive();
            }}
          >
            NEW HIVE
          </button>
        </div>
      )}
    </div>
  );
}

function ViewMenu({ prefs }: { prefs: ViewPrefs }) {
  const presetOn = (id: CamPresetId) => {
    const p = CAM_PRESETS[id];
    return Math.abs(prefs.camDist - p.camDist) < 0.6 && Math.abs(prefs.camFov - p.camFov) < 1.5;
  };
  return (
    <div className="flex flex-col gap-3">
      <p className="font-display text-xs tracking-[0.22em] text-gilt">CHROME</p>
      <p className="text-[0.75rem] text-muted">TIGHT packs menus. ROOMY breathes. WATCH hides the sheet. AUTO reads the glass and rotation.</p>
      <div className="grid grid-cols-4 gap-1">
        {(["auto", "compact", "comfort", "watch"] as Density[]).map((id) => (
          <button
            key={id}
            type="button"
            title={DENSITY_LABEL[id]}
            onClick={() => patchPrefs({ density: id })}
            className={cn("nidus-card min-h-12 px-1 py-1 text-center", prefs.density === id && "nidus-card-on")}
          >
            <span className="block font-display text-[0.62rem] tracking-[0.14em]">{DENSITY_LABEL[id]}</span>
          </button>
        ))}
      </div>
      <UnitSlider
        label="UI SCALE"
        why="Shrinks chrome without hiding verbs. Live."
        value={prefs.uiScale}
        min={0.88}
        max={1.22}
        step={0.01}
        display={prefs.uiScale.toFixed(2)}
        onChange={(v) => patchPrefs({ uiScale: v })}
      />
      <p className="font-display text-xs tracking-[0.22em] text-gilt">HOW FAR</p>
      <p className="text-[0.75rem] text-muted">The hull was sitting on the lens. Pick a shot. Drag the slider while you watch the nave. Changes stick.</p>
      <div className="grid grid-cols-4 gap-1">
        {(Object.keys(CAM_PRESETS) as CamPresetId[]).map((id) => {
          const p = CAM_PRESETS[id];
          const on = presetOn(id);
          return (
            <button
              key={id}
              type="button"
              title={`${p.label} — ${p.why}`}
              onClick={() => applyCamPreset(id)}
              className={cn(
                "nidus-card min-h-14 px-1 py-1 text-center",
                on && "nidus-card-on",
              )}
            >
              <span className="block font-display text-[0.62rem] tracking-[0.14em]">{p.label}</span>
              <span className="block text-[0.58rem] tracking-[0.08em] text-muted">{p.why}</span>
            </button>
          );
        })}
      </div>
      <UnitSlider
        label="DISTANCE"
        why="Higher pulls the camera off the hull. Live."
        value={prefs.camDist}
        min={CAM_MIN}
        max={CAM_MAX}
        step={0.1}
        display={prefs.camDist.toFixed(1)}
        onChange={(v) => patchPrefs({ camDist: v })}
      />
      <UnitSlider
        label="FIELD"
        why="Wider lens sees more sky. Narrower inspects."
        value={prefs.camFov}
        min={28}
        max={70}
        step={0.5}
        display={`${Math.round(prefs.camFov)}°`}
        onChange={(v) => patchPrefs({ camFov: v })}
      />
      <UnitSlider
        label="PINCH"
        why="How hard pinch and wheel shove the shot."
        value={prefs.camZoom}
        min={0.35}
        max={1.8}
        step={0.01}
        display={prefs.camZoom.toFixed(2)}
        onChange={(v) => patchPrefs({ camZoom: v })}
      />
      <UnitSlider
        label="SPIN"
        why="Idle orbit speed. HOLD on the hull freezes it."
        value={prefs.spinSpeed}
        min={0.15}
        max={2}
        step={0.01}
        display={prefs.spinSpeed.toFixed(2)}
        onChange={(v) => patchPrefs({ spinSpeed: v })}
      />
      <div className="grid grid-cols-2 gap-2">
        <Toggle on={prefs.camPull} label="KEEP FRAME" onClick={() => patchPrefs({ camPull: !prefs.camPull })} />
        <Toggle on={prefs.autoHide} label="AUTO HIDE" onClick={() => patchPrefs({ autoHide: !prefs.autoHide })} />
        <button
          type="button"
          className="min-h-11 border border-gilt font-display text-[0.65rem] tracking-[0.16em] text-gilt"
          onClick={() => bumpCam()}
        >
          SNAP FRAME
        </button>
      </div>
      <p className="text-[0.7rem] text-muted">
        Drag empty glass to orbit. Pinch or wheel to zoom. SNAP FRAME uses the distance you set. KEEP FRAME slowly returns to it after you let go. AUTO HIDE is off unless you flip it. EYE still folds chrome by hand.
      </p>
    </div>
  );
}

function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("min-h-11 font-display text-[0.65rem] tracking-[0.18em]", on ? "bg-venom text-void" : "border border-border text-muted")}
    >
      {label}
    </button>
  );
}

function UnitSlider({
  label,
  why,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  why: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2">
        <span className="font-display text-[0.65rem] tracking-[0.2em] text-gilt">{label}</span>
        <span className="font-display text-[0.7rem] tabular-nums text-bone">{display}</span>
      </span>
      <p className="text-[0.65rem] text-muted">{why}</p>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-[var(--color-gilt)]"
      />
    </label>
  );
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="font-display text-[0.65rem] tracking-[0.2em] text-gilt">{label}</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-[var(--color-gilt)]"
      />
    </label>
  );
}
