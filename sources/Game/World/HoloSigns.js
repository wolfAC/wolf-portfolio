import * as THREE from 'three/webgpu'
import { color } from 'three/tsl'
import { Game } from '../Game.js'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'
import { scatterNearDistricts } from './CyberCityPropPlacements.js'
import { createProceduralPropGroup } from './ProceduralPropGroup.js'

// Replaces Lanterns.js (Phase E1/E2). Small knockable holographic sign posts
// scattered near every district, dark pole + a magenta emissive panel.
const POLE_HEIGHT = 0.9
const PANEL_SIZE = 0.7
const TOTAL_HEIGHT = POLE_HEIGHT + PANEL_SIZE / 2

export class HoloSigns
{
    constructor()
    {
        this.game = Game.getInstance()

        const group = new THREE.Group()

        const poleGeometry = new THREE.BoxGeometry(0.08, POLE_HEIGHT, 0.08)
        poleGeometry.translate(0, POLE_HEIGHT / 2, 0)
        const pole = new THREE.Mesh(poleGeometry, new MeshDefaultMaterial({ colorNode: color('#23212f') }))
        pole.name = 'pole'
        pole.castShadow = true
        pole.receiveShadow = true
        group.add(pole)

        const panelGeometry = new THREE.BoxGeometry(PANEL_SIZE, PANEL_SIZE, 0.05)
        panelGeometry.translate(0, POLE_HEIGHT + PANEL_SIZE / 2, 0)
        const panel = new THREE.Mesh(panelGeometry, this.game.materials.getFromName('emissivePurpleRadialGradient'))
        panel.name = 'panel'
        group.add(panel)

        const placements = scatterNearDistricts('holoSigns', 3, 5, 12)

        const { instancedGroup } = createProceduralPropGroup(this.game, group, placements, {
            colliderHalfExtents: [ 0.4, TOTAL_HEIGHT / 2, 0.4 ],
            colliderOffset: { x: 0, y: TOTAL_HEIGHT / 2, z: 0 },
            friction: 0.7,
            mass: 0.1,
            contactThreshold: 10,
            soundGroup: 'hitMetal',
        })

        this.instancedGroup = instancedGroup
    }
}
