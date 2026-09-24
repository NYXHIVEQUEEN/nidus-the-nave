import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { useNidus } from "@/lib/nidus/store";
import { CASTES, FRAMES, RAIDS, ROOMS, TECH } from "@/lib/nidus/content";
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
import { eraseAllData, slotStamp } from "@/lib/nidus/save";
import { APP_VERSION, buildReport, FAQ, SUPPORT_EMAIL, WEBSITE_URL, supportIssueUrl, supportMailto } from "@/lib/nidus/support";
import { openNyxSpotify, setMusicBed, syncAudioGains } from "@/lib/nidus/audio";

const CODEX: { id: string; title: string; body: string }[] = [
  { id: "hive", title: "HIVE", body: "You are the lone brain. Drones are meat. Minds are rare sparks that wake and take a body." },
  { id: "scripts", title: "HIVE MIND", body: "Flip HIVE on the hull. The nave prints, rites, and raids. BUILD is its own toggle — rooms do not auto-raise." },
  { id: "watch", title: "WATCH", body: "A raid orbits. WATCH to see it. BOOST spends SPARK. Leave — it still fights." },
  { id: "mark", title: "MARK", body: "Striker hulls rank DART → RELIQUARY. Spend ore and parts. Bigger mark, harder well." },
  { id: "slot", title: "SLOTS", body: "Three local pews besides the live hive. STASH copies. LOAD swaps. Live save is never wiped by a slot." },
  { id: "flow", title: "FLOW", body: "ORE miners raise, kiln drinks, PRINT spends. PARTS from the kiln, rooms and stamps spend. CUT from mill, sells, raids — RANK MARK EXPAND spend it. SPARK from Solar — SURGE CALL HEAL spend it." },
  { id: "parts", title: "PARTS", body: "Fabs chew ore into parts. Rooms and prints eat parts." },
  { id: "spark", title: "SPARK", body: "Hive will. SURGE, BOOST, HEAL, CALL, PRINT sip it. Empty swarm crawls. Raise Solar." },
  { id: "song", title: "SONG", body: "One bed at a time. ROTATE plays Rules of Engagement — Nytheria Nyx — then the nave's own ambient pieces (NAVE, DRIFT, HUM), then the anthem again. ANTHEM loops her song. VOID is ambient only. The hive never stacks the anthem on itself. NYX ON SPOTIFY opens her catalog." },
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

export type RitePane = "opt" | "view" | "codex" | "save" | "help";

const PANE_LABEL: Record<RitePane, string> = {
  view: "VIEW",
  opt: "TUNE",
  codex: "CODEX",
  save: "SAVE",
  help: "HELP",
};

export function SettingsPanel({
  onClose,
  start = "view",
}: {
  onClose: () => void;
  start?: RitePane;
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
  const kilnOn = useNidus((s) => s.kilnOn !== false);
  const toggleKiln = useNidus((s) => s.toggleKiln);
  const toggleScripts = useNidus((s) => s.toggleScripts);
  const toggleAutoBuild = useNidus((s) => s.toggleAutoBuild);
  const toggleAutoRaid = useNidus((s) => s.toggleAutoRaid);
  const toggleAutoRite = useNidus((s) => s.toggleAutoRite);
  const toggleAuto = useNidus((s) => s.toggleAuto);
  const fileRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [importNote, setImportNote] = useState("");
  const hits = CODEX.filter((c) => !q || `${c.title} ${c.body}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="pointer-events-auto max-h-[70dvh] overflow-y-auto p-2">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="grid grid-cols-5 gap-1">
          {(["view", "opt", "codex", "save", "help"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "nidus-cut min-h-10 px-0.5 font-display text-[0.6rem] tracking-[0.12em]",
                tab === t ? "nidus-cut-on" : "text-muted",
              )}
            >
              {PANE_LABEL[t]}
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
          <p className="text-[0.7rem] text-muted">
            ROTATE plays Rules of Engagement, then the nave&apos;s own ambient pieces, then the anthem again. ANTHEM loops her song. VOID is ambient only.
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Toggle on={prefs.musicBed === "rotate"} label="ROTATE" onClick={() => setMusicBed("rotate")} />
            <Toggle
              on={prefs.musicBed === "anthem"}
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
            <Toggle on={kilnOn} label="KILN" onClick={() => toggleKiln()} />
            <Toggle on={prefs.hints} label="HINTS" onClick={() => patchPrefs({ hints: !prefs.hints })} />
          </div>
          <p className="text-[0.7rem] text-muted">HIVE stamps, rites, and raids. BUILD is separate — tap a node to raise it. KILN ON drinks ore into parts.</p>
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
          <div className="nidus-card p-2">
            <p className="font-display text-[0.7rem] tracking-[0.18em] text-gilt">LOCAL ONLY</p>
            <p className="mt-1 text-[0.75rem] leading-snug text-muted">
              No cloud. No account. The hive lives on this device. Uninstall, a new browser, or clear site data burns the nave. EXPORT a file or STASH a pew before you switch glass.
            </p>
          </div>
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
              e.target.value = "";
              setImportNote(
                importHive(text)
                  ? "HIVE BOUND. THE OLD HIVE WAS KEPT ASIDE."
                  : "NOT A HIVE. ONLY AN EXPORT OR COPY JSON FILE WORKS. YOUR HIVE IS UNTOUCHED.",
              );
            }}
          />
          {importNote && (
            <p role="status" className="text-[0.7rem] tracking-[0.12em] text-gilt">
              {importNote}
            </p>
          )}
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
          <EraseData />
        </div>
      )}
      {tab === "help" && <HelpPane />}
      <div className="mt-3 flex gap-2">
        <a href="/privacy" className="flex min-h-11 flex-1 items-center justify-center border border-border font-display text-[0.62rem] tracking-[0.18em] text-gilt">
          PRIVACY
        </a>
        <a href="/terms" className="flex min-h-11 flex-1 items-center justify-center border border-border font-display text-[0.62rem] tracking-[0.18em] text-gilt">
          TERMS
        </a>
      </div>
      {WEBSITE_URL && (
        <a
          href={WEBSITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="nidus-cut nidus-cut-gilt mt-2 flex min-h-11 items-center justify-center font-display text-[0.65rem] tracking-[0.18em]"
        >
          NYX WEBSITE
        </a>
      )}
    </div>
  );
}

export function EraseData() {
  const [armed, setArmed] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = window.setTimeout(() => setArmed(false), 6000);
    return () => window.clearTimeout(t);
  }, [armed]);
  if (done) {
    return <p role="status" className="text-[0.7rem] tracking-[0.12em] text-gilt">ERASED. NOTHING OF YOURS IS LEFT ON THIS DEVICE.</p>;
  }
  return (
    <div className="nidus-card p-2">
      <p className="font-display text-[0.7rem] tracking-[0.18em] text-gilt">YOUR DATA</p>
      <p className="mt-1 text-[0.75rem] leading-snug text-muted">
        Erases every hive, backup, pew, setting, and offline file NIDUS keeps on this device. Nothing is stored anywhere else. Hero purchases return from Google Play.
      </p>
      <button
        type="button"
        className={cn(
          "mt-2 min-h-11 w-full border font-display text-xs tracking-[0.2em]",
          armed ? "border-blood bg-blood text-bone" : "border-blood text-blood-bright",
        )}
        onClick={async () => {
          if (!armed) {
            setArmed(true);
            return;
          }
          await eraseAllData();
          setDone(true);
          window.setTimeout(() => window.location.replace("/"), 900);
        }}
      >
        {armed ? "TAP AGAIN TO ERASE EVERYTHING" : "ERASE MY DATA"}
      </button>
    </div>
  );
}

function HelpPane() {
  const [copied, setCopied] = useState(false);
  const report = () => {
    const g = useNidus.getState();
    return buildReport(g, {
      nav: navigator,
      width: window.innerWidth,
      height: window.innerHeight,
      standalone: window.matchMedia?.("(display-mode: standalone)").matches,
    });
  };
  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {FAQ.map((f) => (
          <li key={f.q} className="nidus-card p-2">
            <p className="font-display text-xs tracking-[0.2em] text-gilt">{f.q}</p>
            <p className="text-sm text-bone">{f.a}</p>
          </li>
        ))}
      </ul>
      <div className="nidus-card p-2">
        <p className="font-display text-[0.7rem] tracking-[0.18em] text-gilt">REPORT A FAULT</p>
        <p className="mt-1 text-[0.75rem] leading-snug text-muted">
          The report holds the build, rough hive size, and screen. Never your hive name or anything about you. You see it before it goes anywhere.
        </p>
      </div>
      <button
        type="button"
        className="min-h-11 border border-border font-display text-xs tracking-[0.2em]"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(report());
            setCopied(true);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? "REPORT COPIED" : "COPY REPORT"}
      </button>
      {SUPPORT_EMAIL ? (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = supportMailto(report());
          }}
          className="flex min-h-11 items-center justify-center border border-gilt font-display text-xs tracking-[0.2em] text-gilt"
        >
          MAIL THE QUEEN
        </a>
      ) : (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.open(supportIssueUrl(report()), "_blank", "noopener,noreferrer");
          }}
          className="flex min-h-11 items-center justify-center border border-gilt font-display text-xs tracking-[0.2em] text-gilt"
        >
          FILE A FAULT
        </a>
      )}
      <a href="/support" className="flex min-h-11 items-center justify-center border border-border font-display text-xs tracking-[0.2em] text-muted">
        SUPPORT PAGE
      </a>
      <p className="text-[0.65rem] tracking-[0.12em] text-muted">NIDUS {APP_VERSION} · Nytheria Nyx · NYX HIVEQUEEN</p>
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
        min={0.5}
        max={1}
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
