import * as THREE from 'three/webgpu'
import { color } from 'three/tsl'
import { Game } from '../Game.js'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'
import { scatterNearDistricts } from './CyberCityPropPlacements.js'
import { createProceduralPropGroup } from './ProceduralPropGroup.js'

// Replaces Benches.js (Phase E1/E2). Knockable street vending machines
// scattered near every district, dark cabinet + a cyan emissive screen panel.
const WIDTH = 0.9
const HEIGHT = 1.8
const DEPTH = 0.7

export class VendingMachines
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

        const screenGeometry = new THREE.BoxGeometry(WIDTH * 0.65, HEIGHT * 0.55, 0.06)
        screenGeometry.translate(0, HEIGHT * 0.5, DEPTH / 2 + 0.03)
        const screen = new THREE.Mesh(screenGeometry, this.game.materials.getFromName('emissiveBlueRadialGradient'))
        screen.name = 'screen'
        group.add(screen)

        const placements = scatterNearDistricts('vendingMachines', 2, 5, 12)

        // No collision sound, matching the original Benches.js's (commented-out) behavior.
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
