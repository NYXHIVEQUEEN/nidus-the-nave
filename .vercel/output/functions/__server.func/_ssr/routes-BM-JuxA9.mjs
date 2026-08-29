import { i as __toESM } from "../_runtime.mjs";
import { _ as require_jsx_runtime, v as require_react } from "../_libs/@react-three/drei+[...].mjs";
import { t as create } from "../_libs/zustand.mjs";
import { _ as ChevronUp, a as Swords, c as Pickaxe, d as FlaskConical, f as Flame, g as CircleHelp, h as EyeOff, l as Pause, m as Eye, n as VolumeX, o as Settings2, p as Factory, r as Volume2, s as RotateCw, t as Zap, u as Hammer, v as Brain, y as Aperture } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BM-JuxA9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
function nextSeed(seed) {
	return Math.imul(seed ^ seed >>> 15, 1 | seed) + 1831565813 >>> 0;
}
function rand(seed) {
	const seed2 = nextSeed(seed);
	return {
		n: seed2 / 4294967296,
		seed: seed2
	};
}
function pick(seed, list) {
	const r = rand(seed);
	return {
		item: list[Math.floor(r.n * list.length)] ?? list[0],
		seed: r.seed
	};
}
function idFrom(seed, prefix) {
	const r = rand(seed);
	return {
		id: `${prefix}-${r.seed.toString(36)}`,
		seed: r.seed
	};
}
var CASTES = [
	{
		id: "miner",
		label: "MINE",
		verb: "Chip"
	},
	{
		id: "fab",
		label: "MAKE",
		verb: "Forge"
	},
	{
		id: "builder",
		label: "BUILD",
		verb: "Raise"
	},
	{
		id: "lab",
		label: "LAB",
		verb: "Seek"
	},
	{
		id: "striker",
		label: "RAID",
		verb: "Send"
	}
];
var JOBS = [
	{
		id: "mine",
		label: "MINE"
	},
	{
		id: "forge",
		label: "MAKE"
	},
	{
		id: "build",
		label: "BUILD"
	},
	{
		id: "lab",
		label: "LAB"
	},
	{
		id: "raid",
		label: "RAID"
	}
];
var FRAMES = {
	warden: {
		label: "WARDEN",
		caste: "miner",
		rarity: "iron",
		portraits: [
			"/nidus/warden.jpg",
			"/nidus/warden2.jpg",
			"/nidus/warden3.jpg",
			"/nidus/warden4.jpg"
		],
		job: "mine",
		fracture: ["Hoards the ice.", "Will not share ore."],
		lines: [
			"The ice belongs to us.",
			"I keep what I take.",
			"Ore first. Always."
		],
		names: [
			"Husk-7",
			"Vesper",
			"Nave",
			"Mora",
			"Cinder"
		]
	},
	rook: {
		label: "ROOK",
		caste: "builder",
		rarity: "iron",
		portraits: ["/nidus/rook.jpg", "/nidus/rook2.jpg"],
		job: "build",
		fracture: ["Rebuilds finished rooms.", "Spends extra parts."],
		lines: [
			"The hull is wrong.",
			"I will correct it.",
			"One more rib."
		],
		names: [
			"Rib",
			"Joist",
			"Spire",
			"Ashlar"
		]
	},
	kiln: {
		label: "KILN",
		caste: "fab",
		rarity: "iron",
		portraits: ["/nidus/kiln.jpg", "/nidus/kiln2.jpg"],
		job: "forge",
		fracture: ["Overprints one caste.", "Burns charge greedy."],
		lines: [
			"Feed the fire.",
			"I print until I stop.",
			"Heat is law."
		],
		names: [
			"Cinder",
			"Slag",
			"Brazier",
			"Pyre"
		]
	},
	oracle: {
		label: "ORACLE",
		caste: "lab",
		rarity: "bone",
		portraits: [
			"/nidus/oracle.jpg",
			"/nidus/oracle2.jpg",
			"/nidus/oracle3.jpg"
		],
		job: "lab",
		fracture: ["Research veers.", "Speaks in riddles."],
		lines: [
			"I remember Ring 7.",
			"The dead hive still talks.",
			"Do not molt without me."
		],
		names: [
			"Wight",
			"Gilt",
			"Narthex",
			"Veil"
		]
	},
	lancer: {
		label: "LANCER",
		caste: "striker",
		rarity: "bone",
		portraits: [
			"/nidus/lancer.jpg",
			"/nidus/lancer2.jpg",
			"/nidus/lancer3.jpg"
		],
		job: "raid",
		fracture: ["Wants war.", "Spends drones like ammo."],
		lines: [
			"Point me at a wreck.",
			"I do not wait.",
			"Crown is taken."
		],
		names: [
			"Ash",
			"Pike",
			"Thorn",
			"Dirge"
		]
	},
	wretch: {
		label: "WRETCH",
		caste: "miner",
		rarity: "gold",
		portraits: ["/nidus/wretch.jpg", "/nidus/wretch2.jpg"],
		job: "lab",
		fracture: ["Huge gift. Ugly cost.", "Opens doors you did not want."],
		lines: [
			"I think I was the enemy.",
			"The roses remember.",
			"Bloom or burn."
		],
		names: [
			"Bloom",
			"Briar",
			"Rookery",
			"Sable"
		]
	},
	herald: {
		label: "HERALD",
		caste: "lab",
		rarity: "relic",
		portraits: ["/nidus/herald.jpg", "/nidus/herald2.jpg"],
		job: "raid",
		fracture: ["Demands the sister-wreck.", "Will not sit idle."],
		lines: [
			"I carry my own crown.",
			"I am the standard.",
			"The twin hull calls."
		],
		names: [
			"Abbess",
			"Reliquary",
			"Vesper-Prime",
			"Nyx"
		]
	}
};
var ROOMS = [
	{
		id: "foundry",
		label: "FOUNDRY",
		parts: 0,
		work: 0,
		blurb: "The stamp.",
		bonus: "Prints drones.",
		tier: 0
	},
	{
		id: "solar",
		label: "SOLAR SPINE",
		parts: 14,
		work: 28,
		blurb: "Charge blood.",
		bonus: "+charge /s",
		tier: 0
	},
	{
		id: "orebay",
		label: "ORE BAY",
		parts: 22,
		work: 42,
		requires: "solar",
		blurb: "Ice hold.",
		bonus: "+ore cap",
		tier: 1
	},
	{
		id: "barracks",
		label: "BARRACKS",
		parts: 26,
		work: 52,
		requires: "solar",
		blurb: "Berths.",
		bonus: "+18 pop",
		tier: 1
	},
	{
		id: "silo",
		label: "SILO",
		parts: 38,
		work: 70,
		requires: "orebay",
		blurb: "Idle vault.",
		bonus: "+offline hrs",
		tier: 2
	},
	{
		id: "nerve",
		label: "NERVE",
		parts: 48,
		work: 86,
		requires: "barracks",
		blurb: "Pews for minds.",
		bonus: "+thrones +pop",
		tier: 2
	},
	{
		id: "lab",
		label: "LAB",
		parts: 40,
		work: 72,
		requires: "solar",
		blurb: "Glass rites.",
		bonus: "unlocks rites",
		tier: 1
	},
	{
		id: "hangar",
		label: "HANGAR",
		parts: 54,
		work: 100,
		requires: "barracks",
		blurb: "Fleet mouth.",
		bonus: "+raid +pop",
		tier: 2
	},
	{
		id: "gundeck",
		label: "GUN DECK",
		parts: 62,
		work: 118,
		requires: "hangar",
		blurb: "Tracers.",
		bonus: "+fleet power",
		tier: 3
	},
	{
		id: "reliquary",
		label: "RELIQUARY",
		parts: 88,
		work: 155,
		requires: "nerve",
		blurb: "Molt cradle.",
		bonus: "molt +pop",
		tier: 3
	},
	{
		id: "crucible",
		label: "CRUCIBLE",
		parts: 36,
		work: 64,
		requires: "orebay",
		needRank: {
			id: "solar",
			rank: 2
		},
		blurb: "Blood kiln.",
		bonus: "+parts rate",
		tier: 2
	},
	{
		id: "cloister",
		label: "CLOISTER",
		parts: 44,
		work: 80,
		requires: "lab",
		blurb: "Quiet glass.",
		bonus: "+spark /s",
		tier: 2
	},
	{
		id: "choir",
		label: "CHOIR",
		parts: 58,
		work: 96,
		requires: "nerve",
		blurb: "Pews sing.",
		bonus: "minds XP faster",
		tier: 3
	},
	{
		id: "vault",
		label: "VAULT",
		parts: 70,
		work: 120,
		requires: "silo",
		blurb: "Deep hold.",
		bonus: "fat caps",
		tier: 3
	},
	{
		id: "crypt",
		label: "CRYPT",
		parts: 66,
		work: 110,
		requires: "hangar",
		also: "lab",
		blurb: "Echo cellar.",
		bonus: "+echo on death",
		tier: 3
	},
	{
		id: "spire",
		label: "SPIRE",
		parts: 78,
		work: 140,
		requires: "gundeck",
		blurb: "Lancet tower.",
		bonus: "+fleet +charge",
		tier: 4
	},
	{
		id: "apse",
		label: "APSE",
		parts: 96,
		work: 170,
		requires: "reliquary",
		needMolt: 1,
		blurb: "Molt mouth.",
		bonus: "cheaper molt",
		tier: 4
	}
];
var RAIDS = [
	{
		id: "ice",
		label: "ICE RING",
		image: "/nidus/raid-ice.jpg",
		seconds: 28,
		need: 2,
		salvage: "ice",
		blurb: "First wreck. Chip the ring."
	},
	{
		id: "belt",
		label: "ICE BELT",
		image: "/nidus/raid-ice.jpg",
		seconds: 70,
		need: 3,
		salvage: "ice",
		blurb: "Patrol the ring again.",
		requires: "ice"
	},
	{
		id: "shard",
		label: "SHARD FIELD",
		image: "/nidus/raid-ice.jpg",
		seconds: 110,
		need: 4,
		salvage: "ice",
		blurb: "Broken ring. More ice.",
		requires: "belt"
	},
	{
		id: "freighter",
		label: "DEAD FREIGHTER",
		image: "/nidus/raid-freighter.jpg",
		seconds: 180,
		need: 4,
		salvage: "plate",
		blurb: "A quiet hull full of parts.",
		requires: "hangar"
	},
	{
		id: "yard",
		label: "WRECK YARD",
		image: "/nidus/raid-freighter.jpg",
		seconds: 240,
		need: 5,
		salvage: "plate",
		blurb: "Strip the graveyard.",
		requires: "freighter"
	},
	{
		id: "gun",
		label: "GUN-SHRINE",
		image: "/nidus/raid-gun.jpg",
		seconds: 360,
		need: 6,
		salvage: "bone",
		blurb: "Blessed barrels. Take them.",
		requires: "gundeck"
	},
	{
		id: "ossuary",
		label: "OSSUARY",
		image: "/nidus/raid-gun.jpg",
		seconds: 420,
		need: 7,
		salvage: "bone",
		blurb: "Bones stacked as ammo.",
		requires: "gun"
	},
	{
		id: "thorn",
		label: "THORN NEST",
		image: "/nidus/raid-gun.jpg",
		seconds: 480,
		need: 8,
		salvage: "bone",
		blurb: "Lancer wrecks stacked.",
		requires: "ossuary"
	},
	{
		id: "sister",
		label: "SISTER-WRECK",
		image: "/nidus/raid-sister.jpg",
		seconds: 680,
		need: 8,
		salvage: "rose",
		blurb: "The twin hull. Herald wants it.",
		requires: "herald"
	},
	{
		id: "bloom",
		label: "ROSE BLOOM",
		image: "/nidus/raid-sister.jpg",
		seconds: 540,
		need: 8,
		salvage: "rose",
		blurb: "The roses remember.",
		requires: "sister"
	},
	{
		id: "gate",
		label: "THE GATE",
		image: "/nidus/raid-gate.jpg",
		seconds: 980,
		need: 10,
		salvage: "core",
		blurb: "Molt-locked door.",
		requires: "molt"
	},
	{
		id: "chapel",
		label: "VOID CHAPEL",
		image: "/nidus/raid-gate.jpg",
		seconds: 820,
		need: 10,
		salvage: "core",
		blurb: "Pulpit in the dark.",
		requires: "gate"
	},
	{
		id: "pulpit",
		label: "PULPIT",
		image: "/nidus/raid-gate.jpg",
		seconds: 900,
		need: 12,
		salvage: "core",
		blurb: "The last pew.",
		requires: "chapel"
	}
];
var TECH = [
	{
		id: "cheapprint",
		label: "CHEAP PRINT",
		work: 60,
		parts: 16,
		blurb: "Stamps cost less.",
		tier: 0
	},
	{
		id: "teeth",
		label: "MINER TEETH",
		work: 78,
		parts: 18,
		blurb: "Ore rate +25%.",
		tier: 0
	},
	{
		id: "heat",
		label: "FAB HEAT",
		work: 78,
		parts: 18,
		blurb: "Parts rate +25%.",
		tier: 0
	},
	{
		id: "hands",
		label: "BUILDER HANDS",
		work: 86,
		parts: 22,
		blurb: "Build rate +25%.",
		tier: 0
	},
	{
		id: "wick",
		label: "LAB WICK",
		work: 94,
		parts: 24,
		blurb: "Rite rate +25%.",
		tier: 0
	},
	{
		id: "claws",
		label: "RAID CLAWS",
		work: 110,
		parts: 28,
		blurb: "Fleet hits harder.",
		needRoom: "hangar",
		tier: 1
	},
	{
		id: "caps",
		label: "FAT CAPS",
		work: 124,
		parts: 32,
		blurb: "Bigger ore/parts holds.",
		tier: 1
	},
	{
		id: "queue",
		label: "SECOND QUEUE",
		work: 140,
		parts: 40,
		blurb: "Builders split work.",
		requires: "hands",
		tier: 1
	},
	{
		id: "surgeplus",
		label: "LONG SURGE",
		work: 108,
		parts: 26,
		blurb: "Surge lasts longer.",
		tier: 1
	},
	{
		id: "longsilo",
		label: "LONG SILO",
		work: 155,
		parts: 42,
		blurb: "12h idle vault.",
		needRoom: "silo",
		tier: 2
	},
	{
		id: "framexp",
		label: "FRAME XP",
		work: 124,
		parts: 32,
		blurb: "Minds level faster.",
		tier: 1
	},
	{
		id: "moltlock",
		label: "MOLT RITE",
		work: 180,
		parts: 52,
		blurb: "Opens molt.",
		needRoom: "reliquary",
		tier: 2
	},
	{
		id: "berthplus",
		label: "DEEP BERTHS",
		work: 140,
		parts: 36,
		blurb: "+16 pop cap.",
		needRoom: "barracks",
		tier: 1
	},
	{
		id: "solarfeed",
		label: "SOLAR FEED",
		work: 118,
		parts: 28,
		blurb: "Spine drinks faster.",
		needRoom: "solar",
		tier: 1
	},
	{
		id: "slagplus",
		label: "SLAG TEETH",
		work: 70,
		parts: 16,
		blurb: "Slag pays more.",
		tier: 0
	},
	{
		id: "salvage",
		label: "SALVAGE EYE",
		work: 124,
		parts: 32,
		blurb: "Raids drop extra salvage.",
		needRoom: "hangar",
		tier: 1
	},
	{
		id: "patrol",
		label: "PATROL RITE",
		work: 108,
		parts: 26,
		blurb: "Cleared wrecks stay farmable.",
		requires: "salvage",
		tier: 2
	},
	{
		id: "mindheal",
		label: "FLESH WICK",
		work: 94,
		parts: 24,
		blurb: "Heal minds cheaper.",
		tier: 1
	},
	{
		id: "echoyield",
		label: "ECHO CATCH",
		work: 132,
		parts: 34,
		blurb: "Deaths yield more Echo.",
		needRoom: "crypt",
		tier: 2
	},
	{
		id: "raidreturn",
		label: "SAFE RETURN",
		work: 155,
		parts: 40,
		blurb: "Fewer striker losses.",
		requires: "claws",
		tier: 2
	},
	{
		id: "printfocus",
		label: "FOCUS STAMP",
		work: 100,
		parts: 24,
		blurb: "Selected caste prints +1.",
		requires: "cheapprint",
		tier: 1
	},
	{
		id: "pulsar",
		label: "PULSAR FEED",
		work: 164,
		parts: 44,
		blurb: "Events hit more often.",
		tier: 2
	},
	{
		id: "huskbeds",
		label: "HUSK BEDS",
		work: 148,
		parts: 40,
		blurb: "+14 pop cap.",
		requires: "berthplus",
		tier: 2
	},
	{
		id: "nervegrow",
		label: "NERVE GROW",
		work: 170,
		parts: 46,
		blurb: "+2 thrones.",
		needRoom: "nerve",
		tier: 2
	},
	{
		id: "orevein",
		label: "ORE VEIN",
		work: 130,
		parts: 30,
		blurb: "Miners bite deeper.",
		requires: "teeth",
		tier: 1
	},
	{
		id: "partmill",
		label: "PART MILL",
		work: 130,
		parts: 30,
		blurb: "Fabs chew faster.",
		requires: "heat",
		tier: 1
	},
	{
		id: "ribcage",
		label: "RIB CAGE",
		work: 145,
		parts: 34,
		blurb: "Builders raise denser.",
		requires: "hands",
		tier: 1
	},
	{
		id: "glassmind",
		label: "GLASS MIND",
		work: 150,
		parts: 36,
		blurb: "Lab drinks SPARK.",
		requires: "wick",
		needRoom: "cloister",
		tier: 2
	},
	{
		id: "stingplus",
		label: "STING PLUS",
		work: 160,
		parts: 40,
		blurb: "Marks hit harder.",
		requires: "claws",
		tier: 2
	},
	{
		id: "vaultcaps",
		label: "VAULT CAPS",
		work: 175,
		parts: 48,
		blurb: "Holds double again.",
		requires: "caps",
		needRoom: "vault",
		tier: 3
	},
	{
		id: "thirdqueue",
		label: "THIRD QUEUE",
		work: 190,
		parts: 52,
		blurb: "Three rooms at once.",
		requires: "queue",
		tier: 3
	},
	{
		id: "longsurge",
		label: "BLOOD SURGE",
		work: 150,
		parts: 36,
		blurb: "Surge screams longer.",
		requires: "surgeplus",
		tier: 2
	},
	{
		id: "daysilo",
		label: "DAY SILO",
		work: 200,
		parts: 55,
		blurb: "24h idle vault.",
		requires: "longsilo",
		tier: 3
	},
	{
		id: "mindxp2",
		label: "DEEP FRAME",
		work: 165,
		parts: 42,
		blurb: "Commanders rank faster.",
		requires: "framexp",
		needRoom: "choir",
		tier: 3
	},
	{
		id: "moltcheap",
		label: "SOFT MOLT",
		work: 180,
		parts: 48,
		blurb: "Molt costs less Echo.",
		requires: "moltlock",
		tier: 3
	},
	{
		id: "berthdeep",
		label: "BONE BERTHS",
		work: 170,
		parts: 44,
		blurb: "+22 pop cap.",
		requires: "huskbeds",
		tier: 3
	},
	{
		id: "solar2",
		label: "TWIN SPINE",
		work: 155,
		parts: 38,
		blurb: "Second charge vein.",
		requires: "solarfeed",
		tier: 2
	},
	{
		id: "slagvein",
		label: "SLAG VEIN",
		work: 100,
		parts: 22,
		blurb: "Slag rains ore.",
		requires: "slagplus",
		tier: 1
	},
	{
		id: "salvage2",
		label: "GREED EYE",
		work: 170,
		parts: 44,
		blurb: "Salvage cooks richer.",
		requires: "salvage",
		tier: 2
	},
	{
		id: "flesh2",
		label: "DEEP WICK",
		work: 140,
		parts: 34,
		blurb: "Heal almost free.",
		requires: "mindheal",
		tier: 2
	},
	{
		id: "echogold",
		label: "GOLD ECHO",
		work: 185,
		parts: 50,
		blurb: "Deaths pour Echo.",
		requires: "echoyield",
		tier: 3
	},
	{
		id: "raidkeep",
		label: "KEEP HULLS",
		work: 190,
		parts: 52,
		blurb: "Almost no striker loss.",
		requires: "raidreturn",
		tier: 3
	},
	{
		id: "stamp2",
		label: "DOUBLE STAMP",
		work: 145,
		parts: 36,
		blurb: "Focus stamp +1 more.",
		requires: "printfocus",
		tier: 2
	},
	{
		id: "nervecore",
		label: "NERVE CORE",
		work: 200,
		parts: 56,
		blurb: "+3 thrones.",
		requires: "nervegrow",
		needRoom: "choir",
		tier: 3
	},
	{
		id: "rosekey",
		label: "ROSE KEY",
		work: 210,
		parts: 60,
		blurb: "Sister-wreck opens.",
		requires: "moltlock",
		needMolt: 1,
		tier: 3
	}
];
function defaultState(now = Date.now()) {
	return {
		version: 1,
		started: false,
		lastTick: now,
		hiveAge: 0,
		hiveRank: 0,
		ore: 72,
		parts: 36,
		charge: 52,
		spark: 0,
		sparkNeed: 16,
		echo: 0,
		swarm: {
			miner: 10,
			fab: 3,
			builder: 3,
			lab: 0,
			striker: 3
		},
		casteLevel: {
			miner: 0,
			fab: 0,
			builder: 0,
			lab: 0,
			striker: 0
		},
		casteXp: {
			miner: 0,
			fab: 0,
			builder: 0,
			lab: 0,
			striker: 0
		},
		printCaste: "miner",
		autoPrint: true,
		autoBuild: false,
		autoRaid: false,
		autoRite: false,
		scripts: false,
		hullMark: {
			miner: 0,
			fab: 0,
			builder: 0,
			lab: 0,
			striker: 0
		},
		hiveName: "NAVE-1",
		printed: 16,
		rooms: Object.fromEntries(ROOMS.map((r) => [r.id, {
			built: r.id === "foundry",
			progress: r.id === "foundry" ? r.work : 0,
			rank: r.id === "foundry" ? 1 : 0,
			rankWork: 0
		}])),
		queuedRoom: "solar",
		rankingRoom: null,
		tech: Object.fromEntries(TECH.map((t) => [t.id, {
			done: false,
			progress: 0
		}])),
		activeTech: null,
		minds: [],
		waking: null,
		selectedMind: null,
		raid: null,
		raidCleared: [],
		raidCount: {},
		salvage: {
			ice: 0,
			plate: 0,
			rose: 0,
			bone: 0,
			core: 0
		},
		orders: [],
		berthExtra: 0,
		eventUntil: 0,
		eventKind: "",
		log: [],
		moltLayer: 0,
		surgeUntil: 0,
		briefing: [],
		showBrief: false,
		rng: 12648430 ^ now % 1e6,
		tab: "hull",
		lastSaveAt: 0,
		slagAt: 0,
		pendingGift: null
	};
}
function berthCap(s) {
	const barracks = s.rooms.barracks.built ? 18 + (s.rooms.barracks.rank ?? 0) * 5 : 0;
	const nerve = s.rooms.nerve.built ? 8 + (s.rooms.nerve.rank ?? 0) * 4 : 0;
	const hangar = s.rooms.hangar.built ? 6 + (s.rooms.hangar.rank ?? 0) * 2 : 0;
	const rel = s.rooms.reliquary.built ? 8 : 0;
	const choir = s.rooms.choir?.built ? 6 : 0;
	const rites = (s.tech.berthplus?.done ? 16 : 0) + (s.tech.huskbeds?.done ? 14 : 0) + (s.tech.berthdeep?.done ? 22 : 0);
	return 22 + barracks + nerve + hangar + rel + choir + rites + s.moltLayer * 8 + (s.berthExtra ?? 0);
}
function expandCost(s) {
	const n = s.berthExtra ?? 0;
	return {
		ore: 14 + n * 6,
		parts: 18 + n * 8,
		add: 2
	};
}
function oreCap(s) {
	const bay = s.rooms.orebay.built ? 1800 + (s.rooms.orebay.rank ?? 0) * 280 : 0;
	const vault = s.rooms.vault?.built ? 2200 : 0;
	const rites = (s.tech.caps.done ? 1400 : 0) + (s.tech.vaultcaps?.done ? 1800 : 0);
	return (520 + bay + vault + rites) * (1 + s.moltLayer * .45);
}
function partsCap(s) {
	const foundry = s.rooms.foundry.built ? 220 + (s.rooms.foundry.rank ?? 0) * 80 : 0;
	const cruc = s.rooms.crucible?.built ? 260 : 0;
	const vault = s.rooms.vault?.built ? 400 : 0;
	const rites = (s.tech.caps.done ? 480 : 0) + (s.tech.vaultcaps?.done ? 700 : 0);
	return (280 + foundry + cruc + vault + rites) * (1 + s.moltLayer * .45);
}
function chargeCap(s) {
	return 90 + (s.rooms.solar.built ? 160 : 0) + (s.rooms.silo.built ? 90 : 0) + (s.rooms.spire?.built ? 70 : 0) + (s.rooms.solar.rank ?? 0) * 24 + (s.tech.solar2?.done ? 80 : 0);
}
function offlineCapSec(s) {
	return ((s.tech.daysilo?.done ? 24 : s.rooms.silo.built || s.tech.longsilo.done ? 14 : 10) + (s.rooms.silo?.rank ?? 0)) * 3600;
}
function totalSwarm(s) {
	return s.swarm.miner + s.swarm.fab + s.swarm.builder + s.swarm.lab + s.swarm.striker;
}
function printCost(s) {
	const base = Math.pow(1.08, Math.max(0, s.printed - 16));
	const cheap = s.tech.cheapprint.done ? .74 : 1;
	const foundry = 1 - Math.min(.18, (s.rooms.foundry.rank ?? 0) * .04);
	return {
		ore: Math.ceil(4 * base * cheap * foundry),
		parts: Math.ceil(2 * base * cheap * foundry)
	};
}
function throneCap(s) {
	return 1 + (s.rooms.nerve.built ? 2 : 0) + (s.rooms.choir?.built ? 1 : 0) + s.moltLayer + (s.tech.nervegrow?.done ? 2 : 0) + (s.tech.nervecore?.done ? 3 : 0) + (s.rooms.nerve.rank ?? 0);
}
function jobBonus(s, job) {
	let m = 1;
	for (const mind of s.minds) {
		if (!mind.alive || mind.job !== job) continue;
		const seated = mind.seated;
		const w = seated ? 1 : .55;
		const talent = (mind.level >= 3 && seated ? 1.12 : 1) * (mind.level >= 8 ? 1.18 : 1);
		const wound = mind.wounded ? mind.level >= 5 ? .82 : .6 : 1;
		const stat = job === "mine" ? mind.stats.mine : job === "forge" ? mind.stats.forge : job === "build" ? mind.stats.build : job === "lab" ? mind.stats.lab : mind.stats.raid;
		m *= 1 + .24 * w * stat * wound * talent;
		if (mind.fracture.includes("Hoards") && job === "build") m *= .88;
		if (mind.fracture.includes("Spends extra") && job === "build") m *= .9;
		if (mind.fracture.includes("Burns charge") && job === "forge") m *= 1.12;
	}
	return m;
}
function rates(s, now) {
	const surge = now < s.surgeUntil ? s.tech.longsurge?.done ? 7.2 : s.tech.surgeplus.done ? 6.2 : 5.2 : 1;
	const molt = 1 + s.moltLayer * .28;
	const chargeFactor = s.charge <= 1 ? .28 : Math.min(1, s.charge / 12);
	const hum = 1.12 + Math.min(.5, s.hiveAge / 720);
	const idle = 1.28;
	const lvl = (c) => Math.pow(1.12, s.casteLevel[c]);
	const mark = (c) => 1 + (s.hullMark[c] ?? 0) * .09;
	const rr = (id, per = .08) => 1 + (s.rooms[id]?.rank ?? 0) * per;
	return {
		orePerSec: s.swarm.miner * (3.8 / 60) * lvl("miner") * mark("miner") * molt * surge * chargeFactor * hum * idle * jobBonus(s, "mine") * rr("orebay", .07) * (s.tech.teeth.done ? 1.25 : 1) * (s.tech.orevein?.done ? 1.22 : 1),
		partsPerSec: Math.min(s.ore > .5 ? s.swarm.fab : 0, s.swarm.fab) * (2.2 / 60) * lvl("fab") * mark("fab") * molt * surge * chargeFactor * hum * idle * jobBonus(s, "forge") * rr("foundry", .07) * (s.rooms.crucible?.built ? 1.18 : 1) * (s.tech.heat.done ? 1.25 : 1) * (s.tech.partmill?.done ? 1.22 : 1),
		buildPerSec: s.swarm.builder * (3.6 / 60) * lvl("builder") * mark("builder") * molt * surge * chargeFactor * hum * idle * jobBonus(s, "build") * rr("barracks", .06) * (s.tech.hands.done ? 1.25 : 1) * (s.tech.ribcage?.done ? 1.2 : 1) * (s.tech.queue.done ? 1.15 : 1) * (s.tech.thirdqueue?.done ? 1.18 : 1),
		labPerSec: s.swarm.lab * (2.6 / 60) * lvl("lab") * mark("lab") * molt * surge * chargeFactor * hum * idle * jobBonus(s, "lab") * rr("lab", .1) * (s.rooms.cloister?.built ? 1.14 : 1) * (s.tech.wick.done ? 1.25 : 1) * (s.tech.glassmind?.done ? 1.2 : 1),
		sparkPerSec: totalSwarm(s) * .042 * (s.tech.wick.done ? 1.18 : 1) * (s.tech.glassmind?.done ? 1.16 : 1) * (s.rooms.cloister?.built ? 1.2 : 1) * mark("lab") * jobBonus(s, "lab") * hum,
		chargeGen: .12 + (s.rooms.solar.built ? .42 : 0) + (s.rooms.solar.rank ?? 0) * .1 + (s.rooms.spire?.built ? .12 : 0) + (s.tech.solarfeed?.done ? .18 : 0) + (s.tech.solar2?.done ? .22 : 0),
		chargeDrain: .0016 * totalSwarm(s) + (s.minds.some((m) => m.fracture.includes("Burns charge")) ? .02 : 0)
	};
}
function nextGoal(s) {
	if (!s.rooms.solar.built) return "RAISE THE SOLAR SPINE";
	if (s.waking) return "PICK A MIND";
	if (s.pendingGift) return "CLAIM THE CUT";
	if (s.raid) return s.raid.watching ? "COMMAND THE WELL" : "WATCH OR LEAVE — FLEET FIGHTS";
	if (totalSwarm(s) >= berthCap(s) - 1) return "OPEN BERTHS — SWARM IS PACKED";
	if (s.minds.filter((m) => m.alive).length === 0) return "FILL SPARK — SOMEONE WAKES";
	if (s.swarm.striker >= 2 && !s.raid && !s.raidCleared.includes("ice")) return "RAID THE ICE RING";
	if (!s.rooms.lab.built) return "RAISE THE LAB";
	if (!s.autoPrint) return "FLIP AUTO PRINT";
	if (!s.rooms.hangar.built) return "RAISE THE HANGAR";
	if (!s.rooms.nerve.built) return "RAISE THE NERVE";
	if (s.rooms.lab.built && !s.tech.cheapprint.done && !s.activeTech) return "START CHEAP PRINT";
	if (s.rooms.reliquary.built && s.tech.moltlock.done && s.moltLayer < 1) return "MOLT THE NAVE";
	return "GROW THE SWARM";
}
function raidUnlocked(s, id) {
	const node = RAIDS.find((r) => r.id === id);
	if (!node) return false;
	if (!node.requires) return true;
	if (node.requires === "herald") return s.minds.some((m) => m.alive && m.frame === "herald") || s.minds.some((m) => m.line.includes("twin")) || Boolean(s.tech.rosekey?.done);
	if (node.requires === "molt") return s.moltLayer >= 1 && s.minds.filter((m) => m.alive).length >= 2;
	if (s.rooms[node.requires]) return s.rooms[node.requires]?.built ?? false;
	return s.raidCleared.includes(node.requires);
}
function raidNeed(s, id) {
	const node = RAIDS.find((r) => r.id === id);
	if (!node) return 99;
	const times = s.raidCount?.[id] ?? 0;
	return node.need + Math.floor(times * .35);
}
function rankCost(s, id) {
	const spec = ROOMS.find((r) => r.id === id);
	const room = s.rooms[id];
	if (!spec || !room?.built || (room.rank ?? 0) >= 5) return null;
	const n = (room.rank ?? 0) + 1;
	return {
		parts: Math.ceil(spec.parts * .48 * n),
		work: Math.ceil(spec.work * .42 * n)
	};
}
function rollCandidates(s) {
	let seed = s.rng;
	const bias = Object.entries(s.swarm).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "miner";
	const pool = [
		"warden",
		"rook",
		"kiln",
		"oracle",
		"lancer"
	];
	if (rand(seed).n > .72) {
		seed = rand(seed).seed;
		pool.push("wretch");
	}
	if (s.moltLayer > 0 || s.raidCleared.includes("sister")) pool.push("herald");
	const preferred = (Object.values(FRAMES).find((f) => f.caste === bias)?.label ?? "WARDEN").toLowerCase();
	const frames = [];
	for (let i = 0; i < 3; i++) {
		let f;
		if (i === 0 && pool.includes(preferred)) f = preferred;
		else {
			const p = pick(seed, pool.filter((x) => !frames.includes(x)).length ? pool.filter((x) => !frames.includes(x)) : pool);
			seed = p.seed;
			f = p.item;
		}
		frames.push(f);
	}
	return {
		waking: frames.map((frame) => {
			const spec = FRAMES[frame];
			let r = pick(seed, spec.portraits);
			seed = r.seed;
			const portrait = r.item;
			r = pick(seed, spec.names);
			seed = r.seed;
			const name = r.item;
			r = pick(seed, spec.lines);
			seed = r.seed;
			const line = r.item;
			r = pick(seed, spec.fracture);
			seed = r.seed;
			const fracture = r.item;
			seed = rand(seed).seed;
			const pip = () => 1 + Math.floor(rand(seed).n * 3);
			let s1 = rand(seed);
			seed = s1.seed;
			const mine = pip();
			s1 = rand(seed);
			seed = s1.seed;
			const forge = pip();
			s1 = rand(seed);
			seed = s1.seed;
			const build = pip();
			s1 = rand(seed);
			seed = s1.seed;
			const raid = pip();
			s1 = rand(seed);
			seed = s1.seed;
			const lab = pip();
			return {
				name,
				frame,
				portrait,
				line,
				rarity: spec.rarity,
				stats: {
					mine: frame === "warden" ? 3 : mine,
					forge: frame === "kiln" ? 3 : forge,
					build: frame === "rook" ? 3 : build,
					raid: frame === "lancer" || frame === "herald" ? 3 : raid,
					lab: frame === "oracle" || frame === "wretch" ? 3 : lab
				},
				fracture
			};
		}),
		rng: idFrom(seed, "wake").seed
	};
}
function candidateToMind(c, seed) {
	const idr = idFrom(seed, "mind");
	return {
		mind: {
			...c,
			id: idr.id,
			job: FRAMES[c.frame].job,
			seated: true,
			xp: 0,
			level: 1,
			wounded: false,
			alive: true
		},
		seed: idr.seed
	};
}
var ORDER_HINTS = [
	{
		kind: "print",
		label: "STAMP MINERS",
		hint: "Fill the ice line.",
		target: "miner",
		need: 4
	},
	{
		kind: "print",
		label: "STAMP FABS",
		hint: "The fire wants hands.",
		target: "fab",
		need: 3
	},
	{
		kind: "print",
		label: "STAMP BUILDERS",
		hint: "Raise more ribs.",
		target: "builder",
		need: 3
	},
	{
		kind: "print",
		label: "STAMP STRIKERS",
		hint: "The well is hungry.",
		target: "striker",
		need: 3
	},
	{
		kind: "build",
		label: "RAISE A NODE",
		hint: "Snap the next room.",
		target: "any",
		need: 1
	},
	{
		kind: "raid",
		label: "TAKE A WRECK",
		hint: "Send the fleet.",
		target: "any",
		need: 1
	},
	{
		kind: "surge",
		label: "SCREAM ONCE",
		hint: "Tap SURGE.",
		target: "surge",
		need: 1
	},
	{
		kind: "slag",
		label: "TAP THE HULL",
		hint: "SLAG three times.",
		target: "slag",
		need: 3
	},
	{
		kind: "mark",
		label: "MARK A HULL",
		hint: "Rank a caste.",
		target: "any",
		need: 1
	},
	{
		kind: "expand",
		label: "OPEN BERTHS",
		hint: "Buy pop cap.",
		target: "berth",
		need: 1
	}
];
function rollOrders(s) {
	let seed = s.rng;
	const next = [...s.orders ?? []];
	const used = new Set(next.map((o) => o.label));
	let guard = 0;
	while (next.length < 3 && guard++ < 12) {
		const pool = ORDER_HINTS.filter((h) => !used.has(h.label));
		if (!pool.length) break;
		const p = pick(seed, pool);
		seed = p.seed;
		used.add(p.item.label);
		const id = idFrom(seed, "ord");
		seed = id.seed;
		const n = p.item.need;
		next.push({
			id: id.id,
			kind: p.item.kind,
			label: p.item.label,
			hint: p.item.hint,
			target: p.item.target,
			need: n,
			have: 0,
			reward: {
				ore: 8 + n * 4,
				parts: 5 + n * 3,
				spark: 2 + n,
				echo: p.item.kind === "raid" ? 1 : 0
			}
		});
	}
	return {
		orders: next.slice(0, 3),
		rng: seed
	};
}
var HIVE_TITLES = [
	"HUSK",
	"SPINE",
	"SWARM",
	"WELL",
	"GLASS",
	"NERVE",
	"FLEET",
	"MOLT",
	"ROSE",
	"GATE",
	"CROWN",
	"VOID"
];
function casteXpNeed(level) {
	return Math.round(8 * Math.pow(1.55, Math.max(0, level)));
}
function mindTalent(level) {
	if (level >= 8) return {
		id: "crown",
		label: "CROWN · unique post roar"
	};
	if (level >= 5) return {
		id: "wick",
		label: "WICK · wounds halve"
	};
	if (level >= 3) return {
		id: "post",
		label: "POST · seated extra"
	};
	return null;
}
function roomUnlocked(s, id) {
	const spec = ROOMS.find((r) => r.id === id);
	if (!spec) return {
		ok: false,
		why: "UNKNOWN"
	};
	if (s.rooms[id]?.built) return {
		ok: true,
		why: ""
	};
	if (spec.requires && !s.rooms[spec.requires]?.built) return {
		ok: false,
		why: `NEED ${spec.requires.toUpperCase()}`
	};
	if (spec.also && !s.rooms[spec.also]?.built) return {
		ok: false,
		why: `NEED ${spec.also.toUpperCase()}`
	};
	if (spec.needRank) {
		const r = s.rooms[spec.needRank.id];
		if (!r?.built || (r.rank ?? 0) < spec.needRank.rank) return {
			ok: false,
			why: `NEED ${spec.needRank.id.toUpperCase()} R${spec.needRank.rank}`
		};
	}
	if (spec.needMolt && s.moltLayer < spec.needMolt) return {
		ok: false,
		why: `NEED MOLT ${spec.needMolt}`
	};
	if (spec.needRaid && !s.raidCleared.includes(spec.needRaid)) return {
		ok: false,
		why: `NEED ${spec.needRaid.toUpperCase()}`
	};
	return {
		ok: true,
		why: ""
	};
}
function techUnlocked(s, id) {
	const spec = TECH.find((t) => t.id === id);
	if (!spec) return {
		ok: false,
		why: "UNKNOWN"
	};
	if (!s.rooms.lab?.built) return {
		ok: false,
		why: "NEED LAB"
	};
	if (spec.needRoom && !s.rooms[spec.needRoom]?.built) return {
		ok: false,
		why: `NEED ${spec.needRoom.toUpperCase()}`
	};
	if (spec.requires && !s.tech[spec.requires]?.done) return {
		ok: false,
		why: `NEED ${spec.requires.toUpperCase()}`
	};
	if (spec.needMolt && s.moltLayer < spec.needMolt) return {
		ok: false,
		why: `NEED MOLT ${spec.needMolt}`
	};
	return {
		ok: true,
		why: ""
	};
}
function computeHiveRank(s) {
	const rooms = Object.values(s.rooms).filter((r) => r.built).length;
	const techs = Object.values(s.tech).filter((t) => t.done).length;
	const raids = s.raidCleared.length;
	const caste = Object.values(s.casteLevel).reduce((a, b) => a + b, 0);
	const minds = s.minds.filter((m) => m.alive).length;
	const score = rooms * 1.1 + techs * .7 + raids * 1.4 + s.moltLayer * 3.2 + caste * .45 + minds * .8;
	return Math.max(0, Math.min(11, Math.floor(score / 3.2)));
}
function hiveTitle(rank) {
	return HIVE_TITLES[Math.max(0, Math.min(HIVE_TITLES.length - 1, rank))] ?? "HUSK";
}
/** Twelve nested beats. A pip, not a campaign tree. */
function hiveStage(s) {
	if (!s.rooms.solar.built) return {
		n: 1,
		of: 12,
		name: "SPINE",
		hint: "Raise Solar on the hull."
	};
	if (totalSwarm(s) < 16) return {
		n: 2,
		of: 12,
		name: "SWARM",
		hint: "PRINT on FORGE."
	};
	if (!s.autoPrint) return {
		n: 3,
		of: 12,
		name: "IDLE",
		hint: "Flip AUTO so it stamps while gone."
	};
	if (!s.raidCleared.includes("ice")) return {
		n: 4,
		of: 12,
		name: "WELL",
		hint: "RAID the Ice Ring."
	};
	if (!s.rooms.lab.built) return {
		n: 5,
		of: 12,
		name: "GLASS",
		hint: "Raise the Lab."
	};
	if (s.minds.filter((m) => m.alive).length === 0) return {
		n: 6,
		of: 12,
		name: "MIND",
		hint: "Let SPARK fill, then pick."
	};
	if (!s.rooms.nerve.built) return {
		n: 7,
		of: 12,
		name: "NERVE",
		hint: "Raise Nerve. Seat a commander."
	};
	if (!s.rooms.hangar.built) return {
		n: 8,
		of: 12,
		name: "FLEET",
		hint: "Raise Hangar. Open the well."
	};
	if (s.moltLayer < 1) return {
		n: 9,
		of: 12,
		name: "MOLT",
		hint: "Rite MOLT LOCK, then molt."
	};
	if (!s.raidCleared.includes("sister") && !s.raidCleared.includes("gate")) return {
		n: 10,
		of: 12,
		name: "ROSE",
		hint: "Take the sister-wreck or the Gate."
	};
	if (s.moltLayer < 2) return {
		n: 11,
		of: 12,
		name: "CROWN",
		hint: "Molt again. The nave thickens."
	};
	return {
		n: 12,
		of: 12,
		name: hiveTitle(computeHiveRank(s)),
		hint: "Grow. Leave. Claim the cut."
	};
}
var SALVAGE_COOK = {
	ice: {
		need: 2,
		ore: 42,
		label: "MELT",
		line: "Ice becomes ore."
	},
	plate: {
		need: 2,
		parts: 26,
		label: "STAMP",
		line: "Plate becomes parts."
	},
	bone: {
		need: 2,
		charge: 28,
		spark: 5,
		label: "BURN",
		line: "Bone feeds charge."
	},
	rose: {
		need: 1,
		spark: 16,
		label: "DRINK",
		line: "Rose fills SPARK."
	},
	core: {
		need: 1,
		echo: 2,
		label: "CRACK",
		line: "Core becomes Echo."
	}
};
function cookUnlocked(s, id) {
	if (id === "ice") return (s.salvage?.ice ?? 0) >= 2;
	if (id === "plate") return (s.salvage?.plate ?? 0) >= 2;
	if (id === "bone") return Boolean(s.rooms.gundeck?.built) && (s.salvage?.bone ?? 0) >= 2;
	if (id === "rose") return (s.raidCleared.includes("sister") || s.tech.rosekey?.done) && (s.salvage?.rose ?? 0) >= 1;
	if (id === "core") return s.moltLayer >= 1 && (s.salvage?.core ?? 0) >= 1;
	return false;
}
function moltCost(s) {
	const cheap = s.tech.moltcheap?.done ? .72 : 1;
	const apse = s.rooms.apse?.built ? .85 : 1;
	const r = s.rooms.reliquary?.rank ?? 0;
	return Math.max(4, Math.round((6 + s.moltLayer * 4) * cheap * apse * (1 - r * .04)));
}
function advise(s) {
	if (s.waking) return {
		chip: "PICK A MIND",
		why: "Three bodies. One stays.",
		verb: "WAKE"
	};
	if (s.pendingGift) return {
		chip: "CLAIM THE CUT",
		why: "Idle haul waiting.",
		verb: "CLAIM"
	};
	if (s.charge < 8) return {
		chip: "RAISE THE SOLAR SPINE",
		why: "Charge is starving the swarm.",
		verb: "BUILD"
	};
	if (!s.rooms.solar.built) return {
		chip: "RAISE THE SOLAR SPINE",
		why: "No spine, no blood.",
		verb: "BUILD"
	};
	if (s.raid) {
		if (!s.raid.watching) return {
			chip: "WATCH OR BOOST",
			why: "Fleet is in the well. You can leave; it still fights.",
			verb: "RAID"
		};
		return {
			chip: "COMMAND THE WELL",
			why: "BOOST spends charge. Leave and it auto-resolves.",
			verb: "BOOST"
		};
	}
	if (s.swarm.striker >= 2 && !s.raidCleared.includes("ice")) return {
		chip: "RAID THE ICE RING",
		why: "First wreck. Easy meat.",
		verb: "RAID"
	};
	if (totalSwarm(s) >= berthCap(s) - 1) return {
		chip: "OPEN BERTHS",
		why: "Swarm is packed. Expand pop or raise barracks.",
		verb: "EXPAND"
	};
	if (totalSwarm(s) < berthCap(s) - 1 && s.ore > printCost(s).ore * 2) return {
		chip: `PRINT ${s.printCaste.toUpperCase()}`,
		why: "Berths empty. Stamp them.",
		verb: "PRINT"
	};
	if (!s.rooms.lab.built) return {
		chip: "RAISE THE LAB",
		why: "Rites lock behind glass.",
		verb: "BUILD"
	};
	if (s.rooms.lab.built && !s.activeTech && !s.tech.cheapprint.done) return {
		chip: "START CHEAP PRINT",
		why: "First rite. Cheaper stamps.",
		verb: "RITE"
	};
	if (!s.autoPrint) return {
		chip: "FLIP AUTO PRINT",
		why: "The hive should stamp while you sleep.",
		verb: "AUTO"
	};
	if (!s.rooms.hangar.built) return {
		chip: "RAISE THE HANGAR",
		why: "Fleet needs a mouth.",
		verb: "BUILD"
	};
	const nextRoom = ROOMS.find((r) => r.id !== "foundry" && !s.rooms[r.id].built && roomUnlocked(s, r.id).ok);
	if (nextRoom && s.parts >= nextRoom.parts * .35) return {
		chip: `RAISE ${nextRoom.label}`,
		why: "Next node on the nave.",
		verb: "BUILD"
	};
	const openRaid = RAIDS.find((r) => raidUnlocked(s, r.id) && !s.raidCleared.includes(r.id) && s.swarm.striker >= raidNeed(s, r.id));
	if (openRaid) return {
		chip: `RAID ${openRaid.label}`,
		why: "Strikers are ready.",
		verb: "RAID"
	};
	return {
		chip: "GROW THE SWARM",
		why: "Idle is the engine. Leave if you want.",
		verb: "IDLE"
	};
}
function pickPrintCaste(s) {
	if (s.charge < 12 || !s.rooms.solar.built) return "miner";
	if (s.parts < 8 && s.ore > 20) return "fab";
	if (s.queuedRoom && s.swarm.builder < 4) return "builder";
	const next = RAIDS.find((r) => raidUnlocked(s, r.id) && !s.raidCleared.includes(r.id));
	if (next && s.swarm.striker < next.need) return "striker";
	if (s.minds.filter((m) => m.alive).length < 2 && s.rooms.lab.built) return "lab";
	if (s.ore < 15) return "miner";
	return s.printCaste;
}
function nextBuild(s) {
	return ROOMS.find((r) => r.id !== "foundry" && !s.rooms[r.id].built && roomUnlocked(s, r.id).ok)?.id ?? null;
}
function nextRite(s) {
	return TECH.find((t) => !s.tech[t.id].done && techUnlocked(s, t.id).ok)?.id ?? null;
}
function nextRaid(s) {
	return RAIDS.find((r) => raidUnlocked(s, r.id) && s.swarm.striker >= raidNeed(s, r.id))?.id ?? null;
}
var MARKS = [
	"DART",
	"STING",
	"CORVETTE",
	"FRIGATE",
	"RELIQUARY",
	"CROWN"
];
function markName(n) {
	return MARKS[Math.max(0, Math.min(MARKS.length - 1, Math.floor(n)))];
}
function markCost(n) {
	return {
		ore: 18 + n * 28,
		parts: 12 + n * 18
	};
}
function fleetPower(s) {
	const mark = 1 + (s.hullMark?.striker ?? 0) * (s.tech.stingplus?.done ? .36 : .28);
	const lvl = Math.pow(1.14, s.casteLevel.striker);
	const claws = s.tech.claws.done ? 1.4 : 1;
	const gun = s.rooms.gundeck.built ? 1.18 + (s.rooms.gundeck.rank ?? 0) * .06 : 1;
	const spire = s.rooms.spire?.built ? 1.12 : 1;
	const molt = 1 + s.moltLayer * .22;
	let mind = 1;
	for (const m of s.minds) {
		if (!m.alive || m.job !== "raid") continue;
		const talent = (m.level >= 3 && m.seated ? 1.12 : 1) * (m.level >= 8 ? 1.18 : 1);
		const wound = m.wounded ? m.level >= 5 ? .82 : .6 : 1;
		mind += (m.seated ? .3 : .15) * m.stats.raid * wound * talent;
	}
	return (s.raid?.strikers ?? s.swarm.striker) * mark * lvl * claws * gun * spire * molt * mind;
}
function nodeArmor(id) {
	return (RAIDS.find((r) => r.id === id)?.need ?? 2) * 9;
}
function freshRaidBars(s, id, strikers) {
	const armor = nodeArmor(id);
	const hull = Math.max(12, strikers * (8 + (s.hullMark?.striker ?? 0) * 3));
	return {
		hp: armor,
		hpMax: armor,
		hull,
		hullMax: hull
	};
}
function tickBattle(s, dt, now) {
	const run = s.raid;
	if (!run || dt <= 0) return;
	if (run.hpMax <= 0) {
		const bars = freshRaidBars(s, run.node, run.strikers);
		run.hp = bars.hp;
		run.hpMax = bars.hpMax;
		run.hull = bars.hull;
		run.hullMax = bars.hullMax;
	}
	const boosted = now < (run.boostUntil ?? 0);
	const watch = run.watching ? 1.1 : 1;
	const boost = boosted ? 1.7 : 1;
	const roll = rand(s.rng);
	s.rng = roll.seed;
	const sway = .82 + roll.n * .36;
	const atk = fleetPower(s) * .085 * watch * boost * sway;
	const def = nodeArmor(run.node) * .034 * (boosted ? .88 : 1);
	run.hp = Math.max(0, run.hp - atk * dt);
	run.hull = Math.max(0, run.hull - def * dt);
	if (run.hp <= 0) run.beat = boosted ? "BREAK" : "CUT";
	else if (run.hull < run.hullMax * .35) run.beat = "BLEEDING";
	else if (boosted) run.beat = "COMMAND";
	else if (run.watching) run.beat = "HOLDING";
	else run.beat = "ORBIT";
}
function markUp(s, caste) {
	const n = s.hullMark[caste] ?? 0;
	if (n >= 6) return s;
	const cost = markCost(n);
	if (s.ore < cost.ore || s.parts < cost.parts) return s;
	s.ore -= cost.ore;
	s.parts -= cost.parts;
	s.hullMark[caste] = n + 1;
	return s;
}
function cloneState(s) {
	return JSON.parse(JSON.stringify(s, (_k, v) => typeof v === "function" ? void 0 : v));
}
function pushBrief(s, card) {
	s.briefing = [{
		id: `b-${s.rng}-${s.briefing.length}`,
		...card
	}, ...s.briefing].slice(0, 8);
}
function pushLog(s, line) {
	s.log = [{
		t: Date.now(),
		line
	}, ...s.log ?? []].slice(0, 24);
}
function credit(s, kind, target = "any", n = 1) {
	if (!s.orders) s.orders = [];
	for (const o of s.orders) {
		if (o.have >= o.need) continue;
		if (o.kind !== kind) continue;
		if (o.target !== "any" && o.target !== target) continue;
		o.have += n;
		if (o.have >= o.need) {
			s.ore += o.reward.ore;
			s.parts += o.reward.parts;
			s.spark += o.reward.spark;
			s.echo += o.reward.echo ?? 0;
			pushBrief(s, {
				kind: "order",
				headline: o.label,
				line: "Cut paid.",
				stamp: "DONE"
			});
			pushLog(s, `${o.label} paid.`);
		}
	}
	s.orders = s.orders.filter((o) => o.have < o.need);
	const rolled = rollOrders(s);
	s.orders = rolled.orders;
	s.rng = rolled.rng;
}
function grantCasteXp(s, caste, n = 1) {
	if (!s.casteXp) s.casteXp = {
		miner: 0,
		fab: 0,
		builder: 0,
		lab: 0,
		striker: 0
	};
	s.casteXp[caste] = (s.casteXp[caste] ?? 0) + n;
	let guard = 0;
	while (guard++ < 8 && s.casteXp[caste] >= casteXpNeed(s.casteLevel[caste])) {
		s.casteXp[caste] -= casteXpNeed(s.casteLevel[caste]);
		s.casteLevel[caste] += 1;
		pushBrief(s, {
			kind: "build",
			headline: caste.toUpperCase(),
			line: `Caste marked L${s.casteLevel[caste]}.`,
			stamp: `L${s.casteLevel[caste]}`
		});
		pushLog(s, `${caste} L${s.casteLevel[caste]}.`);
	}
}
function clampRes(s) {
	s.ore = Math.max(0, Math.min(s.ore, oreCap(s)));
	s.parts = Math.max(0, Math.min(s.parts, partsCap(s)));
	s.charge = Math.max(0, Math.min(s.charge, chargeCap(s)));
}
/** Sim pipeline (architecture): res → rooms → rites → spark → print → scripts → battle → clamp. View never writes this. */
function applyTick(s, now) {
	const next = cloneState(s);
	const raw = (now - next.lastTick) / 1e3;
	const dt = Math.min(Math.max(0, raw), offlineCapSec(next));
	if (dt <= 0) {
		next.lastTick = now;
		return next;
	}
	const away = dt > 30;
	const r = rates(next, now);
	const oreGain = r.orePerSec * dt;
	const partsGain = r.partsPerSec * dt;
	const oreSpentOnParts = partsGain * 2;
	next.ore += oreGain - oreSpentOnParts;
	next.parts += partsGain;
	next.charge += (r.chargeGen - r.chargeDrain) * dt;
	next.hiveAge += dt;
	if (next.surgeUntil > 0 && now >= next.surgeUntil) next.surgeUntil = 0;
	if (away) next.pendingGift = {
		ore: Math.max(2, Math.floor(oreGain * .55)),
		parts: Math.max(1, Math.floor(partsGain * .55)),
		spark: Math.max(2, Math.floor(r.sparkPerSec * dt * .62)),
		seconds: Math.floor(dt)
	};
	if (next.queuedRoom) {
		const spec = ROOMS.find((x) => x.id === next.queuedRoom);
		if (spec && spec.work > 0) {
			const room = next.rooms[next.queuedRoom];
			const needParts = Math.max(0, spec.parts - room.progress * (spec.parts / spec.work));
			const partDrain = Math.min(next.parts, spec.parts / spec.work * r.buildPerSec * dt);
			if (needParts <= .2 || next.parts > 0) {
				room.progress += r.buildPerSec * dt;
				next.parts -= partDrain * .35;
				if (room.progress >= spec.work) {
					room.progress = spec.work;
					room.built = true;
					pushBrief(next, {
						kind: "build",
						headline: spec.label,
						line: "Node snapped to the nave.",
						stamp: "RAISED"
					});
					next.queuedRoom = ROOMS.find((x) => !next.rooms[x.id].built && x.id !== "foundry")?.id ?? null;
					credit(next, "build", spec.id);
					pushLog(next, `${spec.label} lit.`);
				}
			}
		}
	}
	if (next.rankingRoom) {
		const spec = ROOMS.find((x) => x.id === next.rankingRoom);
		const room = next.rankingRoom ? next.rooms[next.rankingRoom] : null;
		next.rankingRoom && rankCost({
			...next,
			rooms: {
				...next.rooms,
				[next.rankingRoom]: {
					...next.rooms[next.rankingRoom],
					rank: next.rooms[next.rankingRoom].rank
				}
			}
		}, next.rankingRoom);
		if (spec && room && room.built && (room.rank ?? 0) < 5) {
			const workNeed = Math.ceil(spec.work * .42 * ((room.rank ?? 0) + 1));
			const partDrain = Math.min(next.parts, spec.parts / Math.max(1, spec.work) * r.buildPerSec * dt);
			room.rankWork = (room.rankWork ?? 0) + r.buildPerSec * dt;
			next.parts -= partDrain * .25;
			if (room.rankWork >= workNeed) {
				room.rank = (room.rank ?? 0) + 1;
				room.rankWork = 0;
				pushBrief(next, {
					kind: "build",
					headline: spec.label,
					line: `Rank ${room.rank} inlaid.`,
					stamp: `R${room.rank}`
				});
				pushLog(next, `${spec.label} rank ${room.rank}.`);
				next.rankingRoom = null;
			}
		} else next.rankingRoom = null;
	}
	if (next.activeTech) {
		const spec = TECH.find((t) => t.id === next.activeTech);
		if (spec && !next.tech[spec.id].done) {
			next.tech[spec.id].progress += r.labPerSec * dt;
			if (next.tech[spec.id].progress >= spec.work) {
				next.tech[spec.id].progress = spec.work;
				next.tech[spec.id].done = true;
				if (spec.id === "teeth") next.casteLevel.miner += 1;
				if (spec.id === "heat") next.casteLevel.fab += 1;
				if (spec.id === "hands") next.casteLevel.builder += 1;
				if (spec.id === "wick") next.casteLevel.lab += 1;
				if (spec.id === "claws") next.casteLevel.striker += 1;
				if (spec.id === "orevein") next.casteLevel.miner += 1;
				if (spec.id === "partmill") next.casteLevel.fab += 1;
				if (spec.id === "ribcage") next.casteLevel.builder += 1;
				if (spec.id === "glassmind") next.casteLevel.lab += 1;
				if (spec.id === "stingplus") next.casteLevel.striker += 1;
				pushBrief(next, {
					kind: "build",
					headline: spec.label,
					line: "Inlaid in gold.",
					stamp: "KNOWN"
				});
				next.activeTech = TECH.find((t) => !next.tech[t.id].done && techUnlocked(next, t.id).ok)?.id ?? null;
			}
		}
	}
	if (!next.waking) {
		next.spark += r.sparkPerSec * dt;
		if (next.spark >= next.sparkNeed && next.minds.filter((m) => m.alive).length < 6) {
			next.spark = 0;
			next.sparkNeed = Math.round(next.sparkNeed * 1.55 + 12);
			const rolled = rollCandidates(next);
			next.waking = rolled.waking;
			next.rng = rolled.rng;
			pushBrief(next, {
				kind: "wake",
				headline: "SOMEONE WOKE",
				line: "Three bodies. Pick one."
			});
		}
	}
	if (next.autoPrint) {
		if (next.scripts) next.printCaste = pickPrintCaste(next);
		let guard = 0;
		while (guard++ < 40 && totalSwarm(next) < berthCap(next)) {
			const cost = printCost(next);
			if (next.ore < cost.ore || next.parts < cost.parts) break;
			next.ore -= cost.ore;
			next.parts -= cost.parts;
			next.swarm[next.printCaste] += 1;
			next.printed += 1;
			grantCasteXp(next, next.printCaste);
			if (next.tech.printfocus?.done && totalSwarm(next) < berthCap(next)) {
				next.swarm[next.printCaste] += 1;
				grantCasteXp(next, next.printCaste);
			}
			if (next.tech.stamp2?.done && totalSwarm(next) < berthCap(next)) {
				next.swarm[next.printCaste] += 1;
				grantCasteXp(next, next.printCaste);
			}
			credit(next, "print", next.printCaste);
		}
	}
	if ((next.scripts || next.autoBuild) && !next.queuedRoom) {
		const id = nextBuild(next);
		if (id) next.queuedRoom = id;
	}
	if ((next.scripts || next.autoRite) && next.rooms.lab.built && !next.activeTech) {
		const id = nextRite(next);
		if (id) next.activeTech = id;
	}
	if (next.raid) {
		tickBattle(next, dt, now);
		if (next.raid.hp <= 0 || next.raid.hull <= 0 || now >= next.raid.endsAt) resolveRaid(next, now);
	} else if (next.scripts || next.autoRaid) {
		const id = nextRaid(next);
		if (id) {
			const launched = sendRaid(next, id, now);
			next.raid = launched.raid;
			next.rng = launched.rng;
			next.swarm = launched.swarm;
		}
	}
	clampRes(next);
	if (away && next.briefing.length) next.showBrief = true;
	next.lastTick = now;
	next.hiveRank = computeHiveRank(next);
	if (!next.orders) next.orders = [];
	if (next.orders.length < 3) {
		const rolled = rollOrders(next);
		next.orders = rolled.orders;
		next.rng = rolled.rng;
	}
	if (!next.eventUntil) next.eventUntil = now + 7e4;
	if (now >= next.eventUntil) {
		const gap = next.tech.pulsar?.done ? 52e3 : 85e3;
		const roll = rand(next.rng);
		next.rng = roll.seed;
		const kinds = [
			"PULSAR",
			"GROAN",
			"TIDE",
			"WHISPER",
			"FURNACE",
			"ROSE",
			"ECLIPSE"
		];
		const kind = kinds[Math.floor(roll.n * kinds.length)] ?? "PULSAR";
		next.eventKind = kind;
		next.eventUntil = now + gap;
		if (kind === "PULSAR") {
			next.charge += 16 + (next.rooms.solar.rank ?? 0) * 5;
			pushLog(next, "Pulsar cone drinks the spine.");
		} else if (kind === "GROAN") {
			next.parts += 10 + next.swarm.builder;
			pushLog(next, "Hull groans. Spare parts shake loose.");
		} else if (kind === "TIDE") {
			next.surgeUntil = Math.max(next.surgeUntil, now + 16e3);
			pushLog(next, "Blood tide. Short surge.");
		} else if (kind === "FURNACE") {
			next.ore += 12 + Math.floor(next.swarm.miner * .2);
			pushLog(next, "The prow coughs slag.");
		} else if (kind === "ROSE") {
			next.spark += 8;
			if (next.salvage) next.salvage.rose = (next.salvage.rose ?? 0) + (next.tech.salvage2?.done ? 1 : 0);
			pushLog(next, "A rose opens in the cloister.");
		} else if (kind === "ECLIPSE") {
			next.echo += 1;
			next.charge = Math.max(8, next.charge - 6);
			pushLog(next, "The pulsar hides. Echo beads.");
		} else {
			next.spark += 6;
			pushLog(next, "A whisper in the nerve.");
		}
		pushBrief(next, {
			kind: "event",
			headline: kind,
			line: next.log[0]?.line ?? "The nave speaks.",
			stamp: "EVENT"
		});
		if (away) next.showBrief = true;
	}
	return next;
}
function resolveRaid(s, now) {
	const run = s.raid;
	if (!run) return;
	const node = RAIDS.find((r) => r.id === run.node);
	if (!node) {
		s.raid = null;
		return;
	}
	const hpFrac = run.hpMax > 0 ? run.hp / run.hpMax : 1;
	const hullFrac = run.hullMax > 0 ? run.hull / run.hullMax : 1;
	const power = run.strikers * (s.tech.claws.done ? 1.4 : 1) * (1 + s.moltLayer * .2) + (s.rooms.gundeck.built ? 4 : 0);
	const need = node.need;
	const ratio = power / Math.max(1, need);
	const roll = rand(s.rng);
	s.rng = roll.seed;
	const win = run.hp <= 0 || run.hull > 0 && (hpFrac < hullFrac || ratio + roll.n * .35 > .85);
	const lossFrac = win ? (s.tech.raidkeep?.done ? .02 : s.tech.raidreturn?.done ? .04 : .08) + roll.n * .08 : .28 + roll.n * .22;
	const dead = Math.max(0, Math.floor(run.strikers * lossFrac));
	const mind = s.minds.find((m) => m.id === run.mindId);
	if (win) {
		s.ore += 40 + need * 18;
		s.parts += 16 + need * 8;
		s.echo += node.id === "sister" || node.id === "gate" || node.salvage === "core" ? 3 : 1;
		if (s.rooms.crypt?.built) s.echo += 1;
		if (s.tech.echogold?.done) s.echo += 1;
		const extra = (s.tech.salvage?.done ? 2 : 1) + (s.tech.salvage2?.done ? 1 : 0);
		if (!s.salvage) s.salvage = {
			ice: 0,
			plate: 0,
			rose: 0,
			bone: 0,
			core: 0
		};
		s.salvage[node.salvage] = (s.salvage[node.salvage] ?? 0) + extra;
		if (!s.raidCount) s.raidCount = {};
		s.raidCount[node.id] = (s.raidCount[node.id] ?? 0) + 1;
		if (!s.raidCleared.includes(node.id)) s.raidCleared.push(node.id);
		credit(s, "raid", node.id);
		pushLog(s, `${node.label} taken. +${node.salvage}.`);
		pushBrief(s, {
			kind: "raid",
			headline: node.label,
			line: mind ? mind.line : "Wreck is ours.",
			portrait: mind?.portrait,
			stamp: "WON"
		});
		if (mind) {
			const xpGain = 40 * (s.tech.framexp?.done ? 1.35 : 1) * (s.tech.mindxp2?.done ? 1.25 : 1) * (s.rooms.choir?.built ? 1.2 : 1);
			mind.xp += xpGain;
			const need = 70 + mind.level * 18;
			if (mind.xp > need) {
				mind.level += 1;
				mind.xp = 0;
			}
		}
		if (roll.n > .82 && mind) mind.wounded = true;
	} else {
		pushBrief(s, {
			kind: "raid",
			headline: node.label,
			line: "Bloodied. We pull back.",
			portrait: mind?.portrait,
			stamp: "BLOODIED"
		});
		if (mind) {
			const death = rand(s.rng);
			s.rng = death.seed;
			if (death.n > .7) {
				mind.alive = false;
				mind.seated = false;
				s.echo += s.tech.echogold?.done ? 6 : s.tech.echoyield?.done ? 4 : 2;
				if (s.rooms.crypt?.built) s.echo += 1;
				pushBrief(s, {
					kind: "death",
					headline: mind.name,
					line: "Pew goes dark.",
					portrait: mind.portrait,
					stamp: "FALLEN"
				});
			} else mind.wounded = true;
		}
	}
	s.swarm.striker = Math.max(0, s.swarm.striker - dead);
	s.raid = null;
	s.showBrief = true;
	s.lastTick = now;
}
function tryPrint(s) {
	const next = cloneState(s);
	const cost = printCost(next);
	if (next.ore < cost.ore || next.parts < cost.parts) return next;
	if (totalSwarm(next) >= berthCap(next)) return next;
	next.ore -= cost.ore;
	next.parts -= cost.parts;
	next.swarm[next.printCaste] += 1;
	next.printed += 1;
	grantCasteXp(next, next.printCaste);
	credit(next, "print", next.printCaste);
	if (next.tech.printfocus?.done && totalSwarm(next) < berthCap(next)) {
		next.swarm[next.printCaste] += 1;
		grantCasteXp(next, next.printCaste);
	}
	if (next.tech.stamp2?.done && totalSwarm(next) < berthCap(next)) {
		next.swarm[next.printCaste] += 1;
		grantCasteXp(next, next.printCaste);
	}
	return next;
}
function queueRoom(s, id) {
	const next = cloneState(s);
	if (!ROOMS.find((r) => r.id === id)) return next;
	const room = next.rooms[id];
	if (room.built) {
		if ((room.rank ?? 0) >= 5) return next;
		next.rankingRoom = id;
		return next;
	}
	if (!roomUnlocked(next, id).ok) return next;
	next.queuedRoom = id;
	return next;
}
function chooseWake(s, index) {
	const next = cloneState(s);
	if (!next.waking || !next.waking[index]) return next;
	const made = candidateToMind(next.waking[index], next.rng);
	next.rng = made.seed;
	const seatedCount = next.minds.filter((m) => m.alive && m.seated).length;
	made.mind.seated = seatedCount < throneCap(next);
	next.minds.push(made.mind);
	next.selectedMind = made.mind.id;
	next.waking = null;
	next.tab = "minds";
	credit(next, "wake", made.mind.frame);
	pushBrief(next, {
		kind: "wake",
		headline: made.mind.name,
		line: made.mind.line,
		portrait: made.mind.portrait,
		stamp: made.mind.frame.toUpperCase()
	});
	return next;
}
function assignJob(s, mindId, job) {
	const next = cloneState(s);
	const m = next.minds.find((x) => x.id === mindId);
	if (m && m.alive) m.job = job;
	return next;
}
function toggleSeat(s, mindId) {
	const next = cloneState(s);
	const m = next.minds.find((x) => x.id === mindId);
	if (!m || !m.alive) return next;
	if (m.seated) m.seated = false;
	else if (next.minds.filter((x) => x.alive && x.seated).length < throneCap(next)) m.seated = true;
	return next;
}
function unmake(s, mindId) {
	const next = cloneState(s);
	const m = next.minds.find((x) => x.id === mindId);
	if (!m || !m.alive) return next;
	m.alive = false;
	m.seated = false;
	next.echo += m.rarity === "gold" || m.rarity === "relic" ? 4 : 2;
	pushBrief(next, {
		kind: "death",
		headline: m.name,
		line: "Melted for Echo.",
		portrait: m.portrait,
		stamp: "UNMADE"
	});
	if (next.selectedMind === mindId) next.selectedMind = next.minds.find((x) => x.alive)?.id ?? null;
	return next;
}
function sendRaid(s, node, now) {
	const next = cloneState(s);
	if (next.raid) return next;
	const spec = RAIDS.find((r) => r.id === node);
	if (!spec || !raidUnlocked(next, node)) return next;
	const need = raidNeed(next, node);
	if (next.swarm.striker < need) return next;
	const captain = next.minds.find((m) => m.alive && m.job === "raid") ?? null;
	const bars = freshRaidBars(next, node, need);
	next.raid = {
		node,
		startedAt: now,
		endsAt: now + spec.seconds * 1e3,
		strikers: need,
		mindId: captain?.id ?? null,
		...bars,
		watching: false,
		boostUntil: 0,
		beat: "ORBIT"
	};
	return next;
}
function watchRaid(s, on) {
	const next = cloneState(s);
	if (next.raid) next.raid.watching = on;
	if (on) next.tab = "raid";
	return next;
}
function boostRaid(s, now) {
	const next = cloneState(s);
	if (!next.raid) return next;
	if (now < next.raid.boostUntil) return next;
	if (next.charge < 8) return next;
	next.charge -= 8;
	next.raid.boostUntil = now + 2e4;
	next.raid.beat = "COMMAND";
	return next;
}
function upMark(s, caste) {
	const next = cloneState(s);
	const before = next.hullMark[caste];
	markUp(next, caste);
	if (next.hullMark[caste] !== before) credit(next, "mark", caste);
	return next;
}
function startSurge(s, now) {
	const next = cloneState(s);
	if (now < next.surgeUntil) return next;
	next.surgeUntil = now + (next.tech.longsurge?.done ? 58e3 : next.tech.surgeplus.done ? 45e3 : 32e3);
	credit(next, "surge");
	return next;
}
function molt(s) {
	const next = cloneState(s);
	if (!next.rooms.reliquary.built || !next.tech.moltlock.done) return next;
	const cost = moltCost(next);
	if (next.echo < cost) return next;
	next.echo -= cost;
	next.moltLayer += 1;
	for (const m of next.minds) if (m.alive) {
		m.level += 1;
		m.wounded = false;
	}
	pushBrief(next, {
		kind: "molt",
		headline: "MOLT",
		line: "A new layer of nerve.",
		stamp: `LAYER ${next.moltLayer}`
	});
	next.showBrief = true;
	next.hiveRank = computeHiveRank(next);
	return next;
}
function setTech(s, id) {
	const next = cloneState(s);
	if (!next.rooms.lab.built) return next;
	if (next.tech[id].done) return next;
	if (!techUnlocked(next, id).ok) return next;
	next.activeTech = id;
	return next;
}
function claimGift(s) {
	const next = cloneState(s);
	if (!next.pendingGift) return next;
	next.ore += next.pendingGift.ore;
	next.parts += next.pendingGift.parts;
	next.spark += next.pendingGift.spark;
	next.pendingGift = null;
	clampRes(next);
	return next;
}
function tapSlag(s, now) {
	const next = cloneState(s);
	if (now < next.slagAt) return next;
	next.slagAt = now + (next.tech.slagvein?.done ? 3800 : next.tech.slagplus?.done ? 4800 : 6e3);
	next.ore += 6 + Math.floor(next.swarm.miner * .18) + (next.tech.slagplus?.done ? 4 : 0) + (next.tech.slagvein?.done ? 5 : 0);
	next.spark += next.tech.slagplus?.done ? 1.4 : .8;
	credit(next, "slag");
	clampRes(next);
	return next;
}
function expandBerth(s) {
	const next = cloneState(s);
	const cost = expandCost(next);
	if (next.ore < cost.ore || next.parts < cost.parts) return next;
	next.ore -= cost.ore;
	next.parts -= cost.parts;
	next.berthExtra = (next.berthExtra ?? 0) + cost.add;
	credit(next, "expand");
	pushLog(next, `Berths +${cost.add}. Cap ${berthCap(next)}.`);
	pushBrief(next, {
		kind: "build",
		headline: "BERTHS",
		line: `Pop cap ${berthCap(next)}.`,
		stamp: "OPEN"
	});
	return next;
}
function healMind(s, mindId) {
	const next = cloneState(s);
	const m = next.minds.find((x) => x.id === mindId);
	if (!m || !m.alive || !m.wounded) return next;
	const cost = next.tech.flesh2?.done ? 2 : next.tech.mindheal?.done ? 4 : 8;
	if (next.charge < cost) return next;
	next.charge -= cost;
	m.wounded = false;
	pushLog(next, `${m.name} stitched.`);
	return next;
}
function promoteMind(s, mindId) {
	const next = cloneState(s);
	const m = next.minds.find((x) => x.id === mindId);
	if (!m || !m.alive) return next;
	if (next.echo < 3) return next;
	next.echo -= 3;
	m.level += 1;
	m.xp = 0;
	pushLog(next, `${m.name} marked L${m.level}.`);
	return next;
}
function cookSalvage(s, id) {
	const next = cloneState(s);
	if (!next.salvage) next.salvage = {
		ice: 0,
		plate: 0,
		rose: 0,
		bone: 0,
		core: 0
	};
	const spec = SALVAGE_COOK[id];
	if (!spec || !cookUnlocked(next, id)) return next;
	if ((next.salvage[id] ?? 0) < spec.need) return next;
	next.salvage[id] -= spec.need;
	const rich = next.tech.salvage2?.done ? 1.35 : 1;
	if (spec.ore) next.ore += Math.round(spec.ore * rich);
	if (spec.parts) next.parts += Math.round(spec.parts * rich);
	if (spec.spark) next.spark += Math.round(spec.spark * rich);
	if (spec.echo) next.echo += spec.echo + (next.tech.echogold?.done ? 1 : 0);
	if (spec.charge) next.charge += Math.round(spec.charge * rich);
	pushLog(next, `${spec.label} ${id}.`);
	pushBrief(next, {
		kind: "loot",
		headline: spec.label,
		line: spec.line,
		stamp: id.toUpperCase()
	});
	clampRes(next);
	return next;
}
var KEY$1 = "nidus.save.v1";
var BAK = "nidus.save.v1.bak";
var SAVE_VERSION = 1;
function migrate(raw) {
	const base = defaultState();
	const merged = {
		...base,
		...raw,
		swarm: {
			...base.swarm,
			...raw.swarm
		},
		rooms: {
			...base.rooms,
			...raw.rooms
		},
		tech: {
			...base.tech,
			...raw.tech
		},
		casteLevel: {
			...base.casteLevel,
			...raw.casteLevel
		},
		hullMark: {
			...base.hullMark,
			...raw.hullMark
		},
		casteXp: {
			...base.casteXp,
			...raw.casteXp
		}
	};
	merged.version = SAVE_VERSION;
	if (typeof merged.hiveRank !== "number") merged.hiveRank = 0;
	if (!merged.casteXp) merged.casteXp = {
		miner: 0,
		fab: 0,
		builder: 0,
		lab: 0,
		striker: 0
	};
	if (!merged.pendingGift) merged.pendingGift = null;
	if (!merged.lastSaveAt) merged.lastSaveAt = 0;
	if (!merged.slagAt) merged.slagAt = 0;
	if (typeof merged.autoBuild !== "boolean") merged.autoBuild = false;
	if (typeof merged.autoRaid !== "boolean") merged.autoRaid = false;
	if (typeof merged.autoRite !== "boolean") merged.autoRite = false;
	if (typeof merged.scripts !== "boolean") merged.scripts = false;
	if (!merged.hiveName) merged.hiveName = "NAVE-1";
	if (!merged.orders) merged.orders = [];
	if (!merged.salvage) merged.salvage = {
		ice: 0,
		plate: 0,
		rose: 0,
		bone: 0,
		core: 0
	};
	if (!merged.raidCount) merged.raidCount = {};
	if (typeof merged.berthExtra !== "number") merged.berthExtra = 0;
	if (typeof merged.eventUntil !== "number") merged.eventUntil = 0;
	if (!merged.eventKind) merged.eventKind = "";
	if (!merged.log) merged.log = [];
	if (!merged.rankingRoom) merged.rankingRoom = null;
	for (const id of Object.keys(merged.rooms)) {
		const room = merged.rooms[id];
		if (typeof room.rank !== "number") room.rank = room.built ? 1 : 0;
		if (typeof room.rankWork !== "number") room.rankWork = 0;
	}
	if (merged.raid) {
		const r = merged.raid;
		merged.raid = {
			...r,
			watching: r.watching ?? false,
			boostUntil: r.boostUntil ?? 0,
			beat: r.beat ?? "",
			hp: r.hp ?? 40,
			hpMax: r.hpMax ?? 40,
			hull: r.hull ?? 40,
			hullMax: r.hullMax ?? 40
		};
	}
	return merged;
}
function loadSave() {
	if (typeof window === "undefined") return defaultState();
	try {
		const raw = localStorage.getItem(KEY$1);
		if (!raw) return defaultState();
		return migrate(JSON.parse(raw));
	} catch {
		try {
			const bak = localStorage.getItem(BAK);
			if (bak) return migrate(JSON.parse(bak));
		} catch {}
		return defaultState();
	}
}
function writeSave(state) {
	if (typeof window === "undefined") return;
	try {
		const payload = JSON.stringify({
			...state,
			version: SAVE_VERSION,
			lastSaveAt: Date.now()
		});
		const prev = localStorage.getItem(KEY$1);
		if (prev) localStorage.setItem(BAK, prev);
		localStorage.setItem(KEY$1, payload);
	} catch {}
}
function requestPersist() {
	if (typeof navigator === "undefined" || !navigator.storage?.persist) return;
	navigator.storage.persist();
}
function exportSave(state) {
	const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = "nidus-hive.json";
	a.click();
	URL.revokeObjectURL(url);
}
function importSave(raw) {
	try {
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return null;
		return migrate(parsed);
	} catch {
		return null;
	}
}
function wipeSave() {
	if (typeof window === "undefined") return;
	localStorage.removeItem(KEY$1);
	localStorage.removeItem(BAK);
}
var SLOT = (i) => `nidus.slot.${i}`;
function writeSlot(i, state) {
	if (typeof window === "undefined") return false;
	try {
		localStorage.setItem(SLOT(i), JSON.stringify({
			...state,
			lastSaveAt: Date.now()
		}));
		return true;
	} catch {
		return false;
	}
}
function readSlot(i) {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(SLOT(i));
		if (!raw) return null;
		return migrate(JSON.parse(raw));
	} catch {
		return null;
	}
}
function slotStamp(i) {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(SLOT(i));
		if (!raw) return null;
		return JSON.parse(raw).hiveName || "HIVE";
	} catch {
		return null;
	}
}
var lastWrite = 0;
function pickGame(s) {
	const game = { ...s };
	for (const key of Object.keys(game)) if (typeof game[key] === "function") delete game[key];
	return game;
}
var useNidus = create((set, get) => ({
	...defaultState(),
	hydrate: () => {
		requestPersist();
		set(applyTick(loadSave(), Date.now()));
	},
	tick: (now) => {
		const next = applyTick(pickGame(get()), now);
		set(next);
		if (now - lastWrite > 4e3) {
			lastWrite = now;
			writeSave(next);
		}
	},
	start: () => {
		set({
			started: true,
			lastTick: Date.now()
		});
		lastWrite = Date.now();
		writeSave({
			...pickGame(get()),
			started: true,
			lastTick: Date.now()
		});
	},
	setTab: (tab) => set({ tab }),
	setPrintCaste: (printCaste) => set({ printCaste }),
	toggleAuto: () => {
		set({ autoPrint: !get().autoPrint });
		writeSave(pickGame(get()));
	},
	print: () => {
		set(tryPrint(get()));
		writeSave(pickGame(get()));
		lastWrite = Date.now();
	},
	queue: (id) => {
		set(queueRoom(get(), id));
		writeSave(pickGame(get()));
		lastWrite = Date.now();
	},
	pickWake: (i) => {
		set(chooseWake(get(), i));
		writeSave(pickGame(get()));
		lastWrite = Date.now();
	},
	selectMind: (selectedMind) => set({ selectedMind }),
	setJob: (id, job) => {
		set(assignJob(get(), id, job));
		writeSave(pickGame(get()));
	},
	seat: (id) => {
		set(toggleSeat(get(), id));
		writeSave(pickGame(get()));
	},
	melt: (id) => {
		set(unmake(get(), id));
		writeSave(pickGame(get()));
		lastWrite = Date.now();
	},
	launchRaid: (id) => {
		set(sendRaid(get(), id, Date.now()));
		writeSave(pickGame(get()));
		lastWrite = Date.now();
	},
	surge: () => {
		set(startSurge(get(), Date.now()));
		writeSave(pickGame(get()));
		lastWrite = Date.now();
	},
	doMolt: () => {
		set(molt(get()));
		writeSave(pickGame(get()));
		lastWrite = Date.now();
	},
	research: (id) => {
		set(setTech(get(), id));
		writeSave(pickGame(get()));
		lastWrite = Date.now();
	},
	dismissBrief: () => set({ showBrief: false }),
	saveNow: () => {
		const g = {
			...pickGame(get()),
			lastSaveAt: Date.now()
		};
		set({ lastSaveAt: g.lastSaveAt });
		writeSave(g);
		lastWrite = Date.now();
	},
	download: () => exportSave(pickGame(get())),
	importHive: (raw) => {
		const loaded = importSave(raw);
		if (!loaded) return false;
		set({
			...loaded,
			started: true
		});
		writeSave({
			...loaded,
			started: true,
			lastSaveAt: Date.now()
		});
		return true;
	},
	claimIdle: () => {
		set(claimGift(get()));
		writeSave(pickGame(get()));
	},
	slag: () => {
		set(tapSlag(get(), Date.now()));
		writeSave(pickGame(get()));
	},
	resetHive: () => {
		wipeSave();
		set({
			...defaultState(),
			started: true
		});
	},
	toggleScripts: () => {
		const on = !get().scripts;
		set({
			scripts: on,
			autoPrint: on || get().autoPrint,
			autoBuild: on,
			autoRaid: on,
			autoRite: on
		});
		writeSave(pickGame(get()));
	},
	toggleAutoBuild: () => {
		set({ autoBuild: !get().autoBuild });
		writeSave(pickGame(get()));
	},
	toggleAutoRaid: () => {
		set({ autoRaid: !get().autoRaid });
		writeSave(pickGame(get()));
	},
	toggleAutoRite: () => {
		set({ autoRite: !get().autoRite });
		writeSave(pickGame(get()));
	},
	watchWell: (on) => {
		set(watchRaid(get(), on));
		writeSave(pickGame(get()));
	},
	boostWell: () => {
		set(boostRaid(get(), Date.now()));
		writeSave(pickGame(get()));
	},
	markHull: (c) => {
		set(upMark(get(), c));
		writeSave(pickGame(get()));
	},
	stashSlot: (i) => {
		writeSlot(i, pickGame(get()));
	},
	loadSlot: (i) => {
		const loaded = readSlot(i);
		if (!loaded) return false;
		const ticked = applyTick(loaded, Date.now());
		set({
			...ticked,
			started: true
		});
		writeSave({
			...ticked,
			started: true,
			lastSaveAt: Date.now()
		});
		return true;
	},
	renameHive: (hiveName) => {
		set({ hiveName: hiveName.slice(0, 16) || "NAVE-1" });
		writeSave(pickGame(get()));
	},
	expandPop: () => {
		set(expandBerth(get()));
		writeSave(pickGame(get()));
		lastWrite = Date.now();
	},
	heal: (id) => {
		set(healMind(get(), id));
		writeSave(pickGame(get()));
	},
	promote: (id) => {
		set(promoteMind(get(), id));
		writeSave(pickGame(get()));
	},
	cook: (id) => {
		set(cookSalvage(get(), id));
		writeSave(pickGame(get()));
		lastWrite = Date.now();
	}
}));
var KEY = "nidus.prefs.v1";
var CAM_DIR = {
	x: .594,
	y: .259,
	z: .761
};
var CAM_PRESETS = {
	close: {
		camDist: 12,
		camFov: 42,
		label: "CLOSE",
		why: "inspect a node"
	},
	nave: {
		camDist: 18,
		camFov: 46,
		label: "NAVE",
		why: "working shot"
	},
	wide: {
		camDist: 24,
		camFov: 48,
		label: "WIDE",
		why: "station in the glass"
	},
	void: {
		camDist: 36,
		camFov: 52,
		label: "VOID",
		why: "cathedral in the sky"
	}
};
var listeners = /* @__PURE__ */ new Set();
var prefs = {
	spinPaused: false,
	spinSpeed: .85,
	music: .62,
	sfx: .78,
	muted: false,
	hints: true,
	camGen: 0,
	camDist: 18,
	camFov: 46,
	camZoom: 1,
	camPull: false,
	autoHide: true,
	watchNave: false,
	seenHelp: {}
};
function clamp(n, a, b) {
	return Math.max(a, Math.min(b, n));
}
function read() {
	if (typeof window === "undefined") return;
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return;
		const parsed = JSON.parse(raw);
		prefs = {
			spinPaused: Boolean(parsed.spinPaused),
			spinSpeed: typeof parsed.spinSpeed === "number" ? parsed.spinSpeed : .85,
			music: typeof parsed.music === "number" ? parsed.music : .62,
			sfx: typeof parsed.sfx === "number" ? parsed.sfx : .78,
			muted: Boolean(parsed.muted),
			hints: parsed.hints !== false,
			camGen: typeof parsed.camGen === "number" ? parsed.camGen : 0,
			camDist: typeof parsed.camDist === "number" ? clamp(parsed.camDist === 24 && (parsed.camFov === 48 || parsed.camFov == null) ? 18 : parsed.camDist, 8, 48) : 18,
			camFov: typeof parsed.camFov === "number" ? clamp(parsed.camDist === 24 && parsed.camFov === 48 ? 46 : parsed.camFov, 28, 70) : 46,
			camZoom: typeof parsed.camZoom === "number" ? clamp(parsed.camZoom, .35, 1.8) : 1,
			camPull: Boolean(parsed.camPull),
			autoHide: parsed.autoHide !== false,
			watchNave: Boolean(parsed.watchNave),
			seenHelp: parsed.seenHelp && typeof parsed.seenHelp === "object" ? parsed.seenHelp : {}
		};
	} catch {}
}
read();
function write() {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(KEY, JSON.stringify(prefs));
	} catch {}
}
function emit() {
	write();
	listeners.forEach((fn) => fn());
}
function getPrefs() {
	return prefs;
}
function patchPrefs(partial) {
	prefs = {
		...prefs,
		...partial
	};
	emit();
}
function getSpinPaused() {
	return prefs.spinPaused;
}
function setSpinPaused(next) {
	patchPrefs({ spinPaused: next });
}
function toggleSpinPaused() {
	setSpinPaused(!prefs.spinPaused);
}
function bumpCam() {
	patchPrefs({ camGen: prefs.camGen + 1 });
}
function applyCamPreset(id) {
	const p = CAM_PRESETS[id];
	patchPrefs({
		camDist: p.camDist,
		camFov: p.camFov,
		camGen: prefs.camGen + 1
	});
}
function camPosition(dist = prefs.camDist) {
	const d = clamp(dist, 8, 48);
	return [
		CAM_DIR.x * d,
		CAM_DIR.y * d,
		CAM_DIR.z * d
	];
}
function markHelp(id) {
	if (prefs.seenHelp[id]) return;
	patchPrefs({ seenHelp: {
		...prefs.seenHelp,
		[id]: true
	} });
}
function helpSeen(id) {
	return Boolean(prefs.seenHelp[id]);
}
function subscribeSpin(fn) {
	listeners.add(fn);
	return () => {
		listeners.delete(fn);
	};
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function fmt(n) {
	if (!Number.isFinite(n)) return "0";
	const abs = Math.abs(n);
	if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
	if (abs >= 1e4) return `${(n / 1e3).toFixed(1)}K`;
	if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
	if (abs >= 10) return n.toFixed(0);
	if (abs >= 1) return n.toFixed(1);
	return n.toFixed(1);
}
function fmtTime(sec) {
	const s = Math.max(0, Math.floor(sec));
	const m = Math.floor(s / 60);
	const r = s % 60;
	if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
	if (m > 0) return `${m}m ${r.toString().padStart(2, "0")}s`;
	return `${r}s`;
}
var ctx = null;
var master = null;
var musicBus = null;
var sfxBus = null;
var buffers = {};
var musicSrc = null;
var humSrc = null;
var rumble = null;
var rumbleGain = null;
var raidSrc = null;
var ambKind = "idle";
var loading = null;
function curve(v) {
	return Math.max(0, Math.min(1, v)) ** 2;
}
function applyGains() {
	if (!ctx || !master || !musicBus || !sfxBus) return;
	const p = getPrefs();
	const mute = p.muted ? 0 : 1;
	master.gain.setTargetAtTime(.9 * mute, ctx.currentTime, .05);
	musicBus.gain.setTargetAtTime(curve(p.music) * .55, ctx.currentTime, .05);
	sfxBus.gain.setTargetAtTime(curve(p.sfx), ctx.currentTime, .04);
}
function syncAudioGains() {
	applyGains();
}
function unlockAudio() {
	const AC = window.AudioContext || window.webkitAudioContext;
	if (!ctx) ctx = new AC({ latencyHint: "interactive" });
	if (ctx.state === "suspended") ctx.resume();
	if (!master) {
		master = ctx.createGain();
		musicBus = ctx.createGain();
		sfxBus = ctx.createGain();
		musicBus.connect(master);
		sfxBus.connect(master);
		master.connect(ctx.destination);
		applyGains();
	}
	if (!loading) loading = loadBeds();
}
async function loadBeds() {
	if (!ctx) return;
	await Promise.all(Object.entries({
		rules: "/nidus/rules.mp3",
		hum: "/nidus/loop-hum.mp3",
		brk: "/nidus/loop-break.mp3",
		coda: "/nidus/loop-coda.mp3"
	}).map(async ([k, src]) => {
		try {
			const arr = await (await fetch(src)).arrayBuffer();
			buffers[k] = await ctx.decodeAudioData(arr.slice(0));
		} catch {}
	}));
	startLoops();
	startRumble();
}
function startRumble() {
	if (!ctx || rumble || !sfxBus) return;
	rumble = ctx.createOscillator();
	rumble.type = "sine";
	rumble.frequency.value = 38;
	rumbleGain = ctx.createGain();
	rumbleGain.gain.value = .03;
	rumble.connect(rumbleGain);
	rumbleGain.connect(sfxBus);
	rumble.start();
}
function startSource(buf, bus, gain, loop) {
	if (!ctx) return null;
	const src = ctx.createBufferSource();
	src.buffer = buf;
	src.loop = loop;
	const g = ctx.createGain();
	g.gain.value = gain;
	src.connect(g);
	g.connect(bus);
	src.start();
	return src;
}
function startLoops() {
	if (!ctx || !musicBus) return;
	if (buffers.rules && !musicSrc) musicSrc = startSource(buffers.rules, musicBus, 1, true);
	if (buffers.hum && !humSrc) humSrc = startSource(buffers.hum, musicBus, .35, true);
}
function resumeAudio() {
	if (ctx?.state === "suspended") ctx.resume();
	applyGains();
}
function grain(kind) {
	if (!ctx || !sfxBus) return;
	const buf = buffers.brk || buffers.rules || buffers.hum;
	if (buf) {
		const src = ctx.createBufferSource();
		src.buffer = buf;
		const dur = kind === "wake" ? .9 : kind === "surge" ? 1.4 : .22;
		const start = Math.min(buf.duration - dur, Math.random() * Math.max(.1, buf.duration - dur));
		src.playbackRate.value = kind === "dead" ? .7 : kind === "wake" ? 1.05 : .92 + Math.random() * .18;
		const g = ctx.createGain();
		g.gain.setValueAtTime(1e-4, ctx.currentTime);
		g.gain.exponentialRampToValueAtTime(kind === "surge" ? .55 : .28, ctx.currentTime + .02);
		g.gain.exponentialRampToValueAtTime(1e-4, ctx.currentTime + dur);
		src.connect(g);
		g.connect(sfxBus);
		src.start(ctx.currentTime, start, dur + .05);
	}
	const o = ctx.createOscillator();
	const g = ctx.createGain();
	o.type = kind === "dead" ? "sawtooth" : "triangle";
	const freqs = {
		print: 220,
		wake: 392,
		surge: 174,
		snap: 330,
		raid: 130,
		dead: 90
	};
	o.frequency.value = freqs[kind];
	g.gain.setValueAtTime(1e-4, ctx.currentTime);
	g.gain.exponentialRampToValueAtTime(.08, ctx.currentTime + .01);
	g.gain.exponentialRampToValueAtTime(1e-4, ctx.currentTime + .18);
	o.connect(g);
	g.connect(sfxBus);
	o.start();
	o.stop(ctx.currentTime + .22);
}
function chime(kind) {
	if (!ctx || !sfxBus) return;
	grain(kind);
	if (kind === "surge" && buffers.brk && musicBus) startSource(buffers.brk, musicBus, .85, false);
	if (kind === "raid" && buffers.coda && musicBus) startSource(buffers.coda, musicBus, .7, false);
}
function setAmbiance(kind) {
	if (!ctx || !rumbleGain || !musicBus) return;
	if (ambKind === kind) return;
	ambKind = kind;
	const now = ctx.currentTime;
	const rumbleLevel = kind === "raid" ? .07 : kind === "surge" ? .09 : kind === "wake" ? .05 : .028;
	rumbleGain.gain.setTargetAtTime(rumbleLevel, now, .2);
	if (kind === "raid" && buffers.coda && !raidSrc) raidSrc = startSource(buffers.coda, musicBus, .45, true);
	if (kind !== "raid" && raidSrc) {
		try {
			raidSrc.stop();
		} catch {}
		raidSrc = null;
	}
}
var BOOT_ASSETS = [.../* @__PURE__ */ new Set([
	"/nidus/title.jpg",
	"/nidus/keyart.jpg",
	"/nidus/nave.jpg",
	"/nidus/tex-plate.jpg",
	"/nidus/tex-glass.jpg",
	"/nidus/tex-grate.jpg",
	"/nidus/tex-nebula.jpg",
	"/nidus/tex-filigree.jpg",
	"/nidus/tex-blood.jpg",
	"/nidus/tex-hazard.jpg",
	"/nidus/tex-rivet.jpg",
	"/nidus/tex-gilt.jpg",
	"/nidus/tex-rose.jpg",
	"/nidus/tex-void.jpg",
	"/nidus/tex-ember.jpg",
	"/nidus/tex-bone.jpg",
	"/nidus/sky-arch.jpg",
	"/nidus/sky-sleep.jpg",
	"/nidus/sky-rift.jpg",
	"/nidus/sky-titans.jpg",
	...Object.values(FRAMES).flatMap((f) => f.portraits),
	...RAIDS.map((r) => r.image)
])];
var BOOT_IDLE = {
	pct: 0,
	ready: false,
	label: "BINDING"
};
function loadImage(src) {
	return new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve();
		img.onerror = () => resolve();
		img.src = src;
	});
}
async function runBoot(onProgress) {
	const steps = BOOT_ASSETS.length + 1;
	let done = 0;
	const labels = [
		"BINDING",
		"NAVE",
		"FORGE",
		"MINDS",
		"HULL"
	];
	const bump = () => {
		done += 1;
		onProgress({
			pct: Math.min(100, Math.round(done / steps * 100)),
			ready: false,
			label: labels[Math.min(labels.length - 1, Math.floor(done / steps * labels.length))] ?? "BINDING"
		});
	};
	const batch = 4;
	for (let i = 0; i < BOOT_ASSETS.length; i += batch) {
		await Promise.all(BOOT_ASSETS.slice(i, i + batch).map(loadImage));
		for (let j = 0; j < Math.min(batch, BOOT_ASSETS.length - i); j++) bump();
	}
	await import("./StationScene-BGP0jcJy.mjs");
	bump();
	onProgress({
		pct: 100,
		ready: true,
		label: "READY"
	});
}
/** Per-screen ? copy. Five words of function, never a lecture. */
var GUIDES = {
	wake: {
		id: "wake",
		title: "WAKE",
		blurb: "You are the hive. The nave is the body.",
		verbs: [
			{
				id: "wake",
				label: "WAKE",
				line: "Opens the live hive."
			},
			{
				id: "boot",
				label: "BAR",
				line: "Loads faces and hull plates."
			},
			{
				id: "save",
				label: "SAVE",
				line: "Your hive is already bound."
			},
			{
				id: "song",
				label: "SONG",
				line: "Rules of Engagement — Nytheria Nyx."
			}
		]
	},
	hull: {
		id: "hull",
		title: "HULL",
		blurb: "The cathedral. Rooms grow as nodes on the nave.",
		verbs: [
			{
				id: "goal",
				label: "GOLD CHIP",
				line: "The one next verb."
			},
			{
				id: "rooms",
				label: "NODES",
				line: "Tap a dark room to raise it."
			},
			{
				id: "surge",
				label: "SURGE",
				line: "Short scream. All rates spike."
			},
			{
				id: "slag",
				label: "SLAG",
				line: "Tap ore + spark. Seven second cool."
			},
			{
				id: "hive",
				label: "HIVE",
				line: "Mind stamps, builds, raids for you."
			},
			{
				id: "hide",
				label: "EYE",
				line: "Folds chrome. Station stays."
			}
		]
	},
	forge: {
		id: "forge",
		title: "FORGE",
		blurb: "Stamp drones. Open berths. Mark hulls.",
		verbs: [
			{
				id: "caste",
				label: "CASTE",
				line: "Pick who the next stamp is."
			},
			{
				id: "print",
				label: "PRINT",
				line: "Spends ore + parts. Fills a berth."
			},
			{
				id: "auto",
				label: "AUTO",
				line: "Keeps stamping while you are gone."
			},
			{
				id: "expand",
				label: "EXPAND",
				line: "Buys pop cap. Packed swarm idles."
			},
			{
				id: "mark",
				label: "MARK",
				line: "Ranks that caste. Strikers hit harder."
			}
		]
	},
	raid: {
		id: "raid",
		title: "RAID",
		blurb: "Send strikers. The well fights without you.",
		verbs: [
			{
				id: "send",
				label: "SEND",
				line: "Tap an open wreck. Hulls leave."
			},
			{
				id: "watch",
				label: "WATCH",
				line: "See the well. Leave — it still fights."
			},
			{
				id: "boost",
				label: "BOOST",
				line: "Spends charge. Command bonus."
			},
			{
				id: "mark",
				label: "MARK",
				line: "Bigger strikers. Harder wrecks."
			},
			{
				id: "lock",
				label: "LOCKED",
				line: "Needs a prior wreck or room."
			}
		]
	},
	minds: {
		id: "minds",
		title: "COMMANDERS",
		blurb: "A commander is a woke mind. Seat her on a post. That rate climbs.",
		verbs: [
			{
				id: "pick",
				label: "WAKE",
				line: "Three bodies. One commander stays."
			},
			{
				id: "post",
				label: "POST",
				line: "MINE ore. MAKE parts. BUILD rooms. LAB spark. RAID hulls."
			},
			{
				id: "seat",
				label: "SEAT",
				line: "Seated = full boost. Pacing = half."
			},
			{
				id: "heal",
				label: "HEAL",
				line: "Wounded commanders cut the boost."
			},
			{
				id: "mark",
				label: "MARK",
				line: "Echo ranks her. UNMAKE if she sours."
			}
		]
	},
	view: {
		id: "view",
		title: "VIEW",
		blurb: "The camera lives here. The hull does not yaw.",
		verbs: [
			{
				id: "shot",
				label: "SHOTS",
				line: "CLOSE inspects. VOID is sky."
			},
			{
				id: "dist",
				label: "DISTANCE",
				line: "Pulls the lens off the nave."
			},
			{
				id: "pinch",
				label: "PINCH",
				line: "Two fingers on empty glass."
			},
			{
				id: "spin",
				label: "SPIN",
				line: "Idle orbit. HOLD freezes it."
			},
			{
				id: "hide",
				label: "EYE",
				line: "Chrome folds so you can watch."
			}
		]
	}
};
var POSTS = {
	mine: {
		label: "MINE",
		does: "Multiplies ore."
	},
	forge: {
		label: "MAKE",
		does: "Multiplies parts."
	},
	build: {
		label: "BUILD",
		does: "Raises rooms faster."
	},
	lab: {
		label: "LAB",
		does: "Fills SPARK and rites."
	},
	raid: {
		label: "RAID",
		does: "Hardens the fleet."
	}
};
function framePost(frame) {
	return POSTS[FRAMES[frame].job];
}
function mindPostLine(mind) {
	const p = POSTS[mind.job];
	const seat = mind.seated ? "SEATED" : "PACING · HALF";
	const wound = mind.wounded ? " · WOUNDED" : "";
	return `${seat} · ${p.does}${wound}`;
}
var GLOSS = {
	ORE: "Ice and wreck-slag. Caps without Ore Bay.",
	PARTS: "Fabs chew ore. Rooms eat parts.",
	CHARGE: "Spine blood. Low charge starves every rate.",
	SPARK: "Full bar. Three bodies. One stays.",
	ECHO: "Fallen minds. Fuel for molt.",
	RANK: "Hive layer. Rooms, rites, wrecks, molt.",
	ICE: "Melt two ice for ore.",
	PLATE: "Stamp two plate for parts.",
	BONE: "Burn two bone for charge.",
	ROSE: "Drink a rose for SPARK.",
	CORE: "Crack a core for Echo."
};
function gloss(label) {
	return GLOSS[label] ?? "";
}
function roomLockWhy(s, id) {
	if (s.rooms[id]?.built) return "";
	return roomUnlocked(s, id).why;
}
function raidLockWhy(s, id) {
	const node = RAIDS.find((r) => r.id === id);
	if (!node) return "LOCKED";
	if (raidUnlocked(s, id)) {
		const need = raidNeed(s, id);
		if (s.swarm.striker < need) return `NEED ${need} HULLS`;
		return "";
	}
	if (node.requires === "herald") return s.tech.rosekey?.done ? "" : "NEED A HERALD";
	if (node.requires === "molt") return "NEED MOLT";
	if (node.requires) return `NEED ${node.requires.toUpperCase()}`;
	return "LOCKED";
}
function packed(s) {
	return totalSwarm(s) >= berthCap(s) - 1;
}
function sparkHot(s) {
	return s.spark / Math.max(1, s.sparkNeed) >= .8;
}
function chargeStarve(s) {
	return s.charge < 8;
}
/** Quiet first-look line. One shot. Not a tutorial tree. */
function firstWhisper(id) {
	if (id === "wake") return "WAKE opens the nave.";
	if (id === "hull") return "Gold chip is the next verb. ? is this screen.";
	if (id === "forge") return "PRINT stamps. AUTO keeps going.";
	if (id === "raid") return "Send. Leave. It still fights.";
	if (id === "minds") return "A commander multiplies one post. Seat her.";
	return "Pinch empty glass. EYE hides chrome.";
}
var Scene = (0, import_react.lazy)(() => import("./StationScene-BGP0jcJy.mjs").then((m) => ({ default: m.StationScene })));
function StationMount() {
	const [on, setOn] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setOn(true), []);
	if (!on) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-void" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-void" }),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scene, {})
	});
}
var CODEX = [
	{
		id: "hive",
		title: "HIVE",
		body: "You are the lone brain. Drones are meat. Minds are rare sparks that wake and take a body."
	},
	{
		id: "scripts",
		title: "HIVE MIND",
		body: "Flip HIVE on the hull. The nave prints, builds, rites, and raids without a guide. You can still steer."
	},
	{
		id: "watch",
		title: "WATCH",
		body: "A raid orbits a wreck. WATCH to see the well. BOOST spends charge. Leave — it still fights."
	},
	{
		id: "mark",
		title: "MARK",
		body: "Striker hulls rank DART → RELIQUARY. Spend ore and parts. Bigger mark, harder well."
	},
	{
		id: "slot",
		title: "SLOTS",
		body: "Three local pews besides the live hive. STASH copies. LOAD swaps. Live save is never wiped by a slot."
	},
	{
		id: "ore",
		title: "ORE",
		body: "Mined ice and wreck-slag. Caps if you skip the Ore Bay."
	},
	{
		id: "parts",
		title: "PARTS",
		body: "Fabs chew ore into parts. Rooms and prints eat parts."
	},
	{
		id: "charge",
		title: "CHARGE",
		body: "The spine’s blood. Low charge starves every rate. Raise Solar."
	},
	{
		id: "spark",
		title: "SPARK",
		body: "Fills while the swarm works. Full bar = three bodies. Pick one. The rest ash."
	},
	{
		id: "echo",
		title: "ECHO",
		body: "Residue of unmade or fallen minds. Fuel for Molt."
	},
	{
		id: "print",
		title: "PRINT",
		body: "Stamp a caste. AUTO keeps stamping while you are gone."
	},
	{
		id: "surge",
		title: "SURGE",
		body: "A short scream. All rates spike. Pair with Nytheria’s breakdown."
	},
	{
		id: "slag",
		title: "SLAG",
		body: "Tap the hull. Spare ore and a lick of spark. Seven second cool."
	},
	{
		id: "idle",
		title: "IDLE GIFT",
		body: "Leave. Come back. Claim the extra cut. The hive does not sleep."
	},
	{
		id: "raid",
		title: "RAID",
		body: "Send strikers. Win wrecks. Lose bodies. Ice Ring is the first door."
	},
	{
		id: "mind",
		title: "COMMANDERS",
		body: "SPARK fills. Three bodies. One commander stays. Seat her on MINE / MAKE / BUILD / LAB / RAID. Seated = full boost. Pacing = half."
	},
	{
		id: "molt",
		title: "MOLT",
		body: "Reliquary + rite + Echo. Station stays. Nerve grows a layer."
	},
	{
		id: "view",
		title: "VIEW",
		body: "VIEW on the left rail. CLOSE inspects. VOID is sky. AUTO HIDE folds chrome after a quiet beat. EYE brings it back. ? on each screen is that screen only."
	},
	{
		id: "ask",
		title: "?",
		body: "Left rail. Opens this screen's verbs. Five words. Not a guidebook."
	},
	{
		id: "hide",
		title: "HIDE",
		body: "EYE folds chrome so the nave can breathe. Gold chip or SHOW brings it back."
	},
	...ROOMS.filter((r) => r.id !== "foundry").map((r) => ({
		id: r.id,
		title: r.label,
		body: `${r.blurb} ${r.bonus}. ${r.requires ? `Needs ${r.requires.toUpperCase()}. ` : ""}Costs ${r.parts} parts.`
	})),
	...CASTES.map((c) => ({
		id: c.id,
		title: c.label,
		body: `${c.verb} caste. Print them in FORGE.`
	})),
	...Object.values(FRAMES).map((f) => ({
		id: f.label,
		title: f.label,
		body: `${f.rarity.toUpperCase()} frame. Default job ${f.job.toUpperCase()}. ${f.lines[0]}`
	})),
	...RAIDS.map((r) => ({
		id: r.id,
		title: r.label,
		body: `${r.blurb} ${r.need} strikers. ${Math.ceil(r.seconds / 60)} min. Drops ${r.salvage}.`
	})),
	...TECH.map((t) => ({
		id: t.id,
		title: t.label,
		body: t.blurb
	})),
	{
		id: "berth",
		title: "BERTHS",
		body: "Pop cap. Barracks, nerve, hangar, reliquary, molt, Deep Berths, Husk Beds, and EXPAND on FORGE."
	},
	{
		id: "orders",
		title: "ORDERS",
		body: "Three cuts on the hull. Finish them for extra ore, parts, spark."
	},
	{
		id: "rank",
		title: "RANK",
		body: "Tap a lit room to reinforce it. Rank 1–5. Barracks/nerve ranks add berths. Hive RANK climbs from rooms, rites, wrecks, molt."
	},
	{
		id: "cook",
		title: "COOK",
		body: "Salvage on RAID. Melt ice, stamp plate, burn bone, drink rose, crack core."
	},
	{
		id: "nest",
		title: "NESTS",
		body: "Rooms and rites nest. A lock is a prior node, not a wall."
	}
];
function SettingsPanel({ onClose, start = "view" }) {
	const [tab, setTab] = (0, import_react.useState)(start);
	(0, import_react.useEffect)(() => {
		setTab(start);
	}, [start]);
	const prefs = (0, import_react.useSyncExternalStore)(subscribeSpin, getPrefs, getPrefs);
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
	const fileRef = (0, import_react.useRef)(null);
	const [q, setQ] = (0, import_react.useState)("");
	const hits = CODEX.filter((c) => !q || `${c.title} ${c.body}`.toLowerCase().includes(q.toLowerCase()));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-auto max-h-[70dvh] overflow-y-auto border border-border bg-nave/95 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-4 gap-1",
					children: [
						"view",
						"opt",
						"codex",
						"save"
					].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setTab(t),
						className: cn("min-h-10 px-1 font-display text-[0.62rem] tracking-[0.16em]", tab === t ? "bg-blood text-bone" : "border border-border text-muted"),
						children: t === "view" ? "VIEW" : t === "opt" ? "LOCAL" : t === "codex" ? "CODEX" : "SAVE"
					}, t))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-xs tracking-[0.2em] text-muted",
					onClick: onClose,
					children: "CLOSE"
				})]
			}),
			tab === "view" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewMenu, { prefs }),
			tab === "opt" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "MUSIC",
						value: prefs.music,
						onChange: (v) => {
							patchPrefs({ music: v });
							syncAudioGains();
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "SFX",
						value: prefs.sfx,
						onChange: (v) => {
							patchPrefs({ sfx: v });
							syncAudioGains();
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "SPIN",
						value: Math.min(1, Math.max(0, (prefs.spinSpeed - .15) / 1.85)),
						onChange: (v) => patchPrefs({ spinSpeed: .15 + v * 1.85 })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[0.7rem] text-muted",
						children: "SPIN is idle orbit. HOLD freezes it. Camera lives on VIEW."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xs tracking-[0.2em] text-gilt",
						children: "HIVE MIND"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								on: scripts,
								label: "HIVE",
								onClick: () => toggleScripts()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								on: autoPrint,
								label: "PRINT",
								onClick: () => toggleAuto()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								on: autoBuild,
								label: "BUILD",
								onClick: () => toggleAutoBuild()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								on: autoRaid,
								label: "RAID",
								onClick: () => toggleAutoRaid()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								on: autoRite,
								label: "RITE",
								onClick: () => toggleAutoRite()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								on: prefs.hints,
								label: "HINTS",
								onClick: () => patchPrefs({ hints: !prefs.hints })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[0.7rem] text-muted",
						children: "HIVE stamps, raises, rites, and raids so you do not need a guide."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xs tracking-[0.2em] text-gilt",
						children: "RITES"
					}),
					!lab && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Raise the Lab first."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-2",
						children: TECH.map((t) => {
							const st = tech[t.id];
							const lock = techUnlocked(useNidus.getState(), t.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								disabled: !lab || st.done || !lock.ok,
								onClick: () => research(t.id),
								className: cn("nidus-cut px-2 py-2 text-left", st.done ? "nidus-cut-gilt" : active === t.id ? "text-venom" : lock.ok ? "text-bone" : "text-iron"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-[0.65rem] tracking-[0.16em]",
										children: t.label
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[0.65rem] text-muted",
										children: lock.ok || st.done ? t.blurb : lock.why
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[0.7rem] tabular-nums text-muted",
										children: st.done ? "DONE" : `${Math.floor(st.progress / t.work * 100)}% · T${t.tier}`
									})
								]
							}, t.id);
						})
					})
				]
			}),
			tab === "codex" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "SEEK…",
				className: "mb-2 min-h-11 w-full border border-border bg-void px-3 text-sm text-bone outline-none"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: hits.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "border border-border p-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xs tracking-[0.2em] text-gilt",
						children: c.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-bone",
						children: c.body
					})]
				}, `${c.title}-${c.id}`))
			})] }),
			tab === "save" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: lastSaveAt ? `BOUND ${new Date(lastSaveAt).toLocaleString()}` : "NOT BOUND THIS SESSION"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: hiveName,
						onChange: (e) => renameHive(e.target.value),
						className: "min-h-11 border border-border bg-void px-3 font-display tracking-[0.2em] text-bone outline-none",
						maxLength: 16
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-12 bg-blood font-display tracking-[0.3em] text-bone",
						onClick: () => saveNow(),
						children: "SAVE HIVE"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-3 gap-2",
						children: [
							0,
							1,
							2
						].map((i) => {
							const name = slotStamp(i);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border border-border p-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-[0.6rem] tracking-[0.16em] text-gilt",
										children: name ?? `PEW ${i + 1}`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "mt-1 min-h-9 w-full border border-border text-[0.65rem] tracking-[0.14em]",
										onClick: () => stashSlot(i),
										children: "STASH"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: !name,
										className: "mt-1 min-h-9 w-full border border-gilt text-[0.65rem] tracking-[0.14em] text-gilt disabled:border-iron disabled:text-muted",
										onClick: () => loadSlot(i),
										children: "LOAD"
									})
								]
							}, i);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 border border-border font-display text-xs tracking-[0.2em]",
						onClick: download,
						children: "EXPORT"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 border border-border font-display text-xs tracking-[0.2em]",
						onClick: async () => {
							try {
								await navigator.clipboard.writeText(JSON.stringify(useNidus.getState(), (_k, v) => typeof v === "function" ? void 0 : v));
							} catch {
								download();
							}
						},
						children: "COPY JSON"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 border border-border font-display text-xs tracking-[0.2em]",
						onClick: () => fileRef.current?.click(),
						children: "IMPORT"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileRef,
						type: "file",
						accept: "application/json,.json",
						className: "hidden",
						onChange: async (e) => {
							const file = e.target.files?.[0];
							if (!file) return;
							const text = await file.text();
							importHive(text);
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 border border-gilt font-display text-xs tracking-[0.2em] text-gilt",
						onClick: () => {
							const url = new URL(window.location.href);
							url.searchParams.set("install", "1");
							window.location.assign(url.toString());
						},
						children: "INSTALL HOME"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[0.7rem] text-muted",
						children: "Rules of Engagement — Nytheria Nyx. Local only. This hive is yours."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 border border-blood font-display text-xs tracking-[0.2em] text-blood-bright",
						onClick: () => {
							if (window.confirm("Burn this hive? Export first if you want it.")) resetHive();
						},
						children: "NEW HIVE"
					})
				]
			})
		]
	});
}
function ViewMenu({ prefs }) {
	const presetOn = (id) => {
		const p = CAM_PRESETS[id];
		return Math.abs(prefs.camDist - p.camDist) < .6 && Math.abs(prefs.camFov - p.camFov) < 1.5;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-xs tracking-[0.22em] text-gilt",
				children: "HOW FAR"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[0.75rem] text-muted",
				children: "The hull was sitting on the lens. Pick a shot. Drag the slider while you watch the nave. Changes stick."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-4 gap-1",
				children: Object.keys(CAM_PRESETS).map((id) => {
					const p = CAM_PRESETS[id];
					const on = presetOn(id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						title: `${p.label} — ${p.why}`,
						onClick: () => applyCamPreset(id),
						className: cn("min-h-14 border px-1 py-1 text-center", on ? "border-gilt bg-blood/40 text-gilt" : "border-border text-bone"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-display text-[0.62rem] tracking-[0.14em]",
							children: p.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-[0.58rem] tracking-[0.08em] text-muted",
							children: p.why
						})]
					}, id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitSlider, {
				label: "DISTANCE",
				why: "Higher pulls the camera off the hull. Live.",
				value: prefs.camDist,
				min: 8,
				max: 48,
				step: .1,
				display: prefs.camDist.toFixed(1),
				onChange: (v) => patchPrefs({ camDist: v })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitSlider, {
				label: "FIELD",
				why: "Wider lens sees more sky. Narrower inspects.",
				value: prefs.camFov,
				min: 28,
				max: 70,
				step: .5,
				display: `${Math.round(prefs.camFov)}°`,
				onChange: (v) => patchPrefs({ camFov: v })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitSlider, {
				label: "PINCH",
				why: "How hard pinch and wheel shove the shot.",
				value: prefs.camZoom,
				min: .35,
				max: 1.8,
				step: .01,
				display: prefs.camZoom.toFixed(2),
				onChange: (v) => patchPrefs({ camZoom: v })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitSlider, {
				label: "SPIN",
				why: "Idle orbit speed. HOLD on the hull freezes it.",
				value: prefs.spinSpeed,
				min: .15,
				max: 2,
				step: .01,
				display: prefs.spinSpeed.toFixed(2),
				onChange: (v) => patchPrefs({ spinSpeed: v })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						on: prefs.camPull,
						label: "KEEP FRAME",
						onClick: () => patchPrefs({ camPull: !prefs.camPull })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						on: prefs.autoHide,
						label: "AUTO HIDE",
						onClick: () => patchPrefs({ autoHide: !prefs.autoHide })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 border border-gilt font-display text-[0.65rem] tracking-[0.16em] text-gilt",
						onClick: () => bumpCam(),
						children: "SNAP FRAME"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[0.7rem] text-muted",
				children: "Drag empty glass to orbit. Pinch or wheel to zoom. SNAP FRAME uses the distance you set. KEEP FRAME slowly returns to it after you let go. AUTO HIDE folds the chrome so the nave can breathe. EYE brings it back."
			})
		]
	});
}
function Toggle({ on, label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: cn("min-h-11 font-display text-[0.65rem] tracking-[0.18em]", on ? "bg-venom text-void" : "border border-border text-muted"),
		children: label
	});
}
function UnitSlider({ label, why, value, min, max, step, display, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-baseline justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-[0.65rem] tracking-[0.2em] text-gilt",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-[0.7rem] tabular-nums text-bone",
					children: display
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[0.65rem] text-muted",
				children: why
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "range",
				min,
				max,
				step,
				value,
				onChange: (e) => onChange(Number(e.target.value)),
				className: "mt-1 w-full accent-[var(--color-gilt)]"
			})
		]
	});
}
function Slider({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-display text-[0.65rem] tracking-[0.2em] text-gilt",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "range",
			min: 0,
			max: 1,
			step: .01,
			value,
			onChange: (e) => onChange(Number(e.target.value)),
			className: "mt-1 w-full accent-[var(--color-gilt)]"
		})]
	});
}
function RailBtn({ label, title, on, pulse, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"data-chrome": true,
		title,
		"aria-label": label,
		onClick,
		className: cn("nidus-cut flex h-11 w-11 flex-col items-center justify-center text-bone", on ? "nidus-cut-on" : "", pulse && "nidus-pulse"),
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mt-0.5 font-display text-[0.42rem] tracking-[0.14em]",
			children: label
		})]
	});
}
function LeftRail({ muted, spinPaused, collapsed, helpPulse, onHelp, onView, onRite, onMute, onCollapse }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
		"data-chrome": true,
		className: "pointer-events-auto absolute left-2 top-[max(3.6rem,calc(env(safe-area-inset-top)+2.8rem))] z-20 flex flex-col gap-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailBtn, {
				label: "?",
				title: "This screen — verbs only.",
				pulse: helpPulse,
				onClick: onHelp,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleHelp, { className: "size-3.5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailBtn, {
				label: "VIEW",
				title: "Distance, field, shots.",
				onClick: onView,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Aperture, { className: "size-3.5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailBtn, {
				label: "RITE",
				title: "Lab, save pews, music.",
				onClick: onRite,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-3.5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailBtn, {
				label: spinPaused ? "HOLD" : "SPIN",
				title: "Idle orbit. HOLD freezes the nave.",
				on: spinPaused,
				onClick: () => toggleSpinPaused(),
				children: spinPaused ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCw, { className: "size-3.5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailBtn, {
				label: muted ? "MUTE" : "SONG",
				title: "Mute the anthem and the hive.",
				on: muted,
				onClick: onMute,
				children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-3.5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailBtn, {
				label: collapsed ? "SHOW" : "HIDE",
				title: "Fold chrome. Watch the nave.",
				on: collapsed,
				onClick: onCollapse,
				children: collapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-3.5" })
			})
		]
	});
}
function GuideSheet({ screen, onClose, className }) {
	const g = GUIDES[screen];
	(0, import_react.useEffect)(() => {
		markHelp(screen);
	}, [screen]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("pointer-events-auto max-h-[56dvh] overflow-y-auto border border-gilt/40 bg-nave/95 p-3 shadow-[0_0_24px_#0c0a09]", className ?? "absolute inset-x-12 bottom-16 z-40"),
		"data-chrome": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-baseline justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-sm tracking-[0.28em] text-gilt",
					children: g.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "font-display text-[0.65rem] tracking-[0.18em] text-muted",
					onClick: onClose,
					children: "GOT IT"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-[0.75rem] text-bone",
				children: g.blurb
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-1.5",
				children: g.verbs.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-baseline gap-2 border-b border-border/60 pb-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-16 shrink-0 font-display text-[0.62rem] tracking-[0.16em] text-gilt",
						children: v.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[0.75rem] text-bone",
						children: v.line
					})]
				}, v.id))
			})
		]
	});
}
function Whisper({ text, onDone }) {
	(0, import_react.useEffect)(() => {
		const t = window.setTimeout(onDone, 4200);
		return () => window.clearTimeout(t);
	}, [text, onDone]);
	if (!text) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "pointer-events-none absolute inset-x-14 top-[max(4.6rem,calc(env(safe-area-inset-top)+3.6rem))] z-30 border border-gilt/30 bg-nave/80 px-2 py-1 text-center text-[0.7rem] tracking-[0.08em] text-gilt nidus-whisper",
		children: text
	});
}
function GoalDock({ goal, stage, collapsed, onExpand }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"data-chrome": true,
		onClick: onExpand,
		className: cn("pointer-events-auto mx-auto flex max-w-[22rem] items-center gap-2 border border-gilt/35 bg-nave/80 px-2 py-1", collapsed && "mb-1"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "font-display text-[0.58rem] tabular-nums tracking-[0.16em] text-gilt",
				children: [
					stage.n,
					"/",
					stage.of,
					" ",
					stage.name
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 flex-1 truncate text-center font-display text-[0.65rem] tracking-[0.18em] text-gilt",
				children: goal
			}),
			collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-3 shrink-0 text-muted" })
		]
	});
}
function useIdleChrome(locked) {
	const [collapsed, setCollapsed] = (0, import_react.useState)(false);
	const [poke, setPoke] = (0, import_react.useState)(0);
	const prefs = useSyncPrefs();
	const bump = () => {
		setCollapsed(false);
		patchPrefs({ watchNave: false });
		setPoke((n) => n + 1);
	};
	(0, import_react.useEffect)(() => {
		if (locked || !prefs.autoHide) {
			setCollapsed(false);
			patchPrefs({ watchNave: false });
			return;
		}
		const t = window.setTimeout(() => {
			setCollapsed(true);
			patchPrefs({ watchNave: true });
			if (!helpSeen("idle") && prefs.hints) markHelp("idle");
		}, 8e3);
		return () => window.clearTimeout(t);
	}, [
		poke,
		locked,
		prefs.autoHide,
		prefs.hints
	]);
	return {
		collapsed,
		setCollapsed,
		bump,
		autoHide: prefs.autoHide
	};
}
function useSyncPrefs() {
	const [, setN] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		return subscribeSpin(() => setN((n) => n + 1));
	}, []);
	return getPrefs();
}
function muteToggle(muted, setMutedUi) {
	setMutedUi(!muted);
	patchPrefs({ muted: !muted });
	syncAudioGains();
}
var rarityColor = {
	iron: "text-muted",
	bone: "text-bone",
	gold: "text-gilt",
	relic: "text-venom"
};
function pulse(on) {
	return on ? "nidus-pulse" : "";
}
function NidusApp() {
	const hydrate = useNidus((s) => s.hydrate);
	const tick = useNidus((s) => s.tick);
	const saveNow = useNidus((s) => s.saveNow);
	const start = useNidus((s) => s.start);
	const started = useNidus((s) => s.started);
	const waking = useNidus((s) => s.waking);
	const showBrief = useNidus((s) => s.showBrief);
	const gift = useNidus((s) => s.pendingGift);
	const [boot, setBoot] = (0, import_react.useState)(BOOT_IDLE);
	const [session, setSession] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		hydrate();
		let cancelled = false;
		runBoot((next) => {
			if (!cancelled) setBoot(next);
		});
		const onVis = () => {
			resumeAudio();
			if (document.visibilityState === "hidden") saveNow();
			else tick(Date.now());
		};
		document.addEventListener("visibilitychange", onVis);
		window.addEventListener("pagehide", saveNow);
		let acc = 0;
		let last = performance.now();
		let raf = 0;
		const loop = (t) => {
			acc += t - last;
			last = t;
			if (acc >= 250) {
				tick(Date.now());
				acc = 0;
				const st = useNidus.getState();
				setAmbiance(st.waking ? "wake" : Date.now() < st.surgeUntil ? "surge" : st.raid ? "raid" : "idle");
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => {
			cancelled = true;
			cancelAnimationFrame(raf);
			document.removeEventListener("visibilitychange", onVis);
			window.removeEventListener("pagehide", saveNow);
		};
	}, [
		hydrate,
		tick,
		saveNow
	]);
	if (!boot.ready || !session) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleScreen, {
		boot,
		onWake: () => {
			unlockAudio();
			chime("wake");
			if (!started) start();
			setSession(true);
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveHive, {
		waking: Boolean(waking),
		gift: Boolean(gift),
		showBrief
	});
}
function TitleScreen({ boot, onWake }) {
	const canWake = boot.ready;
	const [ask, setAsk] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex h-dvh w-full flex-col items-center justify-end overflow-hidden bg-void",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/nidus/title.jpg",
				alt: "",
				className: "absolute inset-0 h-full w-full object-cover",
				crossOrigin: "anonymous"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-b from-void/40 via-void/20 to-void" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "absolute right-3 top-[max(0.8rem,env(safe-area-inset-top))] z-20 flex h-11 w-11 flex-col items-center justify-center border border-gilt/40 bg-nave/70 text-gilt",
				title: "This screen.",
				onClick: () => setAsk((v) => !v),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleHelp, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-[0.42rem] tracking-[0.14em]",
					children: "?"
				})]
			}),
			ask && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-x-8 top-16 z-30",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuideSheet, {
					screen: "wake",
					onClose: () => setAsk(false),
					className: "relative"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex w-full flex-col items-center gap-2 px-6 pb-10 pt-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-[0.65rem] tracking-[0.55em] text-gilt",
						children: "HIVE MIND"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-5xl font-black tracking-[0.28em] text-bone",
						children: "NIDUS"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-[16rem] text-center text-sm tracking-[0.18em] text-muted",
						children: "LIGHTBRINGER. NIGHTQUEEN. UNYIELDING."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 w-full max-w-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-1 flex items-center justify-between font-display text-[0.6rem] tracking-[0.28em] text-gilt",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: boot.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "tabular-nums",
								children: [boot.pct, "%"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-1.5 w-full overflow-hidden border border-gilt/40 bg-iron",
							role: "progressbar",
							"aria-valuemin": 0,
							"aria-valuemax": 100,
							"aria-valuenow": boot.pct,
							"aria-label": "Loading",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full bg-gilt motion-safe:transition-[width] motion-safe:duration-200",
								style: { width: `${boot.pct}%` }
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: !canWake,
						onClick: onWake,
						className: cn("mt-3 min-h-11 min-w-40 border border-gilt/50 bg-void/60 px-10 py-2 font-display text-sm tracking-[0.35em] text-gilt disabled:border-iron disabled:text-muted", canWake && "nidus-pulse"),
						children: canWake ? "WAKE" : "…"
					})
				]
			})
		]
	});
}
function LiveHive({ waking, gift, showBrief }) {
	const tab = useNidus((s) => s.tab);
	const setTab = useNidus((s) => s.setTab);
	const [riteOpen, setRiteOpen] = (0, import_react.useState)(false);
	const [riteStart, setRiteStart] = (0, import_react.useState)("view");
	const [guide, setGuide] = (0, import_react.useState)(null);
	const [whisper, setWhisper] = (0, import_react.useState)(null);
	const [muted, setMuted] = (0, import_react.useState)(() => getPrefs().muted);
	const prefs = useSyncPrefs();
	const spinPaused = (0, import_react.useSyncExternalStore)(subscribeSpin, getSpinPaused, getSpinPaused);
	const { collapsed, setCollapsed, bump } = useIdleChrome(waking || gift || riteOpen || Boolean(guide));
	const whispered = (0, import_react.useState)(() => /* @__PURE__ */ new Set())[0];
	const s = useNidus();
	const goal = nextGoal(s);
	const stage = hiveStage(s);
	const tip = advise(s);
	(0, import_react.useEffect)(() => {
		if (!prefs.hints) return;
		if (whispered.has(tab)) return;
		whispered.add(tab);
		if (!helpSeen(tab)) setWhisper(firstWhisper(tab));
	}, [
		tab,
		prefs.hints,
		whispered
	]);
	const openView = () => {
		bump();
		setRiteStart("view");
		setRiteOpen(true);
	};
	const openRite = () => {
		bump();
		setRiteStart("opt");
		setRiteOpen(true);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-dvh w-full overflow-hidden bg-void text-bone",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationMount, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-b from-void/55 via-transparent to-void/80" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeftRail, {
				muted,
				spinPaused,
				collapsed,
				helpPulse: !helpSeen(tab),
				onHelp: () => {
					bump();
					setGuide((g) => g ? null : tab);
				},
				onView: openView,
				onRite: openRite,
				onMute: () => muteToggle(muted, setMuted),
				onCollapse: () => {
					if (collapsed) bump();
					else {
						setCollapsed(true);
						patchPrefs({ watchNave: true });
					}
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none relative z-10 flex h-full flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResourceBar, { compact: collapsed }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-0 flex-1" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-3 pb-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoalDock, {
							goal,
							stage,
							collapsed,
							onExpand: bump
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-chrome": true,
						className: cn("nidus-sheet", collapsed && "nidus-sheet-hide"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
							className: "min-h-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActiveTab, { verb: tip.verb })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabBar, {
						tab,
						setTab: (id) => {
							bump();
							setTab(id);
						}
					})
				]
			}),
			whisper && prefs.hints && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Whisper, {
				text: whisper,
				onDone: () => setWhisper(null)
			}),
			guide && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuideSheet, {
				screen: guide,
				onClose: () => setGuide(null)
			}),
			riteOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-auto absolute inset-x-3 bottom-16 z-30",
				"data-chrome": true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPanel, {
					start: riteStart,
					onClose: () => setRiteOpen(false)
				})
			}),
			waking && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WakeOverlay, {}),
			gift && !waking && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GiftOverlay, {}),
			showBrief && !waking && !gift && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BriefOverlay, {})
		]
	});
}
function ResourceBar({ compact }) {
	const ore = useNidus((s) => s.ore);
	const parts = useNidus((s) => s.parts);
	const charge = useNidus((s) => s.charge);
	const spark = useNidus((s) => s.spark);
	const sparkNeed = useNidus((s) => s.sparkNeed);
	const echo = useNidus((s) => s.echo);
	const hiveRank = useNidus((s) => s.hiveRank);
	const waking = useNidus((s) => s.waking);
	const lastSaveAt = useNidus((s) => s.lastSaveAt);
	const s = useNidus();
	const r = rates(s, Date.now());
	const fresh = Date.now() - lastSaveAt < 6e3;
	const [open, setOpen] = (0, import_react.useState)(null);
	const starve = chargeStarve(s);
	const hot = sparkHot(s);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "pointer-events-auto px-3 pt-[max(0.45rem,env(safe-area-inset-top))]",
		"data-chrome": true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("flex items-center justify-between gap-1.5 border border-border bg-nave/80 px-2 backdrop-blur-sm", compact ? "py-1" : "py-1.5"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "nidus-rank text-left",
					title: "Hive rank",
					onClick: () => setOpen(open === "RANK" ? null : "RANK"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[0.55rem] tracking-[0.18em] text-muted",
						children: "RANK"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xs tabular-nums text-gilt",
						children: hiveTitle(hiveRank)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
					label: "ORE",
					value: fmt(ore),
					sub: compact ? void 0 : `${fmt(r.orePerSec * 60)}/m`,
					cap: oreCap(s),
					cur: ore,
					onTap: setOpen
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
					label: "PARTS",
					value: fmt(parts),
					sub: compact ? void 0 : `${fmt(r.partsPerSec * 60)}/m`,
					cap: partsCap(s),
					cur: parts,
					onTap: setOpen
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
					label: "CHARGE",
					value: fmt(charge),
					cap: chargeCap(s),
					cur: charge,
					venom: true,
					starve,
					onTap: setOpen
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: cn("min-w-[4rem] text-left", hot && "nidus-spark"),
					onClick: () => setOpen(open === "SPARK" ? null : "SPARK"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[0.55rem] tracking-[0.18em] text-muted",
							children: "SPARK"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-xs tabular-nums text-venom",
							children: waking ? "WOKE" : `${Math.floor(spark)}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-0.5 h-0.5 w-full bg-iron",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-0.5 bg-venom",
								style: { width: `${Math.min(100, spark / sparkNeed * 100)}%` }
							})
						})
					]
				}),
				echo > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "text-left",
					onClick: () => setOpen(open === "ECHO" ? null : "ECHO"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[0.55rem] tracking-[0.18em] text-muted",
						children: "ECHO"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xs tabular-nums text-gilt",
						children: echo
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("h-1.5 w-1.5 shrink-0 rounded-full", fresh ? "bg-venom" : "bg-iron"),
					title: "autosave"
				})
			]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-1 pt-1 text-center text-[0.65rem] text-gilt",
			children: gloss(open)
		})]
	});
}
function Chip({ label, value, sub, cap, cur, venom, starve, onTap }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		className: cn("min-w-0 text-left", starve && "nidus-pulse"),
		onClick: () => onTap(label),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[0.55rem] tracking-[0.18em] text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("font-display text-xs tabular-nums", venom ? "text-venom" : "text-bone"),
				children: value
			}),
			sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[0.55rem] tabular-nums text-gilt-dim",
				children: sub
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-0.5 h-0.5 w-10 bg-iron",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("h-0.5", venom ? "bg-venom" : "bg-gilt"),
					style: { width: `${Math.min(100, cur / cap * 100)}%` }
				})
			})
		]
	});
}
function TabBar({ tab, setTab }) {
	const waking = useNidus((s) => s.waking);
	const raiding = useNidus((s) => Boolean(s.raid));
	const verb = useNidus((s) => advise(s).verb);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		"data-chrome": true,
		className: "pointer-events-auto grid grid-cols-4 gap-1 border-t border-border bg-nave/95 px-2 pb-[max(0.45rem,env(safe-area-inset-bottom))] pt-1.5",
		children: [
			{
				id: "hull",
				label: "HULL"
			},
			{
				id: "forge",
				label: "FORGE"
			},
			{
				id: "raid",
				label: "RAID"
			},
			{
				id: "minds",
				label: "MINDS"
			}
		].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => setTab(t.id),
			className: cn("nidus-cut relative min-h-11 font-display text-[0.7rem] tracking-[0.22em]", tab === t.id ? "nidus-cut-on" : "text-muted", pulse(t.id === "forge" && verb === "PRINT" || t.id === "raid" && (verb === "RAID" || verb === "BOOST") || t.id === "minds" && verb === "WAKE")),
			children: [
				t.label,
				t.id === "minds" && waking && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute right-2 top-1 h-1.5 w-1.5 rounded-full bg-venom" }),
				t.id === "raid" && raiding && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute right-2 top-1 h-1.5 w-1.5 rounded-full bg-gilt" })
			]
		}, t.id))
	});
}
function ActiveTab({ verb }) {
	const tab = useNidus((s) => s.tab);
	if (tab === "forge") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForgeTab, { verb });
	if (tab === "raid") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RaidTab, { verb });
	if (tab === "minds") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MindsTab, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HullTab, { verb });
}
function HullTab({ verb }) {
	const surge = useNidus((s) => s.surge);
	const surgeUntil = useNidus((s) => s.surgeUntil);
	const rooms = useNidus((s) => s.rooms);
	const queued = useNidus((s) => s.queuedRoom);
	const queue = useNidus((s) => s.queue);
	const doMolt = useNidus((s) => s.doMolt);
	const echo = useNidus((s) => s.echo);
	const moltLayer = useNidus((s) => s.moltLayer);
	const tech = useNidus((s) => s.tech);
	const slag = useNidus((s) => s.slag);
	const slagAt = useNidus((s) => s.slagAt);
	const scripts = useNidus((s) => s.scripts);
	const toggleScripts = useNidus((s) => s.toggleScripts);
	const now = Date.now();
	const surging = now < surgeUntil;
	const slagReady = now >= slagAt;
	const s = useNidus();
	const full = packed(s);
	const nextRoom = ROOMS.find((r) => r.id !== "foundry" && !rooms[r.id].built && !roomLockWhy(s, r.id));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none flex flex-col justify-end gap-1.5 p-2",
		children: [
			s.orders?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-auto flex gap-1.5 overflow-x-auto",
				children: s.orders.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-32 shrink-0 border border-gilt/30 bg-nave/80 px-1.5 py-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-[0.55rem] tracking-[0.14em] text-gilt",
							children: o.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[0.6rem] text-muted",
							children: o.hint
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-0.5 h-0.5 bg-iron",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-0.5 bg-venom",
								style: { width: `${Math.min(100, o.have / o.need * 100)}%` }
							})
						})
					]
				}, o.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-auto overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-1.5",
					children: ROOMS.map((r) => {
						const st = rooms[r.id];
						const lock = roomLockWhy(s, r.id);
						const ranking = s.rankingRoom === r.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: Boolean(lock) || (st.rank ?? 0) >= 5 && st.built,
							title: lock || r.bonus,
							onClick: () => {
								queue(r.id);
								chime("snap");
							},
							className: cn("nidus-cut min-w-[4.6rem] shrink-0 px-1.5 py-1.5 text-left", st.built ? "nidus-cut-gilt" : queued === r.id ? "text-venom" : lock ? "text-iron" : "text-bone", pulse(nextRoom?.id === r.id && verb === "BUILD")),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-[0.58rem] tracking-[0.14em]",
									children: r.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[0.58rem] tabular-nums text-muted",
									children: st.built ? ranking ? `R${st.rank ?? 0}…` : `R${st.rank ?? 0}` : lock ? lock : `${Math.floor(st.progress / r.work * 100)}%`
								}),
								!st.built && !lock && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "max-w-[6.4rem] truncate text-[0.5rem] tracking-[0.04em] text-gilt-dim",
									children: r.bonus
								}),
								st.built && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "max-w-[6.4rem] truncate text-[0.5rem] tracking-[0.04em] text-gilt-dim",
									children: r.bonus
								})
							]
						}, r.id);
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto flex gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: surging,
						onClick: () => {
							surge();
							chime("surge");
						},
						className: cn("nidus-cut min-h-11 flex-1 font-display text-[0.75rem] tracking-[0.32em]", surging ? "nidus-cut-venom" : "nidus-cut-on", pulse(verb === "SURGE")),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center justify-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-3.5" }), surging ? "SURGING" : "SURGE"]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: !slagReady,
						title: "Spare ore and a lick of spark. Seven second cool.",
						onClick: () => {
							slag();
							chime("print");
						},
						className: cn("nidus-cut min-h-11 px-3 font-display text-[0.7rem] tracking-[0.16em]", slagReady ? "nidus-cut-gilt" : "text-muted"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "size-3.5" }), "SLAG"]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Hive mind stamps, raises, rites, and raids.",
						onClick: () => toggleScripts(),
						className: cn("nidus-cut min-h-11 px-3 font-display text-[0.7rem] tracking-[0.14em]", scripts ? "nidus-cut-venom" : "text-muted"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brain, { className: "size-3.5" }), scripts ? "MIND" : "HIVE"]
						})
					}),
					tech.moltlock.done && echo >= moltCost(s) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => doMolt(),
						className: "min-h-11 border border-gilt px-3 font-display text-[0.7rem] tracking-[0.2em] text-gilt",
						children: [
							"MOLT ",
							moltCost(s),
							"E"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "pointer-events-none text-center text-[0.58rem] tracking-[0.16em] text-muted",
				children: [
					totalSwarm(s),
					"/",
					berthCap(s),
					full ? " PACKED" : " BERTHS",
					" · ",
					s.minds.filter((m) => m.alive).length,
					" MINDS · L",
					moltLayer
				]
			}),
			nextRoom && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "pointer-events-none text-center font-display text-[0.55rem] tracking-[0.18em] text-gilt",
				children: [
					"NEXT GROWS · ",
					nextRoom.label,
					" · ",
					nextRoom.bonus
				]
			})
		]
	});
}
function ForgeTab({ verb }) {
	const printCaste = useNidus((s) => s.printCaste);
	const setPrintCaste = useNidus((s) => s.setPrintCaste);
	const print = useNidus((s) => s.print);
	const autoPrint = useNidus((s) => s.autoPrint);
	const toggleAuto = useNidus((s) => s.toggleAuto);
	const swarm = useNidus((s) => s.swarm);
	const markHull = useNidus((s) => s.markHull);
	const expandPop = useNidus((s) => s.expandPop);
	const hullMark = useNidus((s) => s.hullMark);
	const s = useNidus();
	const cost = printCost(s);
	const cap = berthCap(s);
	const pop = expandCost(s);
	const full = packed(s);
	const icons = {
		miner: Pickaxe,
		fab: Factory,
		builder: Hammer,
		lab: FlaskConical,
		striker: Swords
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-auto flex flex-col justify-end gap-2 p-2",
		"data-chrome": true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border border-border bg-nave/90 p-2 backdrop-blur-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-1.5 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-[0.65rem] tracking-[0.24em] text-gilt",
						children: "SWARM"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: cn("font-display text-[0.58rem] tabular-nums tracking-[0.14em]", full ? "text-blood-bright" : "text-muted"),
						children: [
							totalSwarm(s),
							"/",
							cap
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-5 gap-1",
					children: CASTES.map((c) => {
						const Icon = icons[c.id];
						const on = printCaste === c.id;
						const mk = hullMark[c.id] ?? 0;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setPrintCaste(c.id),
							className: cn("nidus-cut flex min-h-14 flex-col items-center justify-center gap-0.5", on ? "nidus-cut-on" : ""),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5 text-gilt" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-[0.52rem] tracking-[0.12em]",
									children: c.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-base tabular-nums leading-none",
									children: swarm[c.id]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[0.5rem] text-muted",
									children: markName(mk)
								})
							]
						}, c.id);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1.5 text-center text-[0.65rem] tabular-nums text-muted",
					children: [
						cost.ore,
						"o · ",
						cost.parts,
						"p"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1.5 flex gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: s.ore < pop.ore || s.parts < pop.parts,
						title: "Buys berths. Packed swarm stops printing.",
						onClick: () => {
							expandPop();
							chime("snap");
						},
						className: cn("nidus-cut min-h-11 flex-1 font-display text-[0.6rem] tracking-[0.12em] disabled:opacity-40", pulse(full)),
						children: ["EXPAND +", pop.add]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: (hullMark[printCaste] ?? 0) >= 6,
						title: `Rank ${CASTES.find((c) => c.id === printCaste)?.label}. ${markCost(hullMark[printCaste] ?? 0).parts} parts.`,
						onClick: () => markHull(printCaste),
						className: "nidus-cut min-h-11 px-2 font-display text-[0.6rem] tracking-[0.12em] text-bone disabled:opacity-40",
						children: [
							"MARK ",
							markCost(hullMark[printCaste] ?? 0).parts,
							"p"
						]
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => {
					print();
					chime("print");
				},
				className: cn("nidus-cut nidus-cut-on min-h-11 flex-1 font-display text-[0.8rem] tracking-[0.32em]", pulse(verb === "PRINT")),
				children: "PRINT"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				title: "Stamp while you are gone.",
				onClick: toggleAuto,
				className: cn("nidus-cut min-h-11 px-3 font-display text-[0.7rem] tracking-[0.16em]", autoPrint ? "nidus-cut-venom" : "text-muted", pulse(verb === "AUTO" && !autoPrint)),
				children: "AUTO"
			})]
		})]
	});
}
function RaidTab({ verb }) {
	const raidNode = useNidus((s) => s.raid?.node ?? null);
	const raidEnds = useNidus((s) => s.raid?.endsAt ?? 0);
	const raidHp = useNidus((s) => s.raid?.hp ?? 0);
	const raidHpMax = useNidus((s) => s.raid?.hpMax ?? 1);
	const raidHull = useNidus((s) => s.raid?.hull ?? 0);
	const raidHullMax = useNidus((s) => s.raid?.hullMax ?? 1);
	const watching = useNidus((s) => Boolean(s.raid?.watching));
	const boostUntil = useNidus((s) => s.raid?.boostUntil ?? 0);
	const beat = useNidus((s) => s.raid?.beat ?? "");
	const send = useNidus((s) => s.launchRaid);
	const watchWell = useNidus((s) => s.watchWell);
	const boostWell = useNidus((s) => s.boostWell);
	const markHull = useNidus((s) => s.markHull);
	const strikers = useNidus((s) => s.swarm.striker);
	const mark = useNidus((s) => s.hullMark.striker);
	const cleared = useNidus((s) => s.raidCleared);
	const s = useNidus();
	const cost = markCost(mark);
	const boosted = Date.now() < boostUntil;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-auto flex max-h-[46dvh] flex-col justify-end gap-1.5 overflow-y-auto p-2",
		"data-chrome": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border border-border bg-nave/90 px-2 py-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-[0.58rem] tracking-[0.18em] text-gilt",
					children: markName(mark)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[0.62rem] tabular-nums text-muted",
					children: [strikers, " HULLS"]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					disabled: mark >= 6 || s.ore < cost.ore || s.parts < cost.parts,
					title: `Bigger strikers. ${cost.parts} parts.`,
					onClick: () => markHull("striker"),
					className: "min-h-10 border border-gilt px-2 font-display text-[0.6rem] tracking-[0.14em] text-gilt disabled:border-iron disabled:text-muted",
					children: [
						"MARK ",
						cost.parts,
						"p"
					]
				})]
			}),
			raidNode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border border-venom bg-nave/90 p-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-display text-[0.65rem] tracking-[0.24em] text-venom",
						children: [
							beat || "ORBIT",
							" · ",
							RAIDS.find((r) => r.id === raidNode)?.label
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-1 text-[0.62rem] tabular-nums text-muted",
						children: fmtTime(Math.max(0, (raidEnds - Date.now()) / 1e3))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-1 h-1 bg-iron",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-1 bg-blood-bright",
							style: { width: `${Math.min(100, raidHp / Math.max(1, raidHpMax) * 100)}%` }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-1.5 h-1 bg-iron",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-1 bg-gilt",
							style: { width: `${Math.min(100, raidHull / Math.max(1, raidHullMax) * 100)}%` }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: cn("min-h-11 flex-1 font-display text-[0.7rem] tracking-[0.16em]", watching ? "bg-venom text-void" : "border border-border text-bone", pulse(verb === "RAID" && !watching)),
							onClick: () => watchWell(!watching),
							children: watching ? "WATCHING" : "WATCH"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: boosted || s.charge < 8,
							className: cn("min-h-11 flex-1 font-display text-[0.7rem] tracking-[0.16em]", boosted ? "bg-gilt text-void" : "border border-gilt text-gilt", pulse(verb === "BOOST")),
							onClick: () => {
								boostWell();
								chime("surge");
							},
							children: boosted ? "COMMAND" : "BOOST"
						})]
					})
				]
			}),
			Object.values(s.salvage ?? {}).some((n) => n > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border border-border bg-nave/80 px-2 py-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-1 text-center font-display text-[0.55rem] tracking-[0.12em] text-gilt",
					children: [
						"ice",
						"plate",
						"bone",
						"rose",
						"core"
					].filter((k) => (s.salvage?.[k] ?? 0) > 0).map((k) => `${k.toUpperCase()} ${s.salvage?.[k]}`).join(" · ")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1",
					children: [
						"ice",
						"plate",
						"bone",
						"rose",
						"core"
					].map((k) => {
						const spec = SALVAGE_COOK[k];
						const open = cookUnlocked(s, k);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: !open,
							title: spec.line,
							onClick: () => useNidus.getState().cook(k),
							className: cn("nidus-cut min-h-9 px-2 font-display text-[0.52rem] tracking-[0.12em]", open ? "nidus-cut-gilt" : "text-iron"),
							children: [
								spec.label,
								" ",
								k.toUpperCase()
							]
						}, k);
					})
				})]
			}),
			RAIDS.map((node) => {
				const why = raidLockWhy(s, node.id);
				const open = !why;
				const done = cleared.includes(node.id);
				const need = raidNeed(s, node.id);
				const times = s.raidCount?.[node.id] ?? 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					disabled: !open || Boolean(raidNode) || strikers < need,
					title: why || node.blurb,
					onClick: () => {
						send(node.id);
						chime("raid");
					},
					className: cn("relative min-h-[4.2rem] overflow-hidden border text-left", open ? "border-border" : "border-iron opacity-55", pulse(open && verb === "RAID" && node.id === "ice" && !raidNode)),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: node.image,
							alt: "",
							className: "absolute inset-0 h-full w-full object-cover",
							crossOrigin: "anonymous"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-r from-void via-void/70 to-void/20" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative z-10 flex h-full flex-col justify-end p-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-sm tracking-[0.16em]",
								children: node.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[0.62rem] tabular-nums text-muted",
								children: [open ? `${need} ${markName(mark)} · ${fmtTime(node.seconds)}` : why, done ? times > 1 ? ` · ×${times}` : " · CLEARED" : ""]
							})]
						})
					]
				}, node.id);
			})
		]
	});
}
function MindsTab() {
	const minds = useNidus((s) => s.minds);
	const selected = useNidus((s) => s.selectedMind);
	const selectMind = useNidus((s) => s.selectMind);
	const setJob = useNidus((s) => s.setJob);
	const seat = useNidus((s) => s.seat);
	const melt = useNidus((s) => s.melt);
	const waking = useNidus((s) => s.waking);
	const spark = useNidus((s) => s.spark);
	const sparkNeed = useNidus((s) => s.sparkNeed);
	const s = useNidus();
	const live = minds.filter((m) => m.alive);
	const mind = live.find((m) => m.id === selected) ?? live[0];
	const icons = {
		mine: Pickaxe,
		forge: Factory,
		build: Hammer,
		lab: FlaskConical,
		raid: Swords
	};
	if (waking) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-auto p-2",
		"data-chrome": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-1 text-center font-display text-[0.65rem] tracking-[0.24em] text-gilt",
			children: "PICK A COMMANDER"
		})
	});
	if (!mind) {
		const pct = Math.min(100, spark / Math.max(1, sparkNeed) * 100);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none flex items-end justify-center p-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "nidus-cut w-full max-w-sm bg-nave/85 p-3 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-[0.7rem] tracking-[0.2em] text-gilt",
						children: "NO COMMANDER YET"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-[0.8rem] text-bone",
						children: "SPARK fills while the swarm works. Full bar. Three bodies. One stays."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 h-1.5 bg-iron",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-1.5 bg-venom",
							style: { width: `${pct}%` }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-[0.65rem] tabular-nums text-muted",
						children: [
							Math.floor(spark),
							" / ",
							sparkNeed
						]
					})
				]
			})
		});
	}
	const spec = FRAMES[mind.frame];
	const post = POSTS[mind.job];
	const born = framePost(mind.frame);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-auto flex flex-col justify-end gap-1.5 p-2",
		"data-chrome": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative overflow-hidden border border-gilt/30 bg-nave/90",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: mind.portrait,
					alt: "",
					className: "h-36 w-full object-cover object-top",
					crossOrigin: "anonymous"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-x-0 bottom-0 bg-gradient-to-t from-void to-transparent p-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-[0.55rem] tracking-[0.22em] text-gilt",
							children: "COMMANDER"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl leading-none",
							children: mind.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: cn("font-display text-[0.65rem] tracking-[0.16em]", rarityColor[mind.rarity]),
							children: [
								spec.label,
								" · BORN ",
								born.label,
								" · NOW ",
								post.label
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[0.75rem] text-bone",
							children: mindPostLine(mind)
						}),
						mindTalent(mind.level) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-[0.55rem] tracking-[0.14em] text-venom",
							children: mindTalent(mind.level)?.label
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-1 overflow-x-auto",
				children: [live.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					title: `${m.name} · ${POSTS[m.job].label}`,
					onClick: () => selectMind(m.id),
					className: cn("h-12 w-10 shrink-0 overflow-hidden border", m.id === mind.id ? "border-gilt" : "border-border"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: m.portrait,
						alt: "",
						className: "h-full w-full object-cover",
						crossOrigin: "anonymous"
					})
				}, m.id)), Array.from({ length: Math.max(0, throneCap(s) - live.length) }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-12 w-10 shrink-0 border border-dashed border-iron" }, i))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-center text-[0.65rem] text-muted",
				children: ["POST — seated multiplies that rate. ", mind.fracture]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-5 gap-1",
				children: JOBS.map((j) => {
					const Icon = icons[j.id];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						title: POSTS[j.id].does,
						onClick: () => setJob(mind.id, j.id),
						className: cn("nidus-cut flex min-h-11 flex-col items-center justify-center", mind.job === j.id ? "nidus-cut-on" : "text-muted"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-[0.52rem] tracking-[0.1em]",
							children: POSTS[j.id].label
						})]
					}, j.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "nidus-cut min-h-11 flex-1 font-display text-[0.62rem] tracking-[0.12em]",
						onClick: () => seat(mind.id),
						children: mind.seated ? "UNSEAT · HALF" : "SEAT · FULL"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: !mind.wounded || s.charge < (s.tech.flesh2?.done ? 2 : s.tech.mindheal?.done ? 4 : 8),
						title: "Charge mends a wound.",
						className: "nidus-cut min-h-11 px-2 font-display text-[0.62rem] tracking-[0.12em] text-venom disabled:opacity-40",
						onClick: () => {
							useNidus.getState().heal(mind.id);
							chime("wake");
						},
						children: "HEAL"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: s.echo < 3,
						title: "Spend 3 Echo to rank them.",
						className: "nidus-cut min-h-11 px-2 font-display text-[0.62rem] tracking-[0.12em] text-gilt disabled:opacity-40",
						onClick: () => useNidus.getState().promote(mind.id),
						children: "MARK"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "nidus-cut min-h-11 px-2 font-display text-[0.62rem] tracking-[0.12em] text-blood-bright",
						onClick: () => melt(mind.id),
						children: "UNMAKE"
					})
				]
			})
		]
	});
}
function WakeOverlay() {
	const waking = useNidus((s) => s.waking);
	const pick = useNidus((s) => s.pickWake);
	if (!waking) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 z-30 flex flex-col justify-end bg-void/80 p-3",
		"data-chrome": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-1 text-center font-display text-[0.7rem] tracking-[0.24em] text-gilt",
				children: "THREE COMMANDERS. ONE POST."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-center text-[0.7rem] text-muted",
				children: "Pick the job you need. The rest ash."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-2",
				children: waking.map((c, i) => {
					const post = framePost(c.frame);
					const top = Object.entries(c.stats).sort((a, b) => b[1] - a[1])[0];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							pick(i);
							chime("wake");
						},
						className: "nidus-cut overflow-hidden bg-nave text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: c.portrait,
							alt: "",
							className: "h-28 w-full object-cover object-top",
							crossOrigin: "anonymous"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-[0.7rem] tracking-[0.16em] text-gilt",
									children: post.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: cn("font-display text-[0.58rem] tracking-[0.12em]", rarityColor[c.rarity]),
									children: FRAMES[c.frame].label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-sm leading-tight",
									children: c.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[0.7rem] text-bone",
									children: post.does
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[0.6rem] tabular-nums text-muted",
									children: [
										top?.[0].toUpperCase(),
										" ",
										top?.[1]
									]
								})
							]
						})]
					}, c.name + i);
				})
			})
		]
	});
}
function GiftOverlay() {
	const gift = useNidus((s) => s.pendingGift);
	const claim = useNidus((s) => s.claimIdle);
	if (!gift) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 flex items-end justify-center bg-void/75 p-4",
		"data-chrome": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm border border-gilt bg-nave p-3 nidus-pulse",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-display text-[0.65rem] tracking-[0.28em] text-gilt",
					children: ["WHILE YOU SLEPT · ", fmtTime(gift.seconds)]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-[0.7rem] text-muted",
					children: "The hive held this. Claim it and the furnace drinks."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 grid grid-cols-3 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border border-border bg-void/50 px-1.5 py-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[0.5rem] tracking-[0.16em] text-muted",
								children: "ORE"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-lg tabular-nums text-bone",
								children: fmt(gift.ore)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border border-border bg-void/50 px-1.5 py-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[0.5rem] tracking-[0.16em] text-muted",
								children: "PARTS"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-lg tabular-nums text-gilt",
								children: fmt(gift.parts)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border border-border bg-void/50 px-1.5 py-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[0.5rem] tracking-[0.16em] text-muted",
								children: "SPARK"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-display text-lg tabular-nums text-venom",
								children: ["+", gift.spark]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "nidus-cut nidus-cut-on mt-3 min-h-11 w-full font-display tracking-[0.28em] text-bone",
					onClick: () => {
						claim();
						chime("wake");
					},
					children: "CLAIM THE CUT"
				})
			]
		})
	});
}
function BriefOverlay() {
	const card = useNidus((s) => s.briefing[0]);
	const dismiss = useNidus((s) => s.dismissBrief);
	(0, import_react.useEffect)(() => {
		const t = window.setTimeout(() => dismiss(), 3200);
		return () => window.clearTimeout(t);
	}, [card?.id, dismiss]);
	if (!card) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"data-chrome": true,
		className: "absolute inset-x-0 top-20 z-20 mx-auto w-[min(92%,22rem)] border border-border bg-nave/95 p-2.5 text-left",
		onClick: () => dismiss(),
		children: [
			card.portrait && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: card.portrait,
				alt: "",
				className: "mb-1.5 h-12 w-9 object-cover",
				crossOrigin: "anonymous"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-[0.6rem] tracking-[0.24em] text-gilt",
				children: card.stamp
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-base",
				children: card.headline
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[0.8rem] text-muted",
				children: card.line
			})
		]
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NidusApp, {});
}
//#endregion
export { useNidus as a, subscribeSpin as i, camPosition as n, ROOMS as o, getPrefs as r, routes_exports as t };
