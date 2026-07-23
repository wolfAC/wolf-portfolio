import * as THREE from 'three/webgpu'
import gsap from 'gsap'
import { color } from 'three/tsl'
import { Game } from '../Game.js'
import { InstancedGroup } from '../InstancedGroup.js'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'
import { scatterNearDistricts } from './CyberCityPropPlacements.js'

// Phase E: explosive canisters, reskinned in place (same class/property name
// and reset() hook -- Game.js's reset() depends on this class as-is).
// Procedural geometry (no glTF) placed near every district instead of hand-placed
// positions; 4 per district x 6 districts = 24 canisters.
const RADIUS = 0.4
const HEIGHT = 0.9

export class ExplosiveCrates
{
    constructor()
    {
        this.game = Game.getInstance()

        const base = new THREE.Group()

        const geometry = new THREE.CylinderGeometry(RADIUS * 0.9, RADIUS, HEIGHT, 12)
        geometry.translate(0, HEIGHT / 2, 0)
        const canister = new THREE.Mesh(geometry, new MeshDefaultMaterial({ colorNode: color('#ffb020') }))
        canister.name = 'canister'
        canister.castShadow = true
        canister.receiveShadow = true
        base.add(canister)

        this.references = []
        for(const placement of scatterNearDistricts('explosiveCanisters', 4, 5, 12))
        {
            const reference = new THREE.Object3D()
            reference.position.set(placement.position.x, 0, placement.position.z)
            reference.rotation.y = placement.rotationY
            reference.needsUpdate = true
            this.references.push(reference)
        }

        // Create instanced group
        this.instancedGroup = new InstancedGroup(this.references, base)

        this.items = []

        let i = 0
        for(const reference of this.references)
        {
            const crate = {}
            crate.id = i
            crate.exploded = false
            crate.reference = reference.clone()
            crate.object = this.game.objects.add(
                {
                    model: reference,
                },
                {
                    type: 'dynamic',
                    position: reference.position.clone(),
                    rotation: reference.quaternion.clone(),
                    friction: 0.7,
                    mass: 0.02,
                    sleeping: true,
                    colliders: [ { shape: 'cuboid', parameters: [ RADIUS, HEIGHT / 2, RADIUS ], position: { x: 0, y: HEIGHT / 2, z: 0 }, category: 'object' } ],
                    waterGravityMultiplier: - 1,
                    contactThreshold: 0,
                    onCollision: () =>
                    {
                        this.explode(crate)
                    }
                },
            )

            this.items.push(crate)

            i++
        }

        this.setSounds()

        // Tick update
        this.game.ticker.events.on('tick', () =>
        {
            for(const crate of this.items)
            {
                if(!crate.object.physical.body.isSleeping() && crate.object.physical.body.isEnabled())
                    crate.object.visual.object3D.needsUpdate = true
            }
        }, 10)
    }

    setSounds()
    {
        this.sounds = {}

        // Click sound
        this.sounds.triggerClick = this.game.audio.register({
            path: 'sounds/clicks/Source Metal Clicks Delicate Light Sharp Clip Mid 07.mp3',
            autoplay: false,
            loop: false,
            volume: 0.4,
            antiSpam: 0.1,
            positions: new THREE.Vector3(),
            onPlay: (item, coordinates) =>
            {
                item.positions[0].copy(coordinates)
                item.volume = 1
                item.rate = 0.7 + Math.random() * 1.3
            }
        })

        const paths = [
            'sounds/explosions/SmallImpactMediumE PE281202.mp3',
            'sounds/explosions/SmallImpactMediumE PE281203.mp3'
        ]

        this.sounds.explosions = []

        for(const path of paths)
        {
            this.sounds.explosions.push(
                this.game.audio.register({
                    path: path,
                    autoplay: false,
                    loop: false,
                    volume: 0.4,
                    antiSpam: 0.2,
                    positions: new THREE.Vector3(),
                    distanceFade: 25,
                    onPlay: (item, coordinates) =>
                    {
                        item.positions[0].copy(coordinates)
                        item.volume = 1
                        item.rate = 0.9 + Math.random() * 0.3
                    }
                })
            )
        }
    }

    explode(crate)
    {
        if(crate.exploded)
            return

        crate.exploded = true

        this.sounds.triggerClick.play(crate.reference.position)

        gsap.delayedCall(0.4, () =>
        {
            // Sound
            this.sounds.explosions[Math.floor(Math.random() * this.sounds.explosions.length)].play(crate.reference.position)

            // Explode
            this.game.world.fireballs.create(crate.object.physical.body.translation())

            // Disable
            this.game.objects.disable(crate.object)
            crate.object.visual.object3D.position.y += 100 // Hide the instance reference
            crate.object.visual.object3D.needsUpdate = true
        })
    }

    reset()
    {
        for(const crate of this.items)
        {
            this.game.objects.resetObject(crate.object)
            crate.exploded = false

            this.game.ticker.wait(2, () =>
            {
                crate.object.physical.body.setEnabled(true)
            })
        }

        this.instancedGroup.needsUpdate = true

        // Disable every other object to prevent explosion trigger
        this.game.objects.list.forEach((object) =>
        {
            if(
                object.physical &&
                (object.physical.type === 'dynamic' || object.physical.type === 'kinematicPositionBased') &&
                object.physical.body.isEnabled()
            )
            {
                object.physical.body.setEnabled(false)

                // Wait a second and reactivate
                this.game.ticker.wait(1, () =>
                {
                    object.physical.body.setEnabled(true)

                    // Sleep
                    if(object.physical.initialState.sleeping)
                        object.physical.body.sleep()

                })
            }
        })
    }
}
