// Building placement list (Phase D6). Plain, deterministic data, kept separate
// from the geometry-building code in Buildings.js so layout can be tuned without
// touching any mesh code. Deterministic (seeded RNG, not Math.random()) so the
// city looks the same on every visit rather than reshuffling each session.
import { alea } from 'seedrandom'
import { CYBER_CITY_LAYOUT } from './CyberCityLayout.js'
import { BUILDING_ARCHETYPES } from './CyberCityBuildingArchetypes.js'

const ARCHETYPE_IDS = Object.keys(BUILDING_ARCHETYPES)

// Regular buildings alternate through the palette's magenta/cyan/amber accents.
// The acid-green beacon color is reserved for the Skyline Observatory hero
// landmark only (see phase-a1-art-direction-brief.md) and never used here.
const DISTRICT_TINTS = {
    corporateSpire: '#ff2e8a',
    holoBazaar: '#28e0ff',
    broadcastPlaza: '#ffb020',
    undercroftYard: '#28e0ff',
    skylineObservatory: '#ff2e8a',
    devCircuit: '#ffb020'
}

function normalizeAngle(angle)
{
    let normalized = angle % (Math.PI * 2)
    if(normalized > Math.PI)
        normalized -= Math.PI * 2
    if(normalized < -Math.PI)
        normalized += Math.PI * 2
    return normalized
}

// Scatters buildings in two rings around a district's own center, in local
// (district-relative) space, leaving a wedge clear in the direction the gate
// spur enters from (see CyberCityLayout.js) so the road isn't blocked.
// Minimum gap kept between two buildings' circumscribed circles, world units.
const MIN_BUILDING_GAP = 0.6

function overlapsAnyPlaced(x, z, halfWidth, halfDepth, placed)
{
    const radius = Math.hypot(halfWidth, halfDepth)

    for(const other of placed)
    {
        const distance = Math.hypot(x - other.position.x, z - other.position.z)
        const otherRadius = Math.hypot(other.halfWidth, other.halfDepth)

        if(distance < radius + otherRadius + MIN_BUILDING_GAP)
            return true
    }

    return false
}

function generateDistrictBuildings(district, rng)
{
    const buildings = []
    const innerClear = 3
    const outerLimit = district.footprintRadius - 2
    const spurAngle = (district.angleDeg + 180) * (Math.PI / 180)
    const spurClearHalfAngle = 35 * (Math.PI / 180)

    const rings = [
        { radius: innerClear + (outerLimit - innerClear) * 0.4, slots: 4 },
        { radius: innerClear + (outerLimit - innerClear) * 0.85, slots: 6 }
    ]

    let index = 0
    for(const ring of rings)
    {
        for(let slot = 0; slot < ring.slots; slot++)
        {
            const baseAngle = (slot / ring.slots) * Math.PI * 2

            if(Math.abs(normalizeAngle(baseAngle - spurAngle)) < spurClearHalfAngle)
                continue

            const archetypeId = ARCHETYPE_IDS[Math.floor(rng() * ARCHETYPE_IDS.length)]
            const archetype = BUILDING_ARCHETYPES[archetypeId]
            const [ minFootprint, maxFootprint ] = archetype.footprintRange
            const [ minMid, maxMid ] = archetype.midCountRange
            const halfWidth = minFootprint + rng() * (maxFootprint - minFootprint)
            const halfDepth = minFootprint + rng() * (maxFootprint - minFootprint)

            // Retry with shrinking jitter to find a non-overlapping slot; if none
            // is found, shrink the footprint itself as a last resort rather than
            // dropping the building outright (keeps the district populated).
            let localX = 0
            let localZ = 0
            let placed = false

            for(let attempt = 0; attempt < 6 && !placed; attempt++)
            {
                const jitterScale = 1 - attempt / 6
                const slotAngle = baseAngle + (rng() - 0.5) * 0.35 * jitterScale
                const jitteredRadius = ring.radius + (rng() - 0.5) * 1.5 * jitterScale
                const candidateX = district.position.x + Math.cos(slotAngle) * jitteredRadius
                const candidateZ = district.position.z + Math.sin(slotAngle) * jitteredRadius

                if(!overlapsAnyPlaced(candidateX, candidateZ, halfWidth, halfDepth, buildings))
                {
                    localX = candidateX
                    localZ = candidateZ
                    placed = true
                }
            }

            let finalHalfWidth = halfWidth
            let finalHalfDepth = halfDepth

            if(!placed)
            {
                // Last resort: keep the original candidate slot but shrink the
                // footprint until it clears its neighbors (floor at 60% size).
                const slotAngle = baseAngle
                localX = district.position.x + Math.cos(slotAngle) * ring.radius
                localZ = district.position.z + Math.sin(slotAngle) * ring.radius

                let shrink = 1
                while(shrink > 0.6 && overlapsAnyPlaced(localX, localZ, halfWidth * shrink, halfDepth * shrink, buildings))
                    shrink -= 0.1

                finalHalfWidth = halfWidth * shrink
                finalHalfDepth = halfDepth * shrink
            }

            buildings.push({
                id: `${district.id}-${index++}`,
                districtId: district.id,
                archetypeId,
                midCount: minMid + Math.floor(rng() * (maxMid - minMid + 1)),
                halfWidth: finalHalfWidth,
                halfDepth: finalHalfDepth,
                rotationY: rng() * Math.PI * 2,
                tint: DISTRICT_TINTS[district.id],
                position: {
                    x: localX,
                    z: localZ
                }
            })
        }
    }

    return buildings
}

// D4: three unique "hero" landmarks — same modular system, deliberately extreme
// parameters (height/taper/twin/footprint) rather than the regular per-district
// random ranges, so each reads as a one-of-a-kind skyline focal point.
function generateHeroLandmarks()
{
    const findDistrict = (id) => CYBER_CITY_LAYOUT.districts.find((district) => district.id === id)

    return [
        {
            id: 'hero-skylineObservatory',
            districtId: 'skylineObservatory',
            archetypeId: 'steppedZiggurat',
            midCount: 14,
            halfWidth: 3.2,
            halfDepth: 3.2,
            rotationY: 0,
            tint: '#8dff4f', // reserved beacon color — hero-only, see phase-a1-art-direction-brief.md
            position: {
                x: findDistrict('skylineObservatory').position.x,
                z: findDistrict('skylineObservatory').position.z + 6
            }
        },
        {
            id: 'hero-corporateSpire',
            districtId: 'corporateSpire',
            archetypeId: 'twinSpire',
            midCount: 11,
            halfWidth: 2.2,
            halfDepth: 2.2,
            rotationY: Math.PI * 0.25,
            tint: '#ff2e8a',
            position: {
                x: findDistrict('corporateSpire').position.x,
                z: findDistrict('corporateSpire').position.z + 6
            }
        },
        {
            id: 'hero-broadcastPlaza',
            districtId: 'broadcastPlaza',
            archetypeId: 'slabTower',
            midCount: 12,
            halfWidth: 1.2,
            halfDepth: 1.2,
            rotationY: 0,
            tint: '#28e0ff',
            position: {
                x: findDistrict('broadcastPlaza').position.x,
                z: findDistrict('broadcastPlaza').position.z + 6
            }
        }
    ]
}

function generatePlacements()
{
    const rng = new alea('cyberCityBuildings')
    const placements = []

    for(const district of CYBER_CITY_LAYOUT.districts)
        placements.push(...generateDistrictBuildings(district, rng))

    placements.push(...generateHeroLandmarks())

    return placements
}

export const CYBER_CITY_BUILDING_PLACEMENTS = generatePlacements()
