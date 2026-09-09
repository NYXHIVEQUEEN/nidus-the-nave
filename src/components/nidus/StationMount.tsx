import { Component, lazy, Suspense, useEffect, useState, type ErrorInfo, type ReactNode } from "react";
import { useNidus } from "@/lib/nidus/store";

const Scene = lazy(() => import("./StationScene").then((m) => ({ default: m.StationScene })));

class HullBound extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(_err: Error, _info: ErrorInfo) {
    /* hull stays optional; chrome still plays */
  }
  render() {
    if (this.state.failed) {
      return (
        <button
          type="button"
          className="absolute inset-0 flex items-center justify-center bg-void font-display text-sm tracking-[0.28em] text-gilt"
          onClick={() => this.setState({ failed: false })}
        >
          HULL STUTTER · TAP
        </button>
      );
    }
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

const INTERIOR: Record<string, string> = {
  hull: "/nidus/interior-hull.jpg",
  forge: "/nidus/interior-forge.jpg",
  minds: "/nidus/interior-minds.jpg",
};

/** 3D canvas stays mounted so RAID never cold-starts WebGL. Interiors overlay it. */
export function StationMount() {
  const [on, setOn] = useState(false);
  const tab = useNidus((s) => s.tab);
  const live = tab === "raid";
  useEffect(() => setOn(true), []);
  if (!on) return <div className="absolute inset-0 bg-void" />;
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          visibility: live ? "visible" : "hidden",
          pointerEvents: live ? "auto" : "none",
        }}
        aria-hidden={!live}
      >
        <HullBound>
          <Suspense fallback={<div className="absolute inset-0 bg-void" />}>
            <Scene />
          </Suspense>
        </HullBound>
      </div>
      {!live && (
        <img
          src={INTERIOR[tab] ?? INTERIOR.hull}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          crossOrigin="anonymous"
        />
      )}
    </>
  );
}
