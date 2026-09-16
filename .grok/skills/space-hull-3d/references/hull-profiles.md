# Hull profiles (lathe + capsule + merge)

three.js lathe spins a 2D polyline around **+Y**. Capsule is a cylinder with
hemisphere caps, also +Y. Hero ships in this stack **rotate to +Z** after.

## Lathe (capital / unique silhouette)

```ts
import { LatheGeometry, Vector2 } from "three";

// x = radius, y = length along the spin axis (will become Z after rotate)
const pts = [
  new Vector2(0.02, -2.4), // needle
  new Vector2(0.18, -2.1),
  new Vector2(0.34, -1.4),
  new Vector2(0.42, -0.2), // waist hold
  new Vector2(0.38, 0.6),
  new Vector2(0.55, 1.1),  // aft bulge
  new Vector2(0.28, 1.9),
  new Vector2(0.08, 2.3),  // engine taper
];
const geo = new LatheGeometry(pts, 24);
geo.rotateX(Math.PI / 2); // nose toward +Z
geo.computeVertexNormals();
```

**Crease vs smooth:** duplicate a point if you want a panel break
(`[r, y], [r, y]`). A single point averages the normal and looks ballooned.

**Segments:** 24 radial is the mobile default. 12 looks like a gem. 48+ is
waste on a mid-ground capital.

**Hollow bug:** a lathe with `pts[0].x === 0` still has **no end cap**. Close
the nose with a small sphere or an extra ring, or the camera sees inside.

## Capsule (rams, guns, nacelles, drones)

```ts
import { CapsuleGeometry } from "three";

// radius, cylindrical height, capSegments, radial, heightSegments
const gun = new CapsuleGeometry(0.055, 0.42, 8, 16, 4);
gun.rotateX(Math.PI / 2);
```

Capsules beat boxes for gun pods and pirate rams. Keep **capSegments ≥ 8**
or the dome facets.

## Merge add-ons (do not parent 40 meshes if they never move)

```ts
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

body.translate(0, 0, 0);
leftNacelle.translate(-0.55, 0, 0.2);
rightNacelle.translate(0.55, 0, 0.2);
const hull = mergeGeometries([body, leftNacelle, rightNacelle], false);
hull?.computeVertexNormals();
```

Merge **static** armor. Keep **animated** bits (turrets, searchlights,
engine glow) as child meshes.

## Rounded box (modules, cargo, UI props — never the hero hull)

drei `<RoundedBox radius={0.08} smoothness={4} />` or
`three/addons/geometries/RoundedBoxGeometry.js`. Fine for a crate. Wrong for
a capital ship.

## Subdivision is not the fix

Do not Loop-subdivide a box and call it a ship. You get a pillowy brick.
Change the **profile**, then add segments.

## Orientation self-test

Place `AxesHelper` on the hull. +Z must be the nose. If the wake trails the
wrong way, the geo was not rotated, or the group `rotation.y` is `Math.PI`
from a previous “fix”.
