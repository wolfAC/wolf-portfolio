// Prop placement generators (Phase E). Deterministic (seeded RNG per prop type,
// not Math.random()) so the city looks the same on every visit. Unlike
// CyberCityBuildingPlacements.js's buildings (fixed, must not overlap), these
// props are all *dynamic* physics bodies -- a little initial overlap self-
// resolves via the physics simulation within the first second, so no
// collision-avoidance/retry logic is needed here, keeping this much simpler.
import { alea } from 'seedrandom'
import { CYBER_CITY_LAYOUT } from './CyberCityLayout.js'

function normalizeAngle(angle)
{
    let normalized = angle % (Math.PI * 2)
    if(normalized > Math.PI)
        normalized -= Math.PI * 2
    if(normalized < -Math.PI)
        normalized += Math.PI * 2
    return normalized
}

// Scatters `countPerDistrict` points around each district's own center, at a
// random radius/angle within [minRadius, maxRadius], skipping the wedge each
// district's gate spur enters from (see CyberCityBuildingPlacements.js, same
// convention) so props don't spawn on top of the road.
export function scatterNearDistricts(seedKey, countPerDistrict, minRadius, maxRadius)
{
    const rng = new alea(seedKey)
    const placements = []
    const spurClearHalfAngle = 30 * (Math.PI / 180)

    for(const district of CYBER_CITY_LAYOUT.districts)
    {
        const spurAngle = (district.angleDeg + 180) * (Math.PI / 180)

        let placed = 0
        let attempts = 0

        while(placed < countPerDistrict && attempts < countPerDistrict * 4)
        {
            attempts++

            const angle = rng() * Math.PI * 2
            if(Math.abs(normalizeAngle(angle - spurAngle)) < spurClearHalfAngle)
                continue

            const radius = minRadius + rng() * (maxRadius - minRadius)

            placements.push({
                id: `${district.id}-${seedKey}-${placed}`,
                districtId: district.id,
                position: {
                    x: district.position.x + Math.cos(angle) * radius,
                    z: district.position.z + Math.sin(angle) * radius
                },
                rotationY: rng() * Math.PI * 2
            })
            placed++
        }
    }

    return placements
}

// Evenly-spaced points along the ring road and every radial avenue, offset to
// one side (toward the sidewalk, not the road surface) -- for streetlights.
// Only the ring + radials are lit (not gate spurs/alley connectors), to keep
// the total count reasonable.
export function scatterAlongMainRoads(spacing, sideOffset)
{
    const placements = []
    const layout = CYBER_CITY_LAYOUT
    let index = 0

    // Ring road: light both the inner and outer edge.
    const ringCircumference = Math.PI * 2 * layout.ringRoad.radius
    const ringSteps = Math.round(ringCircumference / spacing)

    for(let i = 0; i < ringSteps; i++)
    {
        const angle = (i / ringSteps) * Math.PI * 2
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)

        for(const side of [ -1, 1 ])
        {
            const radius = layout.ringRoad.radius + side * sideOffset
            placements.push({
                id: `streetlight-ring-${index++}`,
                position: { x: radius * cos, z: radius * sin },
                rotationY: angle + Math.PI / 2
            })
        }
    }

    // Radial avenues: light both sides, from the hub edge out to the ring.
    for(const district of layout.districts)
    {
        const angle = district.angleDeg * (Math.PI / 180)
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        const perpX = -sin
        const perpZ = cos

        const length = layout.ringRoad.radius - layout.hub.radius
        const steps = Math.max(1, Math.round(length / spacing))

        for(let i = 1; i < steps; i++)
        {
            const t = i / steps
            const radius = layout.hub.radius + t * length
            const centerX = radius * cos
            const centerZ = radius * sin

            for(const side of [ -1, 1 ])
            {
                placements.push({
                    id: `streetlight-avenue-${district.id}-${index++}`,
                    position: {
                        x: centerX + side * sideOffset * perpX,
                        z: centerZ + side * sideOffset * perpZ
                    },
                    rotationY: angle
                })
            }
        }
    }

    return placements
}
