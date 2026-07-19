import * as THREE from 'three/webgpu'
import { color } from 'three/tsl'
import { Game } from '../Game.js'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'
import { scatterNearDistricts } from './CyberCityPropPlacements.js'
import { createProceduralPropGroup } from './ProceduralPropGroup.js'

// Replaces Fences.js (Phase E1/E2). Knockable security barricades scattered
// near every district, dark structure + an amber hazard-stripe band.
const WIDTH = 1.6
const HEIGHT = 0.9
const DEPTH = 0.18

export class Barricades
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

        const stripeGeometry = new THREE.BoxGeometry(WIDTH + 0.02, 0.3, DEPTH + 0.02)
        stripeGeometry.translate(0, HEIGHT / 2, 0)
        const stripe = new THREE.Mesh(stripeGeometry, this.game.materials.getFromName('emissiveOrangeRadialGradient'))
        stripe.name = 'stripe'
        group.add(stripe)

        const placements = scatterNearDistricts('barricades', 3, 5, 12)

        // No collision sound, matching the original Fences.js's (commented-out) behavior.
        const { instancedGroup } = createProceduralPropGroup(this.game, group, placements, {
            colliderHalfExtents: [ WIDTH / 2, HEIGHT / 2, DEPTH / 2 ],
            colliderOffset: { x: 0, y: HEIGHT / 2, z: 0 },
            friction: 0.7,
            mass: 0.1,
            contactThreshold: 10,
        })

        this.instancedGroup = instancedGroup
    }
}
