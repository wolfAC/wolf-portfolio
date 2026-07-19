// Phase B2 primitive asset generator: static/terrain/terrain.png
//
// No Substance/Photoshop authoring tool is available in this environment, so this
// script procedurally rasterizes the ground mask directly from the same
// road-network layout used by generate-terrain-model.mjs -- a real, correct
// texture (not a placeholder), matching the new channel convention documented
// in phase-b-implementation-notes.md:
//   R = sidewalkMask (1 = pavement/plaza, 0 = road)
//   G = roadMask     (1 = drivable road surface, 0 = elsewhere)
//   B = heightMask   (0 = road level, 1 = curb/sidewalk level)
// R and G are exact complements and B mirrors R; kept as three distinct channels
// (rather than collapsing to one) so a future hand-painted texture can diverge
// them (e.g. graduated plaza heights) without another shader change.

import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { loadLayout, roadInsideness, smoothstep } from './road-network.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const layout = loadLayout()

const SIZE = 512
const HALF_EXTENT = layout.worldFootprint.halfExtent // 130
const FEATHER = 1.0 // world units of antialiasing on the road edge, avoids jagged pixel-stepped curves

const pixels = Buffer.alloc(SIZE * SIZE * 4)

for(let py = 0; py < SIZE; py++)
{
    const z = ((py + 0.5) / SIZE - 0.5) * (HALF_EXTENT * 2)

    for(let px = 0; px < SIZE; px++)
    {
        const x = ((px + 0.5) / SIZE - 0.5) * (HALF_EXTENT * 2)

        const insideness = roadInsideness(x, z, layout)
        const roadMask = smoothstep(-FEATHER, FEATHER, insideness)
        const sidewalkMask = 1 - roadMask
        const heightMask = sidewalkMask

        const offset = (py * SIZE + px) * 4
        pixels[offset + 0] = Math.round(sidewalkMask * 255) // R
        pixels[offset + 1] = Math.round(roadMask * 255)     // G
        pixels[offset + 2] = Math.round(heightMask * 255)   // B
        pixels[offset + 3] = 255                             // A (unused by the engine, kept opaque)
    }
}

const outputPath = path.join(here, '..', '..', '..', 'static', 'terrain', 'terrain.png')

const image = sharp(pixels, { raw: { width: SIZE, height: SIZE, channels: 4 } })
await image.png().toFile(outputPath)

console.log(`Wrote ${outputPath} (${SIZE}x${SIZE} RGBA, R=sidewalkMask G=roadMask B=heightMask)`)
