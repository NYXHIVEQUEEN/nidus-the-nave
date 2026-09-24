import { useEffect, useState, useSyncExternalStore } from "react";
import { Crown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNidus } from "@/lib/nidus/store";
import { chime } from "@/lib/nidus/audio";
import { BUNDLE_PRICE, BUNDLE_SKU, HERO_PRICE, SOVEREIGNS, heroSku, sovereignSeats, type Sovereign } from "@/lib/nidus/heroes";
import { buy, getShop, restore, subscribeShop } from "@/lib/nidus/billing";
import { BOOST_PRICE, BOOST_SKU } from "@/lib/nidus/boost";

const PLAY_URL = "https://play.google.com/store/apps/details?id=com.nyxhivequeen.nidus";

function useShop() {
  return useSyncExternalStore(subscribeShop, getShop, getShop);
}

function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(t);
  }, [ms]);
  return now;
}

function clock(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function Portrait({ hero, className }: { hero: Sovereign; className?: string }) {
  const chain = [hero.art, hero.art.replace(/\.webp$/, ".jpg"), hero.portrait];
  const [i, setI] = useState(0);
  return (
    <img
      src={chain[i]}
      alt={`${hero.name}, ${hero.title}`}
      loading="lazy"
      decoding="async"
      onError={() => setI((n) => Math.min(n + 1, chain.length - 1))}
      className={cn("h-full w-full object-cover object-[center_22%]", className)}
    />
  );
}

export function SovereignHall({ onClose }: { onClose: () => void }) {
  const shop = useShop();
  const now = useNow();
  const seated = useNidus((s) => s.sovereigns);
  const trial = useNidus((s) => s.trial);
  const molt = useNidus((s) => s.moltLayer);
  const [pick, setPick] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<string | null>(null);
  useEffect(() => {
    const on = (e: Event) => setRevealed((e as CustomEvent<string>).detail);
    window.addEventListener("nidus:bought", on);
    return () => window.removeEventListener("nidus:bought", on);
  }, []);
  const seats = sovereignSeats({ moltLayer: molt });
  const allOwned = shop.owned.size >= SOVEREIGNS.length;
  const hero = SOVEREIGNS.find((h) => h.id === pick) ?? null;

  return (
    <div className="nidus-hall pointer-events-auto flex max-h-[78dvh] flex-col" data-chrome data-scroll>
      <header className="flex items-center justify-between gap-2 border-b border-gilt/30 px-3 py-2">
        <div className="flex items-center gap-2">
          <Crown className="size-4 text-gilt" />
          <div>
            <p className="font-display text-sm tracking-[0.28em] text-gilt">SOVEREIGNS</p>
            <p className="text-[0.62rem] tracking-[0.14em] text-muted">
              THRONE {seated.length}/{seats} · {seats < 3 ? "MOLT FOR ANOTHER SEAT" : "FULL COURT"}
            </p>
          </div>
        </div>
        <button type="button" aria-label="Close" className="flex size-10 items-center justify-center text-muted" onClick={onClose}>
          <X className="size-4" />
        </button>
      </header>

      <div className="relative min-h-0 flex-1 overflow-y-auto p-2" data-scroll>
        {revealed && <Reveal sku={revealed} onDone={() => setRevealed(null)} onPick={setPick} />}
        {hero ? (
          <HeroDetail hero={hero} now={now} onBack={() => setPick(null)} />
        ) : (
          <>
            <BoostCard />
            {!allOwned && <BundleCard />}
            {trial && now < trial.until && (
              <p className="mb-2 text-center font-display text-[0.62rem] tracking-[0.18em] text-venom">
                TRIAL · {SOVEREIGNS.find((h) => h.id === trial.id)?.name} · {clock(trial.until - now)}
              </p>
            )}
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {SOVEREIGNS.map((h) => {
                const owned = shop.owned.has(h.id);
                const on = seated.includes(h.id);
                const trying = trial?.id === h.id && now < trial.until;
                return (
                  <li key={h.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setPick(h.id);
                        chime("ping");
                      }}
                      className={cn("nidus-sov group relative block aspect-[3/4] w-full overflow-hidden text-left", on && "nidus-sov-on", !owned && "nidus-sov-locked")}
                      style={{ ["--sov" as string]: h.accent }}
                    >
                      <Portrait hero={h} className="transition-transform duration-500 group-hover:scale-105" />
                      <span className="nidus-sov-veil" />
                      <span className={cn("nidus-chip absolute left-1.5 top-1.5", on ? "nidus-chip-lit" : trying ? "nidus-chip-open" : owned ? "nidus-chip-next" : "nidus-chip-price")}>
                        {on ? "THRONED" : trying ? "TRIAL" : owned ? "OWNED" : shop.prices[heroSku(h.id)] ?? HERO_PRICE}
                      </span>
                      <span className="absolute inset-x-0 bottom-0 p-2">
                        <span className="block font-display text-[0.8rem] tracking-[0.2em] text-bone">{h.name}</span>
                        <span className="block truncate text-[0.6rem] tracking-[0.08em] text-muted">{h.archetype}</span>
                        <span className="mt-1 inline-block border border-gilt/50 bg-void/70 px-1.5 py-0.5 font-display text-[0.55rem] tracking-[0.12em] text-gilt">
                          {h.power}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <ShopFooter />
          </>
        )}
      </div>
    </div>
  );
}

function BoostCard() {
  const shop = useShop();
  const on = useNidus((s) => s.boost2x);
  const price = shop.prices[BOOST_SKU] ?? BOOST_PRICE;
  return (
    <div className="nidus-foil mb-2 flex items-center gap-3 p-3">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-gilt/60 bg-void font-display text-2xl text-gilt">2×</div>
      <div className="min-w-0 flex-1">
        <p className="whitespace-nowrap font-display text-[0.78rem] tracking-[0.2em] text-gilt">DOUBLE TITHE</p>
        <p className="text-[0.68rem] leading-snug text-bone/85">Twice the ore, parts, spark, and cut. Forever. Offline and raids too.</p>
      </div>
      {on ? (
        <span className="nidus-chip nidus-chip-lit shrink-0">ACTIVE</span>
      ) : (
        <div className="shrink-0">
          <BuyButton sku={BOOST_SKU} label={price} />
        </div>
      )}
    </div>
  );
}

function BundleCard() {
  const shop = useShop();
  const price = shop.prices[BUNDLE_SKU] ?? BUNDLE_PRICE;
  return (
    <div className="nidus-foil mb-2 flex flex-col gap-2 p-3">
      <div className="flex items-center gap-3">
        <div className="flex shrink-0 -space-x-4">
          {SOVEREIGNS.slice(0, 4).map((h) => (
            <div key={h.id} className="h-14 w-10 overflow-hidden border border-gilt/60 bg-void">
              <Portrait hero={h} />
            </div>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <p className="whitespace-nowrap font-display text-[0.78rem] tracking-[0.2em] text-gilt">THE FULL COURT</p>
          <p className="text-[0.68rem] leading-snug text-bone/85">All 20 sovereigns, forever. Half the price of one by one.</p>
        </div>
      </div>
      <BuyButton sku={BUNDLE_SKU} label={`ALL 20 · ${price}`} wide />
    </div>
  );
}

function BuyButton({ sku, label, wide }: { sku: string; label: string; wide?: boolean }) {
  const shop = useShop();
  if (shop.mode === "web" && shop.inApp) {
    return (
      <span className={cn("nidus-cut flex min-h-11 items-center justify-center px-3 font-display text-[0.6rem] tracking-[0.14em] text-muted", wide && "w-full")}>
        NEEDS CHROME
      </span>
    );
  }
  if (shop.mode !== "play") {
    return (
      <a
        href={PLAY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("nidus-cut nidus-cut-gilt flex min-h-11 items-center justify-center px-3 font-display text-[0.6rem] tracking-[0.14em]", wide && "w-full")}
      >
        {shop.mode === "loading" ? "…" : "GET ON GOOGLE PLAY"}
      </a>
    );
  }
  return (
    <button
      type="button"
      disabled={Boolean(shop.busy)}
      onClick={async () => {
        if (!(await buy(sku))) return;
        chime("claim");
        window.dispatchEvent(new CustomEvent("nidus:bought", { detail: sku }));
      }}
      className={cn("nidus-cut nidus-cut-on min-h-11 px-4 font-display text-[0.72rem] tracking-[0.16em] disabled:opacity-50", wide && "w-full")}
    >
      {shop.busy === sku ? "…" : label}
    </button>
  );
}

function ShopFooter() {
  const shop = useShop();
  return (
    <div className="mt-3 flex flex-col items-center gap-2 pb-2">
      {shop.note && <p role="status" className="text-center text-[0.66rem] tracking-[0.1em] text-gilt">{shop.note}</p>}
      {shop.mode === "play" ? (
        <button
          type="button"
          disabled={Boolean(shop.busy)}
          onClick={() => void restore()}
          className="min-h-10 px-4 font-display text-[0.58rem] tracking-[0.18em] text-muted underline-offset-4 hover:underline"
        >
          {shop.busy === "restore" ? "RESTORING…" : "RESTORE PURCHASES"}
        </button>
      ) : (
        <p className="max-w-xs text-center text-[0.64rem] leading-snug text-muted">
          Sovereigns are sold in the NIDUS app on Google Play. Every hero can be tried free for 10 minutes here.
        </p>
      )}
      <p className="max-w-xs text-center text-[0.6rem] leading-snug text-muted/80">
        One-time purchases. No ads, no loot boxes, no subscriptions. The whole game is playable without buying.
      </p>
    </div>
  );
}

function HeroDetail({ hero, now, onBack }: { hero: Sovereign; now: number; onBack: () => void }) {
  const shop = useShop();
  const seated = useNidus((s) => s.sovereigns);
  const trial = useNidus((s) => s.trial);
  const used = useNidus((s) => s.trialsUsed.includes(hero.id));
  const molt = useNidus((s) => s.moltLayer);
  const enthrone = useNidus((s) => s.enthroneHero);
  const unthrone = useNidus((s) => s.unthroneHero);
  const tryHero = useNidus((s) => s.tryHero);
  const owned = shop.owned.has(hero.id);
  const on = seated.includes(hero.id);
  const trying = trial?.id === hero.id && now < trial.until;
  const otherTrial = Boolean(trial && now < trial.until && trial.id !== hero.id);
  const full = seated.length >= sovereignSeats({ moltLayer: molt });

  return (
    <article className="flex flex-col gap-3" style={{ ["--sov" as string]: hero.accent }}>
      <button type="button" onClick={onBack} className="self-start font-display text-[0.6rem] tracking-[0.2em] text-muted">
        ← ALL SOVEREIGNS
      </button>
      <div className="nidus-sov nidus-sov-hero relative aspect-[4/5] w-full overflow-hidden">
        <Portrait hero={hero} />
        <span className="nidus-sov-veil" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="font-display text-2xl tracking-[0.24em] text-bone">{hero.name}</p>
          <p className="font-display text-[0.7rem] tracking-[0.18em] text-gilt">{hero.title}</p>
          <p className="mt-1 text-sm italic text-bone/85">“{hero.line}”</p>
        </div>
      </div>
      <div className="nidus-card flex items-center justify-between gap-2 p-3">
        <div>
          <p className="text-[0.6rem] tracking-[0.18em] text-muted">{hero.archetype.toUpperCase()} · EDICT</p>
          <p className="font-display text-lg tracking-[0.14em] text-gilt">{hero.power}</p>
          <p className="text-[0.66rem] text-muted">Active while she sits the throne.</p>
        </div>
      </div>
      {owned ? (
        <button
          type="button"
          onClick={() => {
            if (on) unthrone(hero.id);
            else enthrone(hero.id, shop.owned);
            chime(on ? "snap" : "seat");
          }}
          className={cn("nidus-cut min-h-12 w-full font-display text-sm tracking-[0.24em]", on ? "nidus-cut-venom" : "nidus-cut-on")}
        >
          {on ? "STAND DOWN" : full ? "ENTHRONE · REPLACES OLDEST" : "ENTHRONE"}
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <BuyButton sku={heroSku(hero.id)} label={`CLAIM · ${shop.prices[heroSku(hero.id)] ?? HERO_PRICE}`} wide />
          <button
            type="button"
            disabled={used || otherTrial}
            onClick={() => {
              tryHero(hero.id);
              chime("wake");
            }}
            className="nidus-cut min-h-11 w-full font-display text-[0.66rem] tracking-[0.18em] disabled:opacity-40"
          >
            {trying ? `TRIAL · ${clock((trial?.until ?? now) - now)}` : used ? "TRIAL USED" : otherTrial ? "ONE TRIAL AT A TIME" : "TRY FREE · 10 MIN"}
          </button>
        </div>
      )}
      <ShopFooter />
    </article>
  );
}

function Reveal({ sku, onDone, onPick }: { sku: string; onDone: () => void; onPick: (id: string) => void }) {
  if (sku === BOOST_SKU) {
    return (
      <div className="nidus-reveal absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 p-4 text-center">
        <span className="nidus-reveal-rays" aria-hidden />
        <p className="nidus-reveal-card relative font-display text-7xl text-gilt">2×</p>
        <p className="relative font-display text-[0.7rem] tracking-[0.3em] text-gilt">THE HIVE DOUBLES ITS TITHE</p>
        <p className="relative text-sm text-bone/85">Ore, parts, spark, and cut now flow twice as fast. Forever.</p>
        <button type="button" className="nidus-cut nidus-cut-on relative min-h-12 w-full max-w-xs font-display text-sm tracking-[0.24em]" onClick={onDone}>
          BACK TO THE NAVE
        </button>
      </div>
    );
  }
  const all = sku === BUNDLE_SKU;
  const hero = all ? (SOVEREIGNS.find((h) => h.edict === "all") ?? SOVEREIGNS[0]) : SOVEREIGNS.find((h) => heroSku(h.id) === sku);
  if (!hero) return null;
  return (
    <div className="nidus-reveal absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 p-4 text-center">
      <span className="nidus-reveal-rays" aria-hidden />
      <div className="nidus-sov nidus-sov-hero nidus-reveal-card relative aspect-[4/5] w-3/4 max-w-[16rem] overflow-hidden" style={{ ["--sov" as string]: hero.accent }}>
        <Portrait hero={hero} />
        <span className="nidus-sov-veil" />
      </div>
      <p className="relative font-display text-[0.7rem] tracking-[0.3em] text-gilt">{all ? "THE FULL COURT KNEELS" : "A SOVEREIGN KNEELS"}</p>
      <p className="relative font-display text-2xl tracking-[0.24em] text-bone">{all ? "ALL 20 ARE YOURS" : hero.name}</p>
      {!all && <p className="relative text-sm italic text-bone/85">“{hero.line}”</p>}
      <button
        type="button"
        className="nidus-cut nidus-cut-on relative min-h-12 w-full max-w-xs font-display text-sm tracking-[0.24em]"
        onClick={() => {
          onDone();
          if (!all) onPick(hero.id);
        }}
      >
        {all ? "SEE YOUR COURT" : "TAKE HER TO THE THRONE"}
      </button>
    </div>
  );
}

export function CourtStrip({ onOpen }: { onOpen: () => void }) {
  const seated = useNidus((s) => s.sovereigns);
  const trial = useNidus((s) => s.trial);
  const now = useNow();
  const trying = trial && now < trial.until ? SOVEREIGNS.find((h) => h.id === trial.id) : undefined;
  const court = SOVEREIGNS.filter((h) => seated.includes(h.id));
  if (court.length === 0 && !trying) return null;
  return (
    <button type="button" onClick={onOpen} className="pointer-events-auto mt-1 flex items-center gap-1.5 self-start border border-gilt/40 bg-void/70 px-1.5 py-1 backdrop-blur-sm" data-chrome>
      {[...court, ...(trying ? [trying] : [])].map((h) => (
        <span key={h.id} className="nidus-crest" style={{ ["--sov" as string]: h.accent }} title={`${h.name} · ${h.power}`}>
          <Portrait hero={h} />
        </span>
      ))}
      <span className="font-display text-[0.5rem] leading-tight tracking-[0.12em] text-gilt">
        {court.map((h) => h.power).join(" · ")}
        {trying && <span className="block text-venom">TRIAL {trying.power} · {clock(trial!.until - now)}</span>}
      </span>
    </button>
  );
}
