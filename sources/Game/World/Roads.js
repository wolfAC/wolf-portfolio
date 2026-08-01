import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { cameraPosition, color, float, Fn, fwidth, max, mix, PI, positionWorld, texture, uniform, uv, vec2, vec3 } from 'three/tsl'
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

        // Priority 10, after View's optimalArea recompute (priority 7) -- update()
        // reads this.game.view.optimalArea.radius/position for the ground-edge
        // fade, which needs this frame's value, not last frame's stale one.
        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 10)
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

        // Radial avenues (hub -> ring) and gate spurs (ring -> district), one pair per district.
        // Both stop at the ring annulus's edge (inner edge for the inbound avenue, outer
        // edge for the outbound spur) rather than its centerline radius -- ending at the
        // centerline would run each quad halfway across the annulus's own width, doubling
        // up geometry with the annulus there and z-fighting against it (visible as
        // flickering at every avenue/spur <-> ring junction).
        const ringInnerRadius = this.layout.ringRoad.radius - this.layout.ringRoad.width / 2
        const ringOuterRadius = this.layout.ringRoad.radius + this.layout.ringRoad.width / 2

        for(const district of this.layout.districts)
        {
            const angle = district.angleDeg * (Math.PI / 180)
            const cos = Math.cos(angle)
            const sin = Math.sin(angle)

            const hubEdgeX = this.layout.hub.radius * cos
            const hubEdgeZ = this.layout.hub.radius * sin
            const ringInnerX = ringInnerRadius * cos
            const ringInnerZ = ringInnerRadius * sin
            const ringOuterX = ringOuterRadius * cos
            const ringOuterZ = ringOuterRadius * sin

            pushQuad(hubEdgeX, hubEdgeZ, ringInnerX, ringInnerZ, this.layout.radialAvenues.width / 2)

            const innerRadius = district.radius - district.footprintRadius
            pushQuad(ringOuterX, ringOuterZ, innerRadius * cos, innerRadius * sin, this.layout.gateSpurs.width / 2)
        }

        // Alley connectors (ring -> alley node). Alley nodes sit inside the ring
        // (see CyberCityLayout.js), so like radial avenues these start at the ring's
        // inner edge, not its centerline, for the same reason as above.
        for(const alley of this.layout.alleyNodes)
        {
            const angle = alley.angleDeg * (Math.PI / 180)
            const ringInnerX = ringInnerRadius * Math.cos(angle)
            const ringInnerZ = ringInnerRadius * Math.sin(angle)

            pushQuad(ringInnerX, ringInnerZ, alley.position.x, alley.position.z, this.layout.alleyConnectors.width / 2)
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
        // viewportSharedTexture/depth-reprojection plumbing (the technique the
        // now-removed WaterSurface.js used; see phase-j-implementation-notes.md)
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

        // Ground-edge fade: the city's road network (ring road radius 90,
        // districts out to 112 -- see CyberCityLayout.js) reaches far past
        // Floor.js's ground plane, which is deliberately sized/recentered
        // each frame to only cover what's near the camera (a performance
        // choice, not a bug). Roads.js's mesh is never distance-culled, so
        // without this, distant road segments render at full neon brightness
        // with no ground underneath them -- visible as a "floating road"
        // past the edge of the world. Fading toward the fog color as the
        // road approaches the ground's own edge keeps it visually consistent
        // with where the ground disappears, whatever that radius happens to
        // be on a given frame (zoom level, screen ratio, etc.).
        this.groundRadius = uniform(0)
        this.groundCenter = uniform(vec2(0, 0))

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

            // Lane marking: a dashed centerline tinted with the cyan neon accent.
            // Edge widths are widened by fwidth() (screen-space derivative) on
            // top of the authored softness, so each transition always spans
            // about a pixel on screen. Without this, the line/dash edges are a
            // fixed width in world/UV space -- at distance or a grazing angle
            // that width collapses below a pixel, and the dash mask strobes
            // on/off between frames as the camera moves (the "flickering
            // stripes" artifact). fwidth is taken on the pre-mod, continuous
            // coordinate (uv().x), not on dashPhase itself, since the mod
            // wrap is a value discontinuity that would spike the derivative.
            const distanceFromCenter = uv().y.sub(0.5).abs()
            const lineEdge = max(this.laneLineWidth.mul(0.3), fwidth(distanceFromCenter))
            const lineMask = distanceFromCenter.smoothstep(this.laneLineWidth.sub(lineEdge), this.laneLineWidth.add(lineEdge)).oneMinus()

            const dashCycle = this.laneDashLength.add(this.laneGapLength)
            const dashPhase = uv().x.mod(dashCycle)
            const dashEdge = max(this.laneDashLength.mul(0.1), fwidth(uv().x))
            const dashMask = dashPhase.smoothstep(this.laneDashLength.sub(dashEdge), this.laneDashLength.add(dashEdge)).oneMinus()

            const laneMask = lineMask.mul(dashMask).mul(this.laneLineIntensity)
            baseColor.assign(mix(baseColor, this.neonColorB, laneMask))

            // Ground-edge fade (see groundRadius/groundCenter comment above)
            const distanceFromGroundCenter = positionWorld.xz.sub(this.groundCenter).length()
            const groundFade = distanceFromGroundCenter.smoothstep(this.groundRadius.mul(0.7), this.groundRadius)
            baseColor.assign(mix(baseColor, this.game.fog.color, groundFade))

            return vec3(baseColor)
        })()

        this.material = new MeshDefaultMaterial({
            colorNode: colorNode,
            normalNode: vec3(0, 1, 0),
            hasLightBounce: false,
            hasWater: false,
            side: THREE.DoubleSide,
        })

        // The road is a purely visual overlay with no physics collider of its
        // own (see the class comment) -- dynamic props (Barricades, ScrapCrates)
        // rest/topple against the terrain collider underneath instead, so a
        // knocked-over prop lying near/on a road can end up almost exactly
        // coplanar with this mesh. Biasing the road toward the camera makes it
        // reliably win that depth tie instead of flickering against the prop.
        this.material.polygonOffset = true
        this.material.polygonOffsetFactor = -4
        this.material.polygonOffsetUnits = -4
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

        this.groundRadius.value = this.game.view.optimalArea.radius
        this.groundCenter.value.set(this.game.view.optimalArea.position.x, this.game.view.optimalArea.position.z)
    }
}
