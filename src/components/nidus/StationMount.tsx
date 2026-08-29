import { lazy, Suspense, useEffect, useState } from "react";

const Scene = lazy(() => import("./StationScene").then((m) => ({ default: m.StationScene })));

export function StationMount() {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(true), []);
  if (!on) return <div className="absolute inset-0 bg-void" />;
  return (
    <Suspense fallback={<div className="absolute inset-0 bg-void" />}>
      <Scene />
    </Suspense>
  );
}
