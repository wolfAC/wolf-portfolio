import * as THREE from 'three/webgpu'
import { Game } from './Game.js'
import { CYBER_CITY_LAYOUT } from './World/CyberCityLayout.js'

// Phase A2 (audit/phase-a2-district-mapping.md) mapped every original area name
// onto a new Cyber City location, and Roads.js already builds the actual road
// network from that same layout -- but static/respawns/respawnsReferences.glb
// still holds Bruno Simon's original respawn coordinates (tied to the old map).
// Left unpatched, "landing" (the default spawn) sits in empty space between the
// new road avenues, ~55 units from the new hub, nowhere near any road/building
// content. This builds an override table straight from CYBER_CITY_LAYOUT (the
// same source of truth Roads.js/Buildings.js use) so every named respawn that
// has a Cyber City equivalent lands ON the new road network instead.
function buildRespawnOverrides()
{
    const overrides = new Map()

    overrides.set(CYBER_CITY_LAYOUT.hub.area, {
        position: new THREE.Vector3(CYBER_CITY_LAYOUT.hub.position.x, 4, CYBER_CITY_LAYOUT.hub.position.z),
        rotation: 0, // faces +X, i.e. toward the 0deg (Corporate Spire) avenue
    })

    // District/alley respawns: placed at the exact point Roads.js's own road
    // geometry ends (a district's gate spur stops short, at radius - footprint,
    // so it doesn't cut into the building-placement zone; an alley connector
    // instead runs all the way to the alley node's own position -- see
    // Roads.js's setGeometry() for both), not the district's building-scatter
    // center, so the spawn is guaranteed to sit on a road.
    const placeAtRoadEnd = (entry, roadEndRadius) =>
    {
        const angleRad = entry.angleDeg * (Math.PI / 180)
        const x = Math.cos(angleRad) * roadEndRadius
        const z = Math.sin(angleRad) * roadEndRadius

        // three.js Y-axis rotation runs the opposite way from this layout's
        // angle convention (see CyberCityLayout.js) -- negate so the vehicle
        // ends up facing outward, into the district, not back toward the hub.
        overrides.set(entry.area, {
            position: new THREE.Vector3(x, 4, z),
            rotation: -angleRad,
        })
    }

    for(const district of CYBER_CITY_LAYOUT.districts)
        placeAtRoadEnd(district, district.radius - district.footprintRadius)

    for(const alley of CYBER_CITY_LAYOUT.alleyNodes)
        placeAtRoadEnd(alley, alley.radius)

    return overrides
}

export class Respawns
{
    constructor(defaultName = 'landing')
    {
        this.game = Game.getInstance()
        this.defaultName = defaultName

        this.setItems()
    }

    setItems()
    {
        this.items = new Map()

        const overrides = buildRespawnOverrides()

        for(const child of this.game.resources.respawnsReferencesModel.scene.children)
        {
            child.rotation.reorder('YXZ')

            let name = child.name.replace(/^respawn(.+)$/i, '$1')

            name = name.charAt(0).toLowerCase() + name.slice(1)

            const override = overrides.get(name)

            const item = {
                name: name,
                position: override ? override.position.clone() : new THREE.Vector3(
                    child.position.x,
                    4,
                    child.position.z
                ),
                rotation: override ? override.rotation : child.rotation.y
            }

            this.items.set(name, item)
        }
    }

    getByName(name)
    {
        return this.items.get(name)
    }

    getDefault()
    {
        return this.items.get(this.defaultName)
    }

    getClosest(position)
    {
        let closestItem = null
        let closestDistance = Infinity

        this.items.forEach((item) =>
        {
            const distance = Math.hypot(item.position.x - position.x, item.position.z - position.z)

            if(distance < closestDistance)
            {
                closestDistance = distance
                closestItem = item
            }
        })

        return closestItem
    }
}
