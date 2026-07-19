// Shared road-network math for the Phase B primitive asset generators.
// Single source of truth: audit/assets/cyber-city-layout.json (Phase A3).
// Reused by generate-terrain-model.mjs (physical heightfield) and
// generate-terrain-mask-texture.mjs (visual sidewalk/road/height mask) so both
// stay in agreement about where the road network actually is.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))

export function loadLayout()
{
    const layoutPath = path.join(here, '..', 'cyber-city-layout.json')
    return JSON.parse(readFileSync(layoutPath, 'utf8'))
}

export function distanceToSegment(px, pz, ax, az, bx, bz)
{
    const abx = bx - ax
    const abz = bz - az
    const lengthSquared = abx * abx + abz * abz

    if(lengthSquared === 0)
        return Math.hypot(px - ax, pz - az)

    let t = ((px - ax) * abx + (pz - az) * abz) / lengthSquared
    t = Math.max(0, Math.min(1, t))

    const closestX = ax + t * abx
    const closestZ = az + t * abz

    return Math.hypot(px - closestX, pz - closestZ)
}

/**
 * Returns a signed "insideness" value for the road network at world position (x, z).
 * Positive => inside a road shape (magnitude = distance to the nearest road edge, inward).
 * Negative => outside every road shape (magnitude = distance to the nearest road edge, outward).
 * Take the max across every road shape (hub, ring, radial avenues, gate spurs, alley connectors)
 * since a point only needs to be "inside" one of them to be a road pixel/vertex.
 */
export function roadInsideness(x, z, layout)
{
    const deg2rad = Math.PI / 180
    let best = -Infinity

    // Hub roundabout
    {
        const d = Math.hypot(x - layout.hub.position.x, z - layout.hub.position.z)
        best = Math.max(best, layout.hub.radius - d)
    }

    // Ring road (annulus)
    {
        const d = Math.hypot(x, z)
        const inside = layout.ringRoad.width / 2 - Math.abs(d - layout.ringRoad.radius)
        best = Math.max(best, inside)
    }

    // Radial avenues (hub edge -> ring) and gate spurs (ring -> district inner edge)
    for(const district of layout.districts)
    {
        const angle = district.angleDeg * deg2rad
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)

        const hubEdgeX = layout.hub.radius * cos
        const hubEdgeZ = layout.hub.radius * sin
        const ringX = layout.ringRoad.radius * cos
        const ringZ = layout.ringRoad.radius * sin

        const avenueDistance = distanceToSegment(x, z, hubEdgeX, hubEdgeZ, ringX, ringZ)
        best = Math.max(best, layout.radialAvenues.width / 2 - avenueDistance)

        const innerRadius = district.radius - district.footprintRadius
        const innerX = innerRadius * cos
        const innerZ = innerRadius * sin

        const spurDistance = distanceToSegment(x, z, ringX, ringZ, innerX, innerZ)
        best = Math.max(best, layout.gateSpurs.width / 2 - spurDistance)
    }

    // Alley connectors (ring -> alley node)
    for(const alley of layout.alleyNodes)
    {
        const angle = alley.angleDeg * deg2rad
        const ringX = layout.ringRoad.radius * Math.cos(angle)
        const ringZ = layout.ringRoad.radius * Math.sin(angle)

        const connectorDistance = distanceToSegment(x, z, ringX, ringZ, alley.position.x, alley.position.z)
        best = Math.max(best, layout.alleyConnectors.width / 2 - connectorDistance)
    }

    return best
}

export function clamp01(value)
{
    return Math.max(0, Math.min(1, value))
}

export function smoothstep(edge0, edge1, x)
{
    const t = clamp01((x - edge0) / (edge1 - edge0))
    return t * t * (3 - 2 * t)
}
