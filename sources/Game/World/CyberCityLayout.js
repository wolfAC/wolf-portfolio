// Cyber City hub-and-ring road layout (Phase A3 design decision).
// Runtime copy of audit/assets/cyber-city-layout.json — keep both in sync if this
// layout ever changes. World units, ground-plane (x, z), matching
// Game/Terrain.js's positionWorld.xz convention. Origin (0, 0) is the spawn hub.
// Angles are degrees, standard math convention (0deg = +x, increasing
// counter-clockwise viewed from above): position = radius * (cos(angle), sin(angle)).

export const CYBER_CITY_LAYOUT = {
    worldFootprint: {
        halfExtent: 130,
        totalSize: 260
    },
    hub: {
        id: 'transitNexus',
        name: 'Transit Nexus',
        position: { x: 0, z: 0 },
        radius: 18,
        area: 'landing'
    },
    ringRoad: {
        id: 'innerRing',
        radius: 90,
        width: 8
    },
    radialAvenues: {
        width: 8
    },
    gateSpurs: {
        width: 6
    },
    alleyConnectors: {
        width: 4
    },
    sidewalkWidth: 2,
    // Trimmed from 6 districts / 6 alley nodes to 2 / 5 (Phase L): broadcastPlaza (social),
    // undercroftYard (lab), skylineObservatory (achievements), devCircuit (circuit), and
    // archiveSubstation (behindTheScene) pointed at Area classes deleted in commit 443974e,
    // leaving fully-built roads/buildings/props with no content at the other end. Rather than
    // leave dead-end plazas, those slots were removed outright -- see phase-l-implementation-notes.md
    // for the reasoning and for where the two orphaned hero landmarks (skylineObservatory,
    // broadcastPlaza) were relocated to instead of being deleted with their districts.
    districts: [
        { id: 'corporateSpire',      name: 'Corporate Spire District',    area: 'career',       angleDeg: 0,   radius: 112, footprintRadius: 15, position: { x: 112.0,  z: 0.0 } },
        { id: 'holoBazaar',          name: 'Holo-Bazaar',                 area: 'projects',     angleDeg: 60,  radius: 112, footprintRadius: 15, position: { x: 56.0,   z: 96.99 } }
    ],
    alleyNodes: [
        { id: 'overclockArcade',    name: 'Overclock Arcade',     area: 'bowling',        angleDeg: 90,  radius: 80, footprintRadius: 8, position: { x: 0.0,    z: 80.0 } },
        { id: 'serverShrine',       name: 'Server Shrine',        area: 'altar',          angleDeg: 150, radius: 80, footprintRadius: 8, position: { x: -69.28, z: 40.0 } },
        { id: 'glitchVendorAlley',  name: 'Glitch Vendor Alley',  area: 'cookie',         angleDeg: 210, radius: 80, footprintRadius: 8, position: { x: -69.28, z: -40.0 } },
        { id: 'malfunctionStall',   name: 'Malfunction Stall',    area: 'toilet',         angleDeg: 270, radius: 80, footprintRadius: 8, position: { x: 0.0,    z: -80.0 } },
        { id: 'chronoTerminal',     name: 'Chrono Terminal',      area: 'timeMachine',    angleDeg: 330, radius: 80, footprintRadius: 8, position: { x: 69.28,  z: -40.0 } }
    ]
}
