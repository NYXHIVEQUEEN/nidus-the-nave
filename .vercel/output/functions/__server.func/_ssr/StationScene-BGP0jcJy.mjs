import { i as __toESM } from "../_runtime.mjs";
import { _ as require_jsx_runtime, a as useFrame, c as LatheGeometry, d as RepeatWrapping, f as SRGBColorSpace, h as Vector3, i as Canvas, l as Object3D, m as Vector2, n as OrbitControls, p as TOUCH, r as useTexture, s as Color, t as Stars, u as Quaternion, v as require_react } from "../_libs/@react-three/drei+[...].mjs";
import { a as useNidus, i as subscribeSpin, n as camPosition, o as ROOMS, r as getPrefs } from "./routes-BM-JuxA9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/StationScene-BGP0jcJy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var dummy = new Object3D();
var Y_UP = new Vector3(0, 1, 0);
var _dir = new Vector3();
var _quat = new Quaternion();
var BLOOD = "#7a1f2b";
var GILT = "#c4a574";
var VENOM = "#1faf5b";
var BONE = "#d8cbb8";
var SOCKETS = {
	solar: [
		0,
		.9,
		0
	],
	orebay: [
		.76,
		-.12,
		-.52
	],
	silo: [
		.7,
		.46,
		-.14
	],
	barracks: [
		-.76,
		.08,
		.3
	],
	hangar: [
		0,
		-.5,
		-1.12
	],
	gundeck: [
		0,
		.06,
		-1.68
	],
	lab: [
		.64,
		.4,
		.64
	],
	nerve: [
		0,
		.76,
		.16
	],
	reliquary: [
		0,
		1.02,
		0
	],
	cloister: [
		.68,
		.5,
		.68
	],
	choir: [
		-.26,
		.88,
		.4
	],
	vault: [
		.78,
		.54,
		-.4
	],
	crypt: [
		.54,
		-.34,
		-.86
	],
	apse: [
		0,
		1.12,
		.36
	],
	spire: [
		0,
		.58,
		-2.02
	],
	crucible: [
		.4,
		-.26,
		.54
	]
};
function useSpin() {
	return (0, import_react.useSyncExternalStore)(subscribeSpin, getPrefs, getPrefs);
}
function useHullTextures() {
	const [plate, glass, grate, filigree, blood, hazard, arch, sleep, rift, titans, rivet, giltMap, rose, voidMap, ember, bone] = useTexture([
		"/nidus/tex-plate.jpg",
		"/nidus/tex-glass.jpg",
		"/nidus/tex-grate.jpg",
		"/nidus/tex-filigree.jpg",
		"/nidus/tex-blood.jpg",
		"/nidus/tex-hazard.jpg",
		"/nidus/sky-arch.jpg",
		"/nidus/sky-sleep.jpg",
		"/nidus/sky-rift.jpg",
		"/nidus/sky-titans.jpg",
		"/nidus/tex-rivet.jpg",
		"/nidus/tex-gilt.jpg",
		"/nidus/tex-rose.jpg",
		"/nidus/tex-void.jpg",
		"/nidus/tex-ember.jpg",
		"/nidus/tex-bone.jpg"
	]);
	for (const t of [
		plate,
		glass,
		grate,
		filigree,
		blood,
		hazard,
		arch,
		sleep,
		rift,
		titans,
		rivet,
		giltMap,
		rose,
		voidMap,
		ember,
		bone
	]) t.colorSpace = SRGBColorSpace;
	plate.wrapS = plate.wrapT = RepeatWrapping;
	plate.anisotropy = 4;
	plate.repeat.set(2.4, 3.6);
	rivet.wrapS = rivet.wrapT = RepeatWrapping;
	rivet.anisotropy = 4;
	rivet.repeat.set(2.8, 3.2);
	bone.wrapS = bone.wrapT = RepeatWrapping;
	bone.repeat.set(2.2, 2.6);
	grate.wrapS = grate.wrapT = RepeatWrapping;
	grate.repeat.set(2.2, 1.6);
	glass.wrapS = glass.wrapT = RepeatWrapping;
	filigree.wrapS = filigree.wrapT = RepeatWrapping;
	giltMap.wrapS = giltMap.wrapT = RepeatWrapping;
	blood.wrapS = blood.wrapT = RepeatWrapping;
	hazard.wrapS = hazard.wrapT = RepeatWrapping;
	hazard.repeat.set(3, .6);
	rose.wrapS = rose.wrapT = RepeatWrapping;
	voidMap.wrapS = voidMap.wrapT = RepeatWrapping;
	ember.wrapS = ember.wrapT = RepeatWrapping;
	return {
		plate,
		glass,
		grate,
		filigree,
		blood,
		hazard,
		arch,
		sleep,
		rift,
		titans,
		rivet,
		giltMap,
		rose,
		voidMap,
		ember,
		bone
	};
}
function Decal({ position, rotation, size, map, color = "#ffffff", opacity = .72, emissive, eInt = 0 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position,
		rotation,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: size }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			map,
			color,
			transparent: true,
			opacity,
			depthWrite: false,
			polygonOffset: true,
			polygonOffsetFactor: -2,
			metalness: .35,
			roughness: .45,
			emissive,
			emissiveIntensity: eInt,
			side: 2
		})]
	});
}
function Ray({ position, rotation, color, w = .2, len = 3.2, opacity = .13 }) {
	const mat = (0, import_react.useRef)(null);
	const seed = position[0] + position[2];
	useFrame((state) => {
		if (!mat.current) return;
		const t = state.clock.elapsedTime;
		mat.current.opacity = opacity + Math.sin(t * 1.35 + seed) * opacity * .35;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position,
		rotation,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [
			w,
			len,
			3,
			1,
			true
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
			ref: mat,
			color,
			transparent: true,
			opacity,
			blending: 2,
			depthWrite: false,
			side: 2,
			toneMapped: false
		})]
	});
}
function Grow({ children }) {
	const ref = (0, import_react.useRef)(null);
	const k = (0, import_react.useRef)(0);
	useFrame((_, dt) => {
		k.current = Math.min(1, k.current + Math.min(dt, .1) * 1.85);
		if (!ref.current) return;
		const e = 1 - (1 - k.current) ** 3;
		const over = k.current < 1 ? 1 + Math.sin(k.current * Math.PI) * .1 : 1;
		ref.current.scale.setScalar(.06 + e * .94 * over);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
		ref,
		scale: .06,
		children
	});
}
var RADIAL = {};
for (const [k, p] of Object.entries(SOCKETS)) {
	const dir = new Vector3(p[0], p[1], p[2]);
	RADIAL[k] = dir.lengthSq() < 1e-8 ? new Quaternion() : new Quaternion().setFromUnitVectors(Y_UP, dir.normalize());
}
var KIND = {
	solar: "crown",
	orebay: "hopper",
	silo: "spindle",
	barracks: "blister",
	hangar: "maw",
	gundeck: "lance",
	lab: "dome",
	nerve: "hearth",
	reliquary: "lantern",
	cloister: "arcade",
	choir: "bell",
	vault: "coffer",
	crypt: "ossuary",
	crucible: "bowl",
	spire: "needle",
	apse: "apse"
};
function Dock({ id, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position: SOCKETS[id],
		quaternion: RADIAL[id],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			rotation: [
				Math.PI / 2,
				0,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("torusGeometry", { args: [
				.115,
				.016,
				5,
				12
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#3a342e",
				metalness: .88,
				roughness: .28
			})]
		}), children]
	}) });
}
function Hull() {
	const solar = useNidus((s) => s.rooms.solar.built);
	const orebay = useNidus((s) => s.rooms.orebay.built);
	const silo = useNidus((s) => s.rooms.silo.built);
	const barracks = useNidus((s) => s.rooms.barracks.built);
	const hangar = useNidus((s) => s.rooms.hangar.built);
	const gundeck = useNidus((s) => s.rooms.gundeck.built);
	const lab = useNidus((s) => s.rooms.lab.built);
	const nerve = useNidus((s) => s.rooms.nerve.built);
	const reliquary = useNidus((s) => s.rooms.reliquary.built);
	const cloister = useNidus((s) => s.rooms.cloister?.built ?? false);
	const choir = useNidus((s) => s.rooms.choir?.built ?? false);
	const vault = useNidus((s) => s.rooms.vault?.built ?? false);
	const crypt = useNidus((s) => s.rooms.crypt?.built ?? false);
	const apse = useNidus((s) => s.rooms.apse?.built ?? false);
	const spire = useNidus((s) => s.rooms.spire?.built ?? false);
	const crucible = useNidus((s) => s.rooms.crucible?.built ?? false);
	const roomsLit = useNidus((s) => Number(s.rooms.solar.built) + Number(s.rooms.orebay.built) + Number(s.rooms.silo.built) + Number(s.rooms.barracks.built) + Number(s.rooms.hangar.built) + Number(s.rooms.gundeck.built) + Number(s.rooms.lab.built) + Number(s.rooms.nerve.built) + Number(s.rooms.reliquary.built) + Number(s.rooms.cloister?.built) + Number(s.rooms.choir?.built) + Number(s.rooms.vault?.built) + Number(s.rooms.crypt?.built) + Number(s.rooms.apse?.built) + Number(s.rooms.spire?.built) + Number(s.rooms.crucible?.built));
	const molt = useNidus((s) => s.moltLayer);
	const raidEnds = useNidus((s) => s.raid?.endsAt ?? 0);
	const raidStart = useNidus((s) => s.raid?.startedAt ?? 0);
	const raidWing = useNidus((s) => s.raid?.strikers ?? 0);
	const watching = useNidus((s) => Boolean(s.raid?.watching));
	const queued = useNidus((s) => s.queuedRoom);
	const swarm = useNidus((s) => s.swarm.miner + s.swarm.fab + s.swarm.builder + s.swarm.lab + s.swarm.striker);
	const glow = useNidus((s) => Math.min(1, Math.round(s.charge) / 40));
	const surging = useNidus((s) => s.surgeUntil > Date.now());
	const raiding = useNidus((s) => Boolean(s.raid));
	const sparkFill = useNidus((s) => Math.min(1, s.spark / Math.max(1, s.sparkNeed)));
	const printed = useNidus((s) => s.printed);
	const eventKind = useNidus((s) => s.eventKind);
	const hiveRank = useNidus((s) => s.hiveRank ?? 0);
	const ghostId = useNidus((s) => {
		if (s.queuedRoom) return "";
		for (const r of ROOMS) {
			if (r.id === "foundry") continue;
			if (s.rooms[r.id]?.built) continue;
			if (r.requires && !s.rooms[r.requires]?.built) continue;
			if (r.also && !s.rooms[r.also]?.built) continue;
			if (r.needMolt && s.moltLayer < r.needMolt) continue;
			if (r.needRaid && !s.raidCleared.includes(r.needRaid)) continue;
			if (r.needRank) {
				const n = s.rooms[r.needRank.id];
				if (!n?.built || (n.rank ?? 0) < r.needRank.rank) continue;
			}
			return r.id;
		}
		return "";
	});
	const watchNave = useSpin().watchNave;
	const giftOpen = useNidus((s) => Boolean(s.pendingGift));
	const { plate, glass, grate, filigree, blood, hazard, arch, sleep, rift, titans, rivet, giltMap, rose, voidMap, ember, bone } = useHullTextures();
	const drones = (0, import_react.useRef)(null);
	const embers = (0, import_react.useRef)(null);
	const furnace = (0, import_react.useRef)(null);
	const glassMat = (0, import_react.useRef)(null);
	const solarRef = (0, import_react.useRef)(null);
	const nerveRef = (0, import_react.useRef)(null);
	const relicRef = (0, import_react.useRef)(null);
	const labRef = (0, import_react.useRef)(null);
	const gunRef = (0, import_react.useRef)(null);
	const ringRef = (0, import_react.useRef)(null);
	const scaffoldRef = (0, import_react.useRef)(null);
	const rayRef = (0, import_react.useRef)(null);
	const microRef = (0, import_react.useRef)(null);
	const midRef = (0, import_react.useRef)(null);
	const stationRef = (0, import_react.useRef)(null);
	const beamRef = (0, import_react.useRef)(null);
	const fighters = (0, import_react.useRef)(null);
	const tracerRef = (0, import_react.useRef)(null);
	const muzzle = (0, import_react.useRef)(null);
	const sparkleRef = (0, import_react.useRef)(null);
	const skyRef = (0, import_react.useRef)(null);
	const motes = (0, import_react.useRef)(null);
	const printLite = (0, import_react.useRef)(null);
	const leakLite = (0, import_react.useRef)(null);
	const printDart = (0, import_react.useRef)(null);
	const hangarGlow = (0, import_react.useRef)(null);
	const naveMat = (0, import_react.useRef)(null);
	const tendons = (0, import_react.useRef)(null);
	const sap = (0, import_react.useRef)(null);
	const printFlash = (0, import_react.useRef)(0);
	const lastPrinted = (0, import_react.useRef)(printed);
	const mobile = typeof window !== "undefined" && window.innerWidth < 500;
	const count = Math.min(mobile ? 24 : 40, 8 + swarm);
	const emberCount = mobile ? 22 : 38;
	const gilt = (0, import_react.useMemo)(() => new Color(GILT), []);
	const venom = (0, import_react.useMemo)(() => new Color(VENOM), []);
	const bloodC = (0, import_react.useMemo)(() => new Color(BLOOD), []);
	const naveGeo = (0, import_react.useMemo)(() => {
		const pts = [
			new Vector2(.05, 2.08),
			new Vector2(.34, 1.78),
			new Vector2(.52, 1.08),
			new Vector2(.38, .18),
			new Vector2(.54, -.92),
			new Vector2(.46, -1.62),
			new Vector2(.24, -2.02),
			new Vector2(.04, -2.12)
		];
		const g = new LatheGeometry(pts, 16);
		g.rotateX(Math.PI / 2);
		return g;
	}, []);
	const waistGeo = (0, import_react.useMemo)(() => {
		const pts = [
			new Vector2(.28, .85),
			new Vector2(.32, .2),
			new Vector2(.3, -.55)
		];
		const g = new LatheGeometry(pts, 12);
		g.rotateX(Math.PI / 2);
		return g;
	}, []);
	const hopperGeo = (0, import_react.useMemo)(() => new LatheGeometry([
		new Vector2(.05, 0),
		new Vector2(.17, .05),
		new Vector2(.19, .24),
		new Vector2(.08, .34)
	], 10), []);
	const blisterGeo = (0, import_react.useMemo)(() => new LatheGeometry([
		new Vector2(.04, 0),
		new Vector2(.145, .06),
		new Vector2(.155, .22),
		new Vector2(.1, .34),
		new Vector2(.03, .4)
	], 10), []);
	const bowlGeo = (0, import_react.useMemo)(() => new LatheGeometry([
		new Vector2(.04, 0),
		new Vector2(.16, .04),
		new Vector2(.18, .14),
		new Vector2(.1, .2),
		new Vector2(.05, .22)
	], 10), []);
	const apseGeo = (0, import_react.useMemo)(() => new LatheGeometry([
		new Vector2(.04, 0),
		new Vector2(.16, .08),
		new Vector2(.14, .22),
		new Vector2(.04, .36)
	], 10), []);
	const tendonTargets = (0, import_react.useMemo)(() => {
		const out = [];
		if (solar) out.push(SOCKETS.solar);
		if (orebay) out.push(SOCKETS.orebay);
		if (silo) out.push(SOCKETS.silo);
		if (barracks) out.push(SOCKETS.barracks);
		if (hangar) out.push(SOCKETS.hangar);
		if (gundeck) out.push(SOCKETS.gundeck);
		if (lab) out.push(SOCKETS.lab);
		if (nerve) out.push(SOCKETS.nerve);
		if (reliquary) out.push(SOCKETS.reliquary);
		if (cloister) out.push(SOCKETS.cloister);
		if (choir) out.push(SOCKETS.choir);
		if (vault) out.push(SOCKETS.vault);
		if (crypt) out.push(SOCKETS.crypt);
		if (apse) out.push(SOCKETS.apse);
		if (spire) out.push(SOCKETS.spire);
		if (crucible) out.push(SOCKETS.crucible);
		return out;
	}, [
		solar,
		orebay,
		silo,
		barracks,
		hangar,
		gundeck,
		lab,
		nerve,
		reliquary,
		cloister,
		choir,
		vault,
		crypt,
		apse,
		spire,
		crucible
	]);
	useFrame((state, delta) => {
		const d = Math.min(delta, .1);
		const t = state.clock.elapsedTime;
		const hidden = typeof document !== "undefined" && document.hidden;
		const dist = state.camera.position.length();
		const far = dist > 16 + roomsLit * .2;
		const mid = dist > 11;
		if (microRef.current) microRef.current.visible = !mid;
		if (midRef.current) midRef.current.visible = !far;
		if (sparkleRef.current) sparkleRef.current.visible = !far;
		if (skyRef.current) {
			skyRef.current.visible = true;
			skyRef.current.rotation.y += d * .008;
		}
		if (stationRef.current) {
			stationRef.current.visible = !watching;
			const grow = 1.38 + roomsLit * .035 + molt * .07;
			stationRef.current.scale.setScalar(grow);
		}
		if (ringRef.current) {
			ringRef.current.visible = !far;
			ringRef.current.scale.setScalar(1 + roomsLit * .06 + molt * .14);
			ringRef.current.rotation.z += d * (surging ? .55 : .12);
			ringRef.current.rotation.y = Math.sin(t * .2) * .08;
		}
		if (furnace.current) {
			const tide = eventKind === "TIDE" || eventKind === "FURNACE" || surging;
			furnace.current.intensity = (far ? 5 : (tide ? 12 : 8) + Math.sin(t * 11) * 1.6 + glow * 2 + (giftOpen ? 6 : 0)) * (watchNave ? 1.35 : 1);
			furnace.current.color.set(eventKind === "PULSAR" ? GILT : eventKind === "ROSE" ? VENOM : BLOOD);
		}
		if (naveMat.current) naveMat.current.emissiveIntensity = .04 + molt * .12 + sparkFill * .08 + (giftOpen ? .18 : 0);
		if (glassMat.current) glassMat.current.emissiveIntensity = .45 + sparkFill * 1.15 + Math.sin(t * 2.4) * (.08 + sparkFill * .14) + (surging ? .45 : 0);
		if (rayRef.current) rayRef.current.opacity = mid ? 0 : .07 + glow * .08 + Math.sin(t * 1.4) * .02;
		if (solarRef.current) solarRef.current.rotation.y += d * .35;
		if (nerveRef.current) {
			const s = 1 + Math.sin(t * 2.6) * .08 + sparkFill * .14;
			nerveRef.current.scale.setScalar(s);
		}
		if (relicRef.current) relicRef.current.rotation.y += d * .7;
		if (labRef.current) labRef.current.position.y = .28 + Math.sin(t * 1.8) * .05;
		if (gunRef.current) gunRef.current.position.y = Math.sin(t * .9) * .025;
		if (printed !== lastPrinted.current) {
			lastPrinted.current = printed;
			printFlash.current = 1;
		}
		printFlash.current = Math.max(0, printFlash.current - d * 1.8);
		if (printLite.current) printLite.current.intensity = printFlash.current * 28 + glow * 4;
		if (printDart.current) {
			const k = printFlash.current;
			printDart.current.visible = k > .04;
			printDart.current.position.set(.18 + (1 - k) * 1.4, .04 + k * .12, .08);
			printDart.current.rotation.z = (1 - k) * 1.2;
			printDart.current.scale.setScalar(.45 + k * .7);
		}
		if (hangarGlow.current) hangarGlow.current.emissiveIntensity = raiding ? .9 + Math.sin(t * 6) * .35 : .12;
		if (leakLite.current) {
			leakLite.current.intensity = 4 + glow * 6 + Math.sin(t * 2.1) * 1.2 + (surging ? 4 : 0) + (eventKind === "PULSAR" ? 5 : 0);
			leakLite.current.color.set(eventKind === "ECLIPSE" ? "#4a3a58" : GILT);
		}
		if (scaffoldRef.current) {
			scaffoldRef.current.visible = Boolean(queued);
			const pulse = .55 + Math.sin(t * 6) * .45;
			scaffoldRef.current.scale.setScalar(.92 + pulse * .08);
		}
		if (beamRef.current) {
			const sock = queued ? SOCKETS[queued] : null;
			if (!sock) beamRef.current.visible = false;
			else {
				beamRef.current.visible = !far;
				const [x, y, z] = sock;
				_dir.set(x, y, z);
				const len = Math.max(.2, _dir.length());
				_dir.normalize();
				_quat.setFromUnitVectors(Y_UP, _dir);
				beamRef.current.quaternion.copy(_quat);
				beamRef.current.position.set(x * .5, y * .5, z * .5);
				beamRef.current.scale.set(1, len, 1);
			}
		}
		const now = Date.now();
		const fighting = raidEnds > now;
		const u = fighting ? (now - raidStart) / Math.max(1, raidEnds - raidStart) : 0;
		const wing = fighters.current;
		if (wing) {
			const n = Math.min(12, Math.max(0, raidWing));
			for (let i = 0; i < 12; i++) {
				if (!fighting || i >= n) {
					dummy.position.set(0, -80, 0);
					dummy.scale.setScalar(.001);
				} else {
					const launch = Math.max(0, Math.min(1, u * 2.4 - i * .07));
					const a = t * .9 + i * .7;
					dummy.position.set(Math.sin(a) * (.35 + launch * 1.1), -.55 + launch * .9 + Math.sin(t * 2 + i) * .08, -1.45 - launch * (5.5 + i * .22));
					dummy.lookAt(dummy.position.x, dummy.position.y, dummy.position.z - 1);
					dummy.rotateX(Math.PI / 2);
					dummy.scale.setScalar(.7 + launch * .5);
				}
				dummy.updateMatrix();
				wing.setMatrixAt(i, dummy.matrix);
			}
			wing.instanceMatrix.needsUpdate = true;
			wing.visible = fighting;
		}
		if (tracerRef.current) {
			tracerRef.current.visible = Boolean(gundeck && (fighting || surging) && !far);
			tracerRef.current.scale.y = fighting ? 2.4 + Math.sin(t * 14) * .5 : 1.2 + Math.sin(t * 4) * .2;
		}
		if (muzzle.current) muzzle.current.intensity = gundeck && fighting ? 18 + Math.sin(t * 22) * 12 : 0;
		const mesh = drones.current;
		if (mesh) {
			if (far || hidden) mesh.visible = false;
			else {
				for (let i = 0; i < count; i++) {
					const belt = i % 2;
					const a = i / count * Math.PI * 2 + t * (belt ? .22 : -.16);
					const r = 1.85 + belt * .45 + i % 4 * .12;
					dummy.position.set(Math.cos(a) * r, Math.sin(t * .5 + i) * .42 + belt * .25, Math.sin(a) * r * .62);
					dummy.lookAt(0, 0, 0);
					dummy.rotateX(Math.PI / 2);
					dummy.scale.setScalar(.9 + i % 3 * .25);
					dummy.updateMatrix();
					mesh.setMatrixAt(i, dummy.matrix);
				}
				mesh.instanceMatrix.needsUpdate = true;
				mesh.visible = true;
			}
		}
		const em = embers.current;
		if (em) {
			if (mid || hidden) em.visible = false;
			else {
				for (let i = 0; i < emberCount; i++) {
					const life = (t * (.35 + i % 5 * .05) + i * .37) % 1;
					dummy.position.set(i * 17 % 10 * .04 - .2, -.05 + life * 1.1, 2.05 + i * 13 % 7 * .04);
					dummy.scale.setScalar(.4 + (1 - life) * .8);
					dummy.rotation.set(0, 0, 0);
					dummy.updateMatrix();
					em.setMatrixAt(i, dummy.matrix);
				}
				em.instanceMatrix.needsUpdate = true;
				em.visible = true;
			}
		}
		const mo = motes.current;
		if (mo) {
			if (far && !watchNave || hidden) mo.visible = false;
			else {
				const ring = 2.05 + molt * .28;
				for (let i = 0; i < 16; i++) {
					const a = t * .22 + i * .39;
					dummy.position.set(Math.cos(a) * (ring + i % 3 * .16), .12 + Math.sin(t * .8 + i) * .55, Math.sin(a) * (ring * .72 + i % 2 * .18));
					dummy.scale.setScalar(.45 + i % 3 * .35 + sparkFill * .2);
					dummy.rotation.set(0, 0, 0);
					dummy.updateMatrix();
					mo.setMatrixAt(i, dummy.matrix);
				}
				mo.instanceMatrix.needsUpdate = true;
				mo.visible = true;
			}
		}
		const tn = tendons.current;
		if (tn) {
			if (far && !watchNave || hidden) tn.visible = false;
			else {
				const n = tendonTargets.length;
				for (let i = 0; i < 16; i++) {
					if (i >= n) {
						dummy.position.set(0, -80, 0);
						dummy.scale.setScalar(.001);
						dummy.rotation.set(0, 0, 0);
					} else {
						const p = tendonTargets[i];
						_dir.set(p[0], p[1], p[2]);
						const len = Math.max(.16, _dir.length());
						_dir.normalize();
						dummy.position.set(p[0] * .58, p[1] * .58, p[2] * .58);
						dummy.quaternion.setFromUnitVectors(Y_UP, _dir);
						dummy.scale.set(1, len * .52, 1);
					}
					dummy.updateMatrix();
					tn.setMatrixAt(i, dummy.matrix);
				}
				tn.instanceMatrix.needsUpdate = true;
				tn.visible = true;
			}
		}
		const sp = sap.current;
		if (sp) {
			if (far && !watchNave || hidden || tendonTargets.length === 0) sp.visible = false;
			else {
				const n = tendonTargets.length;
				for (let i = 0; i < 12; i++) {
					const p = tendonTargets[i % n];
					const u = (t * .28 + i * .09) % 1;
					dummy.position.set(p[0] * (.42 + u * .62), p[1] * (.42 + u * .62), p[2] * (.42 + u * .62));
					dummy.scale.setScalar(.55 + (1 - u) * .7 + sparkFill * .2);
					dummy.quaternion.identity();
					dummy.updateMatrix();
					sp.setMatrixAt(i, dummy.matrix);
				}
				sp.instanceMatrix.needsUpdate = true;
				sp.visible = true;
			}
		}
		const info = state.gl.info.render;
		globalThis.__nidusPerf = {
			calls: info.calls,
			triangles: info.triangles,
			frameMs: d * 1e3
		};
	});
	const scaffoldPos = queued && SOCKETS[queued] ? SOCKETS[queued] : [
		0,
		0,
		0
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
			ref: skyRef,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					rotation: [
						0,
						0,
						0
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
						78,
						78,
						42,
						48,
						1,
						true
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
						map: arch,
						side: 1
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						0,
						22,
						0
					],
					rotation: [
						0,
						0,
						0
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
						78,
						32,
						16,
						0,
						Math.PI * 2,
						0,
						Math.PI / 2
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
						map: sleep,
						side: 1
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						-28,
						-11,
						-10
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
						8.2,
						28,
						20
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						map: sleep,
						roughness: .92,
						metalness: .05,
						emissive: "#1a1020",
						emissiveIntensity: .25
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						24,
						-9,
						14
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
						6.4,
						28,
						20
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						map: titans,
						roughness: .9,
						metalness: .04,
						emissive: "#141018",
						emissiveIntensity: .2
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						8,
						-14,
						-26
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
						5.2,
						24,
						18
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						map: rift,
						roughness: .94,
						metalness: .04,
						emissive: "#1a0814",
						emissiveIntensity: .22
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					rotation: [
						Math.PI / 2.2,
						.15,
						.1
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("torusGeometry", { args: [
						36,
						.45,
						8,
						64
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
						color: "#c9a8c4",
						transparent: true,
						opacity: .2,
						depthWrite: false
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
			ref: stationRef,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
					geometry: naveGeo,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						ref: naveMat,
						map: rivet,
						color: BONE,
						metalness: .5,
						roughness: .44,
						emissive: gilt,
						emissiveIntensity: .06
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
					geometry: waistGeo,
					position: [
						0,
						.02,
						0
					],
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						map: bone,
						color: "#efe4d4",
						metalness: .38,
						roughness: .5
					})
				}),
				molt > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					rotation: [
						Math.PI / 2,
						0,
						0
					],
					position: [
						0,
						.02,
						0
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("torusGeometry", { args: [
						.34 + molt * .05,
						.018,
						6,
						28
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: GILT,
						emissive: gilt,
						emissiveIntensity: .5 + molt * .22,
						metalness: .82,
						roughness: .26,
						toneMapped: false
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						0,
						-.42,
						0
					],
					rotation: [
						Math.PI / 2,
						0,
						0
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
						.22,
						3.6,
						.08
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						map: voidMap,
						color: "#2c2622",
						metalness: .74,
						roughness: .36
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						0,
						.42,
						0
					],
					rotation: [
						.12,
						0,
						0
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
						.08,
						.12,
						3.55
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: "#3a342e",
						metalness: .88,
						roughness: .28
					})]
				}),
				[
					-1.35,
					-.45,
					.45,
					1.35
				].map((z, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						0,
						.5,
						z
					],
					rotation: [
						.15,
						0,
						i % 2 ? .08 : -.08
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [
						.055,
						.22,
						3
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: "#3a342e",
						metalness: .88,
						roughness: .28
					})]
				}, `ridge-${z}`)),
				[-1, 1].map((x) => [
					-1.1,
					.15,
					1.25
				].map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						x * .72,
						-.08,
						z
					],
					rotation: [
						0,
						0,
						x > 0 ? -.55 : .55
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
						.028,
						.022,
						1.05,
						6
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: "#2a2622",
						metalness: .86,
						roughness: .32
					})]
				}, `butt-${x}-${z}`))),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
					ref: microRef,
					children: [
						[-.42, .42].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
							position: [
								x,
								.32,
								.05
							],
							rotation: [
								Math.PI / 2,
								0,
								0
							],
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
								.028,
								.028,
								2.4,
								8
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
								color: "#4a4038",
								metalness: .85,
								roughness: .32
							})]
						}, `pipe-${x}`)),
						[
							-.95,
							0,
							.95
						].map((z, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
								position: [
									.5,
									.08,
									z
								],
								rotation: [
									0,
									Math.PI / 2,
									0
								],
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [.14, .38] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
									ref: i === 0 ? glassMat : void 0,
									map: rose,
									color: i % 2 ? venom : gilt,
									emissive: i % 2 ? venom : gilt,
									emissiveIntensity: .45 + glow * .45,
									metalness: .08,
									roughness: .16,
									toneMapped: false,
									side: 2
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
								position: [
									.5,
									.3,
									z
								],
								rotation: [
									0,
									Math.PI / 2,
									0
								],
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [
									.07,
									.14,
									3
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
									map: rose,
									color: GILT,
									emissive: gilt,
									emissiveIntensity: .7 + glow,
									toneMapped: false
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
								position: [
									-.5,
									.08,
									z
								],
								rotation: [
									0,
									-Math.PI / 2,
									0
								],
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [.14, .38] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
									map: rose,
									color: i % 2 ? bloodC : gilt,
									emissive: i % 2 ? bloodC : gilt,
									emissiveIntensity: .7 + glow * .8,
									toneMapped: false,
									side: 2
								})]
							})
						] }, `lancet-${z}`)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
							position: [
								0,
								.12,
								-2.05
							],
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circleGeometry", { args: [.22, 16] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
								map: rose,
								color: GILT,
								emissive: gilt,
								emissiveIntensity: 1.1 + glow,
								toneMapped: false
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
							position: [
								0,
								.12,
								-2.06
							],
							rotation: [
								0,
								0,
								Math.PI / 4
							],
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ringGeometry", { args: [
								.07,
								.2,
								8
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
								color: "#2a221c",
								metalness: .8,
								roughness: .3
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Decal, {
							position: [
								.5,
								.02,
								.1
							],
							rotation: [
								0,
								Math.PI / 2,
								0
							],
							size: [1.4, .5],
							map: giltMap,
							opacity: .55,
							emissive: gilt,
							eInt: .16
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Decal, {
							position: [
								-.5,
								-.08,
								.25
							],
							rotation: [
								0,
								-Math.PI / 2,
								0
							],
							size: [1.2, .42],
							map: blood,
							color: "#c45a4a",
							opacity: .55,
							emissive: bloodC,
							eInt: .1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Decal, {
							position: [
								0,
								-.46,
								.1
							],
							rotation: [
								-Math.PI / 2,
								0,
								0
							],
							size: [.9, 1.8],
							map: hazard,
							opacity: .42
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						0,
						-.02,
						2.18
					],
					rotation: [
						Math.PI / 2,
						0,
						0
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [
						.28,
						.82,
						4
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						map: ember,
						color: BLOOD,
						metalness: .38,
						roughness: .34,
						emissive: bloodC,
						emissiveIntensity: .4 + glow * .28
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						0,
						.22,
						2.42
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
						.04,
						.32,
						.04
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: GILT,
						metalness: .92,
						roughness: .22,
						emissive: gilt,
						emissiveIntensity: .55
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						0,
						.22,
						2.42
					],
					rotation: [
						0,
						0,
						Math.PI / 2
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
						.04,
						.2,
						.04
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: GILT,
						metalness: .92,
						roughness: .22,
						emissive: gilt,
						emissiveIntensity: .55
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
					ref: furnace,
					position: [
						0,
						-.1,
						2.05
					],
					color: BLOOD,
					distance: 10,
					decay: 2,
					intensity: 16
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
					ref: printLite,
					position: [
						0,
						.2,
						.1
					],
					color: GILT,
					distance: 6,
					decay: 2,
					intensity: 0
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
					ref: leakLite,
					position: [
						.55,
						.18,
						.3
					],
					color: GILT,
					distance: 6,
					decay: 2,
					intensity: 6
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
					ref: midRef,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ray, {
							position: [
								1.05,
								.12,
								0
							],
							rotation: [
								0,
								0,
								-Math.PI / 2
							],
							color: GILT,
							w: .12,
							len: 2.2,
							opacity: .14
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ray, {
							position: [
								-1.05,
								.1,
								.2
							],
							rotation: [
								0,
								0,
								Math.PI / 2
							],
							color: BLOOD,
							w: .1,
							len: 2,
							opacity: .14
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ray, {
							position: [
								0,
								.08,
								-2.55
							],
							rotation: [
								-Math.PI / 2,
								0,
								0
							],
							color: GILT,
							w: .16,
							len: 2.4,
							opacity: .12
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
					ref: ringRef,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
							rotation: [
								Math.PI / 2.4,
								0,
								0
							],
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("torusGeometry", { args: [
								2.35,
								.018,
								6,
								48
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
								color: surging ? VENOM : GILT,
								metalness: .85,
								roughness: .28,
								emissive: surging ? venom : gilt,
								emissiveIntensity: surging ? 1.1 : .35 + sparkFill * .4,
								toneMapped: false
							})]
						}),
						molt > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
							rotation: [
								Math.PI / 2.1,
								.2,
								0
							],
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("torusGeometry", { args: [
								2.7,
								.014,
								6,
								40
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
								color: BLOOD,
								emissive: bloodC,
								emissiveIntensity: .7,
								toneMapped: false
							})]
						}),
						hiveRank >= 6 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
							rotation: [
								Math.PI / 1.9,
								-.15,
								.1
							],
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("torusGeometry", { args: [
								3.05,
								.012,
								6,
								36
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
								color: VENOM,
								emissive: venom,
								emissiveIntensity: .55 + sparkFill * .4,
								toneMapped: false
							})]
						})
					]
				}),
				solar && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dock, {
					id: "solar",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.04,
							0
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
							.07,
							.1,
							.12,
							8
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							map: plate,
							color: "#e8d4a8",
							metalness: .55,
							roughness: .36,
							emissive: gilt,
							emissiveIntensity: .7
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
						ref: solarRef,
						position: [
							0,
							.12,
							0
						],
						children: [
							0,
							1,
							2
						].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
							rotation: [
								Math.PI / 2,
								0,
								i * Math.PI / 3
							],
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circleGeometry", { args: [.26, 6] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
								color: GILT,
								metalness: .55,
								roughness: .22,
								emissive: gilt,
								emissiveIntensity: 1.05,
								toneMapped: false,
								side: 2
							})]
						}, `vane-${i}`))
					})]
				}),
				silo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dock, {
					id: "silo",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.18,
							0
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
							.09,
							.13,
							.4,
							8
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							map: plate,
							color: BONE,
							metalness: .6,
							roughness: .45
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.4,
							0
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
							.1,
							8,
							6
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							map: grate,
							color: "#c4b8a6",
							metalness: .7,
							roughness: .35
						})]
					})]
				}),
				orebay && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dock, {
					id: "orebay",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
						geometry: hopperGeo,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							map: grate,
							color: BONE,
							metalness: .62,
							roughness: .4
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.04,
							0
						],
						rotation: [
							Math.PI / 2,
							0,
							0
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ringGeometry", { args: [
							.1,
							.16,
							8
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							map: hazard,
							color: "#c4a574",
							metalness: .5,
							roughness: .42
						})]
					})]
				}),
				barracks && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dock, {
					id: "barracks",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
						geometry: blisterGeo,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							map: plate,
							color: BONE,
							metalness: .55,
							roughness: .46
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.18,
							.12
						],
						rotation: [
							0,
							0,
							0
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [.12, .18] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							map: filigree,
							color: GILT,
							transparent: true,
							opacity: .7,
							emissive: gilt,
							emissiveIntensity: .15,
							side: 2
						})]
					})]
				}),
				hangar && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dock, {
					id: "hangar",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.1,
							0
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
							.22,
							.28,
							.22,
							8
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							map: grate,
							color: BONE,
							metalness: .58,
							roughness: .42
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.22,
							0
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
							.16,
							.2,
							.08,
							8,
							1,
							true
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							ref: hangarGlow,
							map: grate,
							color: BONE,
							emissive: venom,
							emissiveIntensity: raiding ? 1 : .12,
							toneMapped: false,
							side: 2
						})]
					})]
				}),
				gundeck && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dock, {
					id: "gundeck",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
						ref: gunRef,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
								position: [
									0,
									.08,
									0
								],
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
									.1,
									.12,
									.18,
									8
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
									map: plate,
									color: "#c4a0a0",
									metalness: .62,
									roughness: .36,
									emissive: bloodC,
									emissiveIntensity: .35
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
								position: [
									0,
									.38,
									0
								],
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
									.035,
									.055,
									.48,
									8
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
									color: BLOOD,
									metalness: .55,
									roughness: .36,
									emissive: bloodC,
									emissiveIntensity: .45
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
								ref: tracerRef,
								position: [
									0,
									.7,
									0
								],
								visible: false,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
									.012,
									.004,
									1,
									5
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
									color: BLOOD,
									transparent: true,
									opacity: .75,
									toneMapped: false
								})] })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
								ref: muzzle,
								position: [
									0,
									.55,
									0
								],
								color: BLOOD,
								distance: 6,
								intensity: 0
							})
						]
					})
				}),
				lab && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dock, {
					id: "lab",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.08,
							0
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
							.1,
							.12,
							.14,
							8
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							map: plate,
							color: "#b8d4c0",
							metalness: .5,
							roughness: .4,
							emissive: venom,
							emissiveIntensity: .35
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
						ref: labRef,
						position: [
							0,
							.28,
							0
						],
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
							.11,
							12,
							10
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							map: glass,
							color: VENOM,
							emissive: venom,
							emissiveIntensity: 1.15,
							transparent: true,
							opacity: .88,
							toneMapped: false
						})] })
					})]
				}),
				nerve && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dock, {
					id: "nerve",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.05,
							0
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
							.09,
							.11,
							.1,
							8
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							map: plate,
							color: "#e8d4a8",
							metalness: .55,
							roughness: .4
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
						ref: nerveRef,
						position: [
							0,
							.2,
							0
						],
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
							.11,
							12,
							12
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							color: GILT,
							emissive: gilt,
							emissiveIntensity: 1.8 + sparkFill * 1.4,
							toneMapped: false
						})] })
					})]
				}),
				sparkFill > .82 && nerve && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
					position: SOCKETS.nerve,
					quaternion: RADIAL.nerve,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						rotation: [
							Math.PI / 2,
							0,
							0
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("torusGeometry", { args: [
							.28,
							.012,
							6,
							24
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
							color: VENOM,
							transparent: true,
							opacity: .4 + sparkFill * .35,
							toneMapped: false,
							blending: 2,
							depthWrite: false
						})]
					})
				}),
				reliquary && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dock, {
					id: "reliquary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
						ref: relicRef,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
							position: [
								0,
								.06,
								0
							],
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
								.07,
								.09,
								.1,
								8
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
								map: plate,
								color: "#e8d4a8",
								metalness: .6,
								roughness: .36,
								emissive: bloodC,
								emissiveIntensity: .35
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
							position: [
								0,
								.26,
								0
							],
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [
								.11,
								.28,
								6
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
								map: giltMap,
								color: GILT,
								emissive: bloodC,
								emissiveIntensity: 1.15,
								metalness: .62,
								roughness: .28
							})]
						})]
					})
				}),
				cloister && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dock, {
					id: "cloister",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.12,
							0
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
							.11,
							.13,
							.24,
							8
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							map: rose,
							color: VENOM,
							metalness: .45,
							roughness: .38,
							emissive: venom,
							emissiveIntensity: .85,
							toneMapped: false
						})]
					})
				}),
				choir && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dock, {
					id: "choir",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.16,
							0
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
							.05,
							.13,
							.32,
							7
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							map: giltMap,
							color: GILT,
							metalness: .62,
							roughness: .32,
							emissive: gilt,
							emissiveIntensity: .9
						})]
					})
				}),
				vault && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dock, {
					id: "vault",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.1,
							0
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
							.14,
							.16,
							.2,
							8
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							map: voidMap,
							color: "#cfc3b2",
							metalness: .72,
							roughness: .32
						})]
					})
				}),
				crypt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dock, {
					id: "crypt",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.14,
							0
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
							.1,
							.16,
							4,
							8
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							map: ember,
							color: BLOOD,
							metalness: .5,
							roughness: .4,
							emissive: bloodC,
							emissiveIntensity: .55
						})]
					})
				}),
				crucible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dock, {
					id: "crucible",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
						geometry: bowlGeo,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							map: ember,
							color: "#c45a4a",
							metalness: .55,
							roughness: .36,
							emissive: bloodC,
							emissiveIntensity: 1.1,
							toneMapped: false
						})
					})
				}),
				spire && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dock, {
					id: "spire",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.22,
							0
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [
							.08,
							.48,
							6
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							map: giltMap,
							color: GILT,
							metalness: .7,
							roughness: .28,
							emissive: gilt,
							emissiveIntensity: .9
						})]
					})
				}),
				apse && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dock, {
					id: "apse",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
						geometry: apseGeo,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							map: rose,
							color: BLOOD,
							metalness: .48,
							roughness: .36,
							emissive: bloodC,
							emissiveIntensity: 1.2,
							toneMapped: false
						})
					})
				}),
				ghostId && SOCKETS[ghostId] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
					position: SOCKETS[ghostId],
					quaternion: RADIAL[ghostId],
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.14,
							0
						],
						children: [KIND[ghostId] === "maw" || KIND[ghostId] === "coffer" || KIND[ghostId] === "hopper" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
							.13,
							.16,
							.24,
							8
						] }) : KIND[ghostId] === "needle" || KIND[ghostId] === "lance" || KIND[ghostId] === "bell" || KIND[ghostId] === "lantern" || KIND[ghostId] === "apse" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [
							.1,
							.34,
							6
						] }) : KIND[ghostId] === "spindle" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
							.08,
							.12,
							.36,
							8
						] }) : KIND[ghostId] === "crown" || KIND[ghostId] === "dome" || KIND[ghostId] === "hearth" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
							.13,
							10,
							8
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
							.1,
							.16,
							4,
							8
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
							color: GILT,
							transparent: true,
							opacity: .38,
							depthWrite: false
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
					ref: printDart,
					visible: false,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						rotation: [
							0,
							0,
							-Math.PI / 2
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [
							.035,
							.14,
							5
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
							color: VENOM,
							toneMapped: false
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
					ref: scaffoldRef,
					position: scaffoldPos,
					children: [[
						0,
						1,
						2,
						3
					].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						rotation: [
							.45,
							i * Math.PI / 2,
							0
						],
						position: [
							.1,
							.02,
							0
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
							.012,
							.01,
							.48,
							5
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
							color: GILT,
							transparent: true,
							opacity: .8
						})]
					}, `rib-${i}`)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						rotation: [
							Math.PI / 2,
							0,
							0
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("torusGeometry", { args: [
							.15,
							.01,
							5,
							12
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
							color: GILT,
							transparent: true,
							opacity: .85
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
					ref: drones,
					args: [
						void 0,
						void 0,
						count
					],
					visible: false,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [
						.032,
						.12,
						6
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: "#e8dcc8",
						emissive: venom,
						emissiveIntensity: 2.1,
						toneMapped: false
					})]
				}, count),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
					ref: embers,
					args: [
						void 0,
						void 0,
						emberCount
					],
					visible: false,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
						.022,
						5,
						5
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
						color: BLOOD,
						toneMapped: false
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
					ref: motes,
					args: [
						void 0,
						void 0,
						16
					],
					visible: false,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
						.016,
						5,
						5
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
						color: GILT,
						transparent: true,
						opacity: .85,
						toneMapped: false,
						blending: 2,
						depthWrite: false
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
					ref: tendons,
					args: [
						void 0,
						void 0,
						16
					],
					visible: false,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
						.022,
						.016,
						1,
						6
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: "#8a7358",
						metalness: .86,
						roughness: .32,
						emissive: gilt,
						emissiveIntensity: .18
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
					ref: sap,
					args: [
						void 0,
						void 0,
						12
					],
					visible: false,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
						.022,
						5,
						5
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
						color: GILT,
						transparent: true,
						opacity: .95,
						toneMapped: false,
						blending: 2,
						depthWrite: false
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { ref: sparkleRef })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
			ref: beamRef,
			visible: false,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
				.035,
				.012,
				1,
				6
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
				color: GILT,
				transparent: true,
				opacity: .62,
				toneMapped: false,
				blending: 2,
				depthWrite: false
			})] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
			ref: fighters,
			args: [
				void 0,
				void 0,
				12
			],
			visible: false,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [
				.04,
				.16,
				6
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#e8dcc8",
				emissive: venom,
				emissiveIntensity: .9
			})]
		})
	] });
}
function Pulsar() {
	const light = (0, import_react.useRef)(null);
	const star = (0, import_react.useRef)(null);
	const shaft = (0, import_react.useRef)(null);
	const pos = [
		34,
		20,
		-30
	];
	useFrame((state) => {
		const t = state.clock.elapsedTime;
		const pulse = .74 + Math.sin(t * 1.65) * .16 + Math.sin(t * 7.1) * .05;
		if (star.current) star.current.scale.setScalar(.9 + pulse * .28);
		if (light.current) {
			light.current.intensity = 22 + pulse * 38;
			light.current.target.position.set(0, 0, 0);
			light.current.target.updateMatrixWorld();
		}
		if (shaft.current) shaft.current.opacity = .05 + pulse * .045;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
			ref: star,
			position: pos,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					1.15,
					16,
					16
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", { color: "#fff6dc" })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					2.05,
					12,
					12
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					color: "#ffb45a",
					transparent: true,
					opacity: .32,
					depthWrite: false,
					blending: 2
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
					color: "#ffe6b8",
					intensity: 36,
					distance: 80,
					decay: 2
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("spotLight", {
			ref: light,
			position: pos,
			angle: .64,
			penumbra: .94,
			color: "#ffe2b0",
			intensity: 36,
			distance: 100,
			decay: 1.65
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				17,
				10,
				-15
			],
			rotation: [
				1.05,
				.4,
				-.15
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [
				4.2,
				18,
				12,
				1,
				true
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
				ref: shaft,
				color: "#ffd8a8",
				transparent: true,
				opacity: .07,
				depthWrite: false,
				blending: 2,
				side: 2
			})]
		})
	] });
}
function BattleField() {
	const watching = useNidus((s) => Boolean(s.raid?.watching));
	const n = useNidus((s) => Math.min(16, s.raid?.strikers ?? 0));
	const boosted = useNidus((s) => (s.raid?.boostUntil ?? 0) > Date.now());
	const ships = (0, import_react.useRef)(null);
	useFrame((state) => {
		const mesh = ships.current;
		if (!mesh) return;
		if (!watching) {
			mesh.visible = false;
			return;
		}
		const t = state.clock.elapsedTime;
		for (let i = 0; i < 16; i++) {
			if (i >= n) {
				dummy.position.set(0, -80, 0);
				dummy.scale.setScalar(.001);
			} else {
				const a = t * .55 + i / Math.max(1, n) * Math.PI * 2;
				dummy.position.set(Math.cos(a) * 2.5, Math.sin(t * 1.4 + i) * .28, Math.sin(a) * 1.7);
				dummy.lookAt(0, 0, 0);
				dummy.rotateX(Math.PI / 2);
				dummy.scale.setScalar(boosted ? 1.15 : 1);
			}
			dummy.updateMatrix();
			mesh.setMatrixAt(i, dummy.matrix);
		}
		mesh.instanceMatrix.needsUpdate = true;
		mesh.visible = true;
	});
	if (!watching) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("icosahedronGeometry", { args: [.55, 0] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
		color: "#2a1a18",
		emissive: "#7a1f2b",
		emissiveIntensity: .9
	})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref: ships,
		args: [
			void 0,
			void 0,
			16
		],
		visible: false,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [
			.055,
			.2,
			6
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: boosted ? GILT : BONE,
			emissive: boosted ? GILT : VENOM,
			emissiveIntensity: boosted ? 1.1 : .7
		})]
	})] });
}
function Rig() {
	const prefs = useSpin();
	const lastCam = (0, import_react.useRef)(-1);
	const lastDist = (0, import_react.useRef)(-1);
	const roomsLit = useNidus((s) => Number(s.rooms.solar.built) + Number(s.rooms.orebay.built) + Number(s.rooms.silo.built) + Number(s.rooms.barracks.built) + Number(s.rooms.hangar.built) + Number(s.rooms.gundeck.built) + Number(s.rooms.lab.built) + Number(s.rooms.nerve.built) + Number(s.rooms.reliquary.built));
	const molt = useNidus((s) => s.moltLayer);
	const extent = 1 + roomsLit * .55 + molt * .85;
	const touched = (0, import_react.useRef)(0);
	useFrame((state, delta) => {
		const dt = Math.min(delta, .1);
		const cam = state.camera;
		if ("fov" in cam && Math.abs(cam.fov - prefs.camFov) > .04) {
			cam.fov = prefs.camFov;
			cam.updateProjectionMatrix();
		}
		const framed = lastCam.current !== prefs.camGen;
		const slid = Math.abs(lastDist.current - prefs.camDist) > .04;
		if (framed || slid) {
			lastCam.current = prefs.camGen;
			lastDist.current = prefs.camDist;
			const [x, y, z] = camPosition(prefs.camDist);
			cam.position.set(x, y, z);
			touched.current = performance.now();
		}
		if (prefs.camPull && performance.now() - touched.current > 1800) {
			const p = cam.position;
			const dist = p.length();
			const want = prefs.camDist;
			if (Math.abs(dist - want) > .08) {
				const k = 1 - Math.exp(-dt * 1.1);
				p.multiplyScalar(1 + (want / Math.max(.2, dist) - 1) * k);
			}
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrbitControls, {
		enablePan: false,
		enableRotate: true,
		enableZoom: true,
		zoomSpeed: .55 + prefs.camZoom * .7,
		rotateSpeed: .85,
		minDistance: 8,
		maxDistance: 48 + extent * 4,
		minPolarAngle: .28,
		maxPolarAngle: Math.PI / 1.45,
		enableDamping: true,
		dampingFactor: prefs.watchNave ? .12 : .085,
		autoRotate: !prefs.spinPaused,
		autoRotateSpeed: prefs.spinSpeed * (prefs.watchNave ? .42 : 1),
		touches: {
			ONE: TOUCH.ROTATE,
			TWO: TOUCH.DOLLY_PAN
		},
		onStart: () => {
			touched.current = performance.now();
		}
	});
}
function StationScene() {
	const mobile = typeof window !== "undefined" && window.innerWidth < 500;
	const start = camPosition(18);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Canvas, {
		camera: {
			position: start,
			fov: 46,
			near: .8,
			far: 260
		},
		dpr: mobile ? [1, 1.3] : [1, 1.65],
		gl: {
			antialias: !mobile,
			alpha: false,
			powerPreference: "high-performance"
		},
		style: {
			touchAction: "none",
			position: "absolute",
			inset: 0
		},
		onCreated: ({ gl, camera }) => {
			gl.setClearColor("#0e0c12");
			gl.toneMapping = 4;
			gl.toneMappingExposure = 1.28;
			const [x, y, z] = camPosition();
			camera.position.set(x, y, z);
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("fog", {
				attach: "fog",
				args: [
					"#160e16",
					48,
					180
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", { args: [
				"#c4b8a8",
				"#1a0c12",
				.7
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", { intensity: .48 }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
				position: [
					6.5,
					8.5,
					3.2
				],
				intensity: 1.85,
				color: GILT
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
				position: [
					-6,
					3,
					-5
				],
				intensity: .85,
				color: "#9ec8dc"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
				position: [
					0,
					1,
					2.6
				],
				intensity: 8,
				color: BLOOD,
				distance: 12,
				decay: 2
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
				position: [
					10,
					5,
					-16
				],
				intensity: 12,
				color: "#c4a574",
				distance: 60,
				decay: 2
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, {
				radius: 90,
				depth: 48,
				count: mobile ? 90 : 180,
				factor: 2.6,
				saturation: 0,
				fade: true,
				speed: .15
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pulsar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hull, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BattleField, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rig, {})
		]
	});
}
//#endregion
export { StationScene };
