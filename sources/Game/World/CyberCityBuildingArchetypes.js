// Building archetypes (Phase D1/D2 — greybox massing kit). Four original silhouette
// families, each built from stacked box modules (base / repeated mid / roof) so a
// single archetype can vary in height without extra modeling. Shared by
// CyberCityBuildingPlacements.js (which samples footprintRange/midCountRange to
// generate placement data) and Buildings.js (which reads the height/taper/twin
// fields to build geometry).
export const BUILDING_ARCHETYPES = {
    slabTower: {
        baseHeight: 2.5,
        midHeight: 3.2,
        roofHeight: 1.6,
        taperPerLevel: 0,
        twin: false,
        footprintRange: [ 1.6, 2.2 ],
        midCountRange: [ 5, 9 ]
    },
    wideBlock: {
        baseHeight: 2.8,
        midHeight: 3.0,
        roofHeight: 1.2,
        taperPerLevel: 0,
        twin: false,
        footprintRange: [ 2.5, 3.5 ],
        midCountRange: [ 1, 3 ]
    },
    steppedZiggurat: {
        baseHeight: 2.5,
        midHeight: 3.0,
        roofHeight: 1.4,
        taperPerLevel: 0.07,
        twin: false,
        footprintRange: [ 2.0, 2.8 ],
        midCountRange: [ 4, 7 ]
    },
    twinSpire: {
        baseHeight: 2.5,
        midHeight: 3.2,
        roofHeight: 1.8,
        taperPerLevel: 0,
        twin: true,
        twinGapRatio: 0.55,
        footprintRange: [ 1.2, 1.6 ],
        midCountRange: [ 4, 8 ]
    }
}
