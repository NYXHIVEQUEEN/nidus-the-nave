import { Component, lazy, memo, Suspense, useEffect, useState, type ErrorInfo, type ReactNode } from "react";
import { useNidus } from "@/lib/nidus/store";

const Scene = lazy(() => import("./StationScene").then((m) => ({ default: m.StationScene })));

const PAINTED: Record<string, string> = {
  hull: "/nidus/sky-arch.jpg",
  raid: "/nidus/sky-arch.jpg",
  forge: "/nidus/interior-forge.jpg",
  lab: "/nidus/interior-lab.jpg",
  minds: "/nidus/interior-minds.jpg",
};

// Painted stand-in for devices that cannot draw 3D; the whole game still plays over it.
function Painted({ tab, note, onRetry }: { tab: string; note?: string; onRetry?: () => void }) {
  return (
    <div className="absolute inset-0">
      <img src={PAINTED[tab] ?? PAINTED.hull} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
      {note && (
        <button
          type="button"
          disabled={!onRetry}
          onClick={onRetry}
          className="pointer-events-auto absolute right-2 top-[max(5.6rem,calc(env(safe-area-inset-top)+4.8rem))] z-20 border border-gilt/40 bg-void/80 px-2 py-1 font-display text-[0.55rem] tracking-[0.18em] text-gilt"
        >
          {note}
        </button>
      )}
    </div>
  );
}

let webgl: boolean | null = null;
function hasWebGL() {
  if (webgl !== null) return webgl;
  try {
    const c = document.createElement("canvas");
    webgl = Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webgl = false;
  }
  return webgl;
}

class HullBound extends Component<{ children: ReactNode; tab: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(_err: Error, _info: ErrorInfo) {
    /* hull stays optional; chrome still plays */
  }
  render() {
    if (this.state.failed) return <Painted tab={this.props.tab} note="3D PAUSED · TAP TO RETRY" onRetry={() => this.setState({ failed: false })} />;
    return this.props.children;
  }
}

export class ChromeBound extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(_err: Error, _info: ErrorInfo) {
    /* chrome stutters; hive stays */
  }
  render() {
    if (this.state.failed) {
      return (
        <button
          type="button"
          className="absolute inset-0 z-50 flex items-center justify-center bg-void/90 font-display text-sm tracking-[0.28em] text-gilt"
          onClick={() => this.setState({ failed: false })}
        >
          CHROME STUTTER · TAP
        </button>
      );
    }
    return this.props.children;
  }
}

/** One 3D canvas for every tab: ship on HULL/RAID, live rooms on FORGE/LAB/MINDS. */
export const StationMount = memo(function StationMount() {
  const [on, setOn] = useState(false);
  const tab = useNidus((s) => s.tab);
  const showShip = tab === "raid" || tab === "hull";
  useEffect(() => setOn(true), []);
  if (!on) return <div className="absolute inset-0 bg-void" />;
  if (!hasWebGL()) return <Painted tab={tab} note="3D OFF ON THIS DEVICE" />;
  return (
    <div className="absolute inset-0" style={{ pointerEvents: showShip ? "auto" : "none" }} aria-hidden={!showShip}>
      <HullBound tab={tab}>
        <Suspense fallback={<Painted tab={tab} />}>
          <Scene />
        </Suspense>
      </HullBound>
    </div>
  );
});
