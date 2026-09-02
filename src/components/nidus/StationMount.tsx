import { Component, lazy, Suspense, useEffect, useState, type ErrorInfo, type ReactNode } from "react";

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

export function StationMount() {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(true), []);
  if (!on) return <div className="absolute inset-0 bg-void" />;
  return (
    <HullBound>
      <Suspense fallback={<div className="absolute inset-0 bg-void" />}>
        <Scene />
      </Suspense>
    </HullBound>
  );
}
