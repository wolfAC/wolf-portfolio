import * as THREE from 'three/webgpu'
import { color } from 'three/tsl'
import { Game } from '../Game.js'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'
import { scatterNearDistricts } from './CyberCityPropPlacements.js'
import { createProceduralPropGroup } from './ProceduralPropGroup.js'

// Replaces Bricks.js (Phase E1/E2). Small knockable scrap-metal crates
// scattered near every district, dark structure + an amber neon trim band --
// procedural geometry/placement instead of a loaded glTF, same reasoning as
// Roads.js/Buildings.js (no 3D authoring tool available here).
const WIDTH = 1.1
const HEIGHT = 0.8
const DEPTH = 1.3

export class ScrapCrates
{
    constructor()
    {
        this.game = Game.getInstance()

        const group = new THREE.Group()

        const structureGeometry = new THREE.BoxGeometry(WIDTH, HEIGHT, DEPTH)
        structureGeometry.translate(0, HEIGHT / 2, 0)
        const structure = new THREE.Mesh(structureGeometry, new MeshDefaultMaterial({ colorNode: color('#23212f') }))
        structure.name = 'structure'
        structure.castShadow = true
        structure.receiveShadow = true
        group.add(structure)

        const trimGeometry = new THREE.BoxGeometry(WIDTH + 0.05, 0.06, DEPTH + 0.05)
        trimGeometry.translate(0, HEIGHT - 0.03, 0)
        const trim = new THREE.Mesh(trimGeometry, this.game.materials.getFromName('emissiveOrangeRadialGradient'))
        trim.name = 'trim'
        group.add(trim)

        const placements = scatterNearDistricts('scrapCrates', 3, 5, 12)

        const { instancedGroup } = createProceduralPropGroup(this.game, group, placements, {
            colliderHalfExtents: [ WIDTH / 2, HEIGHT / 2, DEPTH / 2 ],
            colliderOffset: { x: 0, y: HEIGHT / 2, z: 0 },
            friction: 0.7,
            mass: 0.1,
            contactThreshold: 15,
            soundGroup: 'hitBrick',
        })

        this.instancedGroup = instancedGroup
    }
}
