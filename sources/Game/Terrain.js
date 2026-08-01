import * as THREE from 'three/webgpu'
import { Game } from './Game.js'
import MeshGridMaterial, { MeshGridMaterialLine } from './Materials/MeshGridMaterial.js'
import { color, Fn, mix, round, smoothstep, texture, uniform, uv, vec2 } from 'three/tsl'

export class Terrain
{
    constructor()
    {
        this.game = Game.getInstance()

        this.subdivision = 128
        this.size = 260 // Cyber City world footprint (halfExtent 130) — see audit/assets/cyber-city-layout.json

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🏔️ Terrain Data',
                expanded: false,
            })
        }

        this.setGradient()
        this.setNodes()
    }

    setGradient()
    {
        const height = 16

        const canvas = document.createElement('canvas')
        canvas.width = 1
        canvas.height = height

        this.gradientTexture = new THREE.Texture(canvas)
        this.gradientTexture.colorSpace = THREE.SRGBColorSpace

        const context = canvas.getContext('2d')

        // Road (low stop) -> sidewalk (high stop) grime ramp, see Phase A1 palette (audit/phase-a1-art-direction-brief.md)
        this.colors = [
            { stop: 0.1, value: '#1c1b22' },
            { stop: 0.5, value: '#3a3550' },
            { stop: 0.9, value: '#2a2733' },
        ]

        const update = () =>
        {
            const gradient = context.createLinearGradient(0, 0, 0, height)
            for(const color of this.colors)
                gradient.addColorStop(color.stop, color.value)

            context.fillStyle = gradient
            context.fillRect(0, 0, 1, height)
            this.gradientTexture.needsUpdate = true
        }

        update()

        // // Debug
        // canvas.style.position = 'fixed'
        // canvas.style.zIndex = 999
        // canvas.style.top = 0
        // canvas.style.left = 0
        // canvas.style.width = '128px'
        // canvas.style.height = `256px`
        // document.body.append(canvas)
        
        if(this.game.debug.active)
        {
            for(const color of this.colors)
            {
                this.debugPanel.addBinding(color, 'stop', { min: 0, max: 1, step: 0.001 }).on('change', update)
                this.debugPanel.addBinding(color, 'value', { view: 'color' }).on('change', update)
            }
        }
    }

    setNodes()
    {
        // terrainTexture channels (Cyber City convention, see audit/phase-b-implementation-notes.md):
        // r = sidewalkMask, g = roadMask, b = heightMask (0 = road level, 1 = curb/sidewalk level)
        this.roadTintColorUniform = uniform(color('#1c1b22'))

        const worldPositionToUvNode = Fn(([position]) =>
        {
            return position.div(this.size).add(0.5)
        })

        this.terrainNode = Fn(([position]) =>
        {
            const textureUv = worldPositionToUvNode(position)
            return texture(this.game.resources.terrainTexture, textureUv)
        })

        this.colorNode = Fn(([terrainData]) =>
        {
            // Road/sidewalk grime gradient, keyed by curb height (b)
            const baseColor = texture(this.gradientTexture, vec2(0, terrainData.b.oneMinus()))

            // Reinforce the road tint from the road mask so the procedural floor
            // stays consistent with the dedicated road-surface material (Scenery.js)
            baseColor.assign(mix(baseColor, this.roadTintColorUniform, terrainData.g))

            return baseColor.rgb
        })

        if(this.game.debug.active)
        {
            this.game.debug.addThreeColorBinding(this.debugPanel, this.roadTintColorUniform.value, 'roadTintColor')
        }
    }
}