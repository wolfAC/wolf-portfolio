import * as THREE from 'three/webgpu'
import { color, vec3 } from 'three/tsl'
import { Game } from '../Game.js'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'
import { buildBoxUnionGeometry } from '../Geometries/BoxUnionGeometry.js'

// Phase F: an original "night-runner" vehicle, procedural (no glTF -- no 3D
// authoring tool available here, same reasoning as Roads.js/Buildings.js).
// Builds a THREE.Group with the exact named-child convention
// VisualVehicle.js's setParts()/setWheels() already looks for via regex match
// (bodyPainted, chassis, wheelContainer > wheelCylinder/wheelSuspension/
// wheelPainted, stopLights, backLights, blinkerLeft/Right, energy, cell1-3) --
// VisualVehicle.js itself is completely unchanged, it just gets a procedurally
// built model instead of a loaded glTF scene.
//
// Dimensions match the Phase A4 targets exactly (wheelbase 1.8m / track 1.5m /
// wheel diameter 0.8m come straight from Physics/PhysicsVehicle.js's existing
// `wheels.settings.offset`/`radius` -- unchanged, no physics retune needed;
// body length/width/height land inside the 2.6-3.0m / 1.8-2.0m / 1.0-1.2m
// suggested ranges).
//
// The antenna sub-rig (a whimsical bobble-head detail specific to the
// original folio's character) is deliberately not rebuilt -- it's fully
// optional/guarded in VisualVehicle.js, so omitting it doesn't affect vehicle
// function; see audit/phase-f-implementation-notes.md.
const WHEEL_RADIUS = 0.4 // must match Physics/PhysicsVehicle.js's wheels.settings.radius
const WHEEL_HALF_WIDTH = 0.16

const VARIANTS = {
    default: {
        cabinHalfHeight: 0.225,
        cabinOffsetX: -0.2,
        underglowColor: '#ff2e8a',
        energyColor: '#ff2eb4',
    },
    oldSchool: {
        cabinHalfHeight: 0.3,
        cabinOffsetX: -0.05,
        underglowColor: '#28e0ff',
        energyColor: '#128fff',
    },
}

function markMaterial(material, name)
{
    material.name = name
    material.userData.prevent = true // skip Materials.updateObject()'s name-based conversion, see implementation notes
    return material
}

function buildBodyGeometry(variant)
{
    return buildBoxUnionGeometry([
        // Lower shell: length 2.8, width 1.9, height 0.55 -> spans y -0.4..0.15
        { centerX: 0, centerY: -0.125, centerZ: 0, halfLength: 1.4, halfHeight: 0.275, halfWidth: 0.95 },
        // Cabin/greenhouse, set back toward the rear for a long-hood silhouette
        { centerX: variant.cabinOffsetX, centerY: 0.15 + variant.cabinHalfHeight, centerZ: 0, halfLength: 0.75, halfHeight: variant.cabinHalfHeight, halfWidth: 0.75 },
        // Low rear spoiler deck
        { centerX: -1.3, centerY: 0.35, centerZ: 0, halfLength: 0.12, halfHeight: 0.06, halfWidth: 0.85 },
    ])
}

function buildWheelContainer()
{
    const container = new THREE.Group()
    container.name = 'wheelContainer'

    const tireGeometry = new THREE.CylinderGeometry(WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_HALF_WIDTH * 2, 16)
    tireGeometry.rotateX(Math.PI / 2)
    const cylinder = new THREE.Mesh(tireGeometry, markMaterial(new MeshDefaultMaterial({ colorNode: color('#151420') }), 'vehicleTire'))
    cylinder.name = 'wheelCylinder'
    container.add(cylinder)

    const rimGeometry = new THREE.CylinderGeometry(WHEEL_RADIUS * 0.45, WHEEL_RADIUS * 0.45, WHEEL_HALF_WIDTH * 2 + 0.01, 12)
    rimGeometry.rotateX(Math.PI / 2)
    const painted = new THREE.Mesh(rimGeometry, markMaterial(new MeshDefaultMaterial({ colorNode: color('#ffffff') }), 'vehicleWheelPainted'))
    painted.name = 'wheelPainted'
    container.add(painted)

    // Strut geometry spans local y = 0 (anchored at the wheel hub) to y = 1,
    // so VisualVehicle.js's `.scale.y = suspensionScale` stretches the top
    // toward the chassis while the bottom stays pinned at the wheel.
    const strutGeometry = new THREE.BoxGeometry(0.1, 1, 0.1)
    strutGeometry.translate(0, 0.5, 0)
    const suspension = new THREE.Mesh(strutGeometry, markMaterial(new MeshDefaultMaterial({ colorNode: color('#23212f') }), 'vehicleSuspension'))
    suspension.name = 'wheelSuspension'
    container.add(suspension)

    return container
}

export function buildVehicleModel(variantName = 'default')
{
    const game = Game.getInstance()
    const variant = VARIANTS[variantName] ?? VARIANTS.default

    const model = new THREE.Group()
    model.name = 'vehicleModel'

    const chassis = new THREE.Group()
    chassis.name = 'chassis'
    model.add(chassis)

    // Body (paint color applied immediately afterward by VisualVehicle's own
    // setPaints(); this initial material is only ever visible for a single
    // synchronous construction step)
    const bodyPainted = new THREE.Mesh(buildBodyGeometry(variant), markMaterial(new MeshDefaultMaterial({ colorNode: color('#23212f') }), 'vehicleBodyPainted'))
    bodyPainted.name = 'bodyPainted'
    chassis.add(bodyPainted)

    // Underglow strip (always-on decorative accent, Phase A1's vehicle direction)
    const underglowGeometry = new THREE.BoxGeometry(2.6, 0.04, 0.06)
    underglowGeometry.translate(0, -0.42, 0)
    const underglowMaterialLeft = markMaterial(new THREE.MeshBasicNodeMaterial({ color: new THREE.Color(variant.underglowColor).multiplyScalar(3) }), 'vehicleUnderglow')
    const underglowLeft = new THREE.Mesh(underglowGeometry, underglowMaterialLeft)
    underglowLeft.position.z = 0.9
    underglowLeft.name = 'underglowLeft'
    chassis.add(underglowLeft)
    const underglowRight = new THREE.Mesh(underglowGeometry, underglowMaterialLeft)
    underglowRight.position.z = -0.9
    underglowRight.name = 'underglowRight'
    chassis.add(underglowRight)

    // Stop lights (brake) -- only ever shown/hidden, never recolored, so it
    // needs its own visibly-red material up front
    const stopLightsGeometry = new THREE.BoxGeometry(0.05, 0.12, 1.7)
    stopLightsGeometry.translate(-1.4, 0.05, 0)
    const stopLights = new THREE.Mesh(stopLightsGeometry, markMaterial(new THREE.MeshBasicNodeMaterial({ colorNode: vec3(2.4, 0.08, 0.12) }), 'vehicleStopLights'))
    stopLights.name = 'stopLights'
    stopLights.visible = false
    chassis.add(stopLights)

    // Back lights (reverse) -- material gets swapped every frame by
    // VisualVehicle.js's update(), initial value just needs to be valid
    const backLightsGeometry = new THREE.BoxGeometry(0.05, 0.1, 1.2)
    backLightsGeometry.translate(-1.4, -0.15, 0)
    const backLights = new THREE.Mesh(backLightsGeometry, markMaterial(new THREE.MeshBasicNodeMaterial({ colorNode: vec3(2.2) }), 'vehicleBackLights'))
    backLights.name = 'backLights'
    backLights.visible = false
    chassis.add(backLights)

    // Blinkers (turn signals)
    const blinkerGeometry = new THREE.BoxGeometry(0.14, 0.1, 0.14)
    const blinkerMaterial = markMaterial(game.materials.getFromName('emissiveOrangeRadialGradient'), 'emissiveOrangeRadialGradient')
    const blinkerLeft = new THREE.Mesh(blinkerGeometry, blinkerMaterial)
    blinkerLeft.position.set(1.3, 0, 0.85)
    blinkerLeft.name = 'blinkerLeft'
    blinkerLeft.visible = false
    chassis.add(blinkerLeft)
    const blinkerRight = new THREE.Mesh(blinkerGeometry, blinkerMaterial)
    blinkerRight.position.set(1.3, 0, -0.85)
    blinkerRight.name = 'blinkerRight'
    blinkerRight.visible = false
    chassis.add(blinkerRight)

    // Boost energy panel + charge cells
    const energyGeometry = new THREE.BoxGeometry(0.08, 0.3, 0.5)
    energyGeometry.translate(-1.36, 0.3, 0)
    const energy = new THREE.Mesh(energyGeometry, markMaterial(new MeshDefaultMaterial({ colorNode: color(variant.energyColor) }), 'vehicleEnergy'))
    energy.name = 'energy'
    chassis.add(energy)

    const cellGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1)
    const cellMaterial = markMaterial(game.materials.getFromName('emissivePurpleRadialGradient'), 'emissivePurpleRadialGradient')
    const cellOffsets = [ -0.15, 0, 0.15 ]
    for(let i = 0; i < 3; i++)
    {
        const cell = new THREE.Mesh(cellGeometry, cellMaterial)
        cell.position.set(-1.36, 0.2, cellOffsets[i])
        cell.name = `cell${i + 1}`
        chassis.add(cell)
    }

    // Wheel container template (never rendered directly -- setWheels() clones
    // it 4x and attaches the clones to chassis; kept as a sibling of chassis,
    // inside `model`, which is discarded after VisualVehicle.js extracts
    // chassis, so this template itself never appears in the live scene)
    model.add(buildWheelContainer())

    return model
}
