import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { cameraPosition, color, float, Fn, mix, PI, positionWorld, texture, uniform, uv, vec3 } from 'three/tsl'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'
import { CYBER_CITY_LAYOUT } from './CyberCityLayout.js'

// Original Cyber City road network (Phase A3 hub-and-ring layout). Replaces the
// single hand-modeled `road` mesh that used to live inside static/scenery/scenery.glb
// (see Scenery.js, which no longer spawns or shades that old mesh -- retired there).
//
// The network is built procedurally from CyberCityLayout.js rather than as an
// authored glTF: it's a flat, purely visual overlay (no organic shapes, just
// discs/annuli/rectangles), and it needs no physics collider of its own -- the
// Rapier heightfield collider generated in Phase B (Game/World/Floor.js) already
// covers physical driving support across the whole city, road and sidewalk alike.
// This mesh sits a hair above that ground plane (y = 0.01) purely to avoid
// z-fighting and to carry its own "wet asphalt + neon" material.
export class Roads
{
    constructor()
    {
        this.game = Game.getInstance()
        this.layout = CYBER_CITY_LAYOUT

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🛣️ Roads',
                expanded: false,
            })
        }

        this.setGeometry()
        this.setMaterial()
        this.setMesh()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        })
    }

    setGeometry()
    {
        const y = 0.01
        const positions = []
        const uvs = []
        const indices = []
        let vertexCount = 0

        // Filled disc (the hub roundabout). UV.v runs 0 (center) -> 1 (rim), which
        // combined with the shader's `sin(uv.y * PI)` term gives a soft glowing
        // ring partway out from the center -- a nice roundabout accent for free.
        const pushDisc = (cx, cz, radius, segments) =>
        {
            positions.push(cx, y, cz)
            uvs.push(0, 0)
            const centerIndex = vertexCount
            vertexCount++

            for(let i = 0; i <= segments; i++)
            {
                const angle = (i / segments) * Math.PI * 2
                positions.push(cx + Math.cos(angle) * radius, y, cz + Math.sin(angle) * radius)
                uvs.push(i / segments, 1)
                vertexCount++
            }

            for(let i = 0; i < segments; i++)
                indices.push(centerIndex, centerIndex + 1 + i, centerIndex + 2 + i)
        }

        // A ring-shaped strip (the ring road). UV.v runs 0 (inner edge) -> 1 (outer
        // edge), matching the straight-segment convention below. UV.u is arc length
        // in world units, for lane-dash spacing consistent with straight roads.
        const pushAnnulus = (cx, cz, innerRadius, outerRadius, segments) =>
        {
            const circumference = Math.PI * 2 * ((innerRadius + outerRadius) * 0.5)
            const startIndex = vertexCount

            for(let i = 0; i <= segments; i++)
            {
                const angle = (i / segments) * Math.PI * 2
                const cos = Math.cos(angle)
                const sin = Math.sin(angle)
                const arcLength = (i / segments) * circumference

                positions.push(cx + cos * innerRadius, y, cz + sin * innerRadius)
                uvs.push(arcLength, 0)
                positions.push(cx + cos * outerRadius, y, cz + sin * outerRadius)
                uvs.push(arcLength, 1)
                vertexCount += 2
            }

            for(let i = 0; i < segments; i++)
            {
                const innerA = startIndex + i * 2
                const outerA = innerA + 1
                const innerB = innerA + 2
                const outerB = innerA + 3

                indices.push(innerA, outerA, outerB)
                indices.push(innerA, outerB, innerB)
            }
        }

        // A straight rectangular strip from A to B (avenues, spurs, alley connectors).
        // UV.u is distance along the segment in world units, UV.v is 0/1 across width.
        const pushQuad = (ax, az, bx, bz, halfWidth) =>
        {
            const dx = bx - ax
            const dz = bz - az
            const length = Math.hypot(dx, dz)
            const dirX = dx / length
            const dirZ = dz / length
            const perpX = -dirZ * halfWidth
            const perpZ = dirX * halfWidth

            const startIndex = vertexCount

            positions.push(ax + perpX, y, az + perpZ)
            uvs.push(0, 0)
            positions.push(bx + perpX, y, bz + perpZ)
            uvs.push(length, 0)
            positions.push(bx - perpX, y, bz - perpZ)
            uvs.push(length, 1)
            positions.push(ax - perpX, y, az - perpZ)
            uvs.push(0, 1)
            vertexCount += 4

            indices.push(startIndex, startIndex + 1, startIndex + 2)
            indices.push(startIndex, startIndex + 2, startIndex + 3)
        }

        // Hub roundabout
        pushDisc(this.layout.hub.position.x, this.layout.hub.position.z, this.layout.hub.radius, 64)

        // Ring road
        pushAnnulus(
            0, 0,
            this.layout.ringRoad.radius - this.layout.ringRoad.width / 2,
            this.layout.ringRoad.radius + this.layout.ringRoad.width / 2,
            64
        )

        // Radial avenues (hub -> ring) and gate spurs (ring -> district), one pair per district
        for(const district of this.layout.districts)
        {
            const angle = district.angleDeg * (Math.PI / 180)
            const cos = Math.cos(angle)
            const sin = Math.sin(angle)

            const hubEdgeX = this.layout.hub.radius * cos
            const hubEdgeZ = this.layout.hub.radius * sin
            const ringX = this.layout.ringRoad.radius * cos
            const ringZ = this.layout.ringRoad.radius * sin

            pushQuad(hubEdgeX, hubEdgeZ, ringX, ringZ, this.layout.radialAvenues.width / 2)

            const innerRadius = district.radius - district.footprintRadius
            pushQuad(ringX, ringZ, innerRadius * cos, innerRadius * sin, this.layout.gateSpurs.width / 2)
        }

        // Alley connectors (ring -> alley node)
        for(const alley of this.layout.alleyNodes)
        {
            const angle = alley.angleDeg * (Math.PI / 180)
            const ringX = this.layout.ringRoad.radius * Math.cos(angle)
            const ringZ = this.layout.ringRoad.radius * Math.sin(angle)

            pushQuad(ringX, ringZ, alley.position.x, alley.position.z, this.layout.alleyConnectors.width / 2)
        }

        this.geometry = new THREE.BufferGeometry()
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        this.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
        this.geometry.setIndex(indices)
    }

    setMaterial()
    {
        this.color = uniform(color('#1c1b22'))
        this.wetColor = uniform(color('#3a3550'))
        this.neonColorA = uniform(color('#ff2e8a'))
        this.neonColorB = uniform(color('#28e0ff'))
        this.wetIntensity = uniform(0.35)

        // Phase G2: fresnel-based wet reflection (grazing-angle brightening),
        // reusing the same technique already proven in VisualVehicle.js's
        // "abyssal" paint choice (view direction dot the surface normal). A
        // real screen-space reflection would need this codebase's more complex
        // viewportSharedTexture/depth-reprojection plumbing (see WaterSurface.js)
        // -- not attempted here since it can't be visually verified in this
        // environment; fresnel is simpler, already-proven, and still reads
        // convincingly as "wet asphalt catching light at a shallow angle."
        this.fresnelColor = uniform(color('#8fb8ff'))
        this.fresnelIntensity = uniform(0.5)

        this.glitterVariation = uniform(0)
        this.glitterScarcity = uniform(100)
        this.glitterIntensity = uniform(0.3)
        this.glitterPerlinFrequency = uniform(0.05)
        this.glitterHashFrequency = uniform(0.2)

        this.laneLineWidth = uniform(0.15)
        this.laneDashLength = uniform(3)
        this.laneGapLength = uniform(2)
        this.laneLineIntensity = uniform(0.8)

        const colorNode = Fn(() =>
        {
            const middle = uv().y.mul(PI).sin()

            // Wet asphalt: cool highlight brightening toward the road's centerline
            const baseColor = mix(this.color, this.wetColor, middle.mul(this.wetIntensity)).toVar()

            // Neon-tinted glitter: sparse colored flecks, mimicking scattered reflections
            // on a wet surface (same technique the original road shader used, retinted)
            const glitter = float(0)
            const hashUv = positionWorld.xz.mul(this.glitterHashFrequency)
            const hash = texture(this.game.noises.hash, hashUv).r.mul(2).add(this.glitterVariation).mod(2).sub(1).abs()
            glitter.addAssign(hash)
            glitter.assign(glitter.pow(this.glitterScarcity))
            glitter.mulAssign(this.glitterIntensity)

            const perlinUv = positionWorld.xz.mul(this.glitterPerlinFrequency)
            const perlin = texture(this.game.noises.perlin, perlinUv).r
            glitter.mulAssign(perlin)
            glitter.mulAssign(middle)

            const neonColor = mix(this.neonColorA, this.neonColorB, hash)
            baseColor.addAssign(neonColor.mul(glitter))

            // Wet reflection: brighten toward a cool "sky/neon" tint at grazing
            // viewing angles (fresnel), fading out when looking straight down
            const viewDirection = positionWorld.sub(cameraPosition).normalize()
            const grazing = viewDirection.dot(vec3(0, 1, 0)).abs().smoothstep(0.7, 0).mul(this.fresnelIntensity)
            baseColor.assign(mix(baseColor, this.fresnelColor, grazing))

            // Lane marking: a dashed centerline tinted with the cyan neon accent
            const distanceFromCenter = uv().y.sub(0.5).abs()
            const lineMask = distanceFromCenter.smoothstep(this.laneLineWidth.mul(0.7), this.laneLineWidth).oneMinus()

            const dashCycle = this.laneDashLength.add(this.laneGapLength)
            const dashPhase = uv().x.mod(dashCycle)
            const dashMask = dashPhase.smoothstep(this.laneDashLength.mul(0.9), this.laneDashLength).oneMinus()

            const laneMask = lineMask.mul(dashMask).mul(this.laneLineIntensity)
            baseColor.assign(mix(baseColor, this.neonColorB, laneMask))

            return vec3(baseColor)
        })()

        this.material = new MeshDefaultMaterial({
            colorNode: colorNode,
            normalNode: vec3(0, 1, 0),
            hasLightBounce: false,
            hasWater: false,
            side: THREE.DoubleSide,
        })
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.receiveShadow = true
        this.mesh.frustumCulled = false
        this.game.scene.add(this.mesh)

        if(this.game.debug.active)
        {
            this.game.debug.addThreeColorBinding(this.debugPanel, this.color.value, 'color')
            this.game.debug.addThreeColorBinding(this.debugPanel, this.wetColor.value, 'wetColor')
            this.game.debug.addThreeColorBinding(this.debugPanel, this.neonColorA.value, 'neonColorA')
            this.game.debug.addThreeColorBinding(this.debugPanel, this.neonColorB.value, 'neonColorB')
            this.debugPanel.addBinding(this.wetIntensity, 'value', { label: 'wetIntensity', min: 0, max: 1, step: 0.01 })
            this.debugPanel.addBlade({ view: 'separator' })
            this.game.debug.addThreeColorBinding(this.debugPanel, this.fresnelColor.value, 'fresnelColor')
            this.debugPanel.addBinding(this.fresnelIntensity, 'value', { label: 'fresnelIntensity', min: 0, max: 1, step: 0.01 })
            this.debugPanel.addBlade({ view: 'separator' })
            this.debugPanel.addBinding(this.glitterScarcity, 'value', { label: 'glitterScarcity', min: 1, max: 10000, step: 1 })
            this.debugPanel.addBinding(this.glitterIntensity, 'value', { label: 'glitterIntensity', min: 0, max: 10, step: 0.01 })
            this.debugPanel.addBinding(this.glitterPerlinFrequency, 'value', { label: 'glitterPerlinFrequency', min: 0, max: 0.1, step: 0.0001 })
            this.debugPanel.addBinding(this.glitterHashFrequency, 'value', { label: 'glitterHashFrequency', min: 0, max: 1, step: 0.0001 })
            this.debugPanel.addBlade({ view: 'separator' })
            this.debugPanel.addBinding(this.laneLineWidth, 'value', { label: 'laneLineWidth', min: 0, max: 0.5, step: 0.001 })
            this.debugPanel.addBinding(this.laneDashLength, 'value', { label: 'laneDashLength', min: 0.1, max: 10, step: 0.01 })
            this.debugPanel.addBinding(this.laneGapLength, 'value', { label: 'laneGapLength', min: 0.1, max: 10, step: 0.01 })
            this.debugPanel.addBinding(this.laneLineIntensity, 'value', { label: 'laneLineIntensity', min: 0, max: 1, step: 0.01 })
        }
    }

    update()
    {
        this.glitterVariation.value += this.game.ticker.deltaScaled * 0.004 + this.game.view.delta.length() * 0.004
    }
}
