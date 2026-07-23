import * as THREE from 'three/webgpu'
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js'
import { Game } from '../Game.js'

// This vehicle model is adapted from a user-provided glTF asset, loaded once
// as game.resources.vehicleModel (see Game.js), rather than built
// procedurally. Every mesh/material/UV/skin from the source file is left
// untouched -- only Object3D container nodes are added or renamed so the
// hierarchy matches what VisualVehicle.js's setParts()/setWheels() already
// look for (bodyPainted, chassis, wheelContainer > wheelCylinder).
//
// The whole source file is one skin -- a single ~209-bone skeleton shared by
// all 14 meshes -- so there's no clonable per-wheel "wheelContainer" subtree
// in this asset the way the old procedural model had one (its 4 wheel
// meshes are combined into shared meshes like Tyre_MIC/Wheel_MIC, skinned
// across all 4 wheel positions at once). The whole rig therefore moves as a
// single rigid body driven by physics's chassis transform, same as
// bodyPainted already does; wheels don't spin/steer/compress independently.
// wheelContainer/wheelCylinder below are inert placeholder nodes (no
// geometry) that exist purely so VisualVehicle.js's existing clone-based
// wheel loop has something non-null to clone x4 -- the real wheel geometry
// stays embedded in the skinned rig and renders in its authored rest pose.
//
// blinkers/stopLights/backLights/antenna/energy/cell1-3/gunBarrel*/
// muzzleFlash* have no equivalent parts in the source file; all of them are
// already optional/guarded in VisualVehicle.js, so they're simply absent
// here rather than faked with unrelated geometry.

// "Chassis_02" is a bone name inside the source rig that collides with
// VisualVehicle.js's `^chassis` part-name search (which does a plain
// prefix-match over every node in the whole hierarchy and would otherwise
// overwrite this.parts.chassis with this mid-skeleton bone instead of the
// intended root, since it's visited later in traversal order). Renaming it
// is a pure Object3D.name change -- no geometry/material/skin data touched.
const CHASSIS_BONE_COLLISION_NAME = 'Chassis_02'
const CHASSIS_BONE_RENAMED = 'rig_Chassis_02'

// Node name of the main body-shell mesh in the source file (glTF node
// "Object_218", mesh "Batmobile_DLC_Tumbler_Body_MIC") -- renamed so
// VisualVehicle.js's setPaints() can find and recolor it, same as any other
// vehicle model's bodyPainted mesh.
const BODY_MESH_NODE_NAME = 'Object_218'

// The source file is already authored in real-world meters (its body shell
// measures roughly 5.6m long / 3.9m wide / 1.9m tall -- the size of the
// actual vehicle it's modeled after), while this game's
// Physics/PhysicsVehicle.js wheels.settings describes a much smaller arcade
// wheelbase (2 * offset.x = 1.8m). This constant uniformly rescales the
// whole visual model to roughly match that physics wheelbase, measured
// empirically off the skinned wheel-rim mesh's actual world-space extent
// (front-to-rear span ~5.39m -- bone-node translations in this rig are
// mostly parent-relative, not directly comparable across branches, so they
// can't be used for this measurement directly):
//   scale = physicsWheelbase (1.8) / measuredWheelSpan (5.39)
// The source vehicle's front track is much narrower than its rear track (a
// design trait of the real vehicle it's modeled after, not a data error),
// which the physics rig's symmetric 4-wheel box can't reproduce -- ground
// contact/tire tracks will sit slightly outside the visual wheels as a
// result.
const MODEL_SCALE = 0.33387597146601317

function markMaterialsPreserved(root)
{
    root.traverse((child) =>
    {
        if(!child.isMesh)
            return

        // Skinned meshes are culled against their *unskinned* local-space
        // bounding volume in three.js, which doesn't reflect where skinning
        // actually places the vertices -- without this, the renderer can
        // wrongly decide the mesh is outside the frustum and skip it, even
        // though it's clearly on screen.
        child.frustumCulled = false

        const materials = Array.isArray(child.material) ? child.material : [ child.material ]

        for(const material of materials)
            material.userData.prevent = true // skip Materials.updateObject()'s name-based conversion, see implementation notes
    })
}

function buildWheelContainer()
{
    const container = new THREE.Group()
    container.name = 'wheelContainer'

    const cylinder = new THREE.Object3D()
    cylinder.name = 'wheelCylinder'
    container.add(cylinder)

    return container
}

// variantName is kept only so call sites (World.js, KonamiCode.js) don't
// need to change -- the source asset has no equivalent per-variant tuning
// (color/geometry), so it's currently a no-op.
export function buildVehicleModel(variantName = 'default')
{
    const game = Game.getInstance()

    const chassis = cloneSkinned(game.resources.vehicleModel.scene)
    chassis.name = 'chassis'
    chassis.scale.setScalar(MODEL_SCALE)

    const collidingBone = chassis.getObjectByName(CHASSIS_BONE_COLLISION_NAME)
    if(collidingBone)
        collidingBone.name = CHASSIS_BONE_RENAMED

    const bodyMesh = chassis.getObjectByName(BODY_MESH_NODE_NAME)
    if(bodyMesh)
        bodyMesh.name = 'bodyPainted'

    markMaterialsPreserved(chassis)

    // Wheel container template (never rendered directly -- setWheels() clones
    // it 4x and attaches the clones to chassis; kept as a sibling of chassis,
    // inside `model`, which is discarded after VisualVehicle.js extracts
    // chassis, so this template itself never appears in the live scene)
    const model = new THREE.Group()
    model.name = 'vehicleModel'
    model.add(chassis)
    model.add(buildWheelContainer())

    return model
}
