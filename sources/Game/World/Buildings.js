import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { color, Fn, texture, uniform, uv, vec2, vec3 } from 'three/tsl'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'
import { BUILDING_ARCHETYPES } from './CyberCityBuildingArchetypes.js'
import { CYBER_CITY_BUILDING_PLACEMENTS } from './CyberCityBuildingPlacements.js'

// Cyber City buildings (Phase D). There is no building system in the original
// game -- this is new content, built the same way Roads.js builds the road
// network: procedural THREE.BufferGeometry rather than an authored glTF kit,
// since a Blender-style modular kit isn't buildable in this environment. Each
// archetype (CyberCityBuildingArchetypes.js) is a stack of box modules (base /
// repeated mid / roof), so height varies per building without extra geometry
// work, matching the plan's "modular kit" intent (D1/D2) using code instead of
// meshes.
//
// Buildings are NOT GPU-instanced (unlike Bricks.js/Fences.js): each one needs
// its own height/footprint for skyline variety (Phase A1's "vertical density"
// direction), which is exactly what instancing (shared geometry, varying only
// transform) can't give you without either uniform heights or distorting
// non-uniform scale on the windows. At this building count (~50), unique
// per-building THREE.Mesh objects cost nothing worth optimizing away, and
// three.js's own per-mesh frustum culling (left at its default) already
// satisfies D8 without extra code.
export class Buildings
{
    constructor()
    {
        this.game = Game.getInstance()

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🏢 Buildings',
                expanded: false,
            })
        }

        this.setSharedUniforms()

        this.buildings = []
        for(const placement of CYBER_CITY_BUILDING_PLACEMENTS)
            this.buildings.push(this.createBuilding(placement))

        if(this.game.debug.active)
        {
            this.debugPanel.addBinding({ count: this.buildings.length }, 'count', { readonly: true, label: 'buildingCount' })
        }
    }

    setSharedUniforms()
    {
        // Shared across every building's material -- only the emissive window
        // tint varies per building/district (see createMaterial).
        this.structureColor = uniform(color('#23212f'))
        this.cellU = uniform(1.2)
        this.cellV = uniform(1.6)
        this.windowWidthRatio = uniform(0.55)
        this.windowHeightRatio = uniform(0.6)
        this.windowLitRatio = uniform(0.35)
        this.windowFlickerSpeed = uniform(0.6)
        this.windowFlickerAmount = uniform(0.15)

        if(this.game.debug.active)
        {
            this.game.debug.addThreeColorBinding(this.debugPanel, this.structureColor.value, 'structureColor')
            this.debugPanel.addBinding(this.cellU, 'value', { label: 'windowCellU', min: 0.4, max: 4, step: 0.01 })
            this.debugPanel.addBinding(this.cellV, 'value', { label: 'windowCellV', min: 0.4, max: 4, step: 0.01 })
            this.debugPanel.addBinding(this.windowWidthRatio, 'value', { label: 'windowWidthRatio', min: 0.1, max: 0.95, step: 0.01 })
            this.debugPanel.addBinding(this.windowHeightRatio, 'value', { label: 'windowHeightRatio', min: 0.1, max: 0.95, step: 0.01 })
            this.debugPanel.addBinding(this.windowLitRatio, 'value', { label: 'windowLitRatio', min: 0, max: 1, step: 0.01 })
            this.debugPanel.addBinding(this.windowFlickerSpeed, 'value', { label: 'windowFlickerSpeed', min: 0, max: 3, step: 0.01 })
            this.debugPanel.addBinding(this.windowFlickerAmount, 'value', { label: 'windowFlickerAmount', min: 0, max: 0.5, step: 0.01 })
        }
    }

    // Pushes one axis-aligned box's 4 side faces (+ optionally its top) into the
    // shared position/uv/normal/index arrays, centered at (centerX, centerZ) in
    // building-local space, from y = baseY to y = baseY + height. UV.u is the
    // distance along each face's own width in world units (so window spacing
    // stays a consistent physical size regardless of building footprint), and
    // UV.v is absolute local height (so window rows line up across stacked
    // modules). Winding is outward-CCW per face; the material is also set
    // DoubleSide as a safety net (see createMaterial).
    pushBox(centerX, centerZ, halfWidth, halfDepth, baseY, height, includeTop, positions, uvs, normals, indices, vertexCountRef)
    {
        const top = baseY + height

        const faces = [
            { normal: [ 0, 0, 1 ],  a: [ centerX - halfWidth, centerZ + halfDepth ], b: [ centerX + halfWidth, centerZ + halfDepth ] }, // +Z
            { normal: [ 0, 0, -1 ], a: [ centerX + halfWidth, centerZ - halfDepth ], b: [ centerX - halfWidth, centerZ - halfDepth ] }, // -Z
            { normal: [ 1, 0, 0 ],  a: [ centerX + halfWidth, centerZ + halfDepth ], b: [ centerX + halfWidth, centerZ - halfDepth ] }, // +X
            { normal: [ -1, 0, 0 ], a: [ centerX - halfWidth, centerZ - halfDepth ], b: [ centerX - halfWidth, centerZ + halfDepth ] }, // -X
        ]

        for(const face of faces)
        {
            const [ ax, az ] = face.a
            const [ bx, bz ] = face.b
            const width = Math.hypot(bx - ax, bz - az)
            const startIndex = vertexCountRef.value

            positions.push(ax, baseY, az); uvs.push(0, baseY); normals.push(...face.normal)
            positions.push(bx, baseY, bz); uvs.push(width, baseY); normals.push(...face.normal)
            positions.push(bx, top, bz); uvs.push(width, top); normals.push(...face.normal)
            positions.push(ax, top, az); uvs.push(0, top); normals.push(...face.normal)
            vertexCountRef.value += 4

            indices.push(startIndex, startIndex + 1, startIndex + 2)
            indices.push(startIndex, startIndex + 2, startIndex + 3)
        }

        if(includeTop)
        {
            const startIndex = vertexCountRef.value
            const corners = [
                [ centerX - halfWidth, centerZ - halfDepth ],
                [ centerX - halfWidth, centerZ + halfDepth ],
                [ centerX + halfWidth, centerZ + halfDepth ],
                [ centerX + halfWidth, centerZ - halfDepth ],
            ]

            // Constant (0, 0) UV deliberately lands in the window shader's
            // mullion/gap zone (see createMaterial), so rooftops read as plain
            // structure color rather than being tiled with windows.
            for(const [ x, z ] of corners)
            {
                positions.push(x, top, z); uvs.push(0, 0); normals.push(0, 1, 0)
            }
            vertexCountRef.value += 4

            indices.push(startIndex, startIndex + 1, startIndex + 2)
            indices.push(startIndex, startIndex + 2, startIndex + 3)
        }
    }

    buildStack(centerX, centerZ, halfWidth, halfDepth, archetype, placement, positions, uvs, normals, indices, vertexCountRef)
    {
        let currentY = 0
        let currentHalfWidth = halfWidth
        let currentHalfDepth = halfDepth

        this.pushBox(centerX, centerZ, currentHalfWidth, currentHalfDepth, currentY, archetype.baseHeight, false, positions, uvs, normals, indices, vertexCountRef)
        currentY += archetype.baseHeight

        for(let i = 0; i < placement.midCount; i++)
        {
            this.pushBox(centerX, centerZ, currentHalfWidth, currentHalfDepth, currentY, archetype.midHeight, false, positions, uvs, normals, indices, vertexCountRef)
            currentY += archetype.midHeight

            if(archetype.taperPerLevel)
            {
                currentHalfWidth *= 1 - archetype.taperPerLevel
                currentHalfDepth *= 1 - archetype.taperPerLevel
            }
        }

        this.pushBox(centerX, centerZ, currentHalfWidth, currentHalfDepth, currentY, archetype.roofHeight, true, positions, uvs, normals, indices, vertexCountRef)
        currentY += archetype.roofHeight

        return currentY
    }

    buildGeometry(placement)
    {
        const archetype = BUILDING_ARCHETYPES[placement.archetypeId]
        const positions = []
        const uvs = []
        const normals = []
        const indices = []
        const vertexCountRef = { value: 0 }

        let totalHeight

        if(archetype.twin)
        {
            const towerHalfWidth = placement.halfWidth * 0.5
            const offsetX = towerHalfWidth * (1 + archetype.twinGapRatio)

            totalHeight = this.buildStack(-offsetX, 0, towerHalfWidth, placement.halfDepth, archetype, placement, positions, uvs, normals, indices, vertexCountRef)
            this.buildStack(offsetX, 0, towerHalfWidth, placement.halfDepth, archetype, placement, positions, uvs, normals, indices, vertexCountRef)
        }
        else
        {
            totalHeight = this.buildStack(0, 0, placement.halfWidth, placement.halfDepth, archetype, placement, positions, uvs, normals, indices, vertexCountRef)
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
        geometry.setIndex(indices)
        geometry.computeBoundingSphere()

        return { geometry, totalHeight }
    }

    createMaterial(tintHex)
    {
        const windowColor = uniform(color(tintHex))

        const colorNode = Fn(() =>
        {
            const gridU = uv().x.mod(this.cellU)
            const gridV = uv().y.mod(this.cellV)
            const distU = gridU.sub(this.cellU.mul(0.5)).abs()
            const distV = gridV.sub(this.cellV.mul(0.5)).abs()
            const edgeU = this.cellU.mul(0.5).mul(this.windowWidthRatio)
            const edgeV = this.cellV.mul(0.5).mul(this.windowHeightRatio)
            const maskU = distU.smoothstep(edgeU.mul(0.85), edgeU).oneMinus()
            const maskV = distV.smoothstep(edgeV.mul(0.85), edgeV).oneMinus()
            const windowMask = maskU.mul(maskV)

            // Per-window lit/unlit randomness: sample the shared hash noise at a
            // UV scaled down to roughly one texel per window cell, so (unlike a
            // per-pixel sample) each window reads as a single random value
            // rather than continuous noise. floor() is what pins the sample to
            // one texel for the whole cell -- without it this is a continuously
            // varying coordinate into a NearestFilter texture, which samples a
            // different noise texel per-pixel (visible as static/aliasing).
            const hashUv = vec2(uv().x.div(this.cellU).floor(), uv().y.div(this.cellV).floor())
            const hash = texture(this.game.noises.hash, hashUv).r
            const lit = hash.smoothstep(this.windowLitRatio, this.windowLitRatio.add(0.02)).oneMinus()

            const flicker = this.game.ticker.elapsedScaledUniform
                .mul(this.windowFlickerSpeed)
                .add(hash.mul(100))
                .sin()
                .mul(this.windowFlickerAmount)
                .add(this.windowFlickerAmount.oneMinus())

            const emissive = windowColor.mul(windowMask).mul(lit).mul(flicker)

            const baseColor = this.structureColor.toVar()
            baseColor.addAssign(emissive)

            return vec3(baseColor)
        })()

        return new MeshDefaultMaterial({
            colorNode: colorNode,
            hasLightBounce: false,
            hasWater: false,
            side: THREE.DoubleSide, // safety net: buildings' explicit normals + DoubleSide's frontFacing flip keep shading correct even if a face's winding is backwards
        })
    }

    createBuilding(placement)
    {
        const { geometry, totalHeight } = this.buildGeometry(placement)
        const material = this.createMaterial(placement.tint)
        const mesh = new THREE.Mesh(geometry, material)
        mesh.castShadow = true
        mesh.receiveShadow = true

        const object = this.game.objects.add(
            {
                model: mesh,
                updateMaterials: false,
                castShadow: true,
                receiveShadow: true,
                parent: this.game.scene,
            },
            {
                type: 'fixed',
                friction: 0.3,
                restitution: 0.05,
                position: new THREE.Vector3(placement.position.x, 0, placement.position.z),
                rotation: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), placement.rotationY),
                colliders: [
                    {
                        shape: 'cuboid',
                        parameters: [ placement.halfWidth, totalHeight / 2, placement.halfDepth ],
                        position: { x: 0, y: totalHeight / 2, z: 0 },
                        category: 'floor',
                    }
                ]
            }
        )

        return { placement, mesh, totalHeight, object }
    }
}
