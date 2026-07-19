import * as THREE from 'three/webgpu'
import { InstancedGroup } from '../InstancedGroup.js'

// Shared plumbing for Phase E's simple dynamic/knockable instanced props
// (ScrapCrates, Barricades, VendingMachines, HoloSigns). Every existing
// instanced prop in the codebase (Bricks.js, Fences.js, ...) follows this same
// "references + group -> InstancedGroup + per-instance dynamic body" shape,
// normally deriving `references`/`group` from a loaded, artist-placed glTF via
// InstancedGroup.getBaseAndReferencesFromInstances(). These new props have no
// glTF (procedural geometry, procedural placement instead), so this builds the
// same reference/collider/tick-sync wiring directly from placement data.
export function createProceduralPropGroup(game, group, placements, options)
{
    const references = []

    for(const placement of placements)
    {
        const reference = new THREE.Object3D()
        reference.position.set(placement.position.x, options.groundOffset ?? 0, placement.position.z)
        reference.rotation.y = placement.rotationY
        reference.needsUpdate = true // picked up by InstancedGroup's first update() call
        references.push(reference)
    }

    const objects = []

    for(const reference of references)
    {
        objects.push(game.objects.add(
            {
                model: reference,
                updateMaterials: false,
                parent: null,
            },
            {
                type: 'dynamic',
                position: reference.position,
                rotation: reference.quaternion,
                friction: options.friction ?? 0.7,
                mass: options.mass ?? 0.1,
                sleeping: true,
                colliders: [
                    {
                        shape: 'cuboid',
                        parameters: options.colliderHalfExtents,
                        position: options.colliderOffset ?? { x: 0, y: 0, z: 0 },
                        category: 'object',
                    }
                ],
                waterGravityMultiplier: -1,
                contactThreshold: options.contactThreshold ?? 10,
                onCollision: (force, position) =>
                {
                    if(options.soundGroup)
                        game.audio.groups.get(options.soundGroup)?.playRandomNext(force, position)
                }
            },
        ))
    }

    const instancedGroup = new InstancedGroup(references, group)

    game.ticker.events.on('tick', () =>
    {
        for(const object of objects)
        {
            if(!object.physical.body.isSleeping() && object.physical.body.isEnabled())
                object.visual.object3D.needsUpdate = true
        }
    }, 10)

    return { references, objects, instancedGroup }
}
