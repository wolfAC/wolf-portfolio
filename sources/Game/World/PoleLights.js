import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { InstancedGroup } from '../InstancedGroup.js'
import { color, hash, instancedArray, instanceIndex, sin, uniform, vec3 } from 'three/tsl'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'
import { scatterAlongMainRoads } from './CyberCityPropPlacements.js'
import gsap from 'gsap'

// Phase E: neon streetlights, reskinned in place (same class/property name --
// its gameplay role, a fixed pole-mounted light source with a day/night glow
// toggle, is unchanged, only its look and placement are new). Procedural
// geometry (no glTF, see Roads.js/Buildings.js for why) placed along the ring
// road and radial avenues from CyberCityLayout.js instead of Bruno Simon's
// hand-placed positions.
const POLE_HEIGHT = 3.0
const GLASS_SIZE = 0.35

export class PoleLights
{
    constructor()
    {
        this.game = Game.getInstance()

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🏮 Pole lights',
                expanded: false,
            })
        }

        // Base group (2 procedural meshes) and references (from the road-network
        // placement generator instead of a loaded glTF's pre-placed instances)
        const base = new THREE.Group()

        const poleGeometry = new THREE.BoxGeometry(0.15, POLE_HEIGHT, 0.15)
        poleGeometry.translate(0, POLE_HEIGHT / 2, 0)
        const pole = new THREE.Mesh(poleGeometry, new MeshDefaultMaterial({ colorNode: color('#23212f') }))
        pole.name = 'pole'
        pole.castShadow = true
        pole.receiveShadow = true
        base.add(pole)

        const glassGeometry = new THREE.BoxGeometry(GLASS_SIZE, GLASS_SIZE, GLASS_SIZE)
        glassGeometry.translate(0, POLE_HEIGHT + GLASS_SIZE / 2, 0)
        const glass = new THREE.Mesh(glassGeometry, this.game.materials.getFromName('emissiveBlueRadialGradient'))
        glass.name = 'glass'
        base.add(glass)

        this.references = []
        for(const placement of scatterAlongMainRoads(18, 6.5))
        {
            const reference = new THREE.Object3D()
            reference.position.set(placement.position.x, 0, placement.position.z)
            reference.rotation.y = placement.rotationY
            reference.needsUpdate = true
            this.references.push(reference)
        }

        // Create instanced group
        this.instancedGroup = new InstancedGroup(this.references, base, false)

        this.glass = this.instancedGroup.meshes.find(mesh => mesh.instance.name === 'glass').instance

        this.setPhysics()
        this.setFireflies()
        this.setSwitchInterval()
    }

    setPhysics()
    {
        for(const reference of this.references)
        {
            this.game.objects.add(
                null,
                {
                    type: 'fixed',
                    position: reference.position,
                    rotation: reference.quaternion,
                    colliders: [ { shape: 'cuboid', parameters: [ 0.2, POLE_HEIGHT / 2, 0.2 ], position: { x: 0, y: POLE_HEIGHT / 2, z: 0 }, category: 'object' } ],
                    onCollision: (force, position) =>
                    {
                        this.game.audio.groups.get('hitDefault').playRandomNext(force, position)
                    }
                },
            )
        }
    }

    setFireflies()
    {
        this.firefliesScale = uniform(0)

        const countPerLight = 5
        const count = this.references.length * countPerLight
        const positions = new Float32Array(count * 3)

        let i = 0
        for(const reference of this.references)
        {
            for(let j = 0; j < countPerLight; j++)
            {
                const i3 = i * 3

                const angle = Math.random() * Math.PI * 2
                positions[i3 + 0] = reference.position.x + Math.cos(angle)
                positions[i3 + 1] = reference.position.y + POLE_HEIGHT
                positions[i3 + 2] = reference.position.z + Math.sin(angle)
                i++
            }
        }

        const positionAttribute = instancedArray(positions, 'vec3').toAttribute()

        const material = new THREE.SpriteNodeMaterial()
        material.outputNode = this.game.materials.getFromName('emissiveBlueRadialGradient').outputNode

        const baseTime = this.game.ticker.elapsedScaledUniform.add(hash(instanceIndex).mul(999))
        const flyOffset = vec3(
            sin(baseTime.mul(0.4)).mul(0.5),
            sin(baseTime).mul(0.2),
            sin(baseTime.mul(0.3)).mul(0.5)
        )
        material.positionNode = positionAttribute.add(flyOffset)
        material.scaleNode = this.firefliesScale

        const geometry = new THREE.CircleGeometry(0.015, 8)

        const mesh = new THREE.Mesh(geometry, material)
        mesh.count = count
        mesh.frustumCulled = false
        this.game.scene.add(mesh)
    }

    setSwitchInterval()
    {
        const intervalChange = (inInterval) =>
        {
            if(inInterval)
            {
                this.glass.visible = true

                gsap.to(this.firefliesScale, { value: 1, duration: 5, overwrite: true })
            }
            else
            {
                this.glass.visible = false

                gsap.to(this.firefliesScale, { value: 0, duration: 5, overwrite: true })
            }
        }

        this.game.dayCycles.events.on('night', intervalChange)
        intervalChange(this.game.dayCycles.intervalEvents.get('night').inInterval)
    }
}
