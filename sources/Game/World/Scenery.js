import { Game } from '../Game.js'
import { References } from '../References.js'

// The original Bruno Simon `road` mesh baked into scenery.glb is retired here:
// Game/World/Roads.js now owns the Cyber City road network (original hub-and-ring
// layout, own material). Skipping it below avoids spawning a second, unrelated
// road shape on top of/crossing through the new one.
const RETIRED_CHILD_NAME_PATTERN = /^ref(?:erence)?road$/i

// The bridge structure (`bridgePhysicalFixed` / `bridgePhysicalFixed.001`) baked
// into scenery.glb belongs to the old map layout and has no equivalent in the
// Cyber City road network, so it's skipped entirely (both its visual mesh and
// physics body come from the same node via addFromModel below).
const RETIRED_BRIDGE_NAME_PATTERN = /^bridge/i

export class Scenery
{
    constructor()
    {
        this.game = Game.getInstance()

        this.references = new References()
        const model = [...this.game.resources.sceneryModel.scene.children]
        for(const child of model)
        {
            if(RETIRED_CHILD_NAME_PATTERN.test(child.name) || RETIRED_BRIDGE_NAME_PATTERN.test(child.name))
                continue

            // Add
            if(typeof child.userData.prevent === 'undefined' || child.userData.prevent === false)
            {
                // Objects
                this.game.objects.addFromModel(
                    child,
                    {

                    },
                    {
                        position: child.position,
                        rotation: child.quaternion,
                        sleeping: true,
                        mass: child.userData.mass
                    }
                )
            }

            this.references.parse(child)
        }
    }
}