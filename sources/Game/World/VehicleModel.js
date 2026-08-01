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
// across all 4 wheel positions at once). wheelContainer/wheelCylinder below
// are inert placeholder nodes (no geometry) that exist purely so
// VisualVehicle.js's existing clone-based wheel loop has something non-null
// to clone x4 -- the real wheel geometry stays embedded in the skinned rig.
// The rig does, however, expose its own per-wheel steer/spin bones (see
// WHEEL_BONE_RENAMES below) -- renaming those to names VisualVehicle.js's
// part search already looks for lets it drive the *real* wheel meshes
// directly (rotating a skinned bone re-poses the skin same as any other
// bone animation), rather than the geometry-less placeholders, which is what
// actually makes the wheels spin/steer instead of sliding along rigidly.
// Suspension compression is not attempted -- the rig's suspension is a
// multi-bone piston/spring linkage that would need real IK to compress
// convincingly, not just a single bone nudge.
//
// blinkers/stopLights/backLights/antenna/energy/cell1-3 have no equivalent
// parts in the source file; all of them are already optional/guarded in
// VisualVehicle.js, so they're simply absent here rather than faked with
// unrelated geometry. gunBarrelLeft/Right + muzzleFlashLeft/Right *are*
// built below (see buildGunBarrel()), since the source file has nothing to
// reuse for those but VisualVehicle.js needs them to fire the gun visually.

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

// Per-wheel steer/spin bones inside the source rig, renamed so
// VisualVehicle.js's setWheels() can find and drive them directly. Found by
// walking the rig's bind pose: each front wheel has an outer "rot_02" bone
// (rotates the whole wheel assembly around the vertical/kingpin axis --
// steering) parenting an inner "rot_01" bone at the same point (rotates
// around the axle -- rolling); rear wheels only have the axle bone. Which
// local axis is "vertical" vs "axle" was confirmed by composing each bone's
// bind-pose world matrix rather than guessed -- see audit notes.
const WHEEL_BONE_RENAMES = {
    bone_left_front_wheel_rot_02_063: 'wheelSteerFrontLeft',
    bone_left_front_wheel_rot_01_064: 'wheelSpinFrontLeft',
    bone_right_front_wheel_rot_02_084: 'wheelSteerFrontRight',
    bone_right_front_wheel_rot_01_085: 'wheelSpinFrontRight',
    bone_rear_left_wheel_013: 'wheelSpinRearLeft',
    bone_rear_right_wheel_012: 'wheelSpinRearRight',
}

// Local-space nose position of the barrel tips, in real-world/physics
// meters -- must stay in sync with PhysicsVehicle.js's guns.muzzleOffset,
// which is where shots actually originate. Divided by MODEL_SCALE below
// since gunBarrelLeft/Right are added as children of `chassis`, which
// carries that scale -- a child's local position is scaled along with
// everything else in the rig, so reaching a real offset of muzzleOffset.x
// meters from a node inside the scaled chassis requires authoring it at
// muzzleOffset.x / MODEL_SCALE in the chassis's own (pre-scale) units, the
// same way the rig's own bones are authored at real-vehicle scale.
const GUN_MUZZLE_OFFSET = { x: 1.7, y: -0.14, z: 0.5 }

// Local-space rear-center position for the (single) boost trail emitter, in
// the same real-world/physics meters and for the same reason as
// GUN_MUZZLE_OFFSET above -- divided by MODEL_SCALE when authored on
// boostReference below.
const BOOST_OFFSET = { x: -1.28, y: 0.1, z: 0 }

let muzzleFlashGeometry = null
function getMuzzleFlashGeometry()
{
    if(!muzzleFlashGeometry)
    {
        muzzleFlashGeometry = new THREE.PlaneGeometry(1, 1)
        muzzleFlashGeometry.rotateY(Math.PI * 0.5) // face forward (+x), toward the barrel's aim direction
    }

    return muzzleFlashGeometry
}

function buildGunBarrel(name, flashName, lateralSign)
{
    const game = Game.getInstance()

    const barrel = new THREE.Object3D()
    barrel.name = name
    barrel.position.set(
        GUN_MUZZLE_OFFSET.x / MODEL_SCALE,
        GUN_MUZZLE_OFFSET.y / MODEL_SCALE,
        (lateralSign * GUN_MUZZLE_OFFSET.z) / MODEL_SCALE
    )

    // Cloned (not shared) so setParts()'s unconditional shadowSide mutation
    // on every mesh it finds doesn't leak into the emissiveOrangeRadialGradient
    // preset shared by VendingMachines/ScrapCrates/PoleLights/etc.
    const material = game.materials.getFromName('emissiveOrangeRadialGradient').clone()

    const flash = new THREE.Mesh(getMuzzleFlashGeometry(), material)
    flash.name = flashName
    flash.visible = false
    flash.frustumCulled = false
    barrel.add(flash)

    return barrel
}

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

    for(const originalName in WHEEL_BONE_RENAMES)
    {
        const bone = chassis.getObjectByName(originalName)
        if(bone)
            bone.name = WHEEL_BONE_RENAMES[originalName]
    }

    chassis.add(buildGunBarrel('gunBarrelLeft', 'muzzleFlashLeft', -1))
    chassis.add(buildGunBarrel('gunBarrelRight', 'muzzleFlashRight', 1))

    const boostReference = new THREE.Object3D()
    boostReference.name = 'boostReference'
    boostReference.position.set(
        BOOST_OFFSET.x / MODEL_SCALE,
        BOOST_OFFSET.y / MODEL_SCALE,
        BOOST_OFFSET.z / MODEL_SCALE
    )
    chassis.add(boostReference)

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
